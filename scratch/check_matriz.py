import pandas as pd
excel_path = r"C:\Users\usuario\Documents\Oncede\Clientes\Muebles Gacela\Web\Muebles gacela MVP\Herrajes_y_Herramientas_Muebles_Gacela.xlsx"
df_matriz = pd.read_excel(excel_path, sheet_name='Matriz Resumen')
pd.set_option('display.max_rows', 100)
print(df_matriz[['Línea', 'Artículo']])
