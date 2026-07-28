const fs = require('fs');
const path = require('path');

// Utility to normalize a segment (same as applied in python/shell)
function normalizeSegment(s) {
  if (!s) return s;
  return s.toString().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, '-')
    .replace(/[()\[\],'"!]/g, '')
    .replace(/[^a-z0-9\.\-_]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeFullPath(p) {
  if (!p || typeof p !== 'string') return p;
  // Simplifico la validación a solo "gacela" para evitar problemas con el acento en "Artículos"
  if (!p.toLowerCase().includes('gacela')) return p;
  
  // Split by / or \\, then process, then join with /
  return p.split(/[/\\]/).map(seg => {
    if (!seg) return '';
    // Normalize base part keeping extension clean
    if (seg.includes('.')) {
        const parts = seg.split('.');
        const ext = parts.pop();
        const base = parts.join('.');
        return normalizeSegment(base) + '.' + normalizeSegment(ext);
    }
    return normalizeSegment(seg);
  }).join('/');
}

function fixJsonFile() {
    const jsonPath = path.join(__dirname, 'data', 'productos.json');
    if (!fs.existsSync(jsonPath)) {
        console.error("No se encontró data/productos.json");
        return;
    }

    console.log("Leyendo data/productos.json...");
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    let fixCount = 0;
    
    // Recurse through JSON to find strings starting with /Artículos Gacela
    function processNode(node) {
        if (Array.isArray(node)) {
            node.forEach(item => processNode(item));
        } else if (typeof node === 'object' && node !== null) {
            for (const key in node) {
                if (typeof node[key] === 'string') {
                    // Handles comma or semicolon separated lists of paths in single string if present
                    if (node[key].includes(';')) {
                        const parts = node[key].split(';').map(v => v.trim());
                        const normParts = parts.map(p => normalizeFullPath(p));
                        const newVal = normParts.join('; ');
                        if (newVal !== node[key]) {
                            node[key] = newVal;
                            fixCount++;
                        }
                    } else {
                        const newVal = normalizeFullPath(node[key]);
                        if (newVal !== node[key]) {
                            node[key] = newVal;
                            fixCount++;
                        }
                    }
                } else {
                    processNode(node[key]);
                }
            }
        }
    }

    processNode(data);
    
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Proceso completado. Se corrigieron ${fixCount} referencias de ruta en data/productos.json.`);
}

fixJsonFile();
