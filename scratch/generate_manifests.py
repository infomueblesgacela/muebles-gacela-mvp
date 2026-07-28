import os
import json

base_dir = r"c:\Users\usuario\Documents\Oncede\Clientes\Muebles Gacela\Web\Muebles gacela MVP\modelos_3d"

if not os.path.exists(base_dir):
    print(f"Error: Base directory {base_dir} does not exist.")
    exit(1)

# List all lines
lines = [d for d in os.listdir(base_dir) if os.path.isdir(os.path.join(base_dir, d))]

for line in lines:
    line_path = os.path.join(base_dir, line)
    articles = [d for d in os.listdir(line_path) if os.path.isdir(os.path.join(line_path, d))]
    
    print(f"Procesando linea: {line} ({len(articles)} articulos)...")
    for article in articles:
        article_path = os.path.join(line_path, article)
        
        manifest = {
            "files_3d": [],
            "files_pasos": [],
            "files_herrajes": [],
            "files_herramientas": []
        }
        
        # Helper to read folder contents safely
        def get_files(subfolder):
            path = os.path.join(article_path, subfolder)
            if os.path.exists(path) and os.path.isdir(path):
                return sorted([f for f in os.listdir(path) if os.path.isfile(os.path.join(path, f))])
            return []
        
        manifest["files_3d"] = get_files("3d")
        manifest["files_pasos"] = get_files("pasos")
        manifest["files_herrajes"] = get_files("herrajes")
        manifest["files_herramientas"] = get_files("herramientas")
        
        manifest_path = os.path.join(article_path, "manifest.json")
        with open(manifest_path, "w", encoding="utf-8") as mf:
            json.dump(manifest, mf, indent=2, ensure_ascii=False)
            
    print(f"Linea {line} procesada correctamente.")

print("Generacion de manifest.json completada con exito.")
