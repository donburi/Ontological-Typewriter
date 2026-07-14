const fs = require('fs');
let code = fs.readFileSync('src/components/UserAuth.tsx', 'utf8');

const importDB = `import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';`;
code = code.replace(/import { auth } from '\.\.\/lib\/firebase';/, importDB);

const useEffectCode = `
  React.useEffect(() => {
    const saveUser = async () => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        try {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            await updateDoc(userRef, {
              lastLoginAt: Date.now()
            });
          } else {
            await setDoc(userRef, {
              email: user.email,
              createdAt: Date.now(),
              lastLoginAt: Date.now()
            });
          }
        } catch (err) {
          console.error("Error saving user profile", err);
        }
      }
    };
    saveUser();
  }, [user]);
`;

code = code.replace(/const ui = THEME_UI\[theme\];/, 'const ui = THEME_UI[theme];\n' + useEffectCode);

fs.writeFileSync('src/components/UserAuth.tsx', code);
