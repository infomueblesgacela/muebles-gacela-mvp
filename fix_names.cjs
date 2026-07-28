const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// --- UTILS ---

/**
 * Normaliza una cadena quitando acentos, convirtiendo a minúsculas,
 * reemplazando espacios por guiones y quitando caracteres especiales.
 */
function normalizeSegment(str) {
  if (!str) return str;
  
  let normalized = str.toString()
    .toLowerCase()
    // Elimina acentos
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    // Reemplaza espacios por guión
    .replace(/\s+/g, '-')
    // Quita paréntesis, corchetes, comas y comillas
    .replace(/[()\[\],'"!]/g, '')
    // Elimina caracteres que no sean letras minúsculas, números, puntos, guiones o guión bajo
    .replace(/[^a-z0-9\.\-_]/g, '')
    // Colapsa guiones múltiples en uno solo
    .replace(/-+/g, '-')
    // Limpia guiones al principio o al final
    .replace(/^-+|-+$/g, '');

  // Si es un archivo con extensión, nos aseguramos de no tener guiones pegados al punto
  if (normalized.includes('.')) {
    const parts = normalized.split('.');
    const ext = parts.pop();
    const base = parts.join('.').replace(/-+$/g, '');
    return `${base}.${ext}`;
  }

  return normalized;
}

/**
 * Renombrado seguro en Windows que previene colisiones por diferencia de capitalización.
 */
function safeRename(oldPath, newPath) {
  if (oldPath === newPath) return;
  if (!fs.existsSync(oldPath)) return;

  console.log(`Renombrando: ${path.basename(oldPath)} -> ${path.basename(newPath)}`);

  // Hack para Windows: Si solo difiere el casing o acentos que Windows trata igual en FS
  if (oldPath.toLowerCase() === newPath.toLowerCase() || path.resolve(oldPath).toLowerCase() === path.resolve(newPath).toLowerCase()) {
    const tempPath = oldPath + "_temp_" + crypto.randomBytes(2).toString('hex');
    try {
      fs.renameSync(oldPath, tempPath);
      fs.renameSync(tempPath, newPath);
    } catch (err) {
      console.error(`Error crítico renombrando temporalmente ${oldPath}:`, err.message);
    }
  } else {
    try {
      if (fs.existsSync(newPath)) {
        console.warn(`ATENCIÓN: El destino ya existe. Omitiendo '${newPath}'`);
      } else {
        fs.renameSync(oldPath, newPath);
      }
    } catch (err) {
      console.error(`Error renombrando ${oldPath} -> ${newPath}:`, err.message);
    }
  }
}

/**
 * Recorre de abajo hacia arriba para no invalidar las rutas mientras se renombran.
 */
function processDirectoryRecursively(dirPath) {
  if (!fs.existsSync(dirPath)) return;

  const items = fs.readdirSync(dirPath);

  items.forEach(item => {
    const fullPath = path.join(dirPath, item);
    const isDirectory = fs.statSync(fullPath).isDirectory();

    if (isDirectory) {
      processDirectoryRecursively(fullPath);
    }
    
    const normalizedItem = normalizeSegment(item);
    if (normalizedItem !== item) {
      const newFullPath = path.join(dirPath, normalizedItem);
      safeRename(fullPath, newFullPath);
    }
  });
}

// --- MAIN EXECUTION ---

function main() {
  console.log("=== INICIANDO SCRIPT DE CORRECCIÓN DE NOMBRES (NODE.JS) ===");

  const publicDir = path.join(__dirname, 'public');
  const articlesDir = path.join(publicDir, 'articulos-gacela-muebles-2026'); 
  // También intentamos el nombre viejo en caso de que el usuario corra esto después
  const articlesDirOld = path.join(publicDir, 'Artículos Gacela Muebles 2026'); 

  // 1. Renombrar carpetas principales en public si existen
  if (fs.existsSync(articlesDirOld) && !fs.existsSync(articlesDir)) {
    safeRename(articlesDirOld, articlesDir);
  }

  // 2. Procesar recursivamente la carpeta dentro de public
  const targetDir = fs.existsSync(articlesDir) ? articlesDir : articlesDirOld;
  if (fs.existsSync(targetDir)) {
    console.log(`\n1. Escaneando archivos en: ${targetDir}...`);
    processDirectoryRecursively(targetDir);
  } else {
    console.log("\nNo se encontró el directorio de artículos dentro de public/.");
  }

  // 3. Opcional: Sincronizar CSV por si el usuario agregó filas nuevas
  const csvFile = path.join(__dirname, 'productos_auditados.csv');
  if (fs.existsSync(csvFile)) {
    console.log("\n2. Verificando coherencia en productos_auditados.csv...");
    try {
      let content = fs.readFileSync(csvFile, 'utf8');
      
      // Función inline para normalizar toda una ruta de URL web
      const normalizeFullPath = (p) => {
        if (!p) return p;
        return p.split('/').map(segment => segment ? normalizeSegment(segment) : '').join('/');
      };

      const rows = content.split(/\r?\n/);
      if (rows.length > 0) {
        const headers = rows[0].split(';');
        const idxMedidas = headers.indexOf('Foto_Medidas');
        const idxMueble = headers.indexOf('Fotos_Mueble');
        const idxManual = headers.indexOf('Manual_PDF');

        const updatedRows = [rows[0]];
        let count = 0;

        for (let i = 1; i < rows.length; i++) {
          if (!rows[i].trim()) continue;
          const cols = rows[i].split(';');
          
          [idxMedidas, idxManual].forEach(idx => {
            if (idx !== -1 && cols[idx]) {
              const oldVal = cols[idx];
              cols[idx] = normalizeFullPath(cols[idx].trim());
              if (oldVal !== cols[idx]) count++;
            }
          });

          if (idxMueble !== -1 && cols[idxMueble]) {
            const oldVal = cols[idxMueble];
            const items = cols[idxMueble].split(',').map(v => v.trim()).filter(v => v);
            const normalizedItems = items.map(it => normalizeFullPath(it));
            cols[idxMueble] = normalizedItems.join(',');
            if (oldVal !== cols[idxMueble]) count++;
          }
          
          updatedRows.push(cols.join(';'));
        }

        if (count > 0) {
          fs.writeFileSync(csvFile, updatedRows.join('\n'), 'utf8');
          console.log(`CSV actualizado exitosamente. Se formatearon ${count} rutas.`);
        } else {
          console.log("El CSV ya se encuentra totalmente normalizado. No se requirieron cambios.");
        }
      }
    } catch (e) {
      console.error("Error al verificar el CSV:", e.message);
    }
  }

  console.log("\n=== PROCESO FINALIZADO CON ÉXITO ===");
}

main();
