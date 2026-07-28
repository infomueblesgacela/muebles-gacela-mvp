import os
import json

base_dir = r"C:\Users\usuario\Documents\Oncede\Clientes\Muebles Gacela\Web\Muebles gacela MVP"
json_path = os.path.join(base_dir, "data", "productos.json")

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

products = data.get('products', [])
print(f"Total products in JSON: {len(products)}")
if products:
    print("First product sample:")
    print(json.dumps(products[0], indent=2, ensure_ascii=False))
