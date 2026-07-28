import os
import re
import fitz
import pandas as pd
import sys

# Configure standard output to use UTF-8 to prevent encoding crashes on Windows console
sys.stdout.reconfigure(encoding='utf-8')

# Translation table for shifted control characters in encoded PDFs (e.g. A710150.pdf)
SHIFTED_SPANISH = {
    '\x86': 'á',
    '\x8d': 'é',
    '\x91': 'í',
    '\x96': 'ó',
    '\x9b': 'ú',
    '\x95': 'ñ',
    '\x03': ' '
}

# Hardware keywords to check if a line is a hardware item
HARDWARE_KEYWORDS = [
    'tarugo', 'tornillo', 'perno', 'minifix', 'mini fix', 'caja', 'base', 'clavo', 'guia', 'guía',
    'cola', 'bisagra', 'manija', 'soporte', 'escuadra', 'carro', 'clip', 'traba', 'perfil', 'caño',
    'kit', 'botinero'
]

# Tool keywords to check if a line is a tool
TOOL_KEYWORDS = [
    'martillo', 'destornillador', 'llave allen', 'cinta metrica', 'cinta métrica', 'lapiz', 'lápiz',
    'taladro', 'mecha'
]

# Exclusion keywords (wooden parts or general text)
PART_KEYWORDS = [
    'tapa', 'piso', 'costado', 'separador', 'fondo', 'frente', 'zocalo', 'zócalo', 'refuerzo',
    'estante', 'faja', 'puerta', 'repisa', 'escritorio', 'cómoda', 'comoda', 'placard', 'mesa',
    'cajon', 'cajón', 'mantenimiento', 'importante', 'advertencia', 'pagina', 'página', 'modelo armado',
    'usar regla', 'tamaño de tornillos', 'cara derecha', 'cara izquierda', 'preparar', 'prepare',
    'coloque', 'atornille', 'clave', 'repita', 'realice', 'cazoleta 26 y 3 casoleta'
]

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
    # Check shift between -100 and 100
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
    # Fallback to check lowercase target
    target_lower = "elementos provistos"
    for s in range(-100, 100):
        if s == 0:
            continue
        try:
            if any(ord(c) - s < 0 or ord(c) - s > 0x10FFFF for c in target_lower):
                continue
            shifted_target = "".join(chr(ord(c) - s) for c in target_lower)
            if shifted_target in text:
                return s
        except Exception:
            continue
    return 0

def strip_control_characters(s):
    if not isinstance(s, str):
        return s
    # Keep only characters that are valid in XML (no control characters except tab, LF, CR)
    return "".join(c for c in s if ord(c) >= 32 or c in "\t\n\r")

def clean_text(text):
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def parse_elements(text_block):
    # Split blocks that contain multiple items in columns
    words = text_block.split()
    items = []
    current_item = []
    
    NO_SPLIT_PREDECESSORS = ['de', 'o', 'y', 'codo', 'cazoleta', 'casoleta', 'n°', 'n', 'no', 'nro', 'allen', 'llave']
    
    for i, word in enumerate(words):
        is_start = False
        
        # Check if word is a number starting a new item
        if re.match(r'^\d+$', word):
            # Check if preceded by a word that indicates it belongs to the same name/dimension
            preceded_by_no_split = (len(current_item) > 0 and current_item[-1].lower() in NO_SPLIT_PREDECESSORS)
            
            # Check if followed by "x" or dimension units
            is_dim = False
            if i + 1 < len(words):
                next_word = words[i+1].lower()
                if next_word.startswith('x') or next_word in ['cm', 'mm', 'codo', 'cazoleta', 'casoleta', 'n°', 'n', 'no']:
                    is_dim = True
            
            # Check if preceded by "x" (multiplier in parts list)
            is_multiplier = (len(current_item) > 0 and current_item[-1].lower() == 'x')
            
            # Only split if not preceded by no-split terms, not a dimension, not a multiplier, AND not the last word!
            if not preceded_by_no_split and not is_dim and not is_multiplier and i < len(words) - 1:
                if current_item:
                    items.append(" ".join(current_item))
                    current_item = []
                is_start = True
        
        # Check for keywords like "Set de", "Llave", "Martillo", "Destornillador"
        elif word.lower() in ['set', 'llave', 'martillo', 'destornillador', 'cinta']:
            if word.lower() == 'set':
                if i + 1 < len(words) and words[i+1].lower() == 'de':
                    if current_item:
                        items.append(" ".join(current_item))
                        current_item = []
                    is_start = True
            else:
                # Only split if not preceded by "de" or similar (e.g. "2 Tornillos Allen" shouldn't split on Allen)
                # But tools are usually at the start of a block, so if they are preceded by nothing, or by a complete item:
                # Actually, tools like "Llave Allen" shouldn't split on Allen.
                # If we see "Llave" or "Martillo", we can split, but only if it's not preceded by things like "tornillos" or "de"
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

