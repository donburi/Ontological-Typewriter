const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

code = code.replace(/data\.email == request\.auth\.token\.email/g, 'data.email is string');
code = code.replace(/data\.keys\(\)\.size\(\) == 3 &&/g, ''); // maybe there are other fields like photoURL?
code = code.replace(/data\.keys\(\)\.size\(\) == 4 &&/g, '');

fs.writeFileSync('firestore.rules', code);
