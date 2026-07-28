import os
import re
import csv
import unicodedata
import uuid

def remove_accents(input_str):
    """Elimina acentos de strings conservando eñes y similares si es posible, aunque lower y unicode manejan todo."""
    nfkd_form = unicodedata.normalize('NFKD', input_str)
    return u"".join([c for c in nfkd_form if not unicodedata.combining(c)])

def normalize_segment(s):
    """Normaliza un segmento de ruta (nombre de archivo o carpeta) según las reglas de Linux/Vercel."""
    if not s: return s
    
    # 1. Minúsculas y eliminar acentos
    s = s.lower()
    s = remove_accents(s)
    
    # 2. Reemplazar espacios por guión medio
    s = s.replace(' ', '-')
    
    # 3. Eliminar paréntesis, corchetes, comas y comillas
    s = re.sub(r'[()\[\],\'\"]', '', s)
    
    # 4. Eliminar caracteres extraños no deseados (excepto el punto para extensión)
    s = re.sub(r'[^a-z0-9\.\-_]', '', s)
    
    # 5. Colapsar múltiples guiones seguidos a uno solo
    s = re.sub(r'-+', '-', s)
    
    # 6. Limpiar guiones al inicio o final del segmento (ej: -archivo-.webp -> archivo.webp)
    # Conservamos la extensión, limpiamos el nombre base
    if '.' in s and not s.startswith('.'):
        parts = s.rsplit('.', 1)
        base = parts[0].strip('-')
        ext = parts[1].strip('-')
        s = f"{base}.{ext}"
    else:
        s = s.strip('-')
        
    return s

def normalize_full_path(path):
    """Normaliza una ruta completa dividiendo por /."""
    if not path: return path
    # Detectamos separador original
    separator = '/' if '/' in path else '\\'
    
    parts = path.split(separator)
    normalized_parts = []
    for p in parts:
        if p:
            normalized_parts.append(normalize_segment(p))
        else:
            normalized_parts.append('')
            
    # Retornamos siempre con forward-slash para la web
    return '/'.join(normalized_parts)

import time

def safe_rename(old_path, new_path):
    """Renombrado seguro en Windows contemplando cambios de mayúsculas/minúsculas con reintentos."""
    if old_path == new_path:
        return
    
    if not os.path.exists(old_path):
        return

    print(f"Renombrando: {os.path.basename(old_path)} -> {os.path.basename(new_path)}")
    
    # Reintentos en caso de bloqueo temporal por Windows
    for attempt in range(3):
        try:
            # Hack para Windows: si la única diferencia es Case-sensitivity, renombra a un temp intermedio
            if os.path.abspath(old_path).lower() == os.path.abspath(new_path).lower():
                temp_path = old_path + "_rename_temp_" + str(uuid.uuid4())[:6]
                os.rename(old_path, temp_path)
                os.rename(temp_path, new_path)
            else:
                if os.path.exists(new_path):
                    print(f"AVISO: El destino ya existe '{new_path}'.")
                else:
                    os.rename(old_path, new_path)
            return # Éxito!
        except Exception as e:
            if attempt < 2:
                print(f"Reintentando en 0.5s por error: {e}")
                time.sleep(0.5)
            else:
                print(f"ERROR DEFINITIVO renombrando {old_path} -> {new_path}: {e}")

def process_directory(root_dir):
    """Recorre de abajo hacia arriba y renombra archivos y carpetas físicamente."""
    if not os.path.exists(root_dir):
        print(f"Directorio no encontrado: {root_dir}")
        return
        
    print(f"\n--- Procesando Directorio: {root_dir} ---")
    
    # topdown=False asegura que se renombran primero los hijos y luego el contenedor
    for root, dirs, files in os.walk(root_dir, topdown=False):
        # Renombrar archivos
        for name in files:
            norm = normalize_segment(name)
            if norm != name:
                safe_rename(os.path.join(root, name), os.path.join(root, norm))
        
        # Renombrar subcarpetas
        for name in dirs:
            norm = normalize_segment(name)
            if norm != name:
                safe_rename(os.path.join(root, name), os.path.join(root, norm))
    
    # Renombrar el propio root_dir al final
    parent = os.path.dirname(root_dir)
    base = os.path.basename(root_dir)
    norm_base = normalize_segment(base)
    if norm_base != base and parent:
        safe_rename(root_dir, os.path.join(parent, norm_base))
        return os.path.join(parent, norm_base)
    
    return root_dir

def process_csv(csv_path):
    """Lee el CSV con delimitador fijo y guarda cambios."""
    if not os.path.exists(csv_path):
        print(f"CSV no encontrado: {csv_path}")
        return

    print(f"\n--- Actualizando CSV: {csv_path} ---")
    backup_path = csv_path.replace('.csv', '_ORIGINAL_BACKUP.csv')
    
    rows = []
    fieldnames = []
    
    # Guardar Backup
    import shutil
    if not os.path.exists(backup_path):
        shutil.copy2(csv_path, backup_path)
        print(f"Backup inicial guardado en {backup_path}")

    # Leemos forzando utf-8-sig y delimitador ;
    try:
        with open(csv_path, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f, delimiter=';')
            fieldnames = reader.fieldnames
            rows = list(reader)
        print(f"Leído con éxito: {len(rows)} filas encontradas.")
    except Exception as e:
        print(f"Error leyendo UTF-8: {e}. Intentando con latin-1...")
        with open(csv_path, 'r', encoding='latin-1') as f:
            reader = csv.DictReader(f, delimiter=';')
            fieldnames = reader.fieldnames
            rows = list(reader)
            
    if not rows:
        print("No hay datos para procesar en el CSV.")
        return

    count_modified = 0
    for row in rows:
        columns_to_check = ['Foto_Medidas', 'Fotos_Mueble', 'Manual_PDF']
        for col in columns_to_check:
            if col in row and row[col]:
                val = row[col].strip()
                if ',' in val:
                    parts = [p.strip() for p in val.split(',') if p.strip()]
                    norm_parts = [normalize_full_path(p) for p in parts]
                    new_val = ','.join(norm_parts)
                else:
                    new_val = normalize_full_path(val)
                
                if val != new_val:
                    row[col] = new_val
                    count_modified += 1
                    
    # Guardamos el resultado limpio
    with open(csv_path, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter=';')
        writer.writeheader()
        writer.writerows(rows)
        
    print(f"CSV guardado correctamente. Se modificaron {count_modified} rutas de celdas.")

if __name__ == "__main__":
    print("=== INICIANDO LIMPIEZA DE ASSETS PARA VERCEL ===")
    
    # Directorios a normalizar
    paths_to_process = [
        r"public\Artículos Gacela Muebles 2026",
        r"Artículos Gacela Muebles 2026"  # También la carpeta fuente en raíz
    ]
    
    for folder in paths_to_process:
        if os.path.exists(folder):
            process_directory(folder)
            
    # CSV a procesar
    csv_file = "productos_auditados.csv"
    process_csv(csv_file)
    
    print("\n=== PROCESO COMPLETADO CON ÉXITO ===")
    print("Ya podés desplegar a Vercel sin conflictos de mayúsculas o caracteres especiales.")
