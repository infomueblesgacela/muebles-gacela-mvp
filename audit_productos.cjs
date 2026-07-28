const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, 'articulos-gacela-muebles-2026');
const CSV_FILE = path.join(__dirname, 'productos_auditados.csv');
const REPORT_FILE = path.join(__dirname, 'reporte_faltantes.txt');

// Known colors in the Gacela catalog based on common furniture colors
const KNOWN_COLORS = [
    'Blanco', 'Roble Miel', 'Roble', 'Carvalho Mezzo', 'Carvalho', 
    'Venezia', 'Gris Andino', 'Gris', 'Negro', 'Nevado', 'Wengue', 
    'Caoba', 'Báltico', 'Baltico', 'Seda Giorno', 'Ceniza', 'Natural'
];

function getColorsFromFilename(filename) {
    const foundColors = [];
    const upperFilename = filename.toUpperCase();
    for (const color of KNOWN_COLORS) {
        if (upperFilename.includes(color.toUpperCase())) {
            foundColors.push(color);
        }
    }
    // Return the longest matching color (e.g. 'Roble Miel' instead of just 'Roble')
    if (foundColors.length > 0) {
        foundColors.sort((a, b) => b.length - a.length);
        return foundColors[0];
    }
    return 'Unico/Default';
}

function walkDir(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            walkDir(filePath, fileList);
        } else {
            fileList.push(filePath);
        }
    }
    return fileList;
}

const allFiles = walkDir(ROOT_DIR);

// Group by product folder
const products = {};

allFiles.forEach(file => {
    const relativePath = path.relative(ROOT_DIR, file).replace(/\\/g, '/');
    const parts = relativePath.split('/');
    if (parts.length < 2) return; // File at root, skip

    const fileName = parts.pop();
    const productFolderName = parts.pop();
    const lineaName = parts.length > 0 ? parts[0] : 'Sin Linea';

    const productKey = `${lineaName}|${productFolderName}`;
    
    if (!products[productKey]) {
        products[productKey] = {
            linea: lineaName,
            folder: productFolderName,
            files: []
        };
    }
    products[productKey].files.push({ name: fileName, path: relativePath });
});

// Process each product
const csvRows = [];
const missingReport = [];

csvRows.push(['SKU', 'Nombre_Comercial', 'Linea', 'Ambiente', 'Color', 'Descripcion_Corta', 'Descripcion_Larga', 'Medidas_Mueble', 'Peso', 'Embalaje', 'Cantidad_Paquetes', 'Foto_Medidas', 'Fotos_Mueble', 'Manual_PDF', 'Relacionados'].join(';'));

Object.keys(products).forEach(key => {
    const prod = products[key];
    const skuBase = 'GAC-' + prod.folder.replace(/[^0-9a-zA-Z]/g, '').toUpperCase();
    
    // Group files by color
    const colorGroups = {};
    const commonFiles = [];

    prod.files.forEach(f => {
        const color = getColorsFromFilename(f.name);
        if (color === 'Unico/Default' || f.name.toLowerCase().includes('medidas') || f.name.toLowerCase().endsWith('.pdf')) {
            commonFiles.push(f);
        } else {
            if (!colorGroups[color]) colorGroups[color] = [];
            colorGroups[color].push(f);
        }
    });

    const colors = Object.keys(colorGroups);
    if (colors.length === 0) colors.push('Unico/Default');

    colors.forEach(color => {
        let sku = skuBase;
        if (color !== 'Unico/Default') {
            const colorCode = color.substring(0, 2).toUpperCase();
            sku = `${skuBase}-${colorCode}`;
        }

        const variantFiles = [...commonFiles, ...(colorGroups[color] || [])];
        
        let manualPdf = '';
        let fotoMedidas = '';
        let fotoHero = '';
        const fotosGaleria = [];

        variantFiles.forEach(f => {
            const lowerName = f.name.toLowerCase();
            
            if (lowerName.endsWith('.pdf')) {
                manualPdf = f.path;
            } else if (lowerName.includes('medidas') && (lowerName.endsWith('.png') || lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg'))) {
                fotoMedidas = f.path;
            } else if (lowerName.includes('escena') && !lowerName.includes('abierto')) {
                // Si hay varias, guardamos la primera
                if (!fotoHero) fotoHero = f.path;
                else fotosGaleria.push(f.path);
            } else if (lowerName.endsWith('.png') || lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) {
                fotosGaleria.push(f.path);
            }
        });

        // Insert Hero as first in gallery if needed, but per prompt:
        // Foto Principal (Imagen_Hero): Busca el archivo que contenga la palabra "Escena" pero que NO contenga la palabra "Abierto"
        // (Wait, the CSV doesn't have an explicit 'Imagen_Hero' column in the user's list, just 'Fotos_Mueble'. I will put Hero first in the comma/semicolon list)
        
        const todasFotos = [];
        if (fotoHero) todasFotos.push(fotoHero);
        todasFotos.push(...fotosGaleria);

        // Validation for missing data
        const missing = [];
        if (!fotoHero) missing.push('Foto Principal (Escena sin Abierto)');
        if (!fotoMedidas) missing.push('Foto de Medidas');
        if (!manualPdf) missing.push('Manual PDF');

        if (missing.length > 0) {
            missingReport.push(`Producto: ${prod.folder} | Color: ${color} -> Falta: ${missing.join(', ')}`);
        }

        const row = [
            sku,
            prod.folder, // Nombre Comercial provisional
            prod.linea,
            '', // Ambiente
            color === 'Unico/Default' ? '' : color,
            '', '', '', '', '', '', // Descripcion, Medidas, etc.
            fotoMedidas ? `/articulos-gacela-muebles-2026/${fotoMedidas}` : '',
            todasFotos.map(p => `/articulos-gacela-muebles-2026/${p}`).join(','),
            manualPdf ? `/articulos-gacela-muebles-2026/${manualPdf}` : '',
            '' // Relacionados
        ];

        csvRows.push(row.join(';'));
    });
});

fs.writeFileSync(CSV_FILE, csvRows.join('\n'), 'utf8');
fs.writeFileSync(REPORT_FILE, missingReport.join('\n'), 'utf8');

console.log(`Auditoría completada. Procesados ${Object.keys(products).length} productos.`);
console.log(`Generados ${csvRows.length - 1} variantes en total.`);
console.log(`Se encontraron ${missingReport.length} alertas de datos faltantes.`);
