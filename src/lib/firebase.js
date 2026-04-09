// src/lib/firebase.js
// ─────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH for Firebase initialization.
// All Firebase imports across the app must come from THIS file.
// ─────────────────────────────────────────────────────────────

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

// ─── Exported Services ───────────────────────────────────────
export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// ─── Firestore Collection Name Constants ─────────────────────
// Never use raw strings. Always reference these constants.
export const COLLECTIONS = {
  USERS:     'users',
  ORDERS:    'orders',
  REVISIONS: 'revisions',
  ASSETS:    'assets',
  FOLDERS:   'vault_folders',   // ← B1 fix: was missing, caused deleteVaultFolder() to crash
};

// ─── ADMIN PERMISSIONS ─────────────────────────────────────────
// Users with these emails are granted the 'admin' role automatically on signup.
export const ADMIN_EMAILS = ['manu@maxmstudio.com'];
