import os
import json
import pandas as pd

base_dir = r"C:\Users\usuario\Documents\Oncede\Clientes\Muebles Gacela\Web\Muebles gacela MVP"
json_path = os.path.join(base_dir, "data", "productos.json")
audit_xlsx_path = os.path.join(base_dir, "productos_auditados.xlsx")

print("Checking data/productos.json...")
if os.path.exists(json_path):
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    print(f"Loaded json. Total products: {len(data) if isinstance(data, list) else len(data.get('productos', []))}")
    if isinstance(data, list):
        print("First product in list:", data[0])
    else:
        print("Keys in dict:", list(data.keys()))
        if 'productos' in data:
            print("First product in productos:", data['productos'][0])
else:
    print("data/productos.json does not exist")

print("\nChecking productos_auditados.xlsx...")
if os.path.exists(audit_xlsx_path):
    df_audit = pd.read_excel(audit_xlsx_path)
    print("Columns:", list(df_audit.columns))
    print(df_audit.head(5))
else:
    print("productos_auditados.xlsx does not exist")
