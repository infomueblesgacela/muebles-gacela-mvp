import urllib.request

def check_html():
    try:
        url = "https://muebles-gacela-nvp.vercel.app/"
        print(f"Fetching Vercel HTML: {url}")
        req = urllib.request.Request(url, method="GET")
        req.add_header("User-Agent", "Mozilla/5.5")
        with urllib.request.urlopen(req) as resp:
            html = resp.read().decode("utf-8")
            if "index-67XyU84C.js" in html:
                print("  SUCCESS: The updated Javascript bundle (index-67XyU84C.js) is LIVE!")
            else:
                print("  STILL OLD: The javascript bundle in HTML is old.")
                # Print script tags
                for line in html.split("\n"):
                    if "script" in line or "assets/index" in line:
                        print(f"    Line: {line.strip()}")
    except Exception as e:
        print(f"  Failed: {e}")

check_html()
