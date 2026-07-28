import os
import fitz
import re

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

def normalize_item_name(name):
    name_lower = name.lower()
    if 'bisagra' in name_lower:
        if 'codo 15' in name_lower or 'codo15' in name_lower:
            return 'Bisagras codo 15'
        elif 'codo 9' in name_lower or 'codo9' in name_lower:
            return 'Bisagras codo 9'
        elif 'codo 0' in name_lower or 'codo0' in name_lower:
            return 'Bisagras codo 0'
        else:
            return 'Bisagras (otras)'
    if 'manija' in name_lower or 'tirador' in name_lower:
        if 'athenas' in name_lower:
            return 'Manijas Athenas'
        elif 'gama' in name_lower:
            return 'Manijas Gama'
        elif 'bruno' in name_lower:
            return 'Tirador Bruno con tornillo'
        elif 'boton' in name_lower or 'botón' in name_lower:
            return 'Tirador botón'
        else:
            return 'Manijas con tornillos'
    if 'guía' in name_lower or 'guia' in name_lower:
        if '30' in name_lower:
            return 'Guías metálicas 30 cm'
        elif '35' in name_lower or '350' in name_lower:
            return 'Guías metálicas 35 cm'
        elif '40' in name_lower or '400' in name_lower:
            return 'Guías metálicas 40 cm'
        else:
            return 'Guías metálicas'
    if any(k in name_lower for k in ['perno', 'minifix', 'mini fix']):
        return 'Pernos minifix con caja'
    if 'soporte' in name_lower:
        if 'estante' in name_lower:
            return 'Soportes de estantes'
        elif any(k in name_lower for k in ['caño', 'cano', 'caños', 'canos']):
            return 'Soportes de caños'
        else:
            return 'Soportes'
    if 'escuadra' in name_lower:
        if 'plástica' in name_lower or 'plastica' in name_lower:
            return 'Escuadras plásticas'
        elif 'metálica' in name_lower or 'metalica' in name_lower:
            return 'Escuadras metálicas'
        else:
            return 'Escuadras'
    if 'tarugo' in name_lower:
        if 'plástico' in name_lower or 'plastico' in name_lower:
            return 'Tarugos plásticos'
        else:
            return 'Tarugos 6x30'
    if 'cola' in name_lower:
        return 'Cola (envase)'
    if 'clavo' in name_lower:
        return 'Set de clavos'
    if 'carro' in name_lower:
        return 'Carros inferiores'
    if 'clip' in name_lower:
        return 'Clips'
    if 'traba' in name_lower:
        return 'Trabas'
    if 'botinero' in name_lower:
        return 'Kit botineros'
    if 'perfil' in name_lower:
        if 'inferior' in name_lower or 'inf' in name_lower:
            return 'Perfiles guía inferior'
        elif 'superior' in name_lower or 'sup' in name_lower:
            return 'Perfiles guía superior'
        else:
            return 'Perfiles'
    if 'caño' in name_lower or 'cano' in name_lower:
        if '57' in name_lower:
            return 'Caños 57.5 cm'
        elif '86' in name_lower or '862' in name_lower:
            return 'Caño 5/8 (86.2 cm)'
        else:
            return 'Caños'
    if 'base' in name_lower:
        if 'cuadrada' in name_lower:
            return 'Bases cuadradas'
        elif 'redonda' in name_lower:
            return 'Bases redondas para clavar'
        elif any(k in name_lower for k in ['plástica', 'plastica', 'clavo', 'patas']):
            return 'Bases plásticas'
        else:
            return 'Bases plásticas'
    if 'tornillo' in name_lower:
        if 'varianta' in name_lower:
            return 'Tornillos varianta'
        elif 'allen' in name_lower:
            if '5' in name_lower:
                return 'Tornillos Allen 5 cm'
            elif '7' in name_lower:
                return 'Tornillos Allen 7 cm'
            else:
                return 'Tornillos Allen 5 cm'
        elif 'phillips' in name_lower or 'philips' in name_lower:
            if '5' in name_lower:
                return 'Tornillos Phillips 5 cm'
            elif '7' in name_lower:
                return 'Tornillos 7x50'
            else:
                return 'Tornillos Phillips 5 cm'
        elif '7 x 50' in name_lower or '7x50' in name_lower or '7x 50' in name_lower:
            return 'Tornillos 7x50'
        elif any(k in name_lower for k in ['3.5x16', '3,5x16', '3.5x15', '3,5x15', '3.5 x 16', '3,5 x 16']):
            return 'Tornillos 3.5x16'
        elif '3.5x20' in name_lower or '3,5x20' in name_lower or '3.5 x 20' in name_lower or '3,5 x 20' in name_lower:
            return 'Tornillos 3.5x20'
        elif '4x40' in name_lower or '4 x 40' in name_lower:
            return 'Tornillos 4x40'
        elif '4x30' in name_lower or '4 x 30' in name_lower:
            return 'Tornillos 4x30'
        elif '1.5' in name_lower or '1,5' in name_lower:
            return 'Tornillos 1.5 cm'
        elif '2.5' in name_lower or '2,5' in name_lower:
            return 'Tornillos 2.5 cm'
        elif '2' in name_lower:
            return 'Tornillos 2 cm'
        elif '3' in name_lower:
            return 'Tornillos de 3 cm'
        elif '4' in name_lower:
            return 'Tornillos 4 cm'
        elif '5' in name_lower:
            return 'Tornillos de 5 cm'
        else:
            return 'Tornillos'
    return name.strip().capitalize()

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
            
            starts_with_qty = re.match(r'^\d', item_lower) is not None or item_lower.startswith('set de')
            is_cola = 'cola' in item_lower
            is_known_tool = any(k in item_lower for k in TOOL_KEYWORDS)
            
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
            norm_name = normalize_item_name(raw_name)
            
            if is_tool:
                tools_list.append((qty, raw_name, norm_name))
            else:
                hardware_list.append((qty, raw_name, norm_name))
                
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
                    for q, raw, norm in hw:
                        unique_hw_names.add(norm)
                    for q, raw, norm in tl:
                        unique_tool_names.add(norm)
                except Exception as e:
                    print(f"Error in {f}: {e}")
                    
    print("Unique Normalized Hardware Names:")
    for n in sorted(list(unique_hw_names)):
        print(f"  - '{n}'")
        
    print("\nUnique Normalized Tool Names:")
    for n in sorted(list(unique_tool_names)):
        print(f"  - '{n}'")

if __name__ == "__main__":
    main()
