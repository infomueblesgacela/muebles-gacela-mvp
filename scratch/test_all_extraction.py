import os
import fitz
import re
import pandas as pd

HARDWARE_KEYWORDS = [
    'tarugo', 'tornillo', 'perno', 'minifix', 'mini fix', 'caja', 'base', 'clavo', 'guia', 'guía',
    'cola', 'bisagra', 'manija', 'soporte', 'escuadra', 'carro', 'clip', 'traba', 'perfil', 'caño',
    'kit', 'botinero'
]

TOOL_KEYWORDS = [
    'martillo', 'destornillador', 'llave allen', 'llave', 'cinta metrica', 'cinta métrica', 'lapiz', 'lápiz',
    'taladro', 'mecha'
]

SHIFTED_SPANISH = {
    '\x86': 'á',
    '\x8d': 'é',
    '\x91': 'í',
    '\x96': 'ó',
    '\x9b': 'ú',
    '\x95': 'ñ',
    '\x03': ' '
}

def decode_text(text, shift):
    if not shift:
        return text
    decoded_chars = []
    for c in text:
        if c == '\n':
            decoded_chars.append(c)
        else:
            try:
                val = ord(c) + shift
                if 0 <= val <= 0x10FFFF:
                    decoded_char = chr(val)
                    decoded_char = SHIFTED_SPANISH.get(decoded_char, decoded_char)
                    decoded_chars.append(decoded_char)
                else:
                    decoded_chars.append(c)
            except Exception:
                decoded_chars.append(c)
    return "".join(decoded_chars)

def get_text_shift(text):
    target = "Elementos provistos"
    for s in range(-100, 100):
        if s == 0:
            continue
        try:
            if any(ord(c) - s < 0 or ord(c) - s > 0x10FFFF for c in target):
                continue
            shifted_target = "".join(chr(ord(c) - s) for c in target)
            if shifted_target in text:
                return s
        except Exception:
            continue
    return 0

def clean_text(text):
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def parse_elements(text_block):
    words = text_block.split()
    items = []
    current_item = []
    NO_SPLIT_PREDECESSORS = ['de', 'o', 'y', 'codo', 'cazoleta', 'casoleta', 'n°', 'n', 'no', 'nro', 'allen', 'llave']
    for i, word in enumerate(words):
        is_start = False
        if re.match(r'^\d+$', word):
            preceded_by_no_split = (len(current_item) > 0 and current_item[-1].lower() in NO_SPLIT_PREDECESSORS)
            is_dim = False
            if i + 1 < len(words):
                next_word = words[i+1].lower()
                if next_word.startswith('x') or next_word in ['cm', 'mm', 'codo', 'cazoleta', 'casoleta', 'n°', 'n', 'no']:
                    is_dim = True
            is_multiplier = (len(current_item) > 0 and current_item[-1].lower() == 'x')
            if not preceded_by_no_split and not is_dim and not is_multiplier and i < len(words) - 1:
                if current_item:
                    items.append(" ".join(current_item))
                    current_item = []
                is_start = True
        elif word.lower() in ['set', 'llave', 'martillo', 'destornillador', 'cinta']:
            if word.lower() == 'set':
                if i + 1 < len(words) and words[i+1].lower() == 'de':
                    if current_item:
                        items.append(" ".join(current_item))
                        current_item = []
                    is_start = True
            else:
                preceded_by_de = (len(current_item) > 0 and current_item[-1].lower() in ['de', 'o', 'tornillos', 'tornillo'])
                if not preceded_by_de:
                    if current_item:
                        items.append(" ".join(current_item))
                        current_item = []
                    is_start = True
        current_item.append(word)
    if current_item:
        items.append(" ".join(current_item))
    return items

def parse_quantity_and_name(item_text):
    item_text = clean_text(item_text)
    if item_text.lower().startswith("set de"):
        return 1, item_text
    match = re.match(r'^(\d+)\s*(?:Pares? de|pares? de|Envases? de|envases? de|Pares?|pares?|Envases?|envases?)?\s*(.*)$', item_text)
    if match:
        qty = int(match.group(1))
        name = match.group(2).strip()
        if name.lower().startswith("de "):
            name = name[3:].strip()
        return qty, name
    return 1, item_text

def extract_from_pdf(pdf_path):
    doc = fitz.open(pdf_path)
    page = doc.load_page(0)
    text = page.get_text()
    shift = get_text_shift(text)
    blocks = page.get_text("blocks")
    blocks.sort(key=lambda b: (b[1], b[0]))
    
    y_provistos = 350.0
    for b in blocks:
        if "elementos provistos" in decode_text(b[4], shift).lower():
            y_provistos = b[1]
            break
            
    hardware_list = []
    tools_list = []
    
    for b in blocks:
        x0, y0, x1, y1, text_block, block_no, block_type = b
        if y0 < y_provistos - 10:
            continue
            
        decoded = decode_text(text_block, shift).replace('\n', ' ').strip()
        if not decoded:
            continue
            
        decoded_lower = decoded.lower()
        if any(k in decoded_lower for k in ['mantenimiento', 'importante', 'advertencia', 'modelo armado', 'pagina 1', 'página 1', 'usar regla para verificar']):
            continue
        if len(decoded) > 100:
            continue
        if re.search(r'\b0\s*cm\b|\b[oO]\s*cm\b', decoded_lower):
            continue
            
        split_items = parse_elements(decoded)
        for item in split_items:
            item_lower = item.lower().strip()
            
            # Restore strict check: starts with qty, known tool, or is cola
            starts_with_qty = re.match(r'^\d', item_lower) is not None or item_lower.startswith('set de')
            is_known_tool = any(k in item_lower for k in TOOL_KEYWORDS)
            is_cola = 'cola' in item_lower
            
            if not (starts_with_qty or is_known_tool or is_cola):
                continue
                
            has_hw = any(k in item_lower for k in HARDWARE_KEYWORDS)
            has_tool_keyword = any(k in item_lower for k in TOOL_KEYWORDS)
            if not (has_hw or has_tool_keyword):
                continue
                
            qty, raw_name = parse_quantity_and_name(item)
            if not raw_name.strip():
                continue
                
            is_tool = any(k in raw_name.lower() for k in ['martillo', 'destornillador', 'llave', 'cinta', 'taladro', 'mecha', 'lapiz']) and 'tornillo' not in raw_name.lower()
            if is_tool:
                tools_list.append((qty, raw_name))
            else:
                hardware_list.append((qty, raw_name))
                
    return hardware_list, tools_list

def main():
    manuals_dir = r"C:\Users\usuario\Documents\Oncede\Clientes\Muebles Gacela\Web\Muebles gacela MVP\Manuales"
    
    unique_hw_names = set()
    unique_tool_names = set()
    
    for root, dirs, files in os.walk(manuals_dir):
        for f in files:
            if f.lower().endswith(".pdf"):
                pdf_path = os.path.join(root, f)
                try:
                    hw, tl = extract_from_pdf(pdf_path)
                    for q, name in hw:
                        unique_hw_names.add(name)
                    for q, name in tl:
                        unique_tool_names.add(name)
                except Exception as e:
                    print(f"Error in {f}: {e}")
                    
    print("Unique Extracted Hardware Names:")
    for n in sorted(list(unique_hw_names)):
        print(f"  - '{n}'")
        
    print("\nUnique Extracted Tool Names:")
    for n in sorted(list(unique_tool_names)):
        print(f"  - '{n}'")

if __name__ == "__main__":
    main()
