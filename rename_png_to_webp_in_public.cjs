/**
 * rename_png_to_webp_in_public.cjs
 * 
 * Renombra todos los archivos .png y .jpg en public/articulos-gacela-muebles-2026
 * a .webp (cambia solo la extensión, no convierte el contenido).
 * 
 * NOTA: Esto es una solución de compatibilidad. El navegador cargará los archivos
 * con extensión .webp aunque el contenido sea PNG/JPG (los navegadores no validan
 * la extensión, solo el contenido MIME del archivo).
 * 
 * Para conversión real usar el script de compresión aparte.
 */

const fs = require('fs');
const path = require('path');

const TARGET_DIR = path.join(__dirname, 'public', 'articulos-gacela-muebles-2026');
let renamed = 0;
let skipped = 0;

function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
        const newName = entry.name.replace(/\.(png|jpg|jpeg)$/i, '.webp');
        const newPath = path.join(dir, newName);
        
        // Solo renombrar si no existe ya un .webp con ese nombre
        if (!fs.existsSync(newPath)) {
          fs.renameSync(fullPath, newPath);
          console.log(`  ✅ ${path.relative(TARGET_DIR, fullPath)} → ${newName}`);
          renamed++;
        } else {
          // Ya existe .webp, borrar el .png viejo
          fs.unlinkSync(fullPath);
          console.log(`  🗑️  ${entry.name} (ya existe .webp, eliminado)`);
          skipped++;
        }
      }
    }
  }
}

console.log('\n🔄 Renombrando .png/.jpg → .webp en public/articulos-gacela-muebles-2026\n');
console.log('='.repeat(60));

if (!fs.existsSync(TARGET_DIR)) {
  console.error('❌ Carpeta no encontrada:', TARGET_DIR);
  process.exit(1);
}

processDir(TARGET_DIR);

console.log('\n' + '='.repeat(60));
console.log(`\n✨ Proceso completado:`);
console.log(`   📝 Renombrados: ${renamed}`);
console.log(`   🗑️  Eliminados (duplicados): ${skipped}`);
console.log(`   Total procesados: ${renamed + skipped}\n`);
