import { Product } from '../types/product';
import { INITIAL_PRODUCTS } from '../data/initialProducts';

const STORAGE_KEY = 'review_tracker_products_v2';

export const storageService = {
  getProducts: (): Product[] => {
    try {
      // Curăță datele din versiunea v1 demonstrativă dacă există
      if (localStorage.getItem('review_tracker_products_v1')) {
        localStorage.removeItem('review_tracker_products_v1');
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
      return true;
    } catch (err) {
      console.error('Eroare la salvarea produselor:', err);
      return false;
    }
  },

  resetToDefault: (): Product[] => {
    try {
      localStorage.removeItem('review_tracker_products_v1');
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
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
    downloadAnchor.setAttribute('download', `reviewtracker_backup_${new Date().toISOString().slice(0, 10)}.json`);
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
      'Status',
      'Pret',
      'Moneda',
      'Magazin',
      'Link Magazin',
      'Link Exemplu',
      'Tip Finantare',
      'Scor General',
      'Verdict',
      'Campanie Reclama',
      'Cod Reducere',
      'Data Creare'
    ];

    const rows = products.map((p) => [
      `"${p.id}"`,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.brand.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      `"${p.status}"`,
      p.price,
      `"${p.currency}"`,
      `"${p.storeName.replace(/"/g, '""')}"`,
      `"${p.storeUrl || ''}"`,
      `"${p.exampleSiteUrl || ''}"`,
      `"${p.sponsorship}"`,
      p.overallRating || 0,
      `"${p.verdict || ''}"`,
      `"${p.adDetails?.campaignName || ''}"`,
      `"${p.adDetails?.discountCode || ''}"`,
      `"${p.createdAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reviewtracker_produse_${new Date().toISOString().slice(0, 10)}.csv`);
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
            // Validare de bază
            const valid = parsed.filter(item => item && item.id && item.title);
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
