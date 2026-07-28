import pandas as pd
excel_path = r"C:\Users\usuario\Documents\Oncede\Clientes\Muebles Gacela\Web\Muebles gacela MVP\Herrajes_y_Herramientas_Muebles_Gacela.xlsx"
df = pd.read_excel(excel_path, sheet_name='Detalle Plano')
pd.set_option('display.max_columns', None)
pd.set_option('display.width', 1000)
print("Regenerated A712152 details:")
print(df[df['Artículo'].str.lower() == 'a712152'][['Línea', 'Artículo', 'Descripción', 'Tipo', 'Elemento Normalizado', 'Cantidad']])
