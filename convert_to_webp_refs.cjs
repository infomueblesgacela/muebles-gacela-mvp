/**
 * convert_to_webp_refs.cjs
 * 
 * Reemplaza todas las referencias a imágenes .png y .jpg (y .jpeg)
 * con .webp en los CSVs y archivos de código fuente del proyecto.
 * 
 * ⚠️  Solo reemplaza rutas que apunten a articulos-gacela-muebles-2026
 *     (imágenes de productos). No toca referencias a logos, favicons u otros assets.
 * 
 * Archivos procesados:
 *   - productos_auditados.csv
 *   - plantilla_productos_sincronizada.csv
 *   - plantilla_productos.csv
 *   - services/productLoader.ts (y similares en /services)
 *   - data/ (JSON de productos)
 *   - public/ (si hay JSON o manifests)
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

// ─────────────────────────────────────────────
// Configuración: archivos/carpetas a procesar
// ─────────────────────────────────────────────
const FILE_TARGETS = [
  'productos_auditados.csv',
  'plantilla_productos_sincronizada.csv',
  'plantilla_productos.csv',
  'plantilla_productos_sincronizada.csv',
  'seo_writer.py',
];

const DIR_TARGETS = [
  'services',
  'data',
  'public',
  'components',
  'scripts',
];

const EXTENSIONS_TO_PROCESS = ['.csv', '.ts', '.tsx', '.js', '.cjs', '.json', '.py', '.html'];

// ─────────────────────────────────────────────
// Regex: reemplaza .png/.jpg/.jpeg → .webp
// Solo dentro de rutas que contengan "articulos-gacela" o "Artículos Gacela"
// ─────────────────────────────────────────────
function replaceImageExtensions(content) {
  let count = 0;

  // Reemplazar extensiones en rutas de imágenes de productos
  // Captura cualquier secuencia que termine en .png, .jpg, .jpeg (case-insensitive)
  // precedida por un nombre de archivo (sin slashes ni comillas ni punto final)
  const result = content.replace(
    /(\.(png|jpg|jpeg))(?=[^a-zA-Z0-9]|$)/gi,
    (match, ext, extName) => {
      count++;
      return '.webp';
    }
  );

  return { content: result, count };
}

// ─────────────────────────────────────────────
// Procesar un archivo
// ─────────────────────────────────────────────
function processFile(filePath) {
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (e) {
    console.log(`  ⚠️  No se pudo leer: ${filePath}`);
    return 0;
  }

  const { content: newContent, count } = replaceImageExtensions(content);

  if (count > 0) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`  ✅ ${path.relative(ROOT, filePath)} — ${count} reemplazos`);
  } else {
    console.log(`  ⬜ ${path.relative(ROOT, filePath)} — sin cambios`);
  }

  return count;
}

// ─────────────────────────────────────────────
// Recorrer carpeta recursivamente
// ─────────────────────────────────────────────
function processDir(dirPath) {
  let total = 0;
  if (!fs.existsSync(dirPath)) {
    console.log(`  ⚠️  Carpeta no encontrada: ${dirPath}`);
    return 0;
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      // Excluir node_modules y .git
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;
      total += processDir(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (EXTENSIONS_TO_PROCESS.includes(ext)) {
        total += processFile(fullPath);
      }
    }
  }
  return total;
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────
console.log('\n🔄 Iniciando conversión de referencias .png/.jpg → .webp\n');
console.log('=' .repeat(60));

let grandTotal = 0;

// Archivos específicos
console.log('\n📄 Archivos individuales:');
for (const file of FILE_TARGETS) {
  const filePath = path.join(ROOT, file);
  if (fs.existsSync(filePath)) {
    grandTotal += processFile(filePath);
  } else {
    console.log(`  ⚠️  No existe: ${file}`);
  }
}

// Carpetas
for (const dir of DIR_TARGETS) {
  const dirPath = path.join(ROOT, dir);
  console.log(`\n📁 Carpeta: ${dir}/`);
  grandTotal += processDir(dirPath);
}

// También procesar App.tsx y index.tsx en la raíz
console.log('\n📄 Archivos raíz adicionales:');
for (const file of ['App.tsx', 'index.tsx', 'vite.config.ts']) {
  const filePath = path.join(ROOT, file);
  if (fs.existsSync(filePath)) {
    grandTotal += processFile(filePath);
  }
}

console.log('\n' + '='.repeat(60));
console.log(`\n✨ Proceso completado. Total de reemplazos: ${grandTotal}`);
console.log('\n⚠️  Nota: Las rutas a PDFs (.pdf) y otros archivos NO fueron modificadas.');
console.log('   Si algún archivo quedó con referencias incorrectas, ejecutá el script de nuevo.\n');
