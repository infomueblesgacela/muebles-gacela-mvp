import numpy as np
from pygltflib import GLTF2
import struct

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

def get_node_local_matrix(node):
    q = node.rotation or [0, 0, 0, 1]
    x, y, z, w = q
    R = np.array([
        [1 - 2*y**2 - 2*z**2,     2*x*y - 2*z*w,         2*x*z + 2*y*w,  0],
        [2*x*y + 2*z*w,         1 - 2*x**2 - 2*z**2,     2*y*z - 2*x*w,  0],
        [2*x*z - 2*y*w,         2*y*z + 2*x*w,         1 - 2*x**2 - 2*y**2, 0],
        [0, 0, 0, 1]
    ])
    
    t = node.translation or [0, 0, 0]
    T = np.eye(4)
    T[0:3, 3] = t
    
    s = node.scale or [1, 1, 1]
    S = np.eye(4)
    S[0, 0] = s[0]
    S[1, 1] = s[1]
    S[2, 2] = s[2]
    
    return T.dot(R).dot(S)

def main():
    gltf = GLTF2.load("public/modelos_3d/linea-clasica/A008395/A008395_v6.glb")
    
    parent_map = {}
    for i, node in enumerate(gltf.nodes):
        for child in (node.children or []):
            parent_map[child] = i
            
    global_matrices = {}
    
    def get_global_matrix(node_idx):
        if node_idx in global_matrices:
            return global_matrices[node_idx]
            
        local_mat = get_node_local_matrix(gltf.nodes[node_idx])
        parent_idx = parent_map.get(node_idx)
        if parent_idx is not None:
            parent_global = get_global_matrix(parent_idx)
            global_mat = parent_global.dot(local_mat)
        else:
            global_mat = local_mat
            
        global_matrices[node_idx] = global_mat
        return global_mat

    all_vertices = []
    
    for i, node in enumerate(gltf.nodes):
        if node.mesh is None:
            continue
            
        global_mat = get_global_matrix(i)
        mesh = gltf.meshes[node.mesh]
        
        for prim in mesh.primitives:
            pos_accessor_idx = prim.attributes.POSITION
            vertices = get_accessor_data(gltf, pos_accessor_idx)
            if vertices is not None:
                for v in vertices:
                    v4 = np.append(v, 1.0)
                    world_v4 = global_mat.dot(v4)
                    world_v = world_v4[0:3] / world_v4[3]
                    all_vertices.append(world_v)
                    
    all_vertices = np.array(all_vertices)
    print(f"Total vertices: {len(all_vertices)}")
    
    min_coords = np.min(all_vertices, axis=0)
    max_coords = np.max(all_vertices, axis=0)
    
    print("\n--- Bounding Box details ---")
    print(f"Min: X={min_coords[0]:.4f}, Y={min_coords[1]:.4f}, Z={min_coords[2]:.4f}")
    print(f"Max: X={max_coords[0]:.4f}, Y={max_coords[1]:.4f}, Z={max_coords[2]:.4f}")
    print(f"Size: Width(X)={max_coords[0]-min_coords[0]:.4f}, Height(Y)={max_coords[1]-min_coords[1]:.4f}, Depth(Z)={max_coords[2]-min_coords[2]:.4f}")

if __name__ == "__main__":
    main()
