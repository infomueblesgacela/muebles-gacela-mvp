import os
import re
import fitz
import json
import shutil
import unicodedata
import pandas as pd

# Translation table for shifted control characters in encoded PDFs
SHIFTED_SPANISH = {
    '\x86': 'á',
    '\x8d': 'é',
    '\x91': 'í',
    '\x96': 'ó',
    '\x9b': 'ú',
    '\x95': 'ñ',
    '\x03': ' '
}

HARDWARE_KEYWORDS = [
    'tarugo', 'tornillo', 'perno', 'minifix', 'mini fix', 'caja', 'base', 'clavo', 'guia', 'guía',
    'cola', 'bisagra', 'manija', 'soporte', 'escuadra', 'carro', 'clip', 'traba', 'perfil', 'caño',
    'kit', 'botinero'
]

TOOL_KEYWORDS = [
    'martillo', 'destornillador', 'llave allen', 'llave', 'cinta metrica', 'cinta métrica', 'lapiz', 'lápiz',
    'taladro', 'mecha'
]

LINEA_MAP = {
    'clasica': 'Clásica',
    'comedores': 'Comedores',
    'curvalba': 'Curvalba',
    'gamer': 'Gamer',
    'infantil': 'Infantil',
    'kyoto': 'Kyoto',
    'nordik': 'Nordik'
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
            
            # Check if followed by a hardware or tool keyword (indicates next item in merged line)
            is_followed_by_hw_or_tool = False
            if i + 1 < len(words):
                next_word_clean = words[i+1].lower()
                next_word_clean = "".join(c for c in next_word_clean if c.isalnum())
                is_followed_by_hw_or_tool = any(k in next_word_clean for k in HARDWARE_KEYWORDS + TOOL_KEYWORDS)
            
            should_split = False
            if not preceded_by_no_split and not is_dim and not is_multiplier:
                should_split = True
            elif preceded_by_no_split and is_followed_by_hw_or_tool:
                should_split = True
                
            if should_split and i < len(words) - 1:
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
    return [clean_text(it) for it in items if it]

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
    
    # Tools Normalization (must be before specific hardware rules to catch merged tool-strings)
    if 'llave' in name_lower or ('allen' in name_lower and 'tornillo' not in name_lower):
        return 'Llave Allen'
    if 'martillo' in name_lower:
        return 'Martillo de carpintero'
    if 'destornillador' in name_lower or 'cruz' in name_lower:
        return 'Destornillador de punta en cruz'
    if 'cinta' in name_lower:
        return 'Cinta métrica'
    if 'taladro' in name_lower:
        return 'Taladro'
    if 'mecha' in name_lower:
        return 'Mecha'
        
    # 1. Bisagras
    if 'bisagra' in name_lower:
        if 'codo 15' in name_lower or 'codo15' in name_lower:
            return 'Bisagras codo 15'
        elif 'codo 9' in name_lower or 'codo9' in name_lower:
            return 'Bisagras codo 9'
        elif 'codo 0' in name_lower or 'codo0' in name_lower:
            return 'Bisagras codo 0'
        else:
            return 'Bisagras (otras)'
            
    # 2. Manijas / Tiradores (must be before screws)
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
            
    # 3. Guías metálicas (must be before screws)
    if 'guía' in name_lower or 'guia' in name_lower:
        if '30' in name_lower:
            return 'Guías metálicas 30 cm'
        elif '35' in name_lower or '350' in name_lower:
            return 'Guías metálicas 35 cm'
        elif '40' in name_lower or '400' in name_lower:
            return 'Guías metálicas 40 cm'
        else:
            return 'Guías metálicas'
            
    # 4. Pernos Minifix
    if any(k in name_lower for k in ['perno', 'minifix', 'mini fix']):
        return 'Pernos minifix con caja'
        
    # 5. Soportes
    if 'soporte' in name_lower:
        if 'estante' in name_lower:
            return 'Soportes de estantes'
        elif any(k in name_lower for k in ['caño', 'cano', 'caños', 'canos']):
            return 'Soportes de caños'
        else:
            return 'Soportes'
            
    # 6. Escuadras
    if 'escuadra' in name_lower:
        if 'plástica' in name_lower or 'plastica' in name_lower:
            return 'Escuadras plásticas'
        elif 'metálica' in name_lower or 'metalica' in name_lower:
            return 'Escuadras metálicas'
        else:
            return 'Escuadras'
            
    # 7. Tarugos
    if 'tarugo' in name_lower:
        if 'plástico' in name_lower or 'plastico' in name_lower:
            return 'Tarugos plásticos'
        else:
            return 'Tarugos 6x30'
            
    # 8. Cola
    if 'cola' in name_lower:
        return 'Cola (envase)'
        
    # 9. Clavos
    if 'clavo' in name_lower:
        return 'Set de clavos'
        
    # 10. Carros inferiores
    if 'carro' in name_lower:
        return 'Carros inferiores'
        
    # 11. Clips / Trabas / Perfiles / Caños / Kit botineros / Bases
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
            
    # 12. Tornillos
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
            if not raw_name.strip() or len(raw_name) < 2:
                continue
                
            is_tool = any(k in raw_name.lower() for k in ['martillo', 'destornillador', 'llave', 'cinta', 'taladro', 'mecha', 'lapiz'])
            if 'tornillo' in raw_name.lower():
                # If it has "tornillo" but starts with a tool keyword, it is still a tool (e.g. "Llave Allen según tornillo")
                starts_with_tool = any(raw_name.lower().strip().startswith(t) or re.match(r'^\d+\s+' + t, raw_name.lower().strip()) for t in ['llave', 'martillo', 'destornillador', 'cinta', 'taladro', 'mecha', 'lapiz'])
                if not starts_with_tool:
                    is_tool = False
                    
            norm_name = normalize_item_name(raw_name)
            
            if is_tool:
                tools_list.append((qty, raw_name, norm_name))
            else:
                hardware_list.append((qty, raw_name, norm_name))
                
    return hardware_list, tools_list

def get_product_metadata(art_code, products):
    folder_num = re.sub(r'^A0*', '', art_code).lower()
    for p in products:
        sku = str(p.get('SKU', '')).lower()
        manual_pdf = str(p.get('Manual_PDF', '')).lower()
        if art_code.lower() in manual_pdf:
            return p
        if folder_num in manual_pdf:
            return p
        if sku == art_code.lower() or sku == folder_num:
            return p
            
    # Relaxed search by numbers only
    folder_clean = re.sub(r'[^0-9]', '', art_code)
    for p in products:
        sku = str(p.get('SKU', '')).lower()
        sku_clean = re.sub(r'[^0-9]', '', sku)
        if sku_clean and folder_clean and sku_clean == folder_clean:
            return p
    return None

def strip_control_characters(s):
    if not isinstance(s, str):
        return s
    return "".join(c for c in s if ord(c) >= 32 or c in "\t\n\r")

def normalize_mapping_key(text):
    if not isinstance(text, str):
        return ""
    nfkd_form = unicodedata.normalize('NFKD', text)
    text_ascii = nfkd_form.encode('ascii', 'ignore').decode('utf-8')
    return text_ascii.lower().strip()

def main():
    base_dir = r"C:\Users\usuario\Documents\Oncede\Clientes\Muebles Gacela\Web\Muebles gacela MVP"
    manuals_dir = os.path.join(base_dir, "Manuales")
    excel_path = os.path.join(base_dir, "Herrajes_y_Herramientas_Muebles_Gacela.xlsx")
    json_path = os.path.join(base_dir, "data", "productos.json")
    herrajes_src_dir = os.path.join(base_dir, "herrajes")
    modelos_3d_dir = os.path.join(base_dir, "modelos_3d")
    report_path = os.path.join(base_dir, "resumen_deployment.json")

    print("Phase 1: Parsing PDF manuals and building Excel...")

    # Load products database
    with open(json_path, 'r', encoding='utf-8') as f:
        products = json.load(f).get('products', [])

    pdf_files = []
    for root, dirs, files in os.walk(manuals_dir):
        for f in files:
            if f.lower().endswith(".pdf"):
                pdf_files.append(os.path.join(root, f))
                
    total_files = len(pdf_files)
    print(f"Found {total_files} PDF manuals.")

    all_data = []

    for idx, pdf_path in enumerate(pdf_files):
        rel_path = os.path.relpath(pdf_path, manuals_dir)
        line_folder = os.path.basename(os.path.dirname(pdf_path)).replace("linea-", "").lower()
        line_name = LINEA_MAP.get(line_folder, line_folder.capitalize())
        
        # Product code is derived from filename (e.g. A712152)
        art_code = os.path.splitext(os.path.basename(pdf_path))[0]
        
        # Lookup clean description in database
        matched_prod = get_product_metadata(art_code, products)
        if matched_prod:
            art_desc = matched_prod.get('Nombre_Comercial', '')
        else:
            art_desc = art_code # Fallback
            
        print(f"[{idx+1}/{total_files}] Processing: {rel_path} -> Code: {art_code} | Desc: {art_desc[:30]}...")
        
        try:
            hardware, tools = extract_from_pdf(pdf_path)
            
            # Deduplicate and merge hardware quantities
            merged_hw = {}
            for qty, raw, norm in hardware:
                if norm in merged_hw:
                    merged_hw[norm]['qty'] += qty
                    merged_hw[norm]['raws'].append(raw)
                else:
                    merged_hw[norm] = {'qty': qty, 'raws': [raw]}
                    
            for norm_hw, info in merged_hw.items():
                all_data.append({
                    'Línea': line_name,
                    'Archivo': os.path.basename(pdf_path),
                    'Artículo': art_code,
                    'Descripción': art_desc,
                    'Tipo': 'Herraje',
                    'Elemento Original': ", ".join(set(info['raws'])),
                    'Elemento Normalizado': norm_hw,
                    'Cantidad': info['qty']
                })
                
            # Deduplicate tools (keep unique tools per article)
            unique_tools = {}
            for qty, raw, norm in tools:
                if norm not in unique_tools:
                    unique_tools[norm] = raw
                    
            for norm_tool, raw_tool in unique_tools.items():
                all_data.append({
                    'Línea': line_name,
                    'Archivo': os.path.basename(pdf_path),
                    'Artículo': art_code,
                    'Descripción': art_desc,
                    'Tipo': 'Herramienta',
                    'Elemento Original': raw_tool,
                    'Elemento Normalizado': norm_tool,
                    'Cantidad': 1  # 1 indicates present
                })
                
        except Exception as e:
            print(f"  ERROR processing {rel_path}: {e}")

    if not all_data:
        print("Error: No data extracted from manuals.")
        return

    df_detail = pd.DataFrame(all_data)
    for col in df_detail.columns:
        if df_detail[col].dtype == 'object':
            df_detail[col] = df_detail[col].apply(strip_control_characters)

    # Pivot to create Matriz Resumen sheet
    print("Generating Matriz Resumen...")
    df_hw_only = df_detail[df_detail['Tipo'] == 'Herraje']
    df_matrix_hw = df_hw_only.pivot_table(
        index=['Línea', 'Artículo', 'Descripción'],
        columns='Elemento Normalizado',
        values='Cantidad',
        aggfunc='sum'
    ).fillna(0).astype(int)

    df_tools_only = df_detail[df_detail['Tipo'] == 'Herramienta']
    df_matrix_tools = df_tools_only.pivot_table(
        index=['Línea', 'Artículo', 'Descripción'],
        columns='Elemento Normalizado',
        values='Cantidad',
        aggfunc='max'
    ).fillna(0)
    df_matrix_tools = df_matrix_tools.map(lambda val: 'X' if val == 1 else '')

    df_matrix = df_matrix_hw.merge(df_matrix_tools, left_index=True, right_index=True, how='outer').fillna(0)

    # Write to Excel
    print(f"Writing Excel to {excel_path}...")
    try:
        with pd.ExcelWriter(excel_path, engine='openpyxl') as writer:
            df_matrix.to_excel(writer, sheet_name='Matriz Resumen')
            df_detail.to_excel(writer, sheet_name='Detalle Plano', index=False)
        print("Excel written successfully.")
    except PermissionError:
        print(f"WARNING: Permission denied when writing to {excel_path}. Please close the file if it is open in Excel!")
        print("Attempting to write to Herrajes_y_Herramientas_Muebles_Gacela_REGENERADO.xlsx instead...")
        alternative_path = os.path.join(base_dir, "Herrajes_y_Herramientas_Muebles_Gacela_REGENERADO.xlsx")
        with pd.ExcelWriter(alternative_path, engine='openpyxl') as writer:
            df_matrix.to_excel(writer, sheet_name='Matriz Resumen')
            df_detail.to_excel(writer, sheet_name='Detalle Plano', index=False)
        print(f"Alternative Excel written to {alternative_path}.")
        excel_path = alternative_path

    print("\nPhase 2: Deploying digital assets (images) to product folders...")

    HERRAJES_MAPPING = {
        'bases cuadradas': ['base-plastica.webp'],
        'bases plasticas': ['base-plastica.webp'],
        'bases redondas para clavar': ['clavos-de-caucho.webp'],
        'bisagras codo 0': ['bisagra.webp'],
        'bisagras codo 15': ['bisagra.webp'],
        'bisagras codo 9': ['bisagra.webp'],
        'carros inferiores': ['carro-interior.webp'],
        'cano 5/8 (86.2 cm)': ['cano.webp'],
        'canos 57.5 cm': ['cano.webp'],
        'clips': ['clip.webp'],
        'cola (envase)': ['cola.webp'],
        'escuadras': ['escuadra.webp'],
        'escuadras metalicas': ['escuadra-metalica.webp'],
        'escuadras plasticas': ['escuadra_plastica.webp'],
        'guias metalicas': ['guias-metalicas.webp'],
        'guias metalicas 30 cm': ['guias-metalicas.webp'],
        'guias metalicas 35 cm': ['guias-metalicas.webp'],
        'guias metalicas 40 cm': ['guias-metalicas.webp'],
        'kit botineros': ['kit-botinero.webp'],
        'manijas athenas': ['manija-athenas.webp'],
        'manijas gama': ['manija.webp'],
        'manijas con tornillos': ['manija-con-tornillos-de-3-cm.webp'],
        'pernos minifix con caja': ['perno-minifix.webp', 'caja-minifix.webp'],
        'set de clavos': ['clavos.webp'],
        'soportes': ['soporte-de-estantes.webp'],
        'soportes de canos': ['soporte-de-canos.webp'],
        'soportes de estantes': ['soporte-de-estantes.webp'],
        'tarugos 6x30': ['tarugo-madera.webp'],
        'tarugos plasticos': ['tarugo-madera.webp'],
        'tirador bruno con tornillo': ['tirador-bruno-con-tornillo.webp'],
        'tirador boton': ['tirador-boton-con-tornillo.webp'],
        'tornillos 1.5 cm': ['tornillo-1-5.webp'],
        'tornillos 2 cm': ['tornillo-2.webp'],
        'tornillos 2.5 cm': ['tornillo-2.webp'],
        'tornillos 3.5x16': ['tornillo-3-5.webp'],
        'tornillos 3.5x20': ['tornillo-3-5.webp'],
        'tornillos 4 cm': ['tornillo-40.webp'],
        'tornillos 4x30': ['tornillo-40.webp'],
        'tornillos 4x40': ['tornillo-40.webp'],
        'tornillos allen 5 cm': ['tornillo_allen.webp'],
        'tornillos allen 7 cm': ['tornillo_allen.webp'],
        'tornillos phillips 5 cm': ['tornillo_allen.webp'],
        'tornillos de 3 cm': ['tornillo-3-5.webp'],
        'tornillos de 5 cm': ['tornillo_allen.webp'],
        'tornillos varianta': ['tornillo-varianta.webp'],
        'trabas': ['traba.webp']
    }

    TOOLS_MAPPING = {
        'llave allen': ['llave-allen.webp'],
        'martillo de carpintero': ['martillo.webp'],
        'destornillador de punta en cruz': ['destornillador.webp'],
        'cinta metrica': [],
        'taladro': [],
        'mecha': [],
        'lapiz': []
    }

    # Verify input paths
    if not os.path.exists(herrajes_src_dir):
        print(f"Error: Source herrajes directory not found at {herrajes_src_dir}")
        return
    if not os.path.exists(modelos_3d_dir):
        print(f"Error: Target modelos_3d directory not found at {modelos_3d_dir}")
        return

    # Filter dataframes for processing
    df_herrajes = df_detail[df_detail['Tipo'] == 'Herraje'].copy()
    df_herrajes['Normalized_Key'] = df_herrajes['Elemento Normalizado'].apply(normalize_mapping_key)

    df_tools = df_detail[df_detail['Tipo'] == 'Herramienta'].copy()
    df_tools['Normalized_Key'] = df_tools['Elemento Normalizado'].apply(normalize_mapping_key)

    # Scan for product folders in modelos_3d
    product_folders = []
    for line_folder in os.listdir(modelos_3d_dir):
        line_path = os.path.join(modelos_3d_dir, line_folder)
        if not os.path.isdir(line_path) or not line_folder.startswith('linea-'):
            continue
        for prod_folder in os.listdir(line_path):
            prod_path = os.path.join(line_path, prod_folder)
            if os.path.isdir(prod_path):
                product_folders.append({
                    'line': line_folder,
                    'product': prod_folder,
                    'path': prod_path
                })

    print(f"Found {len(product_folders)} active product folders in modelos_3d.")

    copied_files_report = []
    errors_report = []
    stats = {
        'total_products_scanned': len(product_folders),
        'total_products_updated': 0,
        'total_herrajes_copied': 0,
        'total_tools_copied': 0,
        'total_images_copied': 0,
        'total_errors_encountered': 0
    }

    available_src_files = set(os.listdir(herrajes_src_dir))

    for prod in product_folders:
        folder_name = prod['product']
        line_name = prod['line']
        prod_path = prod['path']

        # ----------------------------------------------------
        # PROCESS HARDWARE (HERRAJES)
        # ----------------------------------------------------
        prod_h_df = df_herrajes[df_herrajes['Artículo'].str.lower() == folder_name.lower()]
        target_herrajes_dir = os.path.join(prod_path, "herrajes")
        
        # Clean target directory
        if os.path.exists(target_herrajes_dir):
            shutil.rmtree(target_herrajes_dir)
        os.makedirs(target_herrajes_dir, exist_ok=True)

        copied_for_this_product = 0

        if not prod_h_df.empty:
            unique_h_keys = prod_h_df['Normalized_Key'].unique()
            for key in unique_h_keys:
                orig_names = prod_h_df[prod_h_df['Normalized_Key'] == key]['Elemento Normalizado'].unique()
                orig_name = orig_names[0] if len(orig_names) > 0 else key

                if key not in HERRAJES_MAPPING:
                    reason = f"No image mapping defined for hardware '{orig_name}' (normalized: '{key}')"
                    errors_report.append({
                        'product': folder_name,
                        'line': line_name,
                        'type': 'Herraje',
                        'item': orig_name,
                        'reason': reason
                    })
                    stats['total_errors_encountered'] += 1
                    continue

                mapped_images = HERRAJES_MAPPING[key]
                for img_name in mapped_images:
                    if img_name not in available_src_files:
                        reason = f"Mapped image file '{img_name}' for hardware '{orig_name}' does not exist in source folder."
                        errors_report.append({
                            'product': folder_name,
                            'line': line_name,
                            'type': 'Herraje',
                            'item': orig_name,
                            'reason': reason
                        })
                        stats['total_errors_encountered'] += 1
                        continue

                    src_file_path = os.path.join(herrajes_src_dir, img_name)
                    dest_file_path = os.path.join(target_herrajes_dir, img_name)

                    try:
                        shutil.copy2(src_file_path, dest_file_path)
                        rel_dest = os.path.relpath(dest_file_path, base_dir).replace('\\', '/')
                        copied_files_report.append({
                            'product': folder_name,
                            'line': line_name,
                            'type': 'Herraje',
                            'file_copied': img_name,
                            'destination': rel_dest
                        })
                        copied_for_this_product += 1
                        stats['total_herrajes_copied'] += 1
                        stats['total_images_copied'] += 1
                    except Exception as e:
                        reason = f"Failed to copy hardware image '{img_name}': {str(e)}"
                        errors_report.append({
                            'product': folder_name,
                            'line': line_name,
                            'type': 'Herraje',
                            'item': orig_name,
                            'reason': reason
                        })
                        stats['total_errors_encountered'] += 1

        # ----------------------------------------------------
        # PROCESS TOOLS (HERRAMIENTAS)
        # ----------------------------------------------------
        prod_t_df = df_tools[df_tools['Artículo'].str.lower() == folder_name.lower()]
        target_tools_dir = os.path.join(prod_path, "herramientas")

        # Clean target directory
        if os.path.exists(target_tools_dir):
            shutil.rmtree(target_tools_dir)
        os.makedirs(target_tools_dir, exist_ok=True)

        if not prod_t_df.empty:
            unique_t_keys = prod_t_df['Normalized_Key'].unique()
            for key in unique_t_keys:
                orig_names = prod_t_df[prod_t_df['Normalized_Key'] == key]['Elemento Normalizado'].unique()
                orig_name = orig_names[0] if len(orig_names) > 0 else key

                if key not in TOOLS_MAPPING:
                    reason = f"No image mapping defined for tool '{orig_name}' (normalized: '{key}')"
                    errors_report.append({
                        'product': folder_name,
                        'line': line_name,
                        'type': 'Herramienta',
                        'item': orig_name,
                        'reason': reason
                    })
                    stats['total_errors_encountered'] += 1
                    continue

                mapped_images = TOOLS_MAPPING[key]
                if not mapped_images:
                    reason = f"Tool '{orig_name}' is required but has no image file in source folder (missing tool asset)"
                    errors_report.append({
                        'product': folder_name,
                        'line': line_name,
                        'type': 'Herramienta',
                        'item': orig_name,
                        'reason': reason
                    })
                    stats['total_errors_encountered'] += 1
                    continue

                for img_name in mapped_images:
                    if img_name not in available_src_files:
                        reason = f"Mapped image file '{img_name}' for tool '{orig_name}' does not exist in source folder."
                        errors_report.append({
                            'product': folder_name,
                            'line': line_name,
                            'type': 'Herramienta',
                            'item': orig_name,
                            'reason': reason
                        })
                        stats['total_errors_encountered'] += 1
                        continue

                    src_file_path = os.path.join(herrajes_src_dir, img_name)
                    dest_file_path = os.path.join(target_tools_dir, img_name)

                    try:
                        shutil.copy2(src_file_path, dest_file_path)
                        rel_dest = os.path.relpath(dest_file_path, base_dir).replace('\\', '/')
                        copied_files_report.append({
                            'product': folder_name,
                            'line': line_name,
                            'type': 'Herramienta',
                            'file_copied': img_name,
                            'destination': rel_dest
                        })
                        copied_for_this_product += 1
                        stats['total_tools_copied'] += 1
                        stats['total_images_copied'] += 1
                    except Exception as e:
                        reason = f"Failed to copy tool image '{img_name}': {str(e)}"
                        errors_report.append({
                            'product': folder_name,
                            'line': line_name,
                            'type': 'Herramienta',
                            'item': orig_name,
                            'reason': reason
                        })
                        stats['total_errors_encountered'] += 1

        if copied_for_this_product > 0:
            stats['total_products_updated'] += 1

    # Save report
    final_report = {
        'status': 'completed',
        'summary': stats,
        'copied_files': copied_files_report,
        'errors': errors_report
    }

    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(final_report, f, indent=2, ensure_ascii=False)

    print(f"\nProcessing and deployment complete!")
    print(f"Excel regenerated at: {excel_path}")
    print(f"Scanned products: {stats['total_products_scanned']}")
    print(f"Updated products: {stats['total_products_updated']}")
    print(f"Total herrajes copied: {stats['total_herrajes_copied']}")
    print(f"Total tools copied: {stats['total_tools_copied']}")
    print(f"Total images copied: {stats['total_images_copied']}")
    print(f"Total errors/warnings logged: {stats['total_errors_encountered']}")
    print(f"Report saved to: {report_path}")

if __name__ == "__main__":
    main()
