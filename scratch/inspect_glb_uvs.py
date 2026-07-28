import struct
import json
import os

def inspect_glb_uvs(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
    with open(filepath, 'rb') as f:
        data = f.read()
        
    magic, version, length = struct.unpack("<4sII", data[:12])
    assert magic == b"glTF"
    
    chunk0_length, chunk0_type = struct.unpack("<II", data[12:20])
    json_bytes = data[20:20+chunk0_length]
    gltf = json.loads(json_bytes.decode("utf-8"))
    
    print("\n--- MESHES AND PRIMITIVES ---")
    for i, mesh in enumerate(gltf.get('meshes', [])):
        print(f"Mesh {i}: {mesh.get('name')}")
        for j, prim in enumerate(mesh.get('primitives', [])):
            attributes = prim.get('attributes', {})
            print(f"  Primitive {j}: Material index: {prim.get('material')}")
            print(f"    Attributes: {list(attributes.keys())}")

inspect_glb_uvs("public/modelos_3d/linea-clasica/A008395/A008395_v6.glb")
