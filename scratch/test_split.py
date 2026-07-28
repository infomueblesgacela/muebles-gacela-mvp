import re

HARDWARE_KEYWORDS = [
    'tarugo', 'tornillo', 'perno', 'minifix', 'mini fix', 'caja', 'base', 'clavo', 'guia', 'guía',
    'cola', 'bisagra', 'manija', 'soporte', 'escuadra', 'carro', 'clip', 'traba', 'perfil', 'caño',
    'kit', 'botinero'
]

TOOL_KEYWORDS = [
    'martillo', 'destornillador', 'llave allen', 'llave', 'cinta metrica', 'cinta métrica', 'lapiz', 'lápiz',
    'taladro', 'mecha'
]

def clean_text(text):
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def parse_elements(text_block):
    words = text_block.split()
    items = []
    current_item = []
    NO_SPLIT_PREDECESSORS = ['de', 'o', 'y', 'codo', 'cazoleta', 'casoleta', 'n°', 'n', 'no', 'nro', 'allen', 'llave']
    for i, word in enumerate(words):
        is_start = False
        if re.match(r'^\d+$', word):
            preceded_by_no_split = (len(current_item) > 0 and current_item[-1].lower() in NO_SPLIT_PREDECESSORS)
            is_dim = False
            if i + 1 < len(words):
                next_word = words[i+1].lower()
                if next_word.startswith('x') or next_word in ['cm', 'mm', 'codo', 'cazoleta', 'casoleta', 'n°', 'n', 'no']:
                    is_dim = True
            is_multiplier = (len(current_item) > 0 and current_item[-1].lower() == 'x')
            
            # Check if followed by a hardware or tool keyword
            is_followed_by_hw_or_tool = False
            if i + 1 < len(words):
                next_word_clean = words[i+1].lower()
                # Remove accents
                next_word_clean = "".join(c for c in next_word_clean if c.isalnum())
                is_followed_by_hw_or_tool = any(k in next_word_clean for k in HARDWARE_KEYWORDS + TOOL_KEYWORDS)
            
            # Split if not preceded by no-split predecessors, OR if followed by a hardware/tool keyword
            # But wait, if it's followed by a hardware/tool keyword, we split!
            should_split = False
            if not preceded_by_no_split and not is_dim and not is_multiplier:
                should_split = True
            elif preceded_by_no_split and is_followed_by_hw_or_tool:
                should_split = True
                
            if should_split and i < len(words) - 1:
                if current_item:
                    items.append(" ".join(current_item))
                    current_item = []
                is_start = True
        elif word.lower() in ['set', 'llave', 'martillo', 'destornillador', 'cinta']:
            if word.lower() == 'set':
                if i + 1 < len(words) and words[i+1].lower() == 'de':
                    if current_item:
                        items.append(" ".join(current_item))
                        current_item = []
                    is_start = True
            else:
                preceded_by_de = (len(current_item) > 0 and current_item[-1].lower() in ['de', 'o', 'tornillos', 'tornillo'])
                if not preceded_by_de:
                    if current_item:
                        items.append(" ".join(current_item))
                        current_item = []
                    is_start = True
        current_item.append(word)
    if current_item:
        items.append(" ".join(current_item))
    return [clean_text(it) for it in items if it]

# Test strings
tests = [
    '1 Llave Allen 6 Tarugos 6x30',
    'Llave Allen 4 Tornillos de 2 cm',
    '13 Tornillos Allen 5 cm',
    'Llave Allen N°4',
    '1 Llave Allen 8 Tornillos de 2 cm',
    '1 Llave Allen'
]

for t in tests:
    print(f"Input: '{t}'")
    print(f"Parsed: {parse_elements(t)}")
    print()
