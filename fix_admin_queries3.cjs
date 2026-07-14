const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const target = `  const isAdmin = auth.currentUser?.email === 'procyin@gmail.com';
  if (!isAdmin) {`;
  
code = code.replace(target, `  if (!isAdmin) {`);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
