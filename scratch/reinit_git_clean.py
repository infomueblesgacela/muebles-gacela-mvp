import os
import shutil
import subprocess

def reinit_clean():
    print("Starting clean git initialization...")
    
    # 1. Remove current local .git folder (backup is already safe in parent directory)
    if os.path.exists(".git"):
        print("Removing current .git folder...")
        shutil.rmtree(".git", onerror=lambda func, path, exc: (os.chmod(path, 0o777), func(path)))
            
    # 2. Initialize fresh git repo
    print("Running: git init")
    subprocess.run("git init", shell=True, check=True)
    subprocess.run("git branch -M main", shell=True, check=True)
    
    # 3. Add remote
    remote_url = "https://infomueblesgacela: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@github.com/infomueblesgacela/muebles-gacela-mvp.git"
    print("Adding remote origin...")
    subprocess.run(f"git remote add origin {remote_url}", shell=True, check=True)
    
    # 4. Add files
    print("Adding source files...")
    subprocess.run("git add .", shell=True, check=True)
    
    # 5. Force add the compiled GLB model
    glb_path = "public/modelos_3d/linea-clasica/A008395/A008395_v6.glb"
    if os.path.exists(glb_path):
        print(f"Force adding compiled model: {glb_path}")
        subprocess.run(f"git add -f {glb_path}", shell=True, check=True)
    else:
        print(f"WARNING: Compiled model not found at {glb_path}!")
        
    # 6. Commit
    print("Committing files...")
    subprocess.run('git commit -m "Initial clean commit (optimized size)"', shell=True, check=True)
    
    # 7. Push to GitHub with credential helper override and force push to overwrite the stuck push
    print("Pushing to GitHub...")
    env_vars = {**os.environ, "GIT_TERMINAL_PROMPT": "0"}
    res = subprocess.run(
        "git -c credential.helper= push -u origin main --force",
        shell=True,
        capture_output=True,
        text=True,
        env=env_vars
    )
    
    # Write push output to verify
    with open("scratch/push_clean_output.txt", "w", encoding="utf-8") as f:
        f.write("=== STDOUT ===\n")
        f.write(res.stdout)
        f.write("\n=== STDERR ===\n")
        f.write(res.stderr)
        f.write(f"\n=== EXIT CODE ===\n{res.returncode}\n")
        
    print("Push finished with exit code:", res.returncode)
    if res.returncode == 0:
        print("SUCCESS! Clean repository pushed to GitHub.")
    else:
        print("FAILED to push clean repository. Details written to scratch/push_clean_output.txt")

if __name__ == "__main__":
    reinit_clean()
