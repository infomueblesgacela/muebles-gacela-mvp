import os

def get_dir_size(path):
    total = 0
    try:
        for entry in os.scandir(path):
            if entry.is_file():
                total += entry.stat().st_size
            elif entry.is_dir() and entry.name != "node_modules":
                total += get_dir_size(entry.path)
    except Exception:
        pass
    return total

git_size = get_dir_size(".git")
workspace_size = get_dir_size(".")

print(f"Size of .git: {git_size / (1024*1024):.2f} MB")
print(f"Size of workspace (excl. node_modules): {workspace_size / (1024*1024):.2f} MB")
