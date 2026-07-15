const fs = require('fs');

let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(/const newScene = \{ id: crypto\.randomUUID\(\), title: 'New Scene', content: '', vibe: 'Neutral' as 'Neutral' \};/g, 
  "const newScene = { id: crypto.randomUUID(), title: 'New Scene', content: '', vibe: 'Neutral' as 'Neutral' };");
appCode = appCode.replace(/const newScene = \{ id: crypto\.randomUUID\(\), title: 'New Scene', content: '', vibe: 'Neutral' \};/g, 
  "const newScene = { id: crypto.randomUUID(), title: 'New Scene', content: '', vibe: 'Neutral' as const };");
appCode = appCode.replace(/const newScene = \{ id: crypto\.randomUUID\(\), title: 'New Scene', content: '', vibe: 'Neutral' as 'Neutral' \};/g, 
  "const newScene = { id: crypto.randomUUID(), title: 'New Scene', content: '', vibe: 'Neutral' as const };");
fs.writeFileSync('src/App.tsx', appCode);