def normalize_item_name(name):
    name_lower = name.lower()
    
    # 1. Tarugos
    if 'tarugo' in name_lower:
        return 'Tarugos 6x30'
        
    # 2. Pernos Minifix
    if any(k in name_lower for k in ['perno', 'minifix', 'mini fix']):
        return 'Pernos minifix con caja'
        
    # 3. Cola
    if 'cola' in name_lower:
        return 'Cola (envase)'
        
    # 4. Clavos
    if 'clavo' in name_lower:
        return 'Set de clavos'
        
    # 5. Bases plásticas
    if 'base' in name_lower and any(k in name_lower for k in ['plástica', 'plastica', 'clavo', 'patas']):
        return 'Bases plásticas'
        
    # 6. Tornillos varianta
    if 'varianta' in name_lower:
        return 'Tornillos varianta'
        
    # 7. Tornillos Allen 5 cm
    if 'allen' in name_lower and ('5' in name_lower or '5cm' in name_lower):
        return 'Tornillos Allen 5 cm'
        
    # 8. Tornillos Phillips 5 cm
    if ('phillips' in name_lower or 'philips' in name_lower) and ('5' in name_lower or '5cm' in name_lower):
        return 'Tornillos Phillips 5 cm'
        
    # 9. Tornillos de 7x50 (Phillips/Allen)
    if '7 x 50' in name_lower or '7x50' in name_lower or '7x 50' in name_lower:
        return 'Tornillos 7x50'
        
    # 10. Tornillos 3.5x16 / 3.5x15
    if any(k in name_lower for k in ['3.5x16', '3,5x16', '3.5x15', '3,5x15', '3.5 x 16', '3,5 x 16']):
        return 'Tornillos 3.5x16'
        
    # 11. Tornillos 4x40
    if '4x40' in name_lower or '4 x 40' in name_lower:
        return 'Tornillos 4x40'
        
    # 12. Tornillos 4x30
    if '4x30' in name_lower or '4 x 30' in name_lower:
        return 'Tornillos 4x30'
        
    # 13. Tornillos 3.5x20
    if '3.5x20' in name_lower or '3,5x20' in name_lower or '3.5 x 20' in name_lower:
        return 'Tornillos 3.5x20'
        
    # 14. Tornillos 2 cm
    if 'de 2 cm' in name_lower or 'de 2cm' in name_lower or 'de 2  cm' in name_lower:
        return 'Tornillos 2 cm'
        
    # 15. Tornillos 4 cm
    if 'de 4 cm' in name_lower or 'de 4cm' in name_lower or 'de 4  cm' in name_lower:
        return 'Tornillos 4 cm'
        
    # 16. Tornillos 1.5 cm
    if any(k in name_lower for k in ['1.5 cm', '1.5cm', '1,5 cm', '1,5cm', '1.5  cm']):
        return 'Tornillos 1.5 cm'
        
    # 17. Tornillos 2.5 cm
    if any(k in name_lower for k in ['2.5 cm', '2.5cm', '2,5 cm', '2,5cm', '2.5  cm']):
        return 'Tornillos 2.5 cm'
        
    # 18. Guías metálicas 30 cm
    if 'guía' in name_lower or 'guia' in name_lower:
        if '30' in name_lower:
            return 'Guías metálicas 30 cm'
        elif '35' in name_lower or '350' in name_lower:
            return 'Guías metálicas 35 cm'
        elif '40' in name_lower or '400' in name_lower:
            return 'Guías metálicas 40 cm'
        else:
            return 'Guías metálicas'
            
    # 19. Escuadras plásticas
    if 'escuadra' in name_lower and ('plástica' in name_lower or 'plastica' in name_lower):
        return 'Escuadras plásticas'
        
    # 20. Escuadras metálicas
    if 'escuadra' in name_lower and ('metálica' in name_lower or 'metalica' in name_lower):
        return 'Escuadras metálicas'
        
    # 21. Soportes de estantes
    if 'soporte' in name_lower and 'estante' in name_lower:
        return 'Soportes de estantes'
        
    # 22. Soportes de caños
    if 'soporte' in name_lower and ('caño' in name_lower or 'canos' in name_lower or 'caños' in name_lower):
        return 'Soportes de caños'
        
    # 23. Bisagras codo 15
    if 'bisagra' in name_lower and ('codo 15' in name_lower or 'codo15' in name_lower):
        return 'Bisagras codo 15'
        
    # 24. Bisagras codo 9
    if 'bisagra' in name_lower and ('codo 9' in name_lower or 'codo9' in name_lower):
        return 'Bisagras codo 9'
        
    # 25. Bisagras codo 0
    if 'bisagra' in name_lower and ('codo 0' in name_lower or 'codo0' in name_lower):
        return 'Bisagras codo 0'
        
    # 26. Bisagras (otras/general)
    if 'bisagra' in name_lower:
        return 'Bisagras (otras)'
        
    # 27. Manijas con tornillos
    if 'manija' in name_lower:
        if 'athenas' in name_lower:
            return 'Manijas Athenas'
        elif 'gama' in name_lower:
            return 'Manijas Gama'
        else:
            return 'Manijas con tornillos'
            
    # 28. Caños
    if 'caño' in name_lower or 'cano' in name_lower:
        if '57' in name_lower:
            return 'Caños 57.5 cm'
        elif '86' in name_lower or '862' in name_lower:
            return 'Caño 5/8 (86.2 cm)'
        else:
            return 'Caños'
            
    # 29. Carros inferiores
    if 'carro' in name_lower:
        return 'Carros inferiores'
        
    # 30. Clips / Trabas / Perfiles
    if 'clip' in name_lower:
        return 'Clips'
    if 'traba' in name_lower:
        return 'Trabas'
    if 'perfil' in name_lower and ('inferior' in name_lower or 'inf' in name_lower):
        return 'Perfiles guía inferior'
    if 'perfil' in name_lower and ('superior' in name_lower or 'sup' in name_lower):
        return 'Perfiles guía superior'
        
    # 31. Kit botinero
    if 'botinero' in name_lower:
        return 'Kit botineros'
        
    # 32. Llave Allen
    if 'llave' in name_lower or ('allen' in name_lower and 'tornillo' not in name_lower):
        return 'Llave Allen'
    # 33. Martillo
    if 'martillo' in name_lower:
        return 'Martillo de carpintero'
    # 34. Destornillador
    if 'destornillador' in name_lower:
        return 'Destornillador de punta en cruz'
    # 35. Cinta métrica
    if 'cinta' in name_lower:
        return 'Cinta métrica'
        
    # Default: Capitalize the first letter and keep it clean
    return name.strip().capitalize()

