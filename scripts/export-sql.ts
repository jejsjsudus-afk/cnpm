import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();
type SqlRow = Record<string, string | number | boolean | Date | null>;
type TableAccessor = {
  findMany: () => Promise<SqlRow[]>;
};

async function main() {
  const models = [
    'user',
    'student',
    'lecturer',
    'academicProgram',
    'course',
    'coursePrerequisite',
    'semester',
    'classSection',
    'schedule',
    'enrollment',
    'attendanceSession',
    'attendanceRecord',
    'scoreSettings',
    'score',
    'regradeRequest',
    'tuitionInvoice',
    'payment',
    'auditLog',
  ];

  let sql = '';

  // Get schema from schema.sql if it exists, otherwise we'd need to generate it
  if (fs.existsSync('schema.sql')) {
    sql += fs.readFileSync('schema.sql', 'utf8') + '\n\n';
  }

  sql += '-- Data dump\n\n';

  for (const modelName of models) {
    const table = (prisma as unknown as Record<string, TableAccessor | undefined>)[modelName];
    if (!table) continue;

    const data = await table.findMany();
    if (data.length === 0) continue;

    sql += `-- Data for table ${modelName}\n`;
    
    // Convert camelCase model name to PascalCase or the actual table name
    // Prisma usually matches the model name in schema.prisma
    const tableName = modelName.charAt(0).toUpperCase() + modelName.slice(1);

    for (const row of data) {
      const keys = Object.keys(row);
      const values = keys.map(key => {
        const val = row[key];
        if (val === null) return 'NULL';
        if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
        if (val instanceof Date) return `'${val.toISOString()}'`;
        if (typeof val === 'boolean') return val ? '1' : '0';
        return val;
      });

      sql += `INSERT INTO "${tableName}" (${keys.map(k => `"${k}"`).join(', ')}) VALUES (${values.join(', ')});\n`;
    }
    sql += '\n';
  }

  fs.writeFileSync('database_dump.sql', sql);
  console.log('Database dump created: database_dump.sql');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
