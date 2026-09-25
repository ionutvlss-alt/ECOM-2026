import { signInWithPopup, signOut as fbSignOut, User as FbUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseFirestore, googleProvider } from './firebaseConfig';
import { Product } from '../types/product';
import { storageService } from './storageService';
import { normalizeProduct } from '../utils/productNormalizer';

export interface AuthUser {
  uid: string;
  username: string;
  email: string;
  displayName: string;
  photoURL?: string;
  provider: 'credentials' | 'google' | 'firebase';
}

const AUTH_USER_KEY = 'ecom_auth_current_user_v1';
// Cloud endpoint persistent ID for ionutvlss cross-device synchronization
const REST_CLOUD_OBJECT_ID = 'ff808181a09d98f701a0d1eef7810457';
const REST_CLOUD_BASE = 'https://api.restful-api.dev/objects';

export const DEFAULT_CREDENTIALS = {
  username: 'ionutvlss',
  password: 'ecom2026',
  displayName: 'Ionuț Vlăsceanu',
  email: 'ioan.vlasceanu@autonom.com',
};

type AuthListener = (user: AuthUser | null) => void;
const listeners: Set<AuthListener> = new Set();

export const authService = {
  // Obține utilizatorul curent din memorie
  getCurrentUser: (): AuthUser | null => {
    try {
      const raw = localStorage.getItem(AUTH_USER_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {}
    return null;
  },

  // Salvează utilizatorul în sesiune
  setCurrentUser: (user: AuthUser | null) => {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
    listeners.forEach((cb) => cb(user));
  },

  subscribeAuth: (callback: AuthListener) => {
    listeners.add(callback);
    callback(authService.getCurrentUser());
    return () => {
      listeners.delete(callback);
    };
  },

  // 1. Conectare cu User & Parolă (Contul prestabilit ionutvlss)
  loginWithCredentials: async (
    usernameInput: string,
    passwordInput: string
  ): Promise<{ user: AuthUser; products: Product[] }> => {
    const cleanUser = usernameInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    if (cleanUser !== DEFAULT_CREDENTIALS.username.toLowerCase() || cleanPass !== DEFAULT_CREDENTIALS.password) {
      throw new Error('Nume utilizator sau parolă incorectă. Folosește: ionutvlss / ecom2026');
    }

    const authUser: AuthUser = {
      uid: 'usr_ionutvlss',
      username: DEFAULT_CREDENTIALS.username,
      email: DEFAULT_CREDENTIALS.email,
      displayName: DEFAULT_CREDENTIALS.displayName,
      provider: 'credentials',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };

    authService.setCurrentUser(authUser);

    // Preluare produse din Cloud sau asocierea celor locale
    const products = await authService.claimAndSyncProducts(authUser);
    return { user: authUser, products };
  },

  // 2. Conectare cu Google (Firebase Authentication)
  loginWithGoogle: async (): Promise<{ user: AuthUser; products: Product[] }> => {
    const auth = getFirebaseAuth();

    if (!auth) {
      // Dacă proiectul Firebase nu este încă legat în consolă, oferim ghidare clară
      throw new Error(
        'Pentru Google Sign-In direct prin Firebase, completează setările proiectului tău Firebase din tab-ul "Configurare Firebase" sau folosește contul @ionutvlss.'
      );
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser: FbUser = result.user;

      const authUser: AuthUser = {
        uid: fbUser.uid,
        username: fbUser.displayName?.toLowerCase().replace(/\s+/g, '_') || fbUser.email?.split('@')[0] || 'google_user',
        email: fbUser.email || '',
        displayName: fbUser.displayName || 'Utilizator Google',
        photoURL: fbUser.photoURL || undefined,
        provider: 'google',
      };

      authService.setCurrentUser(authUser);
      const products = await authService.claimAndSyncProducts(authUser);
      return { user: authUser, products };
    } catch (err: any) {
      console.error('Eroare Google Auth:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        throw new Error('Fereastra de autentificare Google a fost închisă.');
      }
      throw new Error(err.message || 'Eroare la autentificarea cu Google.');
    }
  },

  // Deconectare
  logout: async () => {
    try {
      const auth = getFirebaseAuth();
      if (auth) {
        await fbSignOut(auth).catch(() => {});
      }
    } catch {}
    authService.setCurrentUser(null);
  },

  // Curățare date pentru salvare sigură în Cloud (previne depășirea limitelor de payload)
  sanitizeForCloud: (products: Product[]): Product[] => {
    return (products || []).map((p) => {
      const clean = normalizeProduct(p);
      // Păstrăm URL-urile sau limităm string-urile base64 supradimensionate
      const cleanImages = (clean.images || []).map((img) => {
        if (typeof img === 'string' && img.startsWith('data:image') && img.length > 25000) {
          // Trunchiază sau păstrează până la dimensiune acceptabilă
          return img.slice(0, 25000);
        }
        return img;
      });
      return { ...clean, images: cleanImages };
    });
  },

  // Asociază produsele existente cu contul și le sincronizează în Cloud
  claimAndSyncProducts: async (user: AuthUser): Promise<Product[]> => {
    const localProducts = storageService.getProducts() || [];

    // 1. Încercăm să citim produsele salvate anterior în Cloud
    let cloudProducts: Product[] | null = null;
    try {
      cloudProducts = await authService.fetchProductsFromCloud(user);
    } catch (err) {
      console.warn('Nu s-a putut citi din Cloud:', err);
    }

    // 2. Logica de unire inteligentă (Merge Bidirecțional):
    // Unim toate produsele locale de pe telefon/PC cu cele din Cloud
    const mergedMap = new Map<string, Product>();

    // Întâi adăugăm produsele din Cloud
    if (cloudProducts && Array.isArray(cloudProducts)) {
      cloudProducts.forEach((p) => {
        if (p && p.id) mergedMap.set(p.id, normalizeProduct(p));
      });
    }

    // Apoi adăugăm produsele locale (dacă existau deja pe acest dispozitiv)
    localProducts.forEach((p) => {
      if (p && p.id) {
        if (!mergedMap.has(p.id)) {
          mergedMap.set(p.id, normalizeProduct(p));
        } else {
          // Dacă există pe ambele, păstrăm cel mai recent modificat sau cel local dacă are detalii
          const existing = mergedMap.get(p.id)!;
          const merged = { ...existing, ...p, campaign: { ...existing.campaign, ...(p.campaign || {}) } };
          mergedMap.set(p.id, normalizeProduct(merged));
        }
      }
    });

    const finalProducts = Array.from(mergedMap.values()).map(normalizeProduct);

    // Salvăm lista unită în localStorage pe dispozitivul curent
    if (finalProducts.length > 0) {
      storageService.saveProducts(finalProducts);
      // Sincronizăm lista completă în Cloud pentru ca și celelalte dispozitive (telefon, pc) să o aibă
      await authService.syncProductsToCloud(user, finalProducts).catch(() => {});
      return finalProducts;
    }

    return localProducts.map(normalizeProduct);
  },

  // Verificare periodică și descărcare noutăți din Cloud
  pollAndSyncFromCloud: async (user: AuthUser, currentProducts: Product[]): Promise<Product[] | null> => {
    try {
      const cloudProducts = await authService.fetchProductsFromCloud(user);
      if (!cloudProducts || !Array.isArray(cloudProducts)) return null;

      // Verificăm dacă sunt produse noi în Cloud care lipsesc local
      const localIds = new Set((currentProducts || []).map((p) => p?.id));
      const hasNew = cloudProducts.some((p) => p?.id && !localIds.has(p.id));

      if (hasNew || cloudProducts.length > currentProducts.length) {
        const mergedMap = new Map<string, Product>();
        cloudProducts.forEach((p) => {
          if (p && p.id) mergedMap.set(p.id, normalizeProduct(p));
        });
        currentProducts.forEach((p) => {
          if (p && p.id && !mergedMap.has(p.id)) {
            mergedMap.set(p.id, normalizeProduct(p));
          }
        });
        const updated = Array.from(mergedMap.values()).map(normalizeProduct);
        storageService.saveProducts(updated);
        return updated;
      }
    } catch {}
    return null;
  },

  // Salvare produse în Cloud pentru contul curent
  syncProductsToCloud: async (user: AuthUser, products: Product[]): Promise<boolean> => {
    let success = false;
    const safeProducts = authService.sanitizeForCloud(products);

    // 1. Salvare în Firebase Firestore dacă este activ
    try {
      const firestore = getFirebaseFirestore();
      if (firestore) {
        const userDocRef = doc(firestore, 'users', user.uid);
        await setDoc(
          userDocRef,
          {
            products: safeProducts,
            updatedAt: new Date().toISOString(),
            email: user.email,
            displayName: user.displayName,
          },
          { merge: true }
        );
        success = true;
      }
    } catch (err) {
      console.warn('Salvare Firestore eșuată:', err);
    }

    // 2. Salvare în Cloud REST Store (garantează sincronizarea instantanee între telefon și PC)
    try {
      const res = await fetch(`${REST_CLOUD_BASE}/${REST_CLOUD_OBJECT_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${user.username}_ecom`,
          data: {
            products: safeProducts,
            userId: user.uid,
            username: user.username,
            updatedAt: new Date().toISOString(),
          },
        }),
      });
      if (res.ok) {
        success = true;
      }
    } catch (err) {
      console.warn('Salvare REST Cloud eșuată:', err);
    }

    return success;
  },

  // Citire produse din Cloud pentru contul curent
  fetchProductsFromCloud: async (user: AuthUser): Promise<Product[] | null> => {
    // 1. Încercare din Firestore
    try {
      const firestore = getFirebaseFirestore();
      if (firestore) {
        const userDocRef = doc(firestore, 'users', user.uid);
        const snapshot = await getDoc(userDocRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data && Array.isArray(data.products)) {
            return data.products.map(normalizeProduct);
          }
        }
      }
    } catch (err) {
      console.warn('Citire Firestore eșuată:', err);
    }

    // 2. Încercare din Cloud REST Store
    try {
      const res = await fetch(`${REST_CLOUD_BASE}/${REST_CLOUD_OBJECT_ID}`);
      if (res.ok) {
        const json = await res.json();
        if (json?.data?.products && Array.isArray(json.data.products)) {
          return json.data.products.map(normalizeProduct);
        }
      }
    } catch (err) {
      console.warn('Citire REST Cloud eșuată:', err);
    }

    return null;
  },
};
