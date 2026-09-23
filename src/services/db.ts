import { Product } from '../types/product';

const DB_NAME = 'EcomJournalDatabase';
const DB_VERSION = 1;
const STORE_PRODUCTS = 'products';
const STORE_CATEGORIES = 'categories';

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB nu este suportat în acest mediu.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_PRODUCTS)) {
        db.createObjectStore(STORE_PRODUCTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_CATEGORIES)) {
        db.createObjectStore(STORE_CATEGORIES, { keyPath: 'name' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const indexedDBService = {
  getProducts: async (): Promise<Product[]> => {
    try {
      const db = await getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_PRODUCTS, 'readonly');
        const store = tx.objectStore(STORE_PRODUCTS);
        const req = store.getAll();

        req.onsuccess = () => {
          const res = req.result;
          resolve(Array.isArray(res) ? res : []);
        };
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('Eroare accesare IndexedDB pentru produse:', err);
      return [];
    }
  },

  saveProducts: async (products: Product[]): Promise<boolean> => {
    try {
      const db = await getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_PRODUCTS, 'readwrite');
        const store = tx.objectStore(STORE_PRODUCTS);

        // Curăță magazia și adaugă toate produsele
        store.clear();
        products.forEach((p) => {
          store.put(p);
        });

        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.error('Eroare salvare IndexedDB produse:', err);
      return false;
    }
  },

  getCategories: async (): Promise<string[]> => {
    try {
      const db = await getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_CATEGORIES, 'readonly');
        const store = tx.objectStore(STORE_CATEGORIES);
        const req = store.getAll();

        req.onsuccess = () => {
          const res = req.result as { name: string }[];
          if (Array.isArray(res)) {
            resolve(res.map((r) => r.name));
          } else {
            resolve([]);
          }
        };
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('Eroare accesare IndexedDB categorii:', err);
      return [];
    }
  },

  saveCategories: async (categories: string[]): Promise<boolean> => {
    try {
      const db = await getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_CATEGORIES, 'readwrite');
        const store = tx.objectStore(STORE_CATEGORIES);

        store.clear();
        categories.forEach((name) => {
          store.put({ name });
        });

        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.error('Eroare salvare IndexedDB categorii:', err);
      return false;
    }
  },
};
