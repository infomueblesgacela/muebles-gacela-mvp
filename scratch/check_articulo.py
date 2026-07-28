import pandas as pd
excel_path = r"C:\Users\usuario\Documents\Oncede\Clientes\Muebles Gacela\Web\Muebles gacela MVP\Herrajes_y_Herramientas_Muebles_Gacela.xlsx"
df = pd.read_excel(excel_path, sheet_name='Detalle Plano')
print("Unique 'Artículo' values:")
print(df['Artículo'].unique()[:20])
print("\nUnique 'Archivo' values:")
print(df['Archivo'].unique()[:20])
print("\nSome rows:")
print(df[['Archivo', 'Artículo', 'Descripción']].drop_duplicates().head(20))
