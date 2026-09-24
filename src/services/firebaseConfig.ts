import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

export interface FirebaseCustomConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

const FIREBASE_CONFIG_KEY = 'ecom_firebase_custom_config';

// Configurație implicită sau salvată în browser
export const getStoredFirebaseConfig = (): FirebaseCustomConfig => {
  try {
    const raw = localStorage.getItem(FIREBASE_CONFIG_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}

  // Fallback la variabile de mediu dacă există
  return {
    apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || '',
    authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || '',
  };
};

export const saveStoredFirebaseConfig = (cfg: FirebaseCustomConfig) => {
  try {
    localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(cfg));
  } catch (e) {
    console.error('Nu s-a putut salva configurarea Firebase:', e);
  }
};

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;
let cachedFirestore: Firestore | null = null;

export const initFirebase = (): {
  app: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
  isConfigured: boolean;
} => {
  const config = getStoredFirebaseConfig();
  if (!config.apiKey || !config.projectId) {
    return { app: null, auth: null, firestore: null, isConfigured: false };
  }

  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(config);
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    cachedApp = app;
    cachedAuth = auth;
    cachedFirestore = firestore;
    return { app, auth, firestore, isConfigured: true };
  } catch (err) {
    console.warn('Eroare inițializare Firebase SDK:', err);
    return { app: null, auth: null, firestore: null, isConfigured: false };
  }
};

export const getFirebaseAuth = (): Auth | null => {
  if (cachedAuth) return cachedAuth;
  return initFirebase().auth;
};

export const getFirebaseFirestore = (): Firestore | null => {
  if (cachedFirestore) return cachedFirestore;
  return initFirebase().firestore;
};

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});
