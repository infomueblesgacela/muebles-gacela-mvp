import os
import stat
import shutil

def remove_readonly(func, path, excinfo):
    os.chmod(path, stat.S_IWRITE)
    func(path)

def make_writeable(path):
    for root, dirs, files in os.walk(path):
        for d in dirs:
            try:
                os.chmod(os.path.join(root, d), stat.S_IWRITE)
            except Exception:
                pass
        for f in files:
            try:
                os.chmod(os.path.join(root, f), stat.S_IWRITE)
            except Exception:
                pass

src = ".git-original"
dst = "../git-history-backup"

if os.path.exists(src):
    print("Making files writeable...")
    make_writeable(src)
    try:
        os.chmod(src, stat.S_IWRITE)
    except Exception:
        pass
    print(f"Moving {src} to {dst}...")
    if os.path.exists(dst):
        print("Removing existing dst...")
        shutil.rmtree(dst, onerror=remove_readonly)
    try:
        shutil.move(src, dst)
        print("Success!")
    except Exception as e:
        print("Fallback to cmd copy/delete due to:", e)
        # Fallback to shell moving
        os.system(f'attrib -R {src}\\* /S /D')
        os.system(f'move {src} {dst}')
        print("Success via fallback!")
else:
    print(f"Folder {src} not found in workspace.")
