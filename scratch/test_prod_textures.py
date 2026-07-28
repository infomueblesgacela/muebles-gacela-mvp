import urllib.request
import urllib.parse

def test_url(url):
    try:
        print(f"Fetching: {url}")
        req = urllib.request.Request(url, method="HEAD")
        req.add_header("User-Agent", "Mozilla/5.5")
        with urllib.request.urlopen(req) as resp:
            print(f"  Status: {resp.status}")
            print(f"  Content-Length: {resp.getheader('Content-Length')}")
            print(f"  Content-Type: {resp.getheader('Content-Type')}")
    except Exception as e:
        print(f"  Failed: {e}")

test_url("https://www.mueblesgacela.com.ar/images/Mel%20Avellana%20(Carvalho).jpg?v=3")
test_url("https://www.mueblesgacela.com.ar/images/texture_normal.jpg?v=3")
test_url("https://www.mueblesgacela.com.ar/modelos_3d/linea-clasica/A008395/A008395_v6.glb")
