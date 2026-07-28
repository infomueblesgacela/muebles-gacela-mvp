import struct
import json

def embed_carvalho_texture(glb_path, texture_path, output_path):
    print(f"Reading GLB from {glb_path}...")
    with open(glb_path, "rb") as f:
        data = f.read()
        
    magic, version, length = struct.unpack("<4sII", data[:12])
    assert magic == b"glTF"
    
    chunk0_length, chunk0_type = struct.unpack("<II", data[12:20])
    json_bytes = data[20:20+chunk0_length]
    
    chunk1_offset = 20 + chunk0_length
    chunk1_length, chunk1_type = struct.unpack("<II", data[chunk1_offset:chunk1_offset+8])
    bin_bytes = data[chunk1_offset+8:chunk1_offset+8+chunk1_length]
    
    gltf_json = json.loads(json_bytes.decode("utf-8"))
    
    print(f"Reading new texture from {texture_path}...")
    with open(texture_path, "rb") as f_tex:
        new_tex_bytes = f_tex.read()
        
    new_bin_bytes = bytearray(bin_bytes)
    
    # Pad to 4 bytes boundary
    padding = (4 - (len(new_bin_bytes) % 4)) % 4
    new_bin_bytes.extend(b"\x00" * padding)
    
    new_tex_offset = len(new_bin_bytes)
    new_bin_bytes.extend(new_tex_bytes)
    
    new_view = {
        "buffer": 0,
        "byteOffset": new_tex_offset,
        "byteLength": len(new_tex_bytes)
    }
    gltf_json["bufferViews"].append(new_view)
    new_view_idx = len(gltf_json["bufferViews"]) - 1
    
    gltf_json["images"][0]["bufferView"] = new_view_idx
    print(f"Updated GLB image 0 to bufferView index {new_view_idx}")
    
    gltf_json["buffers"][0]["byteLength"] = len(new_bin_bytes)
    
    new_json_bytes = json.dumps(gltf_json, separators=(',', ':')).encode("utf-8")
    
    json_padding = (4 - (len(new_json_bytes) % 4)) % 4
    new_json_bytes += b" " * json_padding
    
    bin_padding = (4 - (len(new_bin_bytes) % 4)) % 4
    new_bin_bytes_padded = new_bin_bytes + b"\x00" * bin_padding
    
    new_chunk0_header = struct.pack("<II", len(new_json_bytes), 0x4E4F534A)
    new_chunk1_header = struct.pack("<II", len(new_bin_bytes_padded), 0x004E4942)
    
    new_total_length = 12 + 8 + len(new_json_bytes) + 8 + len(new_bin_bytes_padded)
    new_header = struct.pack("<4sII", b"glTF", 2, new_total_length)
    
    with open(output_path, "wb") as f_out:
        f_out.write(new_header)
        f_out.write(new_chunk0_header)
        f_out.write(new_json_bytes)
        f_out.write(new_chunk1_header)
        f_out.write(new_bin_bytes_padded)
        
    print(f"Texture embedded successfully! Saved to {output_path}. Size: {new_total_length} bytes.")

embed_carvalho_texture(
    "public/modelos_3d/linea-clasica/A008395/A008395_v6.glb",
    "public/images/Mel Avellana (Carvalho).jpg",
    "public/modelos_3d/linea-clasica/A008395/A008395_v6.glb"
)
