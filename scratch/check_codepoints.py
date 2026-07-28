import os
import pandas as pd

base_dir = r"C:\Users\usuario\Documents\Oncede\Clientes\Muebles Gacela\Web\Muebles gacela MVP"
excel_path = os.path.join(base_dir, "Herrajes_y_Herramientas_Muebles_Gacela.xlsx")

df = pd.read_excel(excel_path, sheet_name='Detalle Plano')
herraje_df = df[df['Tipo'].str.lower() == 'herraje']
unique_herrajes = herraje_df['Elemento Normalizado'].unique()

print("Excel herrajes with code points:")
for h in sorted(unique_herrajes):
    code_points = [ord(c) for c in h]
    print(f"  {repr(h)} -> {code_points}")
