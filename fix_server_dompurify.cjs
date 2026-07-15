const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

server = server.replace(/import createDOMPurify from 'dompurify';/, "import createDOMPurify from 'dompurify';\nconst window = new JSDOM('').window;\nconst DOMPurifyInstance = createDOMPurify(window as any);");

server = server.replace(/DOMPurify\.sanitize\(marked\.parse\(scene\.content \|\| ''\)\)/g, "DOMPurifyInstance.sanitize(marked.parse(scene.content || '') as string)");

fs.writeFileSync('server.ts', server);

