const fs = require('fs');
const path = require('path');

const TARGET_DIR = path.join(__dirname, 'public', 'images');
let renamed = 0, deleted = 0;

function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (/\.(png|jpg|jpeg)$/i.test(entry.name)) {
      const newPath = fullPath.replace(/\.(png|jpg|jpeg)$/i, '.webp');
      if (!fs.existsSync(newPath)) {
        fs.renameSync(fullPath, newPath);
        console.log('✅ renamed:', path.relative(TARGET_DIR, fullPath), '→', path.basename(newPath));
        renamed++;
      } else {
        fs.unlinkSync(fullPath);
        console.log('🗑️  deleted dup:', path.relative(TARGET_DIR, fullPath));
        deleted++;
      }
    }
  }
}

console.log('\n🔄 Renombrando .png/.jpg → .webp en public/images\n');
processDir(TARGET_DIR);
console.log(`\n✨ Listo: ${renamed} renombrados, ${deleted} duplicados eliminados\n`);
