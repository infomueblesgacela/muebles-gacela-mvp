import os
import pandas as pd

base_dir = r"C:\Users\usuario\Documents\Oncede\Clientes\Muebles Gacela\Web\Muebles gacela MVP"
excel_path = os.path.join(base_dir, "Herrajes_y_Herramientas_Muebles_Gacela.xlsx")

df_detail = pd.read_excel(excel_path, sheet_name='Detalle Plano')
print("Detalle Plano Head:")
print(df_detail.head(10))

print("\nMatriz Resumen Head:")
df_matriz = pd.read_excel(excel_path, sheet_name='Matriz Resumen')
print(df_matriz.head(10))
