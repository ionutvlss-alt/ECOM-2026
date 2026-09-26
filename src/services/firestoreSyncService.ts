import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  writeBatch,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Product } from '../types/product';
import { Supplier } from '../types/supplier';
import { normalizeProduct, cleanForFirestore } from '../utils/productNormalizer';
import { storageService } from './storageService';

export interface FirestoreSyncStatus {
  isConnecting: boolean;
  isConnected: boolean;
  lastSyncedAt: Date | null;
  error: string | null;
}

type StatusCallback = (status: FirestoreSyncStatus) => void;
const statusListeners = new Set<StatusCallback>();

let syncStatus: FirestoreSyncStatus = {
  isConnecting: true,
  isConnected: false,
  lastSyncedAt: null,
  error: null,
};

function updateStatus(patch: Partial<FirestoreSyncStatus>) {
  syncStatus = { ...syncStatus, ...patch };
  statusListeners.forEach((cb) => cb(syncStatus));
}

export const firestoreSyncService = {
  subscribeStatus: (callback: StatusCallback) => {
    statusListeners.add(callback);
    callback(syncStatus);
    return () => statusListeners.delete(callback);
  },

  getStatus: () => syncStatus,

  // 1. Ascultare în timp real a colecției de produse (Telefon <-> PC <-> Laptop)
  subscribeProducts: (onData: (products: Product[]) => void): Unsubscribe => {
    updateStatus({ isConnecting: true });
    const colRef = collection(db, 'products');

    return onSnapshot(
      colRef,
      (snapshot) => {
        const prods: Product[] = [];
        snapshot.forEach((docSnap) => {
          const raw = docSnap.data();
          if (raw) {
            prods.push(normalizeProduct({ ...raw, id: docSnap.id }));
          }
        });

        // Ordonare descrescătoare după dată
        prods.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

        updateStatus({
          isConnecting: false,
          isConnected: true,
          lastSyncedAt: new Date(),
          error: null,
        });

        // Actualizăm și backup-ul local
        storageService.saveProducts(prods);
        onData(prods);
      },
      (error) => {
        console.error('Eroare listener Firestore produse:', error);
        updateStatus({
          isConnecting: false,
          isConnected: false,
          error: error.message || 'Eroare conexiune Firestore',
        });
      }
    );
  },

  // 2. Ascultare în timp real a furnizorilor
  subscribeSuppliers: (onData: (suppliers: Supplier[]) => void): Unsubscribe => {
    const colRef = collection(db, 'suppliers');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: Supplier[] = [];
        snapshot.forEach((docSnap) => {
          const raw = docSnap.data();
          if (raw) {
            list.push({ ...raw, id: docSnap.id } as Supplier);
          }
        });
        storageService.saveSuppliers(list);
        onData(list);
      },
      (err) => console.warn('Eroare listener furnizori Firestore:', err)
    );
  },

  // 3. Ascultare categorii
  subscribeCategories: (onData: (categories: string[]) => void): Unsubscribe => {
    const docRef = doc(db, 'settings', 'categories');
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && Array.isArray(data.categories)) {
            storageService.saveCategories(data.categories);
            onData(data.categories);
          }
        }
      },
      (err) => console.warn('Eroare listener categorii Firestore:', err)
    );
  },

  // 4. Salvare produs individual (Create / Edit)
  saveProduct: async (product: Product): Promise<boolean> => {
    try {
      const normalized = normalizeProduct(product);
      const cleaned = cleanForFirestore(normalized);
      const docRef = doc(db, 'products', normalized.id);
      await setDoc(docRef, cleaned, { merge: true });
      return true;
    } catch (err: any) {
      console.error('Eroare salvare produs în Firestore:', err);
      updateStatus({ error: err.message });
      return false;
    }
  },

  // 5. Ștergere produs
  deleteProduct: async (productId: string): Promise<boolean> => {
    try {
      const docRef = doc(db, 'products', productId);
      await deleteDoc(docRef);
      return true;
    } catch (err: any) {
      console.error('Eroare ștergere produs Firestore:', err);
      return false;
    }
  },

  // 6. Salvare furnizor
  saveSupplier: async (supplier: Supplier): Promise<boolean> => {
    try {
      const docRef = doc(db, 'suppliers', supplier.id);
      await setDoc(docRef, supplier, { merge: true });
      return true;
    } catch (err: any) {
      console.error('Eroare salvare furnizor Firestore:', err);
      return false;
    }
  },

  // 7. Ștergere furnizor
  deleteSupplier: async (supplierId: string): Promise<boolean> => {
    try {
      const docRef = doc(db, 'suppliers', supplierId);
      await deleteDoc(docRef);
      return true;
    } catch (err: any) {
      console.error('Eroare ștergere furnizor Firestore:', err);
      return false;
    }
  },

  // 8. Salvare categorii
  saveCategories: async (categories: string[]): Promise<boolean> => {
    try {
      const docRef = doc(db, 'settings', 'categories');
      await setDoc(docRef, { categories, updatedAt: new Date().toISOString() }, { merge: true });
      return true;
    } catch (err: any) {
      console.error('Eroare salvare categorii Firestore:', err);
      return false;
    }
  },

  // 9. Asigurare inițializare categorii dacă este nou Firestore
  seedInitialCategoriesIfEmpty: async (defaultCategories: string[]) => {
    try {
      const catDoc = doc(db, 'settings', 'categories');
      await setDoc(catDoc, { categories: defaultCategories, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (err) {
      console.warn('Verificare seed categorii Firestore:', err);
    }
  },

  // 10. Ștergere toate produsele din Firestore pentru a reseta baza la exact 0 produse sincronizate
  clearAllProductsFromFirestore: async (): Promise<boolean> => {
    try {
      const snap = await getDocs(collection(db, 'products'));
      if (snap.empty) return true;
      const batch = writeBatch(db);
      snap.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
      console.log('Baza Firestore a fost resetată la 0 produse.');
      return true;
    } catch (err: any) {
      console.error('Eroare la ștergerea tuturor produselor din Firestore:', err);
      return false;
    }
  }
};
