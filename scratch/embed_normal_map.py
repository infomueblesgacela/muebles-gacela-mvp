import os
from pygltflib import GLTF2, Image, Texture, NormalMaterialTexture, BufferView

def main():
    glb_path = "modelos_3d/linea-clasica/A008395/A008395.glb"
    normal_path = "modelos_3d/linea-clasica/A008395/textura/texture_normal.png"
    
    print("Loading GLB...")
    gltf = GLTF2.load(glb_path)
    
    # Load normal map bytes
    print("Reading normal map bytes...")
    with open(normal_path, "rb") as f:
        normal_bytes = f.read()
        
    # Get current binary blob
    blob = gltf.binary_blob()
    
    # Align the new data start offset to 4 bytes (required by glTF spec)
    start_offset = len(blob)
    padding = (4 - (start_offset % 4)) % 4
    blob += b"\x00" * padding
    start_offset += padding
    
    # Append the image bytes to the blob
    blob += normal_bytes
    
    # Set the updated blob back
    gltf._binary_blob = blob
    
    # Update the buffer size (buffer 0 is the GLB binary buffer)
    gltf.buffers[0].byteLength = len(blob)
    
    # Create new BufferView for the image
    bv_idx = len(gltf.bufferViews)
    bv = BufferView(
        buffer=0,
        byteOffset=start_offset,
        byteLength=len(normal_bytes)
    )
    gltf.bufferViews.append(bv)
    
    # Create new Image
    img_idx = len(gltf.images)
    img = Image(
        mimeType="image/png",
        bufferView=bv_idx
    )
    gltf.images.append(img)
    
    # Create new Texture
    tex_idx = len(gltf.textures)
    tex = Texture(
        source=img_idx
    )
    gltf.textures.append(tex)
    
    # Assign normalTexture to wood material (material index 0)
    mat_wood = gltf.materials[0]
    mat_wood.normalTexture = NormalMaterialTexture(
        index=tex_idx,
        scale=1.5 # Strong bump effect
    )
    
    # Copy texture transform so the normal map repeats at the exact same scale as the diffuse map
    base_tex_info = mat_wood.pbrMetallicRoughness.baseColorTexture
    if base_tex_info and hasattr(base_tex_info, "extensions") and base_tex_info.extensions:
        if "KHR_texture_transform" in base_tex_info.extensions:
            mat_wood.normalTexture.extensions = {
                "KHR_texture_transform": base_tex_info.extensions["KHR_texture_transform"]
            }
            print("Successfully copied KHR_texture_transform scale to normal map!")
        
    # Save the GLB
    print("Saving GLB...")
    gltf.save(glb_path)
    print("Normal map successfully embedded into GLB!")

if __name__ == "__main__":
    main()
