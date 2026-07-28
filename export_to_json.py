import pandas as pd
import json
import math

file_path = 'productos_auditados.xlsx'
df = pd.read_excel(file_path, sheet_name='productos_auditados')

# Safely convert nan to None for JSON
products = df.to_dict(orient='records')
for row in products:
    for k, v in row.items():
        if pd.isna(v):
            row[k] = None

# Build the final json structure
final_json = {
    "products": products
}

with open('data/productos.json', 'w', encoding='utf-8') as f:
    json.dump(final_json, f, ensure_ascii=False, indent=2)

print("Successfully exported to data/productos.json")
