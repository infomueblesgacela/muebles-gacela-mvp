import os

base_dir = r"C:\Users\usuario\Documents\Oncede\Clientes\Muebles Gacela\Web\Muebles gacela MVP"
modelos_3d_dir = os.path.join(base_dir, "modelos_3d")

all_subfolders = []
for item in os.listdir(modelos_3d_dir):
    item_path = os.path.join(modelos_3d_dir, item)
    if os.path.isdir(item_path):
        for subitem in os.listdir(item_path):
            subitem_path = os.path.join(item_path, subitem)
            if os.path.isdir(subitem_path):
                all_subfolders.append((item, subitem, subitem_path))

print(f"Total subfolders at depth 2: {len(all_subfolders)}")
for line, sub, path in sorted(all_subfolders):
    print(f"  - {line} / {sub}")
