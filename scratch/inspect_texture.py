from PIL import Image
import os

for filename in ["Mel Avellana (Carvalho).jpg", "texture_normal.jpg"]:
    img_path = os.path.join("public/images", filename)
    if os.path.exists(img_path):
        with Image.open(img_path) as img:
            print(f"{filename} -> Format: {img.format}, Size: {img.size}, Mode: {img.mode}")
            print(f"File size: {os.path.getsize(img_path) / (1024*1024):.2f} MB")
    else:
        print(f"{filename} not found")
