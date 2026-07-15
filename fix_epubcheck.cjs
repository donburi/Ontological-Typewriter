const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/import \{ epubcheck \} from "@likecoin\/epubcheck-ts";/, 'import epubcheck from "@likecoin/epubcheck-ts";');
code = code.replace(/import epubcheck from "@likecoin\/epubcheck-ts";/, 'import * as epubcheckLib from "@likecoin/epubcheck-ts";\nconst epubcheck = epubcheckLib.default || epubcheckLib.epubcheck || epubcheckLib;');
fs.writeFileSync('server.ts', code);
