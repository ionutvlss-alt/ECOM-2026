import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, Firestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';

export interface FirebaseCustomConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export const firebaseConfig: FirebaseCustomConfig = {
  apiKey: "AIzaSyB14B2-Flsi9XxJx8bL6v1g2PLhu0uoCVA",
  authDomain: "review-tracker-b3291.firebaseapp.com",
  projectId: "review-tracker-b3291",
  storageBucket: "review-tracker-b3291.firebasestorage.app",
  messagingSenderId: "308280428536",
  appId: "1:308280428536:web:f55971c1bb78f6fbfcf80d",
  measurementId: "G-EG6H4HHLCF"
};

const STORAGE_KEY = 'ecom_custom_firebase_config_v1';

export function getStoredFirebaseConfig(): FirebaseCustomConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch {}
  return firebaseConfig;
}

export function saveStoredFirebaseConfig(config: FirebaseCustomConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {}
}

const activeConfig = typeof window !== 'undefined' ? getStoredFirebaseConfig() : firebaseConfig;

// Singleton initialization
export const app = getApps().length > 0 ? getApp() : initializeApp(activeConfig);
export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export function getFirebaseAuth(): Auth | null {
  try {
    return auth;
  } catch {
    return null;
  }
}

export function getFirebaseFirestore(): Firestore | null {
  try {
    return db;
  } catch {
    return null;
  }
}

export function initFirebase(cfg?: FirebaseCustomConfig) {
  if (cfg) {
    saveStoredFirebaseConfig(cfg);
  }
  return { app, db, auth, isConfigured: Boolean(app && db && activeConfig?.apiKey) };
}

// Activare persistență offline nativă Firebase
try {
  if (typeof window !== 'undefined') {
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        // Tab multiplu deschis
        console.warn('Firebase persistence warning: multiple tabs open');
      } else if (err.code === 'unimplemented') {
        console.warn('Firebase persistence not supported by browser');
      }
    });
  }
} catch (e) {
  // Ignoră erorile de persistență în mediu server
}
