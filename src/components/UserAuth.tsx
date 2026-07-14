import React from 'react';
import { useAuthState, useSignInWithGoogle } from 'react-firebase-hooks/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { LogIn, LogOut, User } from 'lucide-react';
import { THEME_UI, Theme } from '../types';

interface UserAuthProps {
  theme: Theme;
}

export function UserAuth({ theme }: UserAuthProps) {
  const [user, loading, error] = useAuthState(auth);
  const [signInWithGoogle, , , authError] = useSignInWithGoogle(auth);
  const ui = THEME_UI[theme];

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


  const handleSignIn = () => {
    signInWithGoogle();
  };

  const handleSignOut = () => {
    auth.signOut();
  };

  if (loading) {
    return (
      <div className={`px-4 py-2 text-sm font-medium ${ui.textMuted}`}>
        Loading...
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-2 text-sm ${ui.textMuted}`}>
          {user.photoURL ? (
            <img src={user.photoURL} alt="User avatar" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
          ) : (
            <User className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">{user.email}</span>
        </div>
        <button 
          onClick={handleSignOut} 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border ${ui.panelBorder} ${ui.hoverBg} text-sm font-medium transition-colors`}
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={handleSignIn} 
      className={`flex items-center gap-2 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm border ${ui.panelBorder}`}
    >
      <LogIn className="w-4 h-4" />
      Sign in with Google
    </button>
  );
}
