import urllib.request
import urllib.parse
import json

def test_url(url):
    try:
        print(f"Fetching: {url}")
        req = urllib.request.Request(url, method="HEAD")
        with urllib.request.urlopen(req) as resp:
            print(f"  Status: {resp.status}")
            print(f"  Content-Length: {resp.getheader('Content-Length')}")
            print(f"  Content-Type: {resp.getheader('Content-Type')}")
    except Exception as e:
        print(f"  Failed: {e}")

# Test localhost textures
test_url("http://localhost:3000/images/Mel%20Avellana%20(Carvalho).jpg?v=3")
test_url("http://localhost:3000/images/texture_normal.jpg?v=3")
test_url("http://localhost:3000/modelos_3d/linea-clasica/A008395/A008395_v6.glb")
