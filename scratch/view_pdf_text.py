import fitz
pdf_path = r"C:\Users\usuario\Documents\Oncede\Clientes\Muebles Gacela\Web\Muebles gacela MVP\Manuales\linea-clasica\A712152.PDF"
doc = fitz.open(pdf_path)
print("Number of pages:", len(doc))
text = doc[0].get_text()
print("--- Page 1 Text ---")
print(text)
print("--- End Page 1 Text ---")
