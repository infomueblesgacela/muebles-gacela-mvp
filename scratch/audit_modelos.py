import os
import json

base_dir = r"c:\Users\usuario\Documents\Oncede\Clientes\Muebles Gacela\Web\Muebles gacela MVP\modelos_3d"

required_folders = ["3d", "data", "herrajes", "herramientas", "pasos"]

total_articles = 0
correct_articles = 0
errors = []

if not os.path.exists(base_dir):
    print(f"Error: Base directory {base_dir} does not exist.")
    exit(1)

lines = [d for d in os.listdir(base_dir) if os.path.isdir(os.path.join(base_dir, d))]

for line in lines:
    line_path = os.path.join(base_dir, line)
    articles = [d for d in os.listdir(line_path) if os.path.isdir(os.path.join(line_path, d))]
    
    for article in articles:
        total_articles += 1
        article_path = os.path.join(line_path, article)
        
        # Check subfolders (allowing 'glb' as a name but noting it)
        missing_folders = []
        actual_folders = os.listdir(article_path)
        folder_mapping = {}
        
        for req in required_folders:
            if req in actual_folders:
                folder_mapping[req] = req
            elif req == "3d" and "glb" in actual_folders:
                folder_mapping["3d"] = "glb"
            else:
                missing_folders.append(req)
        
        empty_folders = []
        for req, actual_name in folder_mapping.items():
            f_path = os.path.join(article_path, actual_name)
            if os.path.isdir(f_path):
                contents = os.listdir(f_path)
                if not contents:
                    empty_folders.append(req)
        
        # Check json file in data/
        json_error = None
        json_file_path = None
        if "data" in folder_mapping:
            data_folder = os.path.join(article_path, folder_mapping["data"])
            json_file_path = os.path.join(data_folder, f"{article}.json")
            if not os.path.exists(json_file_path):
                # Try finding any json file
                json_files = [f for f in os.listdir(data_folder) if f.endswith(".json")]
                if json_files:
                    json_file_path = os.path.join(data_folder, json_files[0])
                    json_error = f"Nombre de JSON incorrecto: se esperaba {article}.json, se encontro {json_files[0]}"
                else:
                    json_error = "Falta archivo JSON en data/"
            else:
                try:
                    with open(json_file_path, "r", encoding="utf-8") as jf:
                        json.load(jf)
                except Exception as e:
                    json_error = f"Error al parsear JSON: {str(e)}"
        
        has_glb_folder = ("3d" in folder_mapping and folder_mapping["3d"] == "glb")
        
        if missing_folders or empty_folders or json_error or has_glb_folder:
            errors.append({
                "linea": line,
                "articulo": article,
                "missing_folders": missing_folders,
                "empty_folders": empty_folders,
                "json_error": json_error,
                "has_glb_folder": has_glb_folder
            })
        else:
            correct_articles += 1

print("--- AUDITORÍA DE PRODUCTOS EN modelos_3d (CON INSPECCIÓN DE CONTENIDO) ---")
print(f"Líneas encontradas: {len(lines)} ({', '.join(lines)})")
print(f"Total de artículos analizados: {total_articles}")
print(f"Artículos correctos (con 5 carpetas no vacías y JSON válido): {correct_articles}")
print(f"Artículos con observaciones/errores: {len(errors)}")

if errors:
    print("\nDetalle de artículos con observaciones:")
    for err in errors:
        msgs = []
        if err['missing_folders']:
            msgs.append(f"Faltan carpetas: {', '.join(err['missing_folders'])}")
        if err['has_glb_folder']:
            msgs.append("La carpeta '3d' se llama 'glb' (debe renombrarse a '3d')")
        if err['empty_folders']:
            msgs.append(f"Carpetas vacías: {', '.join(err['empty_folders'])}")
        if err['json_error']:
            msgs.append(err['json_error'])
        
        print(f"- [{err['linea']}] Artículo {err['articulo']}: {'; '.join(msgs)}")
else:
    print("\n¡Todo perfecto! Todos los artículos tienen sus 5 carpetas con contenido y JSON válidos.")
