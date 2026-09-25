import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Suport pentru payload mare (imagini base64)
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// CORS deschis pentru securitate și flexibilitate cross-origin în preview
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Director date persistente server
const DATA_DIR = path.resolve(__dirname, 'server_data');
const DB_FILE = path.join(DATA_DIR, 'ecom_db.json');
const BACKUP_FILE = path.join(DATA_DIR, 'ecom_db.backup.json');

interface DbSchema {
  products: any[];
  suppliers: any[];
  categories: string[];
  lastUpdated: string;
  version: number;
}

const DEFAULT_CATEGORIES = [
  'Gadgets & Tech',
  'Cosmetice & Beauty',
  'Casă & Curățenie',
  'Bucătărie & Electro',
  'Fitness & Sport',
  'Auto & Accesorii',
  'Îmbrăcăminte & Modă',
  'Jucării & Copii',
  'Animale de companie',
  'Altele',
];

// Inițializare fișier bază de date
function ensureDbExists(): DbSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.products)) {
        return parsed;
      }
    } catch (e) {
      console.error('Eroare citire fișier db existent:', e);
      // Restaurare din backup dacă există
      if (fs.existsSync(BACKUP_FILE)) {
        try {
          const backupRaw = fs.readFileSync(BACKUP_FILE, 'utf-8');
          const backupParsed = JSON.parse(backupRaw);
          if (backupParsed && Array.isArray(backupParsed.products)) {
            return backupParsed;
          }
        } catch {}
      }
    }
  }

  const initialDb: DbSchema = {
    products: [],
    suppliers: [],
    categories: DEFAULT_CATEGORIES,
    lastUpdated: new Date().toISOString(),
    version: 1,
  };

  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
  } catch (e) {
    console.error('Eroare scriere db inițial:', e);
  }

  return initialDb;
}

function readDb(): DbSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return ensureDbExists();
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Eroare readDb:', e);
    return ensureDbExists();
  }
}

function writeDb(data: DbSchema): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const serialized = JSON.stringify(data, null, 2);
    // Atomic write prin fișier temporar
    const tempFile = path.join(DATA_DIR, `ecom_db_${Date.now()}.tmp`);
    fs.writeFileSync(tempFile, serialized, 'utf-8');
    
    // Păstrăm un backup al versiunii anterioare
    if (fs.existsSync(DB_FILE)) {
      try {
        fs.copyFileSync(DB_FILE, BACKUP_FILE);
      } catch {}
    }

    fs.renameSync(tempFile, DB_FILE);
    return true;
  } catch (e) {
    console.error('Eroare writeDb:', e);
    return false;
  }
}

// Asigură inițializarea
ensureDbExists();

// ================= API ENDPOINTS =================

