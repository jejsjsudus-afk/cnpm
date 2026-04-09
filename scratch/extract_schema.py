import re

def parse_prisma(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    models = re.findall(r'model (\w+) \{([\s\S]*?)\}', content)
    
    result = ""
    for model_name, model_body in models:
        result += f"### Bảng: {model_name}\n\n"
        result += "| Tên trường | Kiểu dữ liệu | Mô tả |\n"
        result += "| :--- | :--- | :--- |\n"
        
        lines = model_body.strip().split('\n')
        for line in lines:
            line = line.strip()
            if not line or line.startswith('//') or line.startswith('@@'):
                continue
            
            # Split line into parts
            parts = re.split(r'\s+', line)
            if len(parts) < 2:
                continue
                
            field_name = parts[0]
            field_type = parts[1]
            
            # Check for comments
            description = ""
            if '//' in line:
                description = line.split('//')[1].strip()
            
            # Clean up field type (remove attributes like @id, @unique, etc.)
            raw_type = field_type
            # Keep only the type name, ignore prism-specific decorators for the 'Type' column
            # but maybe keep them for context? I'll keep them simple.
            
            result += f"| {field_name} | {field_type} | {description} |\n"
        result += "\n"
    
    return result

schema_path = r'c:\Users\Admin\Documents\web\university-sms\prisma\schema.prisma'
markdown_output = parse_prisma(schema_path)

with open('db_schema.md', 'w', encoding='utf-8') as f:
    f.write(markdown_output)

print("Extraction complete. Check db_schema.md")