def parse_quantity_and_name(item_text):
    # Extract quantity number and description
    # Cases:
    # "4 Tarugos 6x30" -> qty=4, name="Tarugos 6x30"
    # "Set de Clavos" -> qty=1, name="Set de Clavos"
    # "1 Par de guías..." -> qty=1, name="Par de guías..."
    # "Llave Allen" -> qty=1, name="Llave Allen"
    
    item_text = clean_text(item_text)
    
    # Check if starts with "Set de"
    if item_text.lower().startswith("set de"):
        return 1, item_text
        
    # Check if starts with a number
    match = re.match(r'^(\d+)\s*(?:Pares? de|pares? de|Envases? de|envases? de|Pares?|pares?|Envases?|envases?)?\s*(.*)$', item_text)
    if match:
        qty = int(match.group(1))
        name = match.group(2).strip()
        # If the name starts with "de ", clean it
        if name.lower().startswith("de "):
            name = name[3:].strip()
        return qty, name
        
    return 1, item_text

def extract_from_pdf(pdf_path):
    doc = fitz.open(pdf_path)
    page = doc.load_page(0)
    text = page.get_text()
    
    # 1. Detect shift
    shift = get_text_shift(text)
    
    # 2. Extract blocks
    blocks = page.get_text("blocks")
    blocks.sort(key=lambda b: (b[1], b[0]))
    
    # 3. Identify Article Code and Description
    art_code = "UNKNOWN"
    art_desc = ""
    art_block_idx = -1
    
    for idx, b in enumerate(blocks):
        x0, y0, x1, y1, text_block, block_no, block_type = b
        decoded = decode_text(text_block, shift).strip()
        if "art." in decoded.lower():
            art_code_raw = decoded
            art_block_idx = idx
            
            # Use regex to split code and desc
            match = re.search(r'(?i)art\.?\s*([0-9a-zA-Z\s\-\/\\yY]+)(?:\b|-|:)\s*(.*)', decoded)
            if match:
                art_code = match.group(1).strip().rstrip('-').strip()
                art_desc = match.group(2).strip().lstrip('-').strip()
            else:
                art_code = decoded
            break
            
    # Fallback for description if empty
    if not art_desc and art_block_idx != -1 and art_block_idx + 1 < len(blocks):
        # Take the next block as description if it doesn't look like part list or instructions
        next_decoded = decode_text(blocks[art_block_idx + 1][4], shift).strip()
        if len(next_decoded) > 5 and not any(k in next_decoded.lower() for k in ["modelo armado", "elementos provistos", "mantenimiento"]):
            art_desc = next_decoded
            
    # Clean up fallback code from filename if UNKNOWN
    if art_code == "UNKNOWN" or not art_code:
        art_code = os.path.splitext(os.path.basename(pdf_path))[0]
        
    # 4. Find Elementos Provistos Y coordinate threshold
    y_provistos = 350.0 # Default fallback
    for b in blocks:
        x0, y0, x1, y1, text_block, block_no, block_type = b
        decoded = decode_text(text_block, shift).lower()
        if "elementos provistos" in decoded:
            y_provistos = y0
            break
            
    # 5. Extract hardware and tools
    hardware_list = []
    tools_list = []
    
    for b in blocks:
        x0, y0, x1, y1, text_block, block_no, block_type = b
        
        # We only look at blocks below the Elementos Provistos header
        if y0 < y_provistos - 10: # small margin
            continue
            
        decoded = decode_text(text_block, shift).replace('\n', ' ').strip()
        if not decoded:
            continue
            
        # Skip description, rules, maintenance blocks
        decoded_lower = decoded.lower()
        if any(k in decoded_lower for k in ['mantenimiento', 'importante', 'advertencia', 'modelo armado', 'pagina 1', 'página 1', 'usar regla para verificar']):
            continue
        if len(decoded) > 100: # too long, likely an instruction
            continue
            
        # Skip ruler blocks (usually containing '0 cm' or 'O cm')
        if re.search(r'\b0\s*cm\b|\b[oO]\s*cm\b', decoded_lower):
            continue
            
        split_items = parse_elements(decoded)
        for item in split_items:
            item_lower = item.lower()
            
            # Exclude headers and standard texts
            if any(h in item_lower for h in ['elementos provistos', 'herramientas adicionales', 'mantenimiento', 'importante', 'advertencia', 'descripción', 'descripcion']):
                continue
                
            is_part = any(k in item_lower for k in PART_KEYWORDS)
            
            # Strong hardware keywords that override part keywords (e.g. "soporte de estantes" contains "estante")
            strong_hw_keywords = ['tarugo', 'tornillo', 'perno', 'minifix', 'mini fix', 'clavo', 'cola', 'bisagra', 'manija', 'carro', 'clip', 'traba', 'kit', 'llave', 'martillo', 'destornillador']
            has_strong_hw = any(k in item_lower for k in strong_hw_keywords)
            
            if is_part and not has_strong_hw:
                continue
                
            starts_with_qty = re.match(r'^\d', item) is not None or item_lower.startswith('set de')
            is_known_tool = any(k in item_lower for k in TOOL_KEYWORDS)
            is_cola = 'cola' in item_lower
            
            if not (starts_with_qty or is_known_tool or is_cola):
                continue
                
            qty, raw_name = parse_quantity_and_name(item)
            if not raw_name.strip():
                continue
            norm_name = normalize_item_name(raw_name)
            
            # Classify as Tool or Hardware
            if is_known_tool or any(k in norm_name.lower() for k in ['llave', 'allen', 'cinta', 'martillo', 'destornillador']):
                tools_list.append((raw_name, norm_name))
            else:
                hardware_list.append((qty, raw_name, norm_name))
                    
    # Clean duplicates in tools (keep unique tools per article)
    tools_list = list(set(tools_list))
    
    # Deduplicate/merge hardware quantities if same element extracted twice (rare but safe)
    merged_hardware = {}
    for qty, raw, norm in hardware_list:
        if norm in merged_hardware:
            merged_hardware[norm]['qty'] += qty
        else:
            merged_hardware[norm] = {'qty': qty, 'raw': raw}
            
    final_hw = [(info['qty'], info['raw'], norm) for norm, info in merged_hardware.items()]
    
    return art_code, clean_text(art_desc), final_hw, tools_list

