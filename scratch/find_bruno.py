import os
import fitz
from test_all_extraction import extract_from_pdf

manuals_dir = r"C:\Users\usuario\Documents\Oncede\Clientes\Muebles Gacela\Web\Muebles gacela MVP\Manuales"

for root, dirs, files in os.walk(manuals_dir):
    for f in files:
        if f.lower().endswith(".pdf"):
            pdf_path = os.path.join(root, f)
            hw, tl = extract_from_pdf(pdf_path)
            for q, name in hw:
                if 'bruno' in name.lower():
                    print(f"File {f} contains Bruno: {name}")
