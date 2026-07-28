import subprocess

def push():
    cmd = "git -c credential.helper= push -u origin main"
    print("Running command:", cmd)
    res = subprocess.run(
        cmd,
        shell=True,
        capture_output=True,
        text=True
    )
    with open("scratch/push_output.txt", "w", encoding="utf-8") as f:
        f.write("=== STDOUT ===\n")
        f.write(res.stdout)
        f.write("\n=== STDERR ===\n")
        f.write(res.stderr)
        f.write(f"\n=== EXIT CODE ===\n{res.returncode}\n")
    print("Finished with exit code:", res.returncode)

if __name__ == "__main__":
    push()
