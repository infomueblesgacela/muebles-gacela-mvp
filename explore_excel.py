import pandas as pd

xl = pd.ExcelFile('productos_auditados.xlsx')

for sheet in xl.sheet_names:
    print(f"\n--- SHEET: {sheet} ---")
    df = pd.read_excel('productos_auditados.xlsx', sheet_name=sheet)
    print("Columns:", list(df.columns))
    print(df.head(3).to_dict('records'))
