const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync('./data/productos.json', 'utf8'));
const rootDir = path.join(__dirname, 'articulos-gacela-muebles-2026');
const publicDir = path.join(__dirname, 'public', 'articulos-gacela-muebles-2026');

// Helper to recursively list all files in a directory
function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(fullPath));
        } else {
            results.push(fullPath);
        }
    });
    return results;
}

// Function to normalize names (lowercase, no spaces, no accents, no parens)
function normalizeText(text) {
    return text
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[()]/g, "")                             // Remove parens
        .replace(/\s+/g, "-")                             // Spaces to hyphens
        .replace(/[^a-z0-9._-]/g, "");                    // Remove other weird chars
}

console.log("Indexing all files from ROOT directory for backup sourcing...");
if (!fs.existsSync(rootDir)) {
    console.error("ERROR: Root directory not found!");
    process.exit(1);
}

const allRootFiles = walkDir(rootDir);
const rootLookup = new Map();

allRootFiles.forEach(filePath => {
    const fileName = path.basename(filePath);
    const key = normalizeText(fileName);
    if (!rootLookup.has(key)) {
        rootLookup.set(key, []);
    }
    rootLookup.get(key).push(filePath);
});

console.log(`Indexed ${allRootFiles.length} total files from ROOT.`);

let copiedCount = 0;
let missingTotally = 0;
let okCount = 0;

// Now iterate over every product link
data.products.forEach(p => {
    ['Foto_Medidas', 'Fotos_Mueble', 'Manual_PDF'].forEach(key => {
        if (!p[key]) return;
        
        // Parse split paths
        const parts = p[key].split(';').map(s => s.trim()).filter(Boolean);
        
        parts.forEach(urlPath => {
            const fullPublicPath = path.join(__dirname, 'public', urlPath);
            
            // 1. Check if it already exists at the expected destination
            if (fs.existsSync(fullPublicPath)) {
                okCount++;
                return;
            }
            
            // 2. It's missing in public. Let's find it in ROOT by normalized filename match!
            const expectedBasename = path.basename(urlPath);
            const normalizedExpected = normalizeText(expectedBasename);
            
            const matches = rootLookup.get(normalizedExpected);
            
            if (matches && matches.length > 0) {
                // Try to find the best match based on folder context
                const expectedFolder = path.basename(path.dirname(urlPath));
                const bestMatch = matches.find(matchPath => normalizeText(path.basename(path.dirname(matchPath))) === normalizeText(expectedFolder)) || matches[0];
                
                // Copy to public folder
                const destDir = path.dirname(fullPublicPath);
                if (!fs.existsSync(destDir)) {
                    fs.mkdirSync(destDir, { recursive: true });
                }
                
                try {
                    fs.copyFileSync(bestMatch, fullPublicPath);
                    console.log(`[FIXED] Copied ${path.basename(bestMatch)} -> ${urlPath}`);
                    copiedCount++;
                } catch (e) {
                    console.error(`[ERROR] Failed to copy ${bestMatch}: ${e.message}`);
                }
            } else {
                // 3. Not even in root directory!
                console.log(`[CRITICAL MISSING] Not found in Root or Public: ${urlPath}`);
                missingTotally++;
            }
        });
    });
});

console.log("\n=== HEALING REPORT ===");
console.log(`Already Found (OK): ${okCount}`);
console.log(`Healed from Backup Root: ${copiedCount}`);
console.log(`Absolutely Missing: ${missingTotally}`);
console.log("======================\n");
