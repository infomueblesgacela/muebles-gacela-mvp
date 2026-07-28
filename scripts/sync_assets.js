import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '../public');
const ASSETS_DIR = path.join(PUBLIC_DIR, 'articulos-gacela-muebles-2026');
const INPUT_CSV = path.join(__dirname, '../plantilla_productos.csv');
const OUTPUT_CSV = path.join(__dirname, '../plantilla_productos_sincronizada.csv');

const HEADERS = [
  'SKU', 'Nombre_Comercial', 'Color', 'Linea', 'Ambiente',
  'Descripcion_Corta', 'Descripcion_Larga', 'Medidas_Mueble',
  'Peso', 'Embalaje', 'Cantidad_Paquetes', 'URLs_Fotos',
  'Imagen_Tecnica', 'Manual_PDF', 'Video_YouTube',
  'Relacionados', 'Detalles_Tecnicos'
];

function escapeCSV(field) {
  if (field == null) return '';
  const str = String(field);
  if (str.includes(';') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Re-using the robust parser logic
function parseExistingCsv(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;
  
  const delimiter = ';';
  
  for (let i = 0; i < fileContent.length; i++) {
    const char = fileContent[i];
    const nextChar = fileContent[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (currentField !== '' || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        rows.push(currentRow);
        currentField = '';
        currentRow = [];
      }
      if (char === '\r' && nextChar === '\n') i++;
    } else {
      currentField += char;
    }
  }
  if (currentField !== '' || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }

  if (rows.length < 2) return [];
  const headers = rows[0];
  const data = [];
  for (let i = 1; i < rows.length; i++) {
    const obj = {};
    headers.forEach((h, index) => {
      obj[h.trim()] = rows[i][index] || '';
    });
    data.push(obj);
  }
  return data;
}

function scan() {
  if (!fs.existsSync(ASSETS_DIR)) {
    console.error("No se encontró la carpeta: " + ASSETS_DIR);
    return;
  }

  // Parse what we currently have in CSV
  const existingProducts = parseExistingCsv(INPUT_CSV);
  const scannedSkus = new Set();
  
  const lineas = fs.readdirSync(ASSETS_DIR).filter(f => fs.statSync(path.join(ASSETS_DIR, f)).isDirectory());
  
  const newProductsMap = new Map();

  for (const lineaFolder of lineas) {
    // Maneja tanto "Línea Clásica" como "linea-clasica"
    const lineaName = lineaFolder.replace(/^linea-/i, '').replace('Línea', '').replace(/-/g, ' ').trim();
    const lineaPath = path.join(ASSETS_DIR, lineaFolder);
    const productFolders = fs.readdirSync(lineaPath).filter(f => fs.statSync(path.join(lineaPath, f)).isDirectory());
    
    for (const prodFolder of productFolders) {
       // Compatible con viejo formato "Art 902-2 (Name)" y el nuevo normalizado "art-902-2-name"
       let sku = '';
       let nombreComercial = '';
       
       const matchOld = prodFolder.match(/Art\s+([A-Za-z0-9\-]+)\s*\((.*)\)/i);
       const matchNew = prodFolder.match(/^art-([0-9a-z]+(?:-[0-9a-z]+)?)-(.*)$/i);
       
       if (matchOld) {
         sku = matchOld[1].trim();
         nombreComercial = matchOld[2].trim();
       } else if (matchNew) {
         sku = matchNew[1].trim().toUpperCase();
         nombreComercial = matchNew[2].replace(/-/g, ' ').trim().toUpperCase();
       } else {
         // Fallback logic: toma el bloque entre guiones
         const parts = prodFolder.split('-');
         sku = parts[1] || prodFolder;
         nombreComercial = prodFolder.replace(/-/g, ' ').toUpperCase();
       }
       
       scannedSkus.add(sku);

       const prodPath = path.join(lineaPath, prodFolder);
       const files = fs.readdirSync(prodPath);

       let escenas = [];
       let reales = [];
       let otras = [];
       let imagenTecnica = '';
       let manualPdf = '';

       for (const file of files) {
         const ext = path.extname(file).toLowerCase();
         const fileName = file.toLowerCase();
         // El path relativo arranca con "/" para funcionar directo en el frontend
         const relativePath = `/articulos-gacela-muebles-2026/${lineaFolder}/${prodFolder}/${file}`.replace(/\\/g, '/');

         if (ext === '.pdf') {
            manualPdf = relativePath;
         } else if (['.webp', '.webp', '.webp', '.webp'].includes(ext)) {
            if (fileName.includes('medidas') || fileName.includes('cotas')) {
                imagenTecnica = relativePath;
            } else if (fileName.includes('escena')) {
                escenas.push(relativePath);
            } else if (fileName.includes('real')) {
                reales.push(relativePath);
            } else {
                otras.push(relativePath);
            }
         }
       }

       // Order: Escenas first, then reales, then otras.
       const fotos = [...escenas, ...reales, ...otras].join('; ');

       // Find if we already had manually entered data for this SKU
       const existing = existingProducts.find(p => p.SKU === sku) || {};

       newProductsMap.set(sku, {
         SKU: sku,
         Nombre_Comercial: existing.Nombre_Comercial || nombreComercial,
         Color: existing.Color || '',
         Linea: existing.Linea || lineaName,
         Ambiente: existing.Ambiente || '',
         Descripcion_Corta: existing.Descripcion_Corta || '',
         Descripcion_Larga: existing.Descripcion_Larga || '',
         Medidas_Mueble: existing.Medidas_Mueble || '',
         Peso: existing.Peso || '',
         Embalaje: existing.Embalaje || '',
         Cantidad_Paquetes: existing.Cantidad_Paquetes || '',
         URLs_Fotos: fotos || existing.URLs_Fotos || '',
         Imagen_Tecnica: imagenTecnica || existing.Imagen_Tecnica || '',
         Manual_PDF: manualPdf || existing.Manual_PDF || '',
         Video_YouTube: existing.Video_YouTube || '',
         Relacionados: existing.Relacionados || '',
         Detalles_Tecnicos: existing.Detalles_Tecnicos || ''
       });
    }
  }

  // Also include any products from CSV that weren't inside the folders
  for (const existing of existingProducts) {
    if (!scannedSkus.has(existing.SKU)) {
      newProductsMap.set(existing.SKU, existing);
    }
  }

  // Generate CSV string
  let csvContent = HEADERS.join(';') + '\n';
  
  for (const p of newProductsMap.values()) {
     const row = HEADERS.map(h => escapeCSV(p[h] || ''));
     csvContent += row.join(';') + '\n';
  }

  fs.writeFileSync(OUTPUT_CSV, csvContent, 'utf-8');
  console.log(`===============================================`);
  console.log(`¡Éxito! Se sincronizaron la base de datos CSV y las carpetas.`);
  console.log(`Se escanearon e ingresaron ${scannedSkus.size} productos locales encontrados.`);
  console.log(`Archivo generado: plantilla_productos_sincronizada.csv`);
  console.log(`===============================================`);
}

try {
  scan();
} catch(e) {
  console.error("Error al sincronizar:", e);
}
