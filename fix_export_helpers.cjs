const fs = require('fs');
let code = fs.readFileSync('src/lib/exportHelpers.ts', 'utf8');
code = code.replace(/import Epub from 'epub-gen-memory';\n/, '');
code = code.replace(/export const exportProjectEPUB[\s\S]*?\}\;/g, '');
fs.writeFileSync('src/lib/exportHelpers.ts', code);
