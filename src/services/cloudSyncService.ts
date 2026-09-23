import { Product } from '../types/product';
import { storageService } from './storageService';

export interface CloudConfig {
  provider: 'supabase' | 'firebase_rest' | 'custom_rest' | 'none';
  url: string;
  apiKey: string;
  autoSync: boolean;
}

const CLOUD_CONFIG_KEY = 'ecom_cloud_sync_config';

export const cloudSyncService = {
  getConfig: (): CloudConfig => {
    try {
      const stored = localStorage.getItem(CLOUD_CONFIG_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return {
      provider: 'none',
      url: '',
      apiKey: '',
      autoSync: false,
    };
  },

  saveConfig: (cfg: CloudConfig) => {
    try {
      localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify(cfg));
    } catch (e) {
      console.error('Eroare salvare configurare cloud:', e);
    }
  },

  // Încarcă produsele din Cloud
  fetchFromCloud: async (): Promise<Product[] | null> => {
    const cfg = cloudSyncService.getConfig();
    if (cfg.provider === 'none' || !cfg.url) return null;

    try {
      if (cfg.provider === 'supabase') {
        const cleanUrl = cfg.url.replace(/\/+$/, '');
        const res = await fetch(`${cleanUrl}/rest/v1/products?select=*`, {
          headers: {
            apikey: cfg.apiKey,
            Authorization: `Bearer ${cfg.apiKey}`,
          },
        });
        if (!res.ok) throw new Error(`Supabase eroare HTTP: ${res.status}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          // If stored as { id, data: { ...product } }
          const formatted = data.map((item) => (item.data ? item.data : item));
          storageService.saveProducts(formatted);
          return formatted;
        }
      } else if (cfg.provider === 'firebase_rest') {
        // Firebase Realtime DB URL e.g. https://my-project-default-rtdb.firebaseio.com/ecom_products.json
        let targetUrl = cfg.url;
        if (!targetUrl.endsWith('.json')) {
          targetUrl = `${targetUrl.replace(/\/+$/, '')}/ecom_products.json`;
        }
        if (cfg.apiKey) {
          targetUrl += `?auth=${cfg.apiKey}`;
        }
        const res = await fetch(targetUrl);
        if (!res.ok) throw new Error(`Firebase HTTP: ${res.status}`);
        const data = await res.json();
        if (data) {
          const list: Product[] = Array.isArray(data) ? data : Object.values(data);
          storageService.saveProducts(list);
          return list;
        }
      } else if (cfg.provider === 'custom_rest') {
        const res = await fetch(cfg.url, {
          headers: cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {},
        });
        if (!res.ok) throw new Error(`Custom REST HTTP: ${res.status}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          storageService.saveProducts(data);
          return data;
        }
      }
    } catch (err) {
      console.warn('Eroare la preluarea din cloud:', err);
      throw err;
    }
    return null;
  },

  // Trimite produsele către Cloud
  pushToCloud: async (products: Product[]): Promise<boolean> => {
    const cfg = cloudSyncService.getConfig();
    if (cfg.provider === 'none' || !cfg.url) return false;

    try {
      if (cfg.provider === 'firebase_rest') {
        let targetUrl = cfg.url;
        if (!targetUrl.endsWith('.json')) {
          targetUrl = `${targetUrl.replace(/\/+$/, '')}/ecom_products.json`;
        }
        if (cfg.apiKey) {
          targetUrl += `?auth=${cfg.apiKey}`;
        }
        const res = await fetch(targetUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(products),
        });
        return res.ok;
      } else if (cfg.provider === 'supabase') {
        const cleanUrl = cfg.url.replace(/\/+$/, '');
        // Upsert în tabelul products
        const rows = products.map((p) => ({ id: p.id, data: p }));
        const res = await fetch(`${cleanUrl}/rest/v1/products`, {
          method: 'POST',
          headers: {
            apikey: cfg.apiKey,
            Authorization: `Bearer ${cfg.apiKey}`,
            'Content-Type': 'application/json',
            Prefer: 'resolution=merge-duplicates',
          },
          body: JSON.stringify(rows),
        });
        return res.ok;
      }
    } catch (err) {
      console.warn('Eroare la salvarea în cloud:', err);
      throw err;
    }
    return false;
  },
};
