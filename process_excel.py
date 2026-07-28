import pandas as pd
import re
import os

file_path = 'productos_auditados.xlsx'
base_dir = 'Artículos Gacela Muebles 2026'

xl = pd.ExcelFile(file_path)

df_base = pd.read_excel(xl, sheet_name='plantilla_productos')
df_ext = pd.read_excel(xl, sheet_name='Extracción de Datos de Catálogo')
df_sync = pd.read_excel(xl, sheet_name='planitlla_productos_sincronizad')
df_zeta = pd.read_excel(xl, sheet_name='ZETA')

df_zeta.columns = [c.strip() for c in df_zeta.columns]
def extract_digits(x):
    if pd.isna(x): return ""
    return re.sub(r'[^0-9]', '', str(x))
df_zeta['SKU_clean'] = df_zeta['ID Artículo'].apply(extract_digits)
df_sync['SKU_clean'] = df_sync['SKU'].apply(extract_digits)

def get_sku_from_path(path):
    basename = os.path.basename(path)
    m = re.search(r'[\d-]+', basename)
    if m:
        digits = re.sub(r'[^0-9]', '', m.group(0))
        if digits: return digits
    m = re.search(r'Art\s*([\d-]+)', path, re.IGNORECASE)
    if m:
        return re.sub(r'[^0-9]', '', m.group(1))
    return ""

def get_color_keywords(name):
    words = re.split(r'[^a-zA-Z]+', name.lower())
    keys = set()
    for w in words:
        if not w: continue
        if w.startswith('blanc'): keys.add('blanc')
        elif w in ('calvalho', 'carvalho'): keys.add('carvalho')
        elif w == 'roble': keys.add('roble')
        elif w == 'miel': keys.add('miel')
        elif w == 'negro': keys.add('negro')
        elif w == 'rojo': keys.add('rojo')
        elif w == 'wengue': keys.add('wengue')
        elif w.startswith('baltic') or w.startswith('báltic'): keys.add('baltico')
        elif w == 'abedul': keys.add('abedul')
        elif w == 'gris': keys.add('gris')
    return keys

local_pdfs = {}
local_images = {}

for root, dirs, files in os.walk(base_dir):
    for f in files:
        folder_digits = get_sku_from_path(root)
        if not folder_digits: continue
        
        rel_path = "/" + os.path.join(root, f).replace('\\', '/')
        lower_name = f.lower()
        
        if lower_name.endswith('.pdf'):
            if folder_digits not in local_pdfs:
                local_pdfs[folder_digits] = []
            local_pdfs[folder_digits].append(rel_path)
        elif lower_name.endswith(('.png', '.jpg', '.jpeg', '.webp')):
            if folder_digits not in local_images:
                local_images[folder_digits] = []
            local_images[folder_digits].append({'name': lower_name, 'path': rel_path, 'folder': os.path.basename(root)})

ext_measures = {}
grouped = df_ext.groupby('Código de Artículo (Art / SKU)')
for sku, group in grouped:
    sku_clean = extract_digits(sku)
    if len(group) == 1:
        ext_measures[sku_clean] = str(group.iloc[0]['Medidas (cm)'])
    else:
        pieces = []
        for _, row in group.iterrows():
            name = str(row['Nombre del Producto'])
            medida = str(row['Medidas (cm)'])
            m = re.search(r'\((.*?)\)', name)
            if m:
                piece_name = m.group(1).strip()
            else:
                piece_name = name.strip()
            pieces.append(f"{piece_name}: {medida}")
        ext_measures[sku_clean] = " | ".join(pieces)

df_base['SKU_stripped'] = df_base['SKU'].astype(str).str.strip()
sku_counts = df_base['SKU_stripped'].value_counts()
final_rows = []

colors_keywords = ['blanco', 'rojo', 'negro', 'roble', 'carvalho', 'miel', 'wengue', 'báltico', 'baltico', 'abedul', 'gris']

