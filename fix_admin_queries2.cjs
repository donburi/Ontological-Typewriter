const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

code = code.replace(/const \[users, loadingUsers, errorUsers\] = useCollectionData\([\s\S]*?const feedback = feedbackSnapshot\?\.docs/m, `const isAdmin = auth.currentUser?.email === 'procyin@gmail.com';
  const [users, loadingUsers, errorUsers] = useCollectionData(
    isAdmin ? query(collection(db, 'users'), orderBy('createdAt', 'desc')) : null
  );
  
  const [feedbackSnapshot, loadingFeedback, errorFeedback] = useCollection(
    isAdmin ? query(collection(db, 'feedback'), orderBy('createdAt', 'desc')) : null
  );
  
  const feedback = feedbackSnapshot?.docs`);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
