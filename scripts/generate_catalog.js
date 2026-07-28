import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvPath = path.join(__dirname, '../plantilla_productos.csv');
const outputPath = path.join(__dirname, '../data/productos.json');

// Ensure data dir exists
if (!fs.existsSync(path.dirname(outputPath))) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
}

function generateSlug(name) {
  return name.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

try {
  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  
  // Robust CSV parser that handles newlines and delimiters inside quotes
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;
  
  // Detect delimiter
  const firstLineEnd = fileContent.indexOf('\n');
  const firstLine = firstLineEnd !== -1 ? fileContent.substring(0, firstLineEnd) : fileContent;
  const delimiter = firstLine.includes(';') ? ';' : ',';

  for (let i = 0; i < fileContent.length; i++) {
    const char = fileContent[i];
    const nextChar = fileContent[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Handle escaped quotes ("")
        currentField += '"';
        i++;
      } else {
        // Toggle quote state
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
      // Skip \n if we just processed \r
      if (char === '\r' && nextChar === '\n') i++;
    } else {
      currentField += char;
    }
  }
  // Push last field/row
  if (currentField !== '' || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }

  if (rows.length > 0) {
    const headers = rows[0];
    const products = [];
    
    for (let i = 1; i < rows.length; i++) {
      const values = rows[i];
      if (values.length < headers.length) continue;
      
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });

      // Use SKU as the unique reference/slug as requested
      obj.slug = obj.SKU ? generateSlug(obj.SKU) : generateSlug(obj.Nombre_Comercial || 'producto');

      // Normalise logística field
      if (!obj['Medidas_Logistica'] && (obj['Peso'] || obj['Embalaje'])) {
        const parts = [obj['Peso'], obj['Embalaje'], obj['Cantidad_Paquetes']].filter(Boolean);
        obj['Medidas_Logistica'] = parts.join(' · ');
      }

      products.push(obj);
    }
    
    fs.writeFileSync(outputPath, JSON.stringify({ products }, null, 2));
    console.log(`Catalog created successfully at ${outputPath} with ${products.length} products.`);
  }
} catch (error) {
  console.error("Error reading or processing CSV:", error.stack);
}
