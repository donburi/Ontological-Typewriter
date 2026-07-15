const fs = require('fs');
let code = fs.readFileSync('src/components/StoryBible.tsx', 'utf8');

code = code.replace(/              \}\)\n            <\/div>/, '              })}\n            </div>');

fs.writeFileSync('src/components/StoryBible.tsx', code);
