import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from extract_hardware import PART_KEYWORDS

text = '2 tiradores bruno con tornillos de 2.5 cm'
for kw in PART_KEYWORDS:
    if kw in text:
        print(f"Matched keyword: '{kw}'")
