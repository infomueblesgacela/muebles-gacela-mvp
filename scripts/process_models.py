import os
import sys
import re
import unicodedata
import numpy as np
import trimesh

# Force UTF-8 stdout for logging non-ascii characters safely
try:
    sys.stdout.reconfigure(encoding='utf-8')
except AttributeError:
    pass

import FreeCAD as App
import Import
import MeshPart

# Configuration
TOLERANCE = 0.5  # Linear deflection (tessellation precision) in mm. Larger = fewer polygons.
BASE_DIR = r"c:\Users\usuario\Documents\Oncede\Clientes\Muebles Gacela\Web\Muebles gacela MVP"
MODEL_DIR = os.path.join(BASE_DIR, "Modelos 3d", "Nordik")

def clean_label(label):
    """Normalize label to be safe for filenames and web paths."""
    if not label:
        return "unnamed"
    # Remove accents/diacritics
    nfkd = unicodedata.normalize('NFKD', label)
    ascii_label = nfkd.encode('ascii', 'ignore').decode('ascii')
    # Replace non-alphanumeric (except hyphen/underscore) with underscores
    safe_name = re.sub(r'[^a-zA-Z0-9\-_ ]', '_', ascii_label)
    # Replace spaces with underscores
    safe_name = safe_name.replace(' ', '_')
    # Collapse multiple underscores
    safe_name = re.sub(r'_+', '_', safe_name)
    return safe_name.strip('_')

def get_leaf_solids(doc):
    """Scan the document objects and return only leaf geometric solid objects."""
    leaf_nodes = []
    
    for obj in doc.Objects:
        # Must have shape geometry
        if not hasattr(obj, 'Shape') or not obj.Shape:
            continue
            
        # Ignore helper geometry objects
        if obj.TypeId in ["App::Origin", "App::Line", "App::Plane", "App::Point"]:
            continue
        if any(keyword in obj.Name for keyword in ["Axis", "Plane", "Origin"]):
            continue
            
        # Check if it has any children that contain shape geometry
        is_container = False
        for child in obj.OutList:
            if hasattr(child, 'Shape') and child.Shape:
                # Ignore helper child objects
                if child.TypeId not in ["App::Origin", "App::Line", "App::Plane", "App::Point"]:
                    if not any(keyword in child.Name for keyword in ["Axis", "Plane", "Origin"]):
                        is_container = True
                        break
                        
        if not is_container:
            leaf_nodes.append(obj)
            
    return leaf_nodes

