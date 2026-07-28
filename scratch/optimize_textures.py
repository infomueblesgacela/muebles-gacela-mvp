from PIL import Image
import os

def optimize_image(input_path, output_path, max_size=(2048, 2048), quality=85):
    if not os.path.exists(input_path):
        print(f"File not found: {input_path}")
        return
    with Image.open(input_path) as img:
        # Resize preserving aspect ratio
        img.thumbnail(max_size, Image.Resampling.LANCZOS)
        # Convert to RGB (to ensure we can save as JPG if it was PNG or something else)
        if img.mode != 'RGB':
            img = img.convert('RGB')
        # Save as JPEG
        img.save(output_path, 'JPEG', quality=quality)
        print(f"Optimized {input_path} -> {output_path}")
        print(f"  New dimensions: {img.size}")
        print(f"  New file size: {os.path.getsize(output_path) / 1024:.2f} KB")

# Optimize wood texture
optimize_image(
    "public/images/Mel Avellana (Carvalho).jpg",
    "public/images/Mel Avellana (Carvalho).jpg",
    max_size=(2048, 2048),
    quality=85
)

# Optimize normal texture
optimize_image(
    "public/images/texture_normal.jpg",
    "public/images/texture_normal.jpg",
    max_size=(1024, 1024),
    quality=85
)
