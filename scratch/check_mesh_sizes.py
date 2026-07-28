from pygltflib import GLTF2
import numpy as np
import struct

gltf = GLTF2.load("public/modelos_3d/linea-clasica/A008395/A008395_v6.glb")

def get_accessor_data(gltf, accessor_idx):
    accessor = gltf.accessors[accessor_idx]
    bv = gltf.bufferViews[accessor.bufferView]
    blob = gltf.binary_blob()
    start = bv.byteOffset + (accessor.byteOffset or 0)
    if accessor.componentType != 5126:
        return None
    num_elements = accessor.count
    if accessor.type == "VEC3":
        stride = bv.byteStride or 12
        data = []
        for i in range(num_elements):
            offset = start + i * stride
            val = struct.unpack("<fff", blob[offset:offset+12])
            data.append(val)
        return np.array(data)
    return None

print("Mesh Bounding Boxes:")
for mesh_idx, mesh in enumerate(gltf.meshes):
    mesh_name = mesh.name or f"Mesh_{mesh_idx}"
    for prim_idx, prim in enumerate(mesh.primitives):
        pos_accessor_idx = prim.attributes.POSITION
        vertices = get_accessor_data(gltf, pos_accessor_idx)
        if vertices is not None:
            min_c = np.min(vertices, axis=0)
            max_c = np.max(vertices, axis=0)
            size = max_c - min_c
            print(f"Mesh {mesh_idx} ({mesh_name}) Prim {prim_idx}:")
            print(f"  Min: {min_c}")
            print(f"  Max: {max_c}")
            print(f"  Size: {size}")
