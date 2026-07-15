const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');
server = server.replace(/import createDOMPurify from 'dompurify';\nconst window = new JSDOM\(''\)\.window;\nconst DOMPurifyInstance = createDOMPurify\(window as any\);\nimport \{ JSDOM \} from 'jsdom';/g, "import { stringify } from '@vivliostyle/vfm';");
server = server.replace(/import \{ marked \} from 'marked';/g, "");
server = server.replace(/processedContent = DOMPurifyInstance\.sanitize\(marked\.parse\(scene\.content \|\| ''\) as string\);/g, "processedContent = stringify(scene.content || '');");
fs.writeFileSync('server.ts', server);

let pub = fs.readFileSync('src/components/PublisherEditor.tsx', 'utf8');
pub = pub.replace(/import \{ Theme, THEME_UI \} from '\.\.\/types';/g, "import { Theme, THEME_UI } from '../types';\nimport { stringify } from '@vivliostyle/vfm';");
fs.writeFileSync('src/components/PublisherEditor.tsx', pub);
