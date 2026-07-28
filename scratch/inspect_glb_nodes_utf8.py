from pygltflib import GLTF2

gltf = GLTF2.load("public/modelos_3d/linea-clasica/A008395/A008395_v6.glb")

with open("scratch/nodes.txt", "w", encoding="utf-8") as f:
    f.write("Nodes in GLB:\n")
    for i, node in enumerate(gltf.nodes):
        mesh_info = f"Mesh index: {node.mesh}" if node.mesh is not None else "No mesh"
        cam_info = f"Camera index: {node.camera}" if node.camera is not None else ""
        lights_info = f"Extensions: {node.extensions}" if node.extensions else ""
        f.write(f"Node {i}: Name='{node.name}', {mesh_info} {cam_info} {lights_info}\n")

print("Saved node details to scratch/nodes.txt successfully!")
