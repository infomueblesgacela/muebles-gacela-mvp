from pygltflib import GLTF2

gltf = GLTF2.load("public/modelos_3d/linea-clasica/A008395/A008395_v6.glb")

print("Nodes in GLB:")
for i, node in enumerate(gltf.nodes):
    mesh_info = f"Mesh index: {node.mesh}" if node.mesh is not None else "No mesh"
    cam_info = f"Camera index: {node.camera}" if node.camera is not None else ""
    lights_info = f"Extensions: {node.extensions}" if node.extensions else ""
    print(f"Node {i}: Name='{node.name}', {mesh_info} {cam_info} {lights_info}")
