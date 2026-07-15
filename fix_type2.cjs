const fs = require('fs');
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

// For OverviewEditor calls that are missing editorFont
appCode = appCode.replace(/vibe="Neutral"/g, 'vibe="Neutral" editorFont="font-sans"');
fs.writeFileSync('src/App.tsx', appCode);

