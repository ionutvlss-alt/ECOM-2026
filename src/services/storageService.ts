import { Product } from '../types/product';
import { INITIAL_PRODUCTS, DEFAULT_CATEGORIES } from '../data/initialProducts';

const PRODUCTS_KEY = 'review_tracker_products_v3';
const CATEGORIES_KEY = 'review_tracker_categories_v3';

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
      return true;
    } catch (err) {
      console.error('Eroare la salvarea categoriilor:', err);
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
      // Curăță datele din versiuni vechi dacă există
      if (localStorage.getItem('review_tracker_products_v1')) {
        localStorage.removeItem('review_tracker_products_v1');
      }

      const stored = localStorage.getItem(PRODUCTS_KEY);
      if (!stored) {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
        return INITIAL_PRODUCTS;
      }
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return INITIAL_PRODUCTS;
    } catch (err) {
      console.error('Eroare la citirea produselor din localStorage:', err);
      return INITIAL_PRODUCTS;
    }
  },

  saveProducts: (products: Product[]): boolean => {
    try {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
      return true;
    } catch (err) {
      console.error('Eroare la salvarea produselor:', err);
      return false;
    }
  },

  resetToDefault: (): Product[] => {
    try {
      localStorage.removeItem('review_tracker_products_v1');
      localStorage.removeItem('review_tracker_products_v2');
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify([]));
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
  }
};
