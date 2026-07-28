import os

base_dir = r"C:\Users\usuario\Documents\Oncede\Clientes\Muebles Gacela\Web\Muebles gacela MVP"
search_terms = ['cinta', 'martillo', 'destornillador', 'taladro', 'lapiz', 'mecha', 'allen', 'herramienta']

found_files = []
for root, dirs, files in os.walk(base_dir):
    # Skip node_modules and .git to keep it fast
    if 'node_modules' in dirs:
        dirs.remove('node_modules')
    if '.git' in dirs:
        dirs.remove('.git')
        
    for f in files:
        f_lower = f.lower()
        if any(term in f_lower for term in search_terms):
            found_files.append((f, os.path.relpath(os.path.join(root, f), base_dir)))

print("Matching files in workspace:")
for f, rel_path in sorted(found_files):
    print(f"  - {f} : {rel_path}")