def process_step_file(step_path, model_id):
    """Imports a STEP assembly, isolates solids, and exports them to GLB."""
    print(f"\n=========================================")
    print(f"PROCESANDO MUEBLE: {model_id}")
    print(f"Archivo STEP: {os.path.basename(step_path)}")
    print(f"=========================================")
    
    # Create output directory next to the STEP file
    parent_dir = os.path.dirname(step_path)
    parent_name = os.path.basename(parent_dir)
    
    # If the parent folder name matches the model ID (or is part of it), export directly to parent_dir/glb.
    # Otherwise, create parent_dir/model_id/glb.
    if parent_name.lower() == model_id.lower() or parent_name.lower() in model_id.lower() or model_id.lower() in parent_name.lower():
        out_dir = os.path.join(parent_dir, "glb")
    else:
        out_dir = os.path.join(parent_dir, model_id, "glb")
        
    if not os.path.exists(out_dir):
        os.makedirs(out_dir)
        print(f"Creado directorio de salida: {out_dir}")
        
    doc = App.newDocument(f"Doc_{model_id}")
    try:
        # Import assembly
        print("Importando archivo STEP en FreeCAD (puede tomar unos segundos)...")
        Import.insert(step_path, doc.Name)
        doc.recompute()
        
        # Detect leaf solids
        leaf_nodes = get_leaf_solids(doc)
        print(f"Total de objetos en documento: {len(doc.Objects)}")
        print(f"Sólidos hoja encontrados a exportar: {len(leaf_nodes)}")
        
        if not leaf_nodes:
            print("AVISO: No se encontraron sólidos hoja para exportar.")
            return
            
        # First pass: Count normalized names to detect duplicates
        name_counts = {}
        for obj in leaf_nodes:
            name_clean = clean_label(obj.Label)
            name_counts[name_clean] = name_counts.get(name_clean, 0) + 1
            
        # Second pass: Tessellate and export
        exported_files = 0
        name_indices = {}
        
        for i, obj in enumerate(leaf_nodes):
            name_clean = clean_label(obj.Label)
            
            # Resolve name duplicates
            if name_counts[name_clean] > 1:
                name_indices[name_clean] = name_indices.get(name_clean, 0) + 1
                filename = f"{name_clean}_{name_indices[name_clean]}.glb"
            else:
                filename = f"{name_clean}.glb"
                
            out_file_path = os.path.join(out_dir, filename)
            
            print(f" [{i+1:02d}/{len(leaf_nodes)}] Exportando '{obj.Label}' -> '{filename}'...")
            
            try:
                # Tessellate (triangulate shape)
                points, faces = obj.Shape.tessellate(TOLERANCE)
                if not points or not faces:
                    print(f"  --> ADVERTENCIA: {obj.Label} no tiene geometría (0 vértices/caras). Omitiendo.")
                    continue
                    
                # Convert vertices to list of float triples
                vertices = np.array([[pt.x, pt.y, pt.z] for pt in points])
                faces_arr = np.array(faces)
                
                # Export using trimesh (creates a raw, untextured mesh)
                mesh = trimesh.Trimesh(vertices=vertices, faces=faces_arr)
                mesh.export(out_file_path)
                exported_files += 1
                
            except Exception as ex:
                print(f"  --> ERROR al exportar '{obj.Label}': {ex}")
                
        print(f"Completado: {exported_files} de {len(leaf_nodes)} piezas exportadas correctamente a GLB.")
        
    except Exception as e:
        print(f"ERROR al procesar el archivo {os.path.basename(step_path)}: {e}")
        
    finally:
        App.closeDocument(doc.Name)

def main():
    global MODEL_DIR
    
    print("=== INICIANDO BATCH PIPELINE: STEP A GLB (HEADLESS RECURSIVO) ===")
    
    # Read target directory from arguments or use default (Nordik)
    target_arg = sys.argv[1] if len(sys.argv) > 1 else "Modelos 3d/Nordik"
    
    if os.path.isabs(target_arg):
        MODEL_DIR = target_arg
    else:
        MODEL_DIR = os.path.abspath(os.path.join(BASE_DIR, target_arg))
        
    print(f"Directorio raíz de búsqueda: {MODEL_DIR}")
    print(f"Tolerancia remesh: {TOLERANCE} mm\n")
    
    if not os.path.exists(MODEL_DIR):
        print(f"Error: El directorio {MODEL_DIR} no existe.")
        sys.exit(1)
        
    # Recursively find all STEP/STP files
    all_step_files = []
    for root, dirs, files in os.walk(MODEL_DIR):
        # Skip already generated glb folders and git folders
        if 'glb' in root.lower() or '.git' in root.lower():
            continue
        for file in files:
            if file.lower().endswith(('.step', '.stp')):
                all_step_files.append(os.path.join(root, file))
                
    print(f"Modelos STEP encontrados para procesar: {len(all_step_files)}")
    
    processed_count = 0
    for step_path in sorted(all_step_files):
        filename = os.path.basename(step_path)
        model_id = os.path.splitext(filename)[0]
        process_step_file(step_path, model_id)
        processed_count += 1
        
    print("\n=== PIPELINE FINALIZADO CON ÉXITO ===")
    print(f"Se procesaron {processed_count} archivos STEP.")

if __name__ == "__main__":
    main()
