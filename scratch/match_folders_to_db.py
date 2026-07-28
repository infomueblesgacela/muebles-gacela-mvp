import os
import json
import re

base_dir = r"C:\Users\usuario\Documents\Oncede\Clientes\Muebles Gacela\Web\Muebles gacela MVP"
json_path = os.path.join(base_dir, "data", "productos.json")
modelos_3d_dir = os.path.join(base_dir, "modelos_3d")

with open(json_path, 'r', encoding='utf-8') as f:
    products = json.load(f).get('products', [])

folders = []
for line in os.listdir(modelos_3d_dir):
    line_path = os.path.join(modelos_3d_dir, line)
    if os.path.isdir(line_path) and line.startswith('linea-'):
        for prod in os.listdir(line_path):
            if os.path.isdir(os.path.join(line_path, prod)):
                folders.append(prod)

print(f"Total folders: {len(folders)}")

matched_count = 0
for f in sorted(folders):
    # Try to find a product in JSON that matches this folder name
    # We can match:
    # 1. If folder name (e.g. 'A008285') without leading A and zeros (e.g. '8285') is in SKU, or SKU is in the folder name.
    # 2. Or if 'Manual_PDF' in JSON contains folder name (case-insensitive).
    matched_prod = None
    folder_num = re.sub(r'^A0*', '', f).lower() # 'A008285' -> '8285'
    
    for p in products:
        sku = str(p.get('SKU', '')).lower()
        manual_pdf = str(p.get('Manual_PDF', '')).lower()
        
        # Exact folder name in Manual_PDF path
        if f.lower() in manual_pdf:
            matched_prod = p
            break
        # Or folder number in Manual_PDF path
        if folder_num in manual_pdf:
            matched_prod = p
            break
        # Or SKU matches the folder name
        if sku == f.lower() or sku == folder_num:
            matched_prod = p
            break
            
    if matched_prod:
        matched_count += 1
        print(f"Folder: {f} -> SKU: {matched_prod['SKU']} | Name: {matched_prod['Nombre_Comercial']}")
    else:
        # Try a relaxed search
        for p in products:
            sku = str(p.get('SKU', '')).lower()
            sku_clean = re.sub(r'[^0-9]', '', sku)
            folder_clean = re.sub(r'[^0-9]', '', f)
            if sku_clean and folder_clean and sku_clean == folder_clean:
                matched_prod = p
                break
        if matched_prod:
            matched_count += 1
            print(f"Folder: {f} -> SKU: {matched_prod['SKU']} | Name: {matched_prod['Nombre_Comercial']} (relaxed)")
        else:
            print(f"Folder: {f} -> NO MATCH FOUND")

print(f"\nTotal matched: {matched_count} / {len(folders)}")
