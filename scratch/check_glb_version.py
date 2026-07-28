import urllib.request

def check():
    try:
        url = "https://muebles-gacela-nvp.vercel.app/modelos_3d/linea-clasica/A008395/A008395_v6.glb?v=4"
        print(f"Checking GLB v4 on Vercel: {url}")
        req = urllib.request.Request(url, method="HEAD")
        req.add_header("User-Agent", "Mozilla/5.5")
        with urllib.request.urlopen(req) as resp:
            print(f"  Status: {resp.status}")
            print(f"  Content-Length: {resp.getheader('Content-Length')}")
    except Exception as e:
        print(f"  Failed: {e}")

check()