def main():
    manuals_dir = r"C:\Users\usuario\Documents\Oncede\Clientes\Muebles Gacela\Web\Muebles gacela MVP\Manuales"
    excel_path = r"C:\Users\usuario\Documents\Oncede\Clientes\Muebles Gacela\Web\Muebles gacela MVP\Herrajes_y_Herramientas_Muebles_Gacela.xlsx"
    
    all_data = []
    
    print("Iniciando escaneo de manuales...")
    
    pdf_files = []
    for root, dirs, files in os.walk(manuals_dir):
        for f in files:
            if f.lower().endswith(".pdf"):
                pdf_files.append(os.path.join(root, f))
                
    total_files = len(pdf_files)
    print(f"Se encontraron {total_files} archivos PDF.")
    
    # Process each PDF
    for idx, pdf_path in enumerate(pdf_files):
        rel_path = os.path.relpath(pdf_path, manuals_dir)
        line_name = os.path.basename(os.path.dirname(pdf_path)).replace("linea-", "").capitalize()
        
        print(f"[{idx+1}/{total_files}] Procesando: {rel_path} ...")
        try:
            art_code, art_desc, hardware, tools = extract_from_pdf(pdf_path)
            
            # Store details for Plano / Detalle tab
            for qty, raw_hw, norm_hw in hardware:
                all_data.append({
                    'Línea': line_name,
                    'Archivo': os.path.basename(pdf_path),
                    'Artículo': art_code,
                    'Descripción': art_desc,
                    'Tipo': 'Herraje',
                    'Elemento Original': raw_hw,
                    'Elemento Normalizado': norm_hw,
                    'Cantidad': qty
                })
                
            for raw_tool, norm_tool in tools:
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
                
            if not hardware and not tools:
                print(f"  AVISO: No se extrajeron elementos de {rel_path}")
                
        except Exception as e:
            print(f"  ERROR en {rel_path}: {e}")
            
    if not all_data:
        print("No se pudieron extraer datos de ningún manual.")
        return
        
    df_detail = pd.DataFrame(all_data)
    # Apply strip_control_characters to all object/string columns to prevent Excel write errors
    for col in df_detail.columns:
        if df_detail[col].dtype == 'object':
            df_detail[col] = df_detail[col].apply(strip_control_characters)
    
    # Pivot to create Pestaña 1: Matriz de doble entrada (Resumen)
    print("\nGenerando matriz resumen...")
    
    # Create unique identifier for index
    df_hw_only = df_detail[df_detail['Tipo'] == 'Herraje']
    df_matrix_hw = df_hw_only.pivot_table(
        index=['Línea', 'Artículo', 'Descripción'],
        columns='Elemento Normalizado',
        values='Cantidad',
        aggfunc='sum'
    ).fillna(0).astype(int)
    
    # Create tool presence matrix
    df_tools_only = df_detail[df_detail['Tipo'] == 'Herramienta']
    df_matrix_tools = df_tools_only.pivot_table(
        index=['Línea', 'Artículo', 'Descripción'],
        columns='Elemento Normalizado',
        values='Cantidad',
        aggfunc='max'
    ).fillna(0)
    # Map 1 to 'X' and 0 to '' for tools to make it look clean
    df_matrix_tools = df_matrix_tools.map(lambda val: 'X' if val == 1 else '')
    
    # Merge hardware and tools matrices
    df_matrix = df_matrix_hw.merge(df_matrix_tools, left_index=True, right_index=True, how='outer').fillna(0)
    
    # Save to Excel using openpyxl writer to format nicely
    print(f"Guardando Excel en: {excel_path} ...")
    with pd.ExcelWriter(excel_path, engine='openpyxl') as writer:
        # Pestaña 1: Matriz Resumen
        df_matrix.to_excel(writer, sheet_name='Matriz Resumen')
        # Pestaña 2: Detalle Plano
        df_detail.to_excel(writer, sheet_name='Detalle Plano', index=False)
        
    print("\nProceso completado con éxito!")
    print(f"Se procesaron {total_files} manuales.")
    print(f"Se generó el archivo Excel con {len(df_detail)} registros de detalle.")
    
    # Generate markdown table for a quick preview in the walkthrough
    md_summary = df_detail.groupby('Tipo')['Elemento Normalizado'].nunique().reset_index()
    print("\nResumen de elementos únicos extraídos:")
    print(md_summary)

if __name__ == "__main__":
    main()
