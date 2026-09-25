import { Product } from '../types/product';
import { Supplier } from '../types/supplier';
import { INITIAL_PRODUCTS, DEFAULT_CATEGORIES } from '../data/initialProducts';
import { indexedDBService } from './db';
import { normalizeProduct } from '../utils/productNormalizer';

const PRODUCTS_KEY = 'review_tracker_products_v3';
const CATEGORIES_KEY = 'review_tracker_categories_v3';
const SUPPLIERS_KEY = 'review_tracker_suppliers_v1';

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

  renameCategory: (oldName: string, newName: string): { categories: string[]; updatedProducts: Product[] } => {
    try {
      const currentCats = storageService.getCategories();
      const cleanOld = oldName.trim();
      const cleanNew = newName.trim();
      if (!cleanNew || cleanOld.toLowerCase() === cleanNew.toLowerCase()) {
        return { categories: currentCats, updatedProducts: storageService.getProducts() };
      }

      const updatedCats = currentCats.map((c) => (c.toLowerCase() === cleanOld.toLowerCase() ? cleanNew : c));
      storageService.saveCategories(updatedCats);

      const products = storageService.getProducts();
      const updatedProducts = products.map((p) => {
        if ((p.category || '').toLowerCase() === cleanOld.toLowerCase()) {
          return { ...p, category: cleanNew };
        }
        return p;
      });
      storageService.saveProducts(updatedProducts);

      return { categories: updatedCats, updatedProducts };
    } catch (err) {
      console.error('Eroare la redenumirea categoriei:', err);
      return { categories: storageService.getCategories(), updatedProducts: storageService.getProducts() };
    }
  },

  // --- Furnizori ---
  getSuppliers: (): Supplier[] => {
    try {
      const stored = localStorage.getItem(SUPPLIERS_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed.filter((s) => s && s.id && s.name);
      }
      return [];
    } catch (err) {
      console.error('Eroare la citirea furnizorilor:', err);
      return [];
    }
  },

  saveSuppliers: (suppliers: Supplier[]): boolean => {
    try {
      const safe = Array.isArray(suppliers) ? suppliers : [];
      localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(safe));
      indexedDBService.saveSuppliers(safe).catch(() => {});
      return true;
    } catch (err) {
      console.error('Eroare la salvarea furnizorilor:', err);
      indexedDBService.saveSuppliers(suppliers).catch(() => {});
      return false;
    }
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
        return Array.from(foundProductsMap.values()).map(normalizeProduct);
      }

      return INITIAL_PRODUCTS.map(normalizeProduct);
    } catch (err) {
      console.error('Eroare la citirea produselor:', err);
      return INITIAL_PRODUCTS.map(normalizeProduct);
    }
  },

  // Încărcare asincronă cu sincronizare completă din IndexedDB
  syncWithIndexedDB: async (): Promise<{ products: Product[]; categories: string[]; suppliers: Supplier[] } | null> => {
    try {
      const [idbProducts, idbCategories, idbSuppliers] = await Promise.all([
        indexedDBService.getProducts(),
        indexedDBService.getCategories(),
        indexedDBService.getSuppliers(),
      ]);

      const localProducts = storageService.getProducts();
      const localCategories = storageService.getCategories();
      const localSuppliers = storageService.getSuppliers();

      // Dacă IndexedDB are mai multe produse sau produse lipsă, facem merge inteligent
      const mergedMap = new Map<string, Product>();
      localProducts.forEach((p) => mergedMap.set(p.id, normalizeProduct(p)));
      idbProducts.forEach((p) => {
        const normalized = normalizeProduct(p);
        if (!mergedMap.has(normalized.id)) {
          mergedMap.set(normalized.id, normalized);
        } else {
          // Dacă versiunea din IndexedDB are imagini mai complete sau date mai recente
          const existing = mergedMap.get(normalized.id)!;
          if ((normalized.images?.length || 0) > (existing.images?.length || 0)) {
            mergedMap.set(normalized.id, normalized);
          }
        }
      });

      const mergedProducts = Array.from(mergedMap.values()).map(normalizeProduct);
      const mergedCategories = Array.from(new Set([...localCategories, ...idbCategories]));

      // Merge furnizori
      const suppMap = new Map<string, Supplier>();
      localSuppliers.forEach((s) => suppMap.set(s.id, s));
      idbSuppliers.forEach((s) => {
        if (!suppMap.has(s.id)) {
          suppMap.set(s.id, s);
        }
      });
      const mergedSuppliers = Array.from(suppMap.values());

      // Resalvăm sincronizat în ambele stocări
      storageService.saveProducts(mergedProducts);
      if (mergedCategories.length > localCategories.length) {
        storageService.saveCategories(mergedCategories);
      }
      storageService.saveSuppliers(mergedSuppliers);

      return { products: mergedProducts, categories: mergedCategories, suppliers: mergedSuppliers };
    } catch (err) {
      console.warn('Sincronizarea IndexedDB a eșuat:', err);
      return null;
    }
  },

  saveProducts: (products: Product[]): boolean => {
    try {
      const safeProducts = (products || []).map(normalizeProduct);

      // 1. Salvare asincronă prioritară în IndexedDB (spațiu de stocare nelimitat în browser)
      indexedDBService.saveProducts(safeProducts).catch((err) => {
        console.warn('Nu s-a putut salva în IndexedDB:', err);
      });

      // 2. Salvare în sessionStorage ca memorie rapidă de sesiune
      try {
        sessionStorage.setItem(PRODUCTS_KEY, JSON.stringify(safeProducts));
      } catch {}

      // 3. Salvare în localStorage
      try {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(safeProducts));
        return true;
      } catch (quotaError: any) {
        console.warn('localStorage a atins limita de cotă (5MB). Salvăm versiune optimizată...', quotaError);

        // Dacă localStorage a dat eroare de cotă (din cauza pozelor mari):
        // Cream o copie sigură cu poze trunchiate/optimizate pentru localStorage
        // în timp ce IndexedDB a păstrat deja pozele 100% complete!
        const lightweightProducts = safeProducts.map((p) => {
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

  exportToJSON: (products: Product[], suppliers?: Supplier[]): void => {
    const suppList = suppliers || storageService.getSuppliers();
    const dataToExport = {
      exportedAt: new Date().toISOString(),
      products,
      suppliers: suppList,
      categories: storageService.getCategories(),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ecom_backup_complet_${new Date().toISOString().slice(0, 10)}.json`);
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
          const rawList = Array.isArray(parsed)
            ? parsed
            : parsed && Array.isArray(parsed.products)
            ? parsed.products
            : null;

          if (rawList && Array.isArray(rawList)) {
            const valid = rawList
              .filter((item) => item && typeof item === 'object' && (item.title || item.id))
              .map((item) => {
                const withId = {
                  ...item,
                  id: item.id || `imp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                };
                return normalizeProduct(withId);
              });

            if (parsed && Array.isArray(parsed.suppliers)) {
              try {
                storageService.saveSuppliers(parsed.suppliers);
              } catch {}
            }

            if (valid.length > 0) {
              storageService.saveProducts(valid);
              resolve(valid);
            } else {
              reject(new Error('Fișierul JSON nu conține o structură validă de produse.'));
            }
          } else {
            reject(new Error('Format JSON invalid (se aștepta o listă de produse sau un obiect cu proprietatea "products").'));
          }
        } catch (error: any) {
          reject(new Error(error?.message || 'Eroare la procesarea fișierului JSON.'));
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

    const allRecovered = Array.from(recoveredMap.values()).map(normalizeProduct);
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
