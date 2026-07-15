const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace imports
code = code.replace(
  /import \* as epubcheckLib from "@likecoin\/epubcheck-ts";\nconst epubcheck = epubcheckLib\.default \|\| epubcheckLib\.epubcheck \|\| epubcheckLib;/g,
  'import { EpubCheck } from "@likecoin/epubcheck-ts";'
);

// Replace the epubcheck logic
const oldValidationLogic = `
      // Save buffer to temporary file for checking
      const tmpPath = path.join(process.cwd(), 'temp-' + Date.now() + '.epub');
      fs.writeFileSync(tmpPath, epubBuffer);
      
      // Validate using epubcheck
      let isValid = true;
      let checkMessages = [];
      try {
        const checkResult = await epubcheck(tmpPath);
        isValid = checkResult.checker.isSuccess;
        checkMessages = checkResult.messages;
      } catch (checkErr) {
        console.error("Epubcheck error:", checkErr);
      } finally {
        fs.unlinkSync(tmpPath); // Cleanup
      }
`;

const newValidationLogic = `
      // Validate using epubcheck
      let isValid = true;
      let checkMessages = [];
      try {
        const checkResult = await EpubCheck.validate(epubBuffer);
        isValid = checkResult.valid;
        checkMessages = checkResult.messages;
      } catch (checkErr) {
        console.error("Epubcheck error:", checkErr);
      }
`;

// It might fail to replace if there are exact spacing issues, so let's do a more robust replace
// We can use a regex to match from `// Save buffer` to `fs.unlinkSync(tmpPath); // Cleanup\n      }`
code = code.replace(/\/\/ Save buffer to temporary file[\s\S]*?\/\/ Cleanup\n      \}/, newValidationLogic.trim());

fs.writeFileSync('server.ts', code);
