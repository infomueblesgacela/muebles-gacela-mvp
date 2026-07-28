const fs = require('fs');
const path = require('path');

const JSON_PATH = path.join(__dirname, 'data', 'productos.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

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

function main() {
  console.log("=== INICIANDO ESCANEO DE ARCHIVOS FÍSICOS ===");
  const targetDir = path.join(PUBLIC_DIR, 'articulos-gacela-muebles-2026');
  
  if (!fs.existsSync(targetDir)) {
      console.error(`Error: El directorio físico ${targetDir} no existe.`);
      return;
  }

  const physicalFiles = walkSync(targetDir);
  console.log(`Encontrados ${physicalFiles.length} archivos físicos en total.`);

  // Crear un Mapa de: filename -> path físico web (/articulos...)
  const fileMap = new Map();
  physicalFiles.forEach(fp => {
      const filename = path.basename(fp).toLowerCase();
      // Convertir C:\...\public\articulos-gacela... -> /articulos-gacela...
      const webPath = '/' + path.relative(PUBLIC_DIR, fp).replace(/\\/g, '/');
      
      // Guardar usando nombre base como clave. 
      // Si hay repetidos de distintos productos, guardaremos Map de Maps por productoFolder
      const segments = webPath.split('/');
      const prodFolder = segments[3]; // [0]='', [1]='articulos...', [2]='linea...', [3]='art-...'

      if (!fileMap.has(prodFolder)) {
          fileMap.set(prodFolder, new Map());
      }
      fileMap.get(prodFolder).set(filename, webPath);
  });

  console.log(`Indexadas carpetas de ${fileMap.size} productos.`);

  console.log("\n=== PROCESANDO data/productos.json ===");
  if (!fs.existsSync(JSON_PATH)) {
      console.error("No se encontró data/productos.json");
      return;
  }

  const raw = fs.readFileSync(JSON_PATH, 'utf8');
  const data = JSON.parse(raw);
  
  let checkedCount = 0;
  let fixedCount = 0;
  let unfoundCount = 0;

  function resolvePath(originalPath) {
      if (!originalPath || typeof originalPath !== 'string') return originalPath;
      if (!originalPath.toLowerCase().includes('articulos-gacela')) return originalPath;

      // Normalizar slash por si acaso
      const cleanedOrig = originalPath.replace(/\\/g, '/').trim();
      
      // 1. Verificar si ya es válido físicamente
      const physicalTest = path.join(PUBLIC_DIR, cleanedOrig);
      if (fs.existsSync(physicalTest)) {
          checkedCount++;
          return cleanedOrig; // Ya está correcto
      }

      // 2. ¡Está roto! Intentar resolverlo con el mapa dinámico
      const filename = path.basename(cleanedOrig).toLowerCase();
      
      // Detectar la carpeta del producto de la ruta original
      // Ej: /articulos-gacela-muebles-2026/linea-clasica/art-902-2-bahiut-gammel/carvalho/...
      const parts = cleanedOrig.split('/');
      const prodFolder = parts[3]; 

      if (fileMap.has(prodFolder)) {
          const subMap = fileMap.get(prodFolder);
          if (subMap.has(filename)) {
              fixedCount++;
              return subMap.get(filename);
          }
      }

      // 3. Si falló por carpeta, intentar en TODAS las carpetas (menos seguro pero fallback)
      for (const [folder, subMap] of fileMap.entries()) {
          if (subMap.has(filename)) {
              fixedCount++;
              return subMap.get(filename);
          }
      }

      console.warn(`AVISO: No se encontró reemplazo físico para: ${cleanedOrig}`);
      unfoundCount++;
      return cleanedOrig; // No pudimos arreglarlo
  }

  function iterateAndFix(node) {
      if (Array.isArray(node)) {
          node.forEach(item => iterateAndFix(item));
      } else if (typeof node === 'object' && node !== null) {
          for (const key in node) {
              if (typeof node[key] === 'string') {
                  // Si es lista separada por punto y coma
                  if (node[key].includes(';')) {
                      const pieces = node[key].split(';').map(p => p.trim());
                      const resolvedPieces = pieces.map(p => resolvePath(p));
                      node[key] = resolvedPieces.join('; ');
                  } else {
                      node[key] = resolvePath(node[key]);
                  }
              } else {
                  iterateAndFix(node[key]);
              }
          }
      }
  }

  iterateAndFix(data);

  fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2), 'utf8');

  console.log("\n=== RESUMEN DE REPARACIÓN ===");
  console.log(`Rutas correctas conservadas: ${checkedCount}`);
  console.log(`Rutas rotas CORREGIDAS dinámicamente: ${fixedCount}`);
  console.log(`Rutas no encontradas (siguen rotas): ${unfoundCount}`);
  console.log("\nEl archivo data/productos.json ha sido actualizado exitosamente.");
}

main();
