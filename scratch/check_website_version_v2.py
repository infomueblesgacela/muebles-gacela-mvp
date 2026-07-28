import urllib.request

def check_html():
    try:
        url = "https://muebles-gacela-nvp.vercel.app/"
        print(f"Fetching Vercel HTML: {url}")
        req = urllib.request.Request(url, method="GET")
        req.add_header("User-Agent", "Mozilla/5.5")
        with urllib.request.urlopen(req) as resp:
            html = resp.read().decode("utf-8")
            if "index-CDlGc5ZJ.js" in html:
                print("  SUCCESS: The updated Javascript bundle (index-CDlGc5ZJ.js) is LIVE!")
            else:
                print("  STILL OLD in this HTML.")
                for line in html.split("\n"):
                    if "script type=\"module\" crossorigin src=\"/assets/index" in line:
                        print(f"    Line: {line.strip()}")
    except Exception as e:
        print(f"  Failed: {e}")

check_html()
