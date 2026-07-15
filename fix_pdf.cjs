const fs = require('fs');
let code = fs.readFileSync('src/lib/exportHelpers.ts', 'utf8');
code = code.replace(/import html2pdf from 'html2pdf.js';\n/, '');
code = code.replace(/html2pdf\(\).set\(opt\).from\(content\).save\(\);/, `const html2pdf = (await import('html2pdf.js')).default;\n  html2pdf().set(opt).from(content).save();`);
fs.writeFileSync('src/lib/exportHelpers.ts', code);
