import struct
import json
import os

def inspect_glb(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
    with open(filepath, 'rb') as f:
        header = f.read(12)
        magic, version, length = struct.unpack('<4sII', header)
        if magic != b'glTF':
            print("Not a valid GLB file")
            return
            
        print(f"Magic: {magic}, Version: {version}, Total Length: {length}")
        
        # Read JSON chunk header
        chunk_header = f.read(8)
        if len(chunk_header) < 8:
            return
        chunk_length, chunk_type = struct.unpack('<II', chunk_header)
        
        if chunk_type != 0x4E4F534A: # 'JSON'
            print("First chunk is not JSON")
            return
            
        json_data = f.read(chunk_length).decode('utf-8')
        gltf = json.loads(json_data)
        
        print("\n--- MATERIALS ---")
        for i, mat in enumerate(gltf.get('materials', [])):
            print(f"Material {i}: {mat.get('name')}, pbrMetallicRoughness: {mat.get('pbrMetallicRoughness')}")
            
        print("\n--- IMAGES ---")
        for i, img in enumerate(gltf.get('images', [])):
            print(f"Image {i}: {img.get('name')}, mimeType: {img.get('mimeType')}, bufferView: {img.get('bufferView')}")
            
        print("\n--- TEXTURES ---")
        for i, tex in enumerate(gltf.get('textures', [])):
            print(f"Texture {i}: {tex}")

inspect_glb("public/modelos_3d/linea-clasica/A008395/A008395_v6.glb")