// 1. Verificare PIN de acces cerut: 6122
app.post('/api/auth/verify-pin', (req, res) => {
  const { pin } = req.body || {};
  const cleanPin = String(pin || '').trim();

  if (cleanPin === '6122') {
    return res.json({
      success: true,
      message: 'Acces acordat. Bun venit!',
      user: {
        username: 'ionutvlss',
        displayName: 'Ionuț Vlăsceanu',
        email: 'ioan.vlasceanu@autonom.com',
        role: 'owner',
        pin: '6122',
      },
      token: 'auth_pin_6122_' + Date.now(),
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Cod de acces incorect. Te rugăm să introduci codul unic 6122.',
  });
});

// 2. Health check
app.get('/api/health', (req, res) => {
  const db = readDb();
  res.json({
    status: 'ok',
    serverTime: new Date().toISOString(),
    productsCount: db.products.length,
    suppliersCount: db.suppliers.length,
    lastUpdated: db.lastUpdated,
    version: db.version,
  });
});

// 3. Obține toate datele din Cloud/Server
app.get('/api/data', (req, res) => {
  const db = readDb();
  res.json({
    success: true,
    products: db.products || [],
    suppliers: db.suppliers || [],
    categories: db.categories || DEFAULT_CATEGORIES,
    lastUpdated: db.lastUpdated,
    version: db.version,
  });
});

// 4. Sincronizare bidirecțională / Salvare globală (telefon <-> pc <-> laptop)
app.post('/api/sync', (req, res) => {
  try {
    const { products, suppliers, categories } = req.body || {};
    const currentDb = readDb();

    let updatedProducts = currentDb.products;
    if (Array.isArray(products)) {
      updatedProducts = products;
    }

    let updatedSuppliers = currentDb.suppliers;
    if (Array.isArray(suppliers)) {
      updatedSuppliers = suppliers;
    }

    let updatedCategories = currentDb.categories;
    if (Array.isArray(categories) && categories.length > 0) {
      updatedCategories = categories;
    }

    const newDb: DbSchema = {
      products: updatedProducts,
      suppliers: updatedSuppliers,
      categories: updatedCategories,
      lastUpdated: new Date().toISOString(),
      version: (currentDb.version || 1) + 1,
    };

    const saved = writeDb(newDb);

    res.json({
      success: saved,
      products: newDb.products,
      suppliers: newDb.suppliers,
      categories: newDb.categories,
      lastUpdated: newDb.lastUpdated,
      version: newDb.version,
    });
  } catch (err: any) {
    console.error('Eroare /api/sync:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. Salvare sau actualizare produs individual
app.post('/api/products', (req, res) => {
  try {
    const product = req.body;
    if (!product || !product.id) {
      return res.status(400).json({ success: false, message: 'Produs invalid' });
    }

    const db = readDb();
    const existingIndex = db.products.findIndex((p: any) => p.id === product.id);

    if (existingIndex >= 0) {
      db.products[existingIndex] = { ...db.products[existingIndex], ...product, updatedAt: new Date().toISOString() };
    } else {
      db.products.unshift({ ...product, createdAt: product.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() });
    }

    db.lastUpdated = new Date().toISOString();
    db.version = (db.version || 1) + 1;
    writeDb(db);

    res.json({
      success: true,
      product: existingIndex >= 0 ? db.products[existingIndex] : db.products[0],
      version: db.version,
      lastUpdated: db.lastUpdated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. Ștergere produs
app.delete('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = readDb();
    db.products = db.products.filter((p: any) => p.id !== id);
    db.lastUpdated = new Date().toISOString();
    db.version = (db.version || 1) + 1;
    writeDb(db);

    res.json({
      success: true,
      remainingCount: db.products.length,
      version: db.version,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 7. Salvare furnizor
app.post('/api/suppliers', (req, res) => {
  try {
    const supplier = req.body;
    if (!supplier || !supplier.id) {
      return res.status(400).json({ success: false, message: 'Furnizor invalid' });
    }

    const db = readDb();
    const existingIndex = db.suppliers.findIndex((s: any) => s.id === supplier.id);

    if (existingIndex >= 0) {
      db.suppliers[existingIndex] = supplier;
    } else {
      db.suppliers.unshift(supplier);
    }

    db.lastUpdated = new Date().toISOString();
    db.version = (db.version || 1) + 1;
    writeDb(db);

    res.json({ success: true, supplier, version: db.version });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 8. Ștergere furnizor
app.delete('/api/suppliers/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = readDb();
    db.suppliers = db.suppliers.filter((s: any) => s.id !== id);
    db.lastUpdated = new Date().toISOString();
    db.version = (db.version || 1) + 1;
    writeDb(db);

    res.json({ success: true, remainingCount: db.suppliers.length, version: db.version });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 9. Resetare sau restaurare bază de date
app.post('/api/reset', (req, res) => {
  const { pin } = req.body || {};
  if (pin !== '6122') {
    return res.status(401).json({ success: false, message: 'PIN incorect' });
  }
  const resetDb: DbSchema = {
    products: [],
    suppliers: [],
    categories: DEFAULT_CATEGORIES,
    lastUpdated: new Date().toISOString(),
    version: 1,
  };
  writeDb(resetDb);
  res.json({ success: true, message: 'Baza de date a fost resetată.' });
});

// ================= INTEGRARE VITE / STATIC =================
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serverul E-commerce rulează pe portul ${PORT} (dev: ${!isProd})`);
  });
}

startServer().catch((err) => {
  console.error('Eroare la pornirea serverului:', err);
  process.exit(1);
});
