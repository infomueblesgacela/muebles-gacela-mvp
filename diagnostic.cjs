const fs = require('fs');
const path = require('path');

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

function extractSku(str) {
    if (!str) return null;
    const match = str.match(/([0-9]{2,7}(?:-[0-9]{1,3})?)/);
    return match ? match[0] : null;
}

const target = path.join(PUBLIC_DIR, 'articulos-gacela-muebles-2026');
const physicalFiles = walkSync(target);
const testSku = "334271";
console.log("DIAGNÓSTICO PARA SKU:", testSku);

physicalFiles.forEach(fp => {
    const folderName = path.basename(path.dirname(fp));
    const filename = path.basename(fp);
    let sku = extractSku(folderName);
    if (sku === testSku) {
        console.log("   -> Encontrado archivo físico:", filename, "en carpeta:", folderName);
    }
});

const targetJsonPath = "/articulos-gacela-muebles-2026/linea-curvalba/art-334271-escritorio-atuel/escena-art-334271-escena.png";
const skuJson = extractSku(targetJsonPath);
console.log("SKU detectado en JSON path:", skuJson);
