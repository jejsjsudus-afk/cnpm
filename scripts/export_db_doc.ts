import fs from 'fs';
import path from 'path';

const schemaPath = path.join(process.cwd(), 'prisma/schema.prisma');
const outputPath = path.join(process.cwd(), 'DATABASE_SCHEMA.md');

function parseSchema() {
  const content = fs.readFileSync(schemaPath, 'utf-8');
  const lines = content.split('\n');

  let currentModel: string | null = null;
  const models: any = {};

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    const modelMatch = line.match(/^model\s+(\w+)\s+\{/);
    if (modelMatch) {
      currentModel = modelMatch[1];
      models[currentModel] = {
        name: currentModel,
        fields: [],
        fks: new Set<string>()
      };
      continue;
    }

    if (line === '}') {
      currentModel = null;
      continue;
    }

    if (currentModel) {
      // Check for relation attributes to identify FKs
      const relationMatch = line.match(/@relation\([^)]*fields:\s*\[([^\]]+)\]/);
      if (relationMatch) {
        const fields = relationMatch[1].split(',').map(f => f.trim());
        fields.forEach(f => models[currentModel!].fks.add(f));
      }

      // Parse field
      const fieldMatch = line.match(/^(\w+)\s+([\w\[\]\?]+)/);
      if (fieldMatch) {
        const name = fieldMatch[1];
        const type = fieldMatch[2];
        const commentMatch = line.match(/\/\/\s*(.*)$/);
        const description = commentMatch ? commentMatch[1].trim() : '';
        
        // Skip relation fields (non-scalar types that are part of Prisma relations)
        // In Prisma, scalar fields are lowercase or simple strings. 
        // Relation fields are capitalized types usually.
        // Actually, better to check if it has @relation or if it's a model name.
        
        models[currentModel].fields.push({
          name,
          type,
          description,
          lineRaw: line
        });
      }
    }
  }

  // Refine fields: Separate relation definitions from actual table columns
  for (const modelName in models) {
    const model = models[modelName];
    model.columns = model.fields.filter((f: any) => {
      // Prisma convention: fields that are NOT models themselves are columns.
      // Or more accurately: if it's a scalar type.
      const scalarTypes = ['String', 'Int', 'Float', 'Boolean', 'DateTime', 'Json', 'Decimal', 'BigInt', 'Bytes'];
      const baseType = f.type.replace(/[\[\]\?]/g, '');
      return scalarTypes.includes(baseType);
    }).map((f: any) => ({
      name: f.name,
      type: f.type,
      description: f.description,
      isFK: model.fks.has(f.name) ? 'Có' : 'Không'
    }));
  }

  return models;
}

function generateMarkdown(models: any) {
  let md = '# Tài liệu Cấu trúc Cơ sở dữ liệu\n\n';

  for (const modelName in models) {
    const model = models[modelName];
    md += `## Bảng: ${modelName}\n\n`;
    md += '| Tên cột | Kiểu dữ liệu | Mô tả | Là khóa ngoại? |\n';
    md += '| :--- | :--- | :--- | :--- |\n';

    for (const col of model.columns) {
      md += `| ${col.name} | ${col.type} | ${col.description} | ${col.isFK} |\n`;
    }
    md += '\n';
  }

  return md;
}

const models = parseSchema();
const markdown = generateMarkdown(models);
fs.writeFileSync(outputPath, markdown);
console.log(`Đã xuất thông tin database ra file: ${outputPath}`);
