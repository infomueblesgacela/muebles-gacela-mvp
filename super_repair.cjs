const fs = require('fs');
const path = require('path');

const JSON_PATH = path.join(__dirname, 'data', 'productos.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

// Recursively list files
function walkSync(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  files.forEach(function(file) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      filelist = walkSync(fullPath, filelist);
    } else {
      filelist.push(fullPath);
    }
  });
  return filelist;
}

// Extract SKU from path segments (looks for digits separated optionally by dashes)
function extractSku(str) {
    if (!str) return null;
    // Quitamos el prefijo del año 2026 para evitar falsos positivos
    const cleanStr = str.toString().toLowerCase().replace(/articulos-gacela-muebles-2026/g, '');
    
    // Prioridad 1: Después de "art-"
    const artMatch = cleanStr.match(/art-([0-9]{2,7}(?:-[0-9]{1,3})?)/i);
    if (artMatch) return artMatch[1];

    // Prioridad 2: Fallback genérico de números
    const match = cleanStr.match(/([0-9]{2,7}(?:-[0-9]{1,3})?)/);
    return match ? match[0] : null;
}

// Compute similarity score based on common non-trivial tokens
function calculateSimilarity(strA, strB) {
    const tokenize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(' ').filter(w => w.length > 1);
    const tokensA = new Set(tokenize(strA));
    const tokensB = new Set(tokenize(strB));
    
    let matchCount = 0;
    tokensA.forEach(t => { if (tokensB.has(t)) matchCount++; });
    
    return matchCount;
}

function main() {
  console.log("=== INICIANDO ESCANEO INTELIGENTE DE ARCHIVOS FÍSICOS ===");
  const targetDir = path.join(PUBLIC_DIR, 'articulos-gacela-muebles-2026');
  
  if (!fs.existsSync(targetDir)) {
      console.error(`Error: El directorio físico ${targetDir} no existe.`);
      return;
  }

  const physicalFiles = walkSync(targetDir);
  console.log(`Encontrados ${physicalFiles.length} archivos físicos totales.`);

  // Database of indexed physical files by detected SKU
  const skuMap = new Map(); 

  physicalFiles.forEach(fp => {
      const webPath = '/' + path.relative(PUBLIC_DIR, fp).replace(/\\/g, '/');
      const filename = path.basename(fp);
      
      // Try to get SKU from parent folder, then from filename
      const folderName = path.basename(path.dirname(fp));
      let sku = extractSku(folderName);
      if (!sku) sku = extractSku(filename);

      if (sku) {
          if (!skuMap.has(sku)) skuMap.set(sku, []);
          skuMap.get(sku).push({
              path: webPath,
              filename: filename,
              ext: path.extname(filename).toLowerCase()
          });
      }
  });
  console.log(`Indexados archivos físicos para ${skuMap.size} SKUs.`);

  console.log("\n=== PROCESANDO data/productos.json CON HEURÍSTICA INTELIGENTE ===");
  if (!fs.existsSync(JSON_PATH)) return;

  const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  
  let counters = { correct: 0, healedExact: 0, healedFuzzy: 0, couldNotHeal: 0 };

  function resolveSmart(originalPath) {
      if (!originalPath || typeof originalPath !== 'string') return originalPath;
      if (!originalPath.toLowerCase().includes('gacela')) return originalPath;

      const cleanedPath = originalPath.replace(/\\/g, '/').trim();

      // 1. Direct match (already correct)
      if (fs.existsSync(path.join(PUBLIC_DIR, cleanedPath))) {
          counters.correct++;
          return cleanedPath;
      }

      const filename = path.basename(cleanedPath);
      const extension = path.extname(filename).toLowerCase();

      // 2. Try matching inside detected SKU bucket
      // Try to extract SKU from the broken path
      let sku = extractSku(cleanedPath);
      if (!sku) {
          // Maybe in parent folder of path
          const folder = cleanedPath.split('/').reverse()[1] || "";
          sku = extractSku(folder);
      }

      if (sku && skuMap.has(sku)) {
          const possibleFiles = skuMap.get(sku);
          
          // A. Quick Exact Match in this SKU bucket
          const exactMatch = possibleFiles.find(f => f.filename.toLowerCase() === filename.toLowerCase());
          if (exactMatch) {
              counters.healedExact++;
              return exactMatch.path;
          }

          // B. Fuzzy match (same extension, maximum shared tokens like "escena", "medidas", "silueta")
          // Filter by same extension category (image vs non-image)
          const isImage = ['.png', '.jpg', '.jpeg', '.webp'].includes(extension);
          const candidatePool = possibleFiles.filter(f => {
              const isCandImage = ['.png', '.jpg', '.jpeg', '.webp'].includes(f.ext);
              return isImage === isCandImage;
          });

          if (candidatePool.length > 0) {
              // Sort by best similarity score
              let bestCandidate = null;
              let bestScore = -1;

              candidatePool.forEach(cand => {
                  const score = calculateSimilarity(filename, cand.filename);
                  if (score > bestScore) {
                      bestScore = score;
                      bestCandidate = cand;
                  }
              });

              // Threshold score: at least 1 matching token (e.g. "escena")
              if (bestCandidate && bestScore >= 1) {
                  counters.healedFuzzy++;
                  return bestCandidate.path;
              }
          }
      }

      // Fallback: Global fuzzy match? High risk, skip to avoid collisions.
      console.warn(`FALLÓ HEAL INTELIGENTE PARA: ${cleanedPath}`);
      counters.couldNotHeal++;
      return cleanedPath;
  }

  function iterateAndFix(node) {
      if (Array.isArray(node)) {
          node.forEach(item => iterateAndFix(item));
      } else if (typeof node === 'object' && node !== null) {
          for (const key in node) {
              if (typeof node[key] === 'string') {
                  if (node[key].includes(';')) {
                      const pieces = node[key].split(';').map(p => p.trim());
                      const resolvedPieces = pieces.map(p => resolveSmart(p));
                      node[key] = resolvedPieces.join('; ');
                  } else {
                      node[key] = resolveSmart(node[key]);
                  }
              } else {
                  iterateAndFix(node[key]);
              }
          }
      }
  }

  iterateAndFix(data);

  fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2), 'utf8');

  console.log("\n=== REPORTE FINAL DE SANEAMIENTO ===");
  console.log(`Correctos originales: ${counters.correct}`);
  console.log(`Reparados DIRECTAMENTE: ${counters.healedExact}`);
  console.log(`Reparados DIFUSO (INTELIGENTE): ${counters.healedFuzzy}`);
  console.log(`FALTA TOTAL (No existen en disco): ${counters.couldNotHeal}`);
  console.log("\nSe ha forzado la curación final en data/productos.json.");
}

main();
