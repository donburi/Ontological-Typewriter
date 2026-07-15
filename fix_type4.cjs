const fs = require('fs');
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

appCode = appCode.replace(/editorFont="font-sans" editorFont="font-sans"/g, 'editorFont="font-sans"');
appCode = appCode.replace(/editorFont="font-sans" editorFont="font-sans"/g, 'editorFont="font-sans"');

fs.writeFileSync('src/App.tsx', appCode);

