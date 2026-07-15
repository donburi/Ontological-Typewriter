const fs = require('fs');
let code = fs.readFileSync('src/components/StoryBible.tsx', 'utf8');

code = code.replace(/              \)\}\}/, '              })');

fs.writeFileSync('src/components/StoryBible.tsx', code);
