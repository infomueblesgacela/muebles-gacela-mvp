import urllib.request

def check():
    try:
        url = "https://muebles-gacela-r0aofrfy4-jignacioferrero-3798s-projects.vercel.app"
        print(f"Checking Vercel Deployment: {url}")
        req = urllib.request.Request(url, method="GET")
        req.add_header("User-Agent", "Mozilla/5.5")
        with urllib.request.urlopen(req) as resp:
            print(f"  Status: {resp.status}")
            print(f"  Url: {resp.url}")
    except Exception as e:
        print(f"  Failed: {e}")

check()
