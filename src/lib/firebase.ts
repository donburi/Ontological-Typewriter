import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0019843499",
  appId: "1:1001141539834:web:e7999a1a69c9a71c080a43",
  apiKey: "AIzaSyDCqKOfLZ92TU0Pqw28qAeOP48fGxbTpsE",
  authDomain: "gen-lang-client-0019843499.firebaseapp.com",
  storageBucket: "gen-lang-client-0019843499.firebasestorage.app",
  messagingSenderId: "1001141539834",
  measurementId: "G-G6P6561SRZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-ontologicaltypew-7e81ec13-8129-4729-8503-8c446134755c");
export const googleProvider = new GoogleAuthProvider();
