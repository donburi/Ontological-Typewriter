const fs = require('fs');
let code = fs.readFileSync('src/components/StoryBible.tsx', 'utf8');
const lines = code.split('\n');

// We want to remove lines from 101 to 116 (inclusive) which contain the broken escapeRegExp
lines.splice(101, 16, 
  "  const escapeRegExp = (string: string) => {",
  "    return string.replace(/[.*+?^${()|[\\]\\\\]/g, '\\\\$&');",
  "  };"
);

fs.writeFileSync('src/components/StoryBible.tsx', lines.join('\n'));
