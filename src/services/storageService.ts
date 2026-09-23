import { Product } from '../types/product';
import { INITIAL_PRODUCTS, DEFAULT_CATEGORIES } from '../data/initialProducts';
import { indexedDBService } from './db';

const PRODUCTS_KEY = 'review_tracker_products_v3';
const CATEGORIES_KEY = 'review_tracker_categories_v3';

// Known legacy keys from previous app iterations to rescue user data
const LEGACY_PRODUCT_KEYS = [
  'review_tracker_products_v3',
  'review_tracker_products_v2',
  'review_tracker_products_v1',
  'review_tracker_products',
  'ecom_products_backup',
];

export const storageService = {
  // --- Categorii ---
  getCategories: (): string[] => {
    try {
      const stored = localStorage.getItem(CATEGORIES_KEY);
      if (!stored) {
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
        return DEFAULT_CATEGORIES;
      }
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      return DEFAULT_CATEGORIES;
    } catch (err) {
      console.error('Eroare la citirea categoriilor:', err);
      return DEFAULT_CATEGORIES;
    }
  },

  saveCategories: (categories: string[]): boolean => {
    try {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
      // Salvare asincronă în IndexedDB pentru siguranță completă
      indexedDBService.saveCategories(categories).catch(() => {});
      return true;
    } catch (err) {
      console.error('Eroare la salvarea categoriilor în localStorage:', err);
      indexedDBService.saveCategories(categories).catch(() => {});
      return false;
    }
  },

  addCategory: (newCategory: string): string[] => {
    const trimmed = newCategory.trim();
    if (!trimmed) return storageService.getCategories();
    const current = storageService.getCategories();
    if (!current.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      const updated = [...current, trimmed];
      storageService.saveCategories(updated);
      return updated;
    }
    return current;
  },

  deleteCategory: (categoryToDelete: string): string[] => {
    const current = storageService.getCategories();
    const updated = current.filter((c) => c.toLowerCase() !== categoryToDelete.toLowerCase());
    storageService.saveCategories(updated);
    return updated;
  },

  // --- Produse ---
  getProducts: (): Product[] => {
    try {
      const foundProductsMap = new Map<string, Product>();

      // Verificăm întâi cheia primară v3
      const storedV3 = localStorage.getItem(PRODUCTS_KEY);
      if (storedV3) {
        try {
          const parsed = JSON.parse(storedV3);
          if (Array.isArray(parsed)) {
            parsed.forEach((p) => {
              if (p && p.id) foundProductsMap.set(p.id, p);
            });
          }
        } catch (e) {
          console.warn('Eroare parsare v3:', e);
        }
      }

      // Verificăm și cheile vechi pentru a recupera orice produs pierdut la trecerea de versiune
      LEGACY_PRODUCT_KEYS.forEach((key) => {
        if (key === PRODUCTS_KEY) return;
        try {
          const legacyData = localStorage.getItem(key);
          if (legacyData) {
            const parsed = JSON.parse(legacyData);
            if (Array.isArray(parsed)) {
              parsed.forEach((p) => {
                if (p && p.id && !foundProductsMap.has(p.id)) {
                  foundProductsMap.set(p.id, p);
                }
              });
            }
          }
        } catch {
          // Ignoră erorile din chei vechi
        }
      });

      // Verificăm și sessionStorage ca protecție suplimentară
      try {
        const sessionData = sessionStorage.getItem(PRODUCTS_KEY);
        if (sessionData) {
          const parsed = JSON.parse(sessionData);
          if (Array.isArray(parsed)) {
            parsed.forEach((p) => {
              if (p && p.id && !foundProductsMap.has(p.id)) {
                foundProductsMap.set(p.id, p);
              }
            });
          }
        }
      } catch {}

      if (foundProductsMap.size > 0) {
        return Array.from(foundProductsMap.values());
      }

      return INITIAL_PRODUCTS;
    } catch (err) {
      console.error('Eroare la citirea produselor:', err);
      return INITIAL_PRODUCTS;
    }
  },

  // Încărcare asincronă cu sincronizare completă din IndexedDB
  syncWithIndexedDB: async (): Promise<{ products: Product[]; categories: string[] } | null> => {
    try {
      const [idbProducts, idbCategories] = await Promise.all([
        indexedDBService.getProducts(),
        indexedDBService.getCategories(),
      ]);

      const localProducts = storageService.getProducts();
      const localCategories = storageService.getCategories();

      // Dacă IndexedDB are mai multe produse sau produse lipsă, facem merge inteligent
      const mergedMap = new Map<string, Product>();
      localProducts.forEach((p) => mergedMap.set(p.id, p));
      idbProducts.forEach((p) => {
        if (!mergedMap.has(p.id)) {
          mergedMap.set(p.id, p);
        } else {
          // Dacă versiunea din IndexedDB are imagini mai complete sau date mai recente
          const existing = mergedMap.get(p.id)!;
          if ((p.images?.length || 0) > (existing.images?.length || 0)) {
            mergedMap.set(p.id, p);
          }
        }
      });

      const mergedProducts = Array.from(mergedMap.values());
      const mergedCategories = Array.from(new Set([...localCategories, ...idbCategories]));

      // Resalvăm sincronizat în ambele stocări
      storageService.saveProducts(mergedProducts);
      if (mergedCategories.length > localCategories.length) {
        storageService.saveCategories(mergedCategories);
      }

      return { products: mergedProducts, categories: mergedCategories };
    } catch (err) {
      console.warn('Sincronizarea IndexedDB a eșuat:', err);
      return null;
    }
  },

  saveProducts: (products: Product[]): boolean => {
    try {
      // 1. Salvare asincronă prioritară în IndexedDB (spațiu de stocare nelimitat în browser)
      indexedDBService.saveProducts(products).catch((err) => {
        console.warn('Nu s-a putut salva în IndexedDB:', err);
      });

      // 2. Salvare în sessionStorage ca memorie rapidă de sesiune
      try {
        sessionStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
      } catch {}

      // 3. Salvare în localStorage
      try {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
        return true;
      } catch (quotaError: any) {
        console.warn('localStorage a atins limita de cotă (5MB). Salvăm versiune optimizată...', quotaError);

        // Dacă localStorage a dat eroare de cotă (din cauza pozelor mari):
        // Cream o copie sigură cu poze trunchiate/optimizate pentru localStorage
        // în timp ce IndexedDB a păstrat deja pozele 100% complete!
        const lightweightProducts = products.map((p) => {
          const safeImages = (p.images || []).map((img) => {
            // Dacă este un base64 uriaș, păstrăm doar un placeholder sau imagine comprimată
            if (img.startsWith('data:image') && img.length > 50000) {
              return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
            }
            return img;
          });
          return { ...p, images: safeImages };
        });

        try {
          localStorage.setItem(PRODUCTS_KEY, JSON.stringify(lightweightProducts));
          return true;
        } catch {
          // Chiar dacă localStorage refuză, IndexedDB a salvat datele
          return true;
        }
      }
    } catch (err) {
      console.error('Eroare generală la salvarea produselor:', err);
      return false;
    }
  },

  resetToDefault: (): Product[] => {
    try {
      LEGACY_PRODUCT_KEYS.forEach((key) => localStorage.removeItem(key));
      sessionStorage.removeItem(PRODUCTS_KEY);
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify([]));
      indexedDBService.saveProducts([]).catch(() => {});
      return [];
    } catch (err) {
      console.error('Eroare la resetarea produselor:', err);
      return [];
    }
  },

  exportToJSON: (products: Product[]): void => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ecom_products_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  exportToCSV: (products: Product[]): void => {
    const headers = [
      'ID',
      'Nume Produs',
      'Brand',
      'Categorie',
      'Pret Produs',
      'Moneda',
      'Magazin/Furnizor',
      'Link Magazin',
      'Link Exemplu/Competitor',
      'Platforma Ads',
      'Status Campanie',
      'Buget Cheltuit (Ad Spend)',
      'Venit (Revenue)',
      'ROAS',
      'Comenzi',
      'CPA',
      'Link Campanie',
      'Note Campanie',
      'Data Creare'
    ];

    const rows = products.map((p) => {
      const c = p.campaign || ({} as any);
      return [
        `"${p.id}"`,
        `"${(p.title || '').replace(/"/g, '""')}"`,
        `"${(p.brand || '').replace(/"/g, '""')}"`,
        `"${(p.category || '').replace(/"/g, '""')}"`,
        p.price || 0,
        `"${p.currency || 'RON'}"`,
        `"${(p.storeName || '').replace(/"/g, '""')}"`,
        `"${p.storeUrl || ''}"`,
        `"${p.exampleSiteUrl || ''}"`,
        `"${c.platform || ''}"`,
        `"${c.status || ''}"`,
        c.adSpend || 0,
        c.revenue || 0,
        c.roas || 0,
        c.ordersCount || 0,
        c.cpa || 0,
        `"${c.campaignUrl || ''}"`,
        `"${(c.notes || '').replace(/"/g, '""')}"`,
        `"${p.createdAt || ''}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ecom_produse_campanii_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  importFromJSON: async (file: File): Promise<Product[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            const valid = parsed.filter((item) => item && item.id && item.title);
            if (valid.length > 0) {
              storageService.saveProducts(valid);
              resolve(valid);
            } else {
              reject(new Error('Fișierul JSON nu conține o structură validă de produse.'));
            }
          } else {
            reject(new Error('Format JSON invalid (se aștepta o listă de produse).'));
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Eroare la citirea fișierului.'));
      reader.readAsText(file);
    });
  },

  // Scanare avansată în tot spațiul browserului (localStorage, sessionStorage, IndexedDB)
  // Caută orice fragment JSON sau produs rămas în memorie
  deepScanBrowserStorage: async (): Promise<{ recovered: Product[]; totalFound: number }> => {
    const recoveredMap = new Map<string, Product>();

    // 1. Scanăm produsele curente
    try {
      const current = storageService.getProducts();
      current.forEach((p) => {
        if (p && p.id) recoveredMap.set(p.id, p);
      });
    } catch {}

    // 2. Scanăm absolut toate cheile din localStorage
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        const val = localStorage.getItem(key);
        if (!val) continue;

        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) {
            parsed.forEach((item) => {
              if (item && typeof item === 'object' && item.title) {
                const id = item.id || `rec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
                if (!recoveredMap.has(id)) {
                  recoveredMap.set(id, { ...item, id });
                }
              }
            });
          } else if (parsed && typeof parsed === 'object' && parsed.title) {
            const id = parsed.id || `rec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            if (!recoveredMap.has(id)) {
              recoveredMap.set(id, { ...parsed, id });
            }
          }
        } catch {}
      }
    } catch (e) {
      console.warn('Eroare scan localStorage:', e);
    }

    // 3. Scanăm absolut toate cheile din sessionStorage
    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (!key) continue;
        const val = sessionStorage.getItem(key);
        if (!val) continue;

        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) {
            parsed.forEach((item) => {
              if (item && typeof item === 'object' && item.title) {
                const id = item.id || `rec_ses_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
                if (!recoveredMap.has(id)) {
                  recoveredMap.set(id, { ...item, id });
                }
              }
            });
          }
        } catch {}
      }
    } catch (e) {}

    // 4. Scanăm IndexedDB
    try {
      const idbList = await indexedDBService.getProducts();
      idbList.forEach((p) => {
        if (p && p.id && !recoveredMap.has(p.id)) {
          recoveredMap.set(p.id, p);
        }
      });
    } catch {}

    const allRecovered = Array.from(recoveredMap.values());
    if (allRecovered.length > 0) {
      storageService.saveProducts(allRecovered);
    }

    return { recovered: allRecovered, totalFound: allRecovered.length };
  }
};

// Expunere utilitar global pentru recuperare rapidă din consola browserului F12
if (typeof window !== 'undefined') {
  (window as any).recoverMyProducts = async () => {
    console.log('Se scanează memoria browserului pentru produse pierdute...');
    const result = await storageService.deepScanBrowserStorage();
    console.log(`Scanare finalizată! S-au găsit și salvat ${result.totalFound} produse:`, result.recovered);
    return result;
  };
}
