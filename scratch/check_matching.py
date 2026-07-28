import os
import pandas as pd

base_dir = r"C:\Users\usuario\Documents\Oncede\Clientes\Muebles Gacela\Web\Muebles gacela MVP"
modelos_3d_dir = os.path.join(base_dir, "modelos_3d")
excel_path = os.path.join(base_dir, "Herrajes_y_Herramientas_Muebles_Gacela.xlsx")

df_detail = pd.read_excel(excel_path, sheet_name='Detalle Plano')
excel_files = set(df_detail['Archivo'].dropna().str.lower().unique())

folders = []
for line in os.listdir(modelos_3d_dir):
    line_path = os.path.join(modelos_3d_dir, line)
    if os.path.isdir(line_path):
        for prod in os.listdir(line_path):
            prod_path = os.path.join(line_path, prod)
            if os.path.isdir(prod_path):
                folders.append(prod)

print(f"Total folders: {len(folders)}")
print(f"Total unique Archivos in Excel: {len(excel_files)}")

matched = []
unmatched_folder = []
for f in folders:
    pdf_name = (f + ".pdf").lower()
    if pdf_name in excel_files:
        matched.append(f)
    else:
        unmatched_folder.append(f)

print(f"\nMatched folders: {len(matched)}")
print(f"Unmatched folders: {len(unmatched_folder)}")
if unmatched_folder:
    print("Unmatched folder list:", unmatched_folder)

unmatched_excel = []
folder_pdfs = set((f + ".pdf").lower() for f in folders)
for ef in excel_files:
    if ef not in folder_pdfs:
        unmatched_excel.append(ef)

print(f"\nUnmatched Excel Archivos: {len(unmatched_excel)}")
if unmatched_excel:
    print("Unmatched Excel list:", unmatched_excel)