for _, row in df_base.iterrows():
    sku = str(row['SKU']).strip()
    sku_clean = extract_digits(sku)
    nombre = str(row['Nombre_Comercial']).strip()
    
    color = ""
    m = re.search(r'\(([^)]+)\)$', nombre)
    if m:
        color = m.group(1).strip()
    else:
        words = nombre.split()
        found_colors = []
        for w in words:
            parts = re.split(r'[/|-]', w)
            if any(p.lower() in colors_keywords for p in parts):
                found_colors.append(w)
        if found_colors:
            color = " ".join(found_colors)
            
    if not color:
        sync_match = df_sync[df_sync['SKU_clean'] == sku_clean]
        if not sync_match.empty and 'Color' in sync_match.columns:
            if pd.notna(sync_match.iloc[0]['Color']):
                color = str(sync_match.iloc[0]['Color']).strip()
    
    final_sku = sku
    if sku_counts.get(sku, 0) > 1 and color:
        suffix = "".join([w[0].upper() for w in re.split(r'[^a-zA-Z]', color) if w])
        if suffix:
            final_sku = f"{sku}-{suffix}"
            
    zeta_match = df_zeta[df_zeta['SKU_clean'] == sku_clean]
    pdf_link = ""
    if not zeta_match.empty:
        pdf_link = str(zeta_match.iloc[0]['Archivo PDF']).strip()
        if pdf_link.lower() == 'nan': pdf_link = ""
        
    urls_fotos = ""
    foto_medidas = ""
    
    sync_match = df_sync[df_sync['SKU_clean'] == sku_clean]
    if not sync_match.empty:
        matched_sync = sync_match.iloc[0]
        if color and 'Color' in sync_match.columns:
            for _, s_row in sync_match.iterrows():
                if pd.notna(s_row['Color']) and color.lower() in str(s_row['Color']).lower():
                    matched_sync = s_row
                    break
        urls_fotos = str(matched_sync.get('URLs_Fotos', ''))
        foto_medidas = str(matched_sync.get('Imagen_Tecnica', ''))
        
        if urls_fotos.lower() == 'nan': urls_fotos = ""
        if foto_medidas.lower() == 'nan': foto_medidas = ""
        
        sync_pdf = str(matched_sync.get('Manual_PDF', '')).strip()
        if sync_pdf.lower() == 'nan': sync_pdf = ""
        
        if (not pdf_link or '/' not in pdf_link) and '/' in sync_pdf:
            pdf_link = sync_pdf
            
    if sku_clean in local_images:
        imgs = local_images[sku_clean]
        imgs_to_process = imgs
        
        if color:
            excel_keys = get_color_keywords(color)
            if excel_keys:
                available_folders = {img['folder'] for img in imgs}
                best_folder = None
                best_score = -1
                
                for fld in available_folders:
                    fld_keys = get_color_keywords(fld)
                    if not fld_keys: continue
                    intersection = len(excel_keys.intersection(fld_keys))
                    union = len(excel_keys.union(fld_keys))
                    if union == 0: continue
                    score = intersection / union
                    if score > best_score:
                        best_score = score
                        best_folder = fld
                        
                if best_folder and best_score > 0:
                    imgs_to_process = [img for img in imgs if img['folder'] == best_folder or not get_color_keywords(img['folder'])]
        
        hero_img = ""
        gal_imgs = []
        med_img = ""
        
        for img in imgs_to_process:
            name = img['name']
            path = img['path']
            
            if 'medida' in name:
                med_img = path
            elif 'escena' in name and 'abierto' not in name:
                if not hero_img: hero_img = path
                else: gal_imgs.append(path)
            else:
                gal_imgs.append(path)
                
        all_fotos = []
        if hero_img: all_fotos.append(hero_img)
        all_fotos.extend(gal_imgs)
        
        if all_fotos:
            urls_fotos = "; ".join(all_fotos)
        if med_img:
            foto_medidas = med_img

    if pdf_link.lower() == 'nan': pdf_link = ""
    
    if (not pdf_link or '/' not in pdf_link) and sku_clean in local_pdfs:
        pdfs = local_pdfs[sku_clean]
        
        pdfs_to_process = pdfs
        if color:
            excel_keys = get_color_keywords(color)
            if excel_keys:
                best_p = None
                best_score = -1
                for p in pdfs:
                    fld = os.path.basename(os.path.dirname(p))
                    fld_keys = get_color_keywords(fld)
                    if not fld_keys: continue
                    intersection = len(excel_keys.intersection(fld_keys))
                    union = len(excel_keys.union(fld_keys))
                    if union == 0: continue
                    score = intersection / union
                    if score > best_score:
                        best_score = score
                        best_p = p
                if best_p and best_score > 0:
                    pdfs_to_process = [best_p]
                    
        if pdfs_to_process:
            pdf_link = pdfs_to_process[0]
        
    medida = ext_measures.get(sku_clean, row.get('Medidas_Mueble', ''))
    if pd.isna(medida): medida = ""
    
    final_row = {
        'SKU': final_sku,
        'Nombre_Comercial': nombre,
        'Linea': row.get('Linea', ''),
        'Ambiente': row.get('Ambiente', ''),
        'Color': color,
        'Descripcion_Corta': row.get('Descripcion_Corta', ''),
        'Descripcion_Larga': row.get('Descripcion_Larga', ''),
        'Medidas_Mueble': medida,
        'Peso': row.get('Medidas_Logistica', ''),
        'Embalaje': '', 
        'Cantidad_Paquetes': '', 
        'Foto_Medidas': foto_medidas,
        'Fotos_Mueble': urls_fotos,
        'Manual_PDF': pdf_link,
        'Relacionados': row.get('Relacionados', '')
    }
    final_rows.append(final_row)

df_final = pd.DataFrame(final_rows)
df_final = df_final.fillna('')
df_final = df_final.replace('nan', '')

with pd.ExcelWriter(file_path, engine='openpyxl', mode='a', if_sheet_exists='replace') as writer:
    df_final.to_excel(writer, sheet_name='productos_auditados', index=False)

print(f"Successfully updated 'productos_auditados' in {file_path}")
