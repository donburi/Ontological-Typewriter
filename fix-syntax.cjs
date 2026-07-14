const fs = require('fs');
let code = fs.readFileSync('src/components/StoryBible.tsx', 'utf8');

const regex = /  const escapeRegExp = \(string: string\) => \{[\s\S]*?\};\'\);\n  \};/;
const replacement = `  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^$\{()|[\\]\\\\]/g, '\\\\$&');
  };`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/StoryBible.tsx', code);
