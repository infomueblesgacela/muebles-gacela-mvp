import pandas as pd
excel_path = r"C:\Users\usuario\Documents\Oncede\Clientes\Muebles Gacela\Web\Muebles gacela MVP\Herrajes_y_Herramientas_Muebles_Gacela.xlsx"
df = pd.read_excel(excel_path, sheet_name='Detalle Plano')
print(df[df['Artículo'].str.lower() == 'a760250'][['Tipo', 'Elemento Normalizado', 'Cantidad']])
