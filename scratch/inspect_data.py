import os
import pandas as pd

base_dir = r"C:\Users\usuario\Documents\Oncede\Clientes\Muebles Gacela\Web\Muebles gacela MVP"
excel_path = os.path.join(base_dir, "Herrajes_y_Herramientas_Muebles_Gacela.xlsx")
herrajes_dir = os.path.join(base_dir, "herrajes")

print("Checking sheets...")
xl = pd.ExcelFile(excel_path)
print("Sheets:", xl.sheet_names)

print("\nReading 'Detalle Plano'...")
df = pd.read_excel(excel_path, sheet_name='Detalle Plano')
print("Columns:", list(df.columns))

print("\nUnique 'Herraje' elements in Excel:")
herraje_df = df[df['Tipo'].str.lower() == 'herraje']
unique_herrajes = herraje_df['Elemento Normalizado'].unique()
for h in sorted(unique_herrajes):
    print(f"  - '{h}'")

print("\nUnique 'Herramienta' elements in Excel:")
herramienta_df = df[df['Tipo'].str.lower() == 'herramienta']
unique_herramientas = herramienta_df['Elemento Normalizado'].unique()
for h in sorted(unique_herramientas):
    print(f"  - '{h}'")

print("\nFiles in herrajes folder:")
files = sorted(os.listdir(herrajes_dir))
for f in files:
    print(f"  - '{f}'")
