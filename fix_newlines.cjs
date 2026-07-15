const fs = require('fs');
let code = fs.readFileSync('src/hooks/useProjectData.ts', 'utf8');
code = code.replace(/import \{ exportProjectPDF, exportProjectTXT \} from '\.\.\/lib\/exportHelpers';import \{ useState, useEffect \} from 'react';/, "import { exportProjectPDF, exportProjectTXT } from '../lib/exportHelpers';\nimport { useState, useEffect } from 'react';");
fs.writeFileSync('src/hooks/useProjectData.ts', code);
