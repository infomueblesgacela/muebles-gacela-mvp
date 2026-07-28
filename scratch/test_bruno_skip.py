import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import fitz
import re
from extract_hardware import decode_text, get_text_shift, parse_elements, PART_KEYWORDS

pdf_path = r"C:\Users\usuario\Documents\Oncede\Clientes\Muebles Gacela\Web\Muebles gacela MVP\Manuales\linea-kyoto\A446250.PDF"
doc = fitz.open(pdf_path)
page = doc.load_page(0)
text = page.get_text()
shift = get_text_shift(text)
blocks = page.get_text("blocks")
blocks.sort(key=lambda b: (b[1], b[0]))

print("Searching for Bruno blocks in page 1:")
for idx, b in enumerate(blocks):
    x0, y0, x1, y1, text_block, block_no, block_type = b
    decoded = decode_text(text_block, shift).replace('\n', ' ').strip()
    if 'bruno' in decoded.lower():
        print(f"Block {idx}: '{decoded}'")
        split_items = parse_elements(decoded)
        for item in split_items:
            item_lower = item.lower()
            is_part = any(k in item_lower for k in PART_KEYWORDS)
            strong_hw_keywords = ['tarugo', 'tornillo', 'perno', 'minifix', 'mini fix', 'clavo', 'cola', 'bisagra', 'manija', 'carro', 'clip', 'traba', 'kit', 'llave', 'martillo', 'destornillador']
            has_strong_hw = any(k in item_lower for k in strong_hw_keywords)
            starts_with_qty = re.match(r'^\d', item_lower) is not None or item_lower.startswith('set de')
            is_known_tool = any(k in item_lower for k in ['martillo', 'destornillador', 'llave allen', 'cinta metrica', 'cinta métrica', 'lapiz', 'lápiz', 'taladro', 'mecha'])
            is_cola = 'cola' in item_lower
            
            print(f"  Item: '{item}'")
            print(f"    is_part: {is_part}")
            print(f"    has_strong_hw: {has_strong_hw}")
            print(f"    starts_with_qty: {starts_with_qty}")
            print(f"    is_known_tool: {is_known_tool}")
            print(f"    is_cola: {is_cola}")
            print(f"    Will keep: {not (is_part and not has_strong_hw) and (starts_with_qty or is_known_tool or is_cola)}")
