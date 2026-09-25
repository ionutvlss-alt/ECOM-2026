import { Product } from '../types/product';
import { Supplier } from '../types/supplier';
import { normalizeProduct } from '../utils/productNormalizer';
import { storageService } from './storageService';

const PIN_STORAGE_KEY = 'ecom_pin_authenticated_v1';
const PIN_TOKEN_KEY = 'ecom_pin_token_v1';
export const REQUIRED_ACCESS_PIN = '6122';

export interface ServerSyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  serverVersion: number;
  lastError: string | null;
}

type SyncStateListener = (state: ServerSyncState) => void;
const listeners = new Set<SyncStateListener>();

let syncState: ServerSyncState = {
  isOnline: true,
  isSyncing: false,
  lastSyncedAt: null,
  serverVersion: 0,
  lastError: null,
};

function updateSyncState(patch: Partial<ServerSyncState>) {
  syncState = { ...syncState, ...patch };
  listeners.forEach((fn) => fn(syncState));
}

export const serverSyncService = {
  // --- Autentificare PIN 6122 ---
  isPinAuthenticated: (): boolean => {
    try {
      const auth = localStorage.getItem(PIN_STORAGE_KEY);
      return auth === 'true';
    } catch {
      return false;
    }
  },

  verifyPin: async (inputPin: string): Promise<{ success: boolean; message: string }> => {
    const clean = (inputPin || '').trim();

    // Verificare locală de siguranță
    if (clean !== REQUIRED_ACCESS_PIN) {
      return { success: false, message: 'Cod de acces incorect. Introdu codul 6122.' };
    }

    try {
      const res = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: clean }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(PIN_STORAGE_KEY, 'true');
        if (data.token) {
          localStorage.setItem(PIN_TOKEN_KEY, data.token);
        }
        return { success: true, message: data.message || 'Acces permis.' };
      }
    } catch (e) {
      console.warn('Server offline sau inaccesibil la verificare PIN, utilizăm validare locală:', e);
    }

    // Fallback garantat offline/local pentru PIN 6122
    localStorage.setItem(PIN_STORAGE_KEY, 'true');
    return { success: true, message: 'Acces permis (Offline/Local).' };
  },

  lockAccess: () => {
    localStorage.removeItem(PIN_STORAGE_KEY);
    localStorage.removeItem(PIN_TOKEN_KEY);
  },

  subscribeSyncState: (callback: SyncStateListener) => {
    listeners.add(callback);
    callback(syncState);
    return () => {
      listeners.delete(callback);
    };
  },

  getSyncState: (): ServerSyncState => syncState,

  // --- Citire din Server / Cloud ---
  fetchServerData: async (): Promise<{
    products: Product[];
    suppliers: Supplier[];
    categories: string[];
    version: number;
    lastUpdated: string;
  } | null> => {
    try {
      updateSyncState({ isSyncing: true });
      const res = await fetch('/api/data', {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error(`Server status HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json && json.success) {
        const rawProducts: any[] = Array.isArray(json.products) ? json.products : [];
        const normalized = rawProducts.map(normalizeProduct);
        const suppliers = Array.isArray(json.suppliers) ? json.suppliers : [];
        const categories = Array.isArray(json.categories) ? json.categories : [];

        updateSyncState({
          isOnline: true,
          isSyncing: false,
          lastSyncedAt: new Date(),
          serverVersion: json.version || 0,
          lastError: null,
        });

        return {
          products: normalized,
          suppliers,
          categories,
          version: json.version || 0,
          lastUpdated: json.lastUpdated,
        };
      }
    } catch (err: any) {
      console.warn('Nu s-a putut citi din serverul API:', err);
      updateSyncState({
        isOnline: false,
        isSyncing: false,
        lastError: err?.message || 'Eroare conexiune server',
      });
    }
    return null;
  },

  // --- Sincronizare completă (salvează datele pe server pentru ca PC și Telefon să aibă identic) ---
  syncWithServer: async (
    localProducts: Product[],
    localSuppliers: Supplier[],
    localCategories: string[]
  ): Promise<{
    products: Product[];
    suppliers: Supplier[];
    categories: string[];
  }> => {
    try {
      updateSyncState({ isSyncing: true });

      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          products: localProducts,
          suppliers: localSuppliers,
          categories: localCategories,
          clientTimestamp: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const serverProds = (data.products || []).map(normalizeProduct);
        const serverSuppliers = data.suppliers || [];
        const serverCategories = data.categories || [];

        // Salvăm și în local storage ca o copie de siguranță offline
        storageService.saveProducts(serverProds);
        storageService.saveSuppliers(serverSuppliers);
        storageService.saveCategories(serverCategories);

        updateSyncState({
          isOnline: true,
          isSyncing: false,
          lastSyncedAt: new Date(),
          serverVersion: data.version || 0,
          lastError: null,
        });

        return {
          products: serverProds,
          suppliers: serverSuppliers,
          categories: serverCategories,
        };
      }
    } catch (err: any) {
      console.warn('Eroare sincronizare cu serverul:', err);
      updateSyncState({
        isOnline: false,
        isSyncing: false,
        lastError: err?.message || 'Eroare rețea',
      });
    }

    // În caz de cădere rețea, salvăm local
    storageService.saveProducts(localProducts);
    storageService.saveSuppliers(localSuppliers);
    storageService.saveCategories(localCategories);

    return {
      products: localProducts,
      suppliers: localSuppliers,
      categories: localCategories,
    };
  },

  // --- Salvare produs individual pe server ---
  saveProduct: async (product: Product): Promise<boolean> => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // --- Ștergere produs pe server ---
  deleteProduct: async (productId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(productId)}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // --- Salvare furnizor pe server ---
  saveSupplier: async (supplier: Supplier): Promise<boolean> => {
    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplier),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // --- Ștergere furnizor pe server ---
  deleteSupplier: async (supplierId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/suppliers/${encodeURIComponent(supplierId)}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};
