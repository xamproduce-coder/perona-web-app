import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db, COLLECTIONS } from '../lib/firebase';
import { Disc3 } from 'lucide-react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let profileUnsub = null;
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const docRef  = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
        
        profileUnsub = onSnapshot(docRef, (docSnap) => {
          setProfile(docSnap.exists() ? docSnap.data() : null);
          setLoading(false); // Ensure loading stops after profile is fetched
        }, () => {
          setProfile(null);
          setLoading(false);
        });
      } else {
        setUser(null);
        setProfile(null);
        if (profileUnsub) profileUnsub();
        setLoading(false);
      }
    });
    
    return () => {
      unsubscribe();
      if (profileUnsub) profileUnsub();
    };
  }, []);

  const signOut = () => firebaseSignOut(auth);

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    signOut,
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0A] text-white">
        <div className="relative">
          <Disc3 size={48} className="text-[#EF4444] animate-[spin_3s_linear_infinite]" />
          <div className="absolute inset-0 bg-[#EF4444]/20 blur-xl rounded-full" />
        </div>
        <p className="mt-8 text-[10px] font-black uppercase tracking-[0.5em] text-white/20 animate-pulse">Initializing Protocol...</p>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
