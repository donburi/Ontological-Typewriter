const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');
server = server.replace(/import \{ stringify \} from "@vivliostyle\/vfm";/g, "import { marked } from 'marked';\nimport createDOMPurify from 'dompurify';\nimport { JSDOM } from 'jsdom';");
server = server.replace(/stringify\(scene\.content \|\| ''\)/g, "DOMPurify.sanitize(marked.parse(scene.content || ''))");
server = server.replace(/let processedContent = scene\.content;\s*try {\s*processedContent = stringify\(scene\.content \|\| ''\);\s*}\s*catch \(e\) {\s*console\.error\("VFM Parse error:", e\);\s*}/g, `
          let processedContent = scene.content;
          try {
            const window = new JSDOM('').window;
            const DOMPurify = createDOMPurify(window);
            processedContent = DOMPurify.sanitize(marked.parse(scene.content || ''));
          } catch (e) {
            console.error("Parse error:", e);
          }
`);
fs.writeFileSync('server.ts', server);

let pub = fs.readFileSync('src/components/PublisherEditor.tsx', 'utf8');
pub = pub.replace(/import \{ stringify \} from '@vivliostyle\/vfm';/g, "");
fs.writeFileSync('src/components/PublisherEditor.tsx', pub);

