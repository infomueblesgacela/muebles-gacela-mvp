import fitz
pdf_path = r"C:\Users\usuario\Documents\Oncede\Clientes\Muebles Gacela\Web\Muebles gacela MVP\Manuales\linea-kyoto\A446250.PDF"
doc = fitz.open(pdf_path)
print("Page 1 Text for A446250:")
print(doc[0].get_text())
