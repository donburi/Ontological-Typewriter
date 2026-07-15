const fs = require('fs');

// Fix App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

appCode = appCode.replace(/<UserAuth \/>/g, '<UserAuth theme={workspace.theme} />');
appCode = appCode.replace(/entities=\{activeProject\.bible\}/g, 'bible={activeProject.bible} project={activeProject}');
appCode = appCode.replace(/vibe="Neutral"/g, 'vibe="Neutral" editorFont="font-sans"');
appCode = appCode.replace(/vibe: 'Neutral'/g, "vibe: 'Neutral' as 'Neutral'");

fs.writeFileSync('src/App.tsx', appCode);

// Fix server.ts
let serverCode = fs.readFileSync('server.ts', 'utf8');
serverCode = serverCode.replace(/import epubcheck from "@likecoin\/epubcheck-ts";/, 'import { epubcheck } from "@likecoin/epubcheck-ts";');

fs.writeFileSync('server.ts', serverCode);
