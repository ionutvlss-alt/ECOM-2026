/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Product, FilterOptions, CampaignStatus, ProductChecklist, ListingStatus } from './types/product';
import { Supplier } from './types/supplier';
import { storageService } from './services/storageService';
import { Sidebar } from './components/Sidebar';
import { HeaderBar } from './components/HeaderBar';
import { DashboardOverview } from './components/DashboardOverview';
import { FilterBar } from './components/FilterBar';
import { ProductCard } from './components/ProductCard';
import { TableView } from './components/TableView';
import { KanbanView } from './components/KanbanView';
import { CampaignsView } from './components/CampaignsView';
import { SuppliersView } from './components/SuppliersView';
import { CategoriesView } from './components/CategoriesView';
import { GalleryView } from './components/GalleryView';
import { ReportsView } from './components/ReportsView';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ProductFormModal } from './components/ProductFormModal';
import { SupplierFormModal } from './components/SupplierFormModal';
import { ExportImportModal } from './components/ExportImportModal';
import { DeviceSyncModal } from './components/DeviceSyncModal';
import { AuthModal } from './components/AuthModal';
import { AccessPinModal } from './components/AccessPinModal';
import { authService, AuthUser } from './services/authService';
import { serverSyncService, ServerSyncState } from './services/serverSyncService';
import { firestoreSyncService } from './services/firestoreSyncService';
import { ErrorBoundary } from './components/ErrorBoundary';
import { normalizeProduct } from './utils/productNormalizer';
import { Plus, Package, AlertCircle } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>(() => (storageService.getProducts() || []).map(normalizeProduct));
  const [categories, setCategories] = useState<string[]>(() => storageService.getCategories());
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => storageService.getSuppliers());
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'catalog' | 'kanban' | 'campaigns' | 'suppliers' | 'categories' | 'gallery' | 'reports'>('dashboard');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => authService.getCurrentUser());
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Stare Autentificare PIN unic: 6122 (permite acces și sincronizare pe Telefon, PC și Laptop)
  const [isPinUnlocked, setIsPinUnlocked] = useState<boolean>(() => serverSyncService.isPinAuthenticated());
  const [serverSyncState, setServerSyncState] = useState<ServerSyncState>(() => serverSyncService.getSyncState());
  const [lastKnownVersion, setLastKnownVersion] = useState<number>(0);

  // Filter state
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    search: '',
    campaignStatus: 'all',
    platform: 'all',
    category: 'all',
    sortBy: 'date_desc',
  });

  // Modal states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);
  const [isDeviceSyncOpen, setIsDeviceSyncOpen] = useState(false);
  const [urlSyncRoomCode, setUrlSyncRoomCode] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Ascultare modificări stare conexiune server
  useEffect(() => {
    const unsub = serverSyncService.subscribeSyncState(setServerSyncState);
    return unsub;
  }, []);

  // Sincronizare completă cu serverul Cloud (Telefon <-> PC <-> Laptop)
  const performFullServerSync = async (forcePushLocal = false) => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const serverData = await serverSyncService.fetchServerData();
      if (serverData) {
        setLastKnownVersion(serverData.version);

        if (Array.isArray(serverData.products)) {
          const clean = serverData.products
            .filter((p) => p && p.id && !['1', '2', '3', '4', '5', '6', '7', '8', 'mock-1', 'mock-2'].includes(String(p.id)))
            .map(normalizeProduct);

          // Păstrăm produsele doar dacă există
          if (clean.length > 0) {
            setProducts(clean);
            storageService.saveProducts(clean);
          }
        }

        if (Array.isArray(serverData.suppliers) && serverData.suppliers.length > 0) {
          setSuppliers(serverData.suppliers);
          storageService.saveSuppliers(serverData.suppliers);
        }
        if (Array.isArray(serverData.categories) && serverData.categories.length > 0) {
          setCategories(serverData.categories);
          storageService.saveCategories(serverData.categories);
        }
      }
    } catch (err) {
      console.warn('Eroare sincronizare server:', err);
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  const handleManualSync = async () => {
    await performFullServerSync(true);
  };

  // Resetare globală la 0 produse (Firestore + Server + Local)
  const handleGlobalResetToZero = async () => {
    if (!window.confirm('Ești sigur că vrei să resetezi lista la 0 produse pe TOATE dispozitivele?')) {
      return;
    }
    setIsSyncing(true);
    try {
      await firestoreSyncService.clearAllProductsFromFirestore();
      await serverSyncService.syncWithServer([], suppliers, categories);
      storageService.clearAllProducts();
      setProducts([]);
    } catch (err) {
      console.error('Eroare resetare la 0:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Blochează ecranul (solicită PIN 6122 pentru deblocare)
  const handleLockAccess = () => {
    serverSyncService.lockAccess();
    setIsPinUnlocked(false);
  };

  // Callback la deblocare cu PIN 6122
  const handlePinSuccess = () => {
    setIsPinUnlocked(true);
    performFullServerSync(false);
  };

  // 1. Sincronizare în timp real Google Cloud Firestore (proiectul: review-tracker-b3291)
  useEffect(() => {
    if (!isPinUnlocked) return;

    firestoreSyncService.seedInitialCategoriesIfEmpty(categories);

    // Ascultare în timp real a colecției de produse - actualizare instantanee pe toate dispozitivele
    const unsubProducts = firestoreSyncService.subscribeProducts((firestoreProducts) => {
      const clean = (firestoreProducts || [])
        .filter((p) => p && p.id && !['1', '2', '3', '4', '5', '6', '7', '8', 'mock-1', 'mock-2'].includes(String(p.id)))
        .map(normalizeProduct);
      setProducts(clean);
      storageService.saveProducts(clean);
    });

    const unsubSuppliers = firestoreSyncService.subscribeSuppliers((firestoreSuppliers) => {
      if (firestoreSuppliers && firestoreSuppliers.length > 0) {
        setSuppliers(firestoreSuppliers);
      }
    });

    const unsubCategories = firestoreSyncService.subscribeCategories((firestoreCategories) => {
      if (firestoreCategories && firestoreCategories.length > 0) {
        setCategories(firestoreCategories);
      }
    });

    return () => {
      unsubProducts();
      unsubSuppliers();
      unsubCategories();
    };
  }, [isPinUnlocked]);

  // Sincronizare la pornire cu IndexedDB și Serverul Cloud
  useEffect(() => {
    storageService.syncWithIndexedDB().then((res) => {
      if (res && Array.isArray(res.products)) {
        const clean = res.products
          .filter((p) => p && p.id && !['1', '2', '3', '4', '5', '6', '7', '8', 'mock-1', 'mock-2'].includes(String(p.id)))
          .map(normalizeProduct);
        if (clean.length > 0) {
          setProducts(clean);
        }
      }
    }).finally(() => {
      if (isPinUnlocked) {
        performFullServerSync();
      }
    });
  }, [isPinUnlocked]);

  // Sincronizare automată în fundal între dispozitive (Telefon <-> PC <-> Laptop)
  useEffect(() => {
    if (!isPinUnlocked) return;

    const checkServerUpdates = async () => {
      try {
        const serverData = await serverSyncService.fetchServerData();
        if (serverData && serverData.version > lastKnownVersion) {
          setLastKnownVersion(serverData.version);
          if (Array.isArray(serverData.products)) {
            if (serverData.products.length > 0 || products.length === 0) {
              const normalized = serverData.products.map(normalizeProduct);
              setProducts(normalized);
              storageService.saveProducts(normalized);
            } else if (products.length > 0 && serverData.products.length === 0) {
              // Serverul s-a repornit gol, reîncărcăm automat datele locale pe server
              serverSyncService.syncWithServer(products, suppliers, categories).catch(() => {});
            }
          }
          if (Array.isArray(serverData.suppliers)) {
            setSuppliers(serverData.suppliers);
            storageService.saveSuppliers(serverData.suppliers);
          }
          if (Array.isArray(serverData.categories) && serverData.categories.length > 0) {
            setCategories(serverData.categories);
            storageService.saveCategories(serverData.categories);
          }
        }
      } catch {}
    };

    const interval = setInterval(checkServerUpdates, 4000);
    window.addEventListener('focus', checkServerUpdates);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkServerUpdates);
    };
  }, [isPinUnlocked, lastKnownVersion]);

  // Detect URL parameter ?sync_room=XYZ on phone or secondary device
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const room = params.get('sync_room') || params.get('sync_code');
      if (room) {
        setUrlSyncRoomCode(room);
        setIsDeviceSyncOpen(true);
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, '', cleanUrl);
      }
    } catch {}
  }, []);

  // Sincronizare produse local + Google Cloud Firestore + Server
  const updateProducts = (newProducts: Product[]) => {
    const normalized = (newProducts || []).map(normalizeProduct);
    setProducts(normalized);
    storageService.saveProducts(normalized);
    
    // Salvare în Google Cloud Firestore (timp real)
    normalized.forEach((p) => {
      firestoreSyncService.saveProduct(p).catch(() => {});
    });

    serverSyncService.syncWithServer(normalized, suppliers, categories).then((res) => {
      if (res && res.products) {
        setLastKnownVersion((prev) => prev + 1);
      }
    }).catch((err) => {
      console.warn('Eroare sincronizare server fundal:', err);
    });
  };

  // Keep selectedProduct in sync
  useEffect(() => {
    if (selectedProduct) {
      const updated = products.find((p) => p.id === selectedProduct.id);
      if (updated) {
        setSelectedProduct(updated);
      }
    }
  }, [products]);

  // Categorie handlers
  const handleAddCategory = (categoryName: string) => {
    const updated = storageService.addCategory(categoryName);
    setCategories(updated);
    firestoreSyncService.saveCategories(updated).catch(() => {});
    serverSyncService.syncWithServer(products, suppliers, updated).catch(() => {});
  };

  const handleDeleteCategory = (categoryName: string) => {
    const updated = storageService.deleteCategory(categoryName);
    setCategories(updated);
    firestoreSyncService.saveCategories(updated).catch(() => {});
    serverSyncService.syncWithServer(products, suppliers, updated).catch(() => {});
  };

  const handleRenameCategory = (oldName: string, newName: string) => {
    const res = storageService.renameCategory(oldName, newName);
    setCategories(res.categories);
    updateProducts(res.updatedProducts);
  };

  // Supplier handlers
  const handleSaveSupplier = (supplier: Supplier) => {
    setSuppliers((prev) => {
      const idx = prev.findIndex((s) => s.id === supplier.id);
      let updated: Supplier[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = supplier;
      } else {
        updated = [supplier, ...prev];
      }
      storageService.saveSuppliers(updated);
      firestoreSyncService.saveSupplier(supplier).catch(() => {});
      serverSyncService.syncWithServer(products, updated, categories).catch(() => {});
      return updated;
    });
    setIsSupplierModalOpen(false);
    setEditingSupplier(null);
  };

  const handleDeleteSupplier = (supplierId: string) => {
    setSuppliers((prev) => {
      const updated = prev.filter((s) => s.id !== supplierId);
      storageService.saveSuppliers(updated);
      firestoreSyncService.deleteSupplier(supplierId).catch(() => {});
      serverSyncService.syncWithServer(products, updated, categories).catch(() => {});
      return updated;
    });
  };

  // Handle Save (Create or Edit)
  const handleSaveProduct = (product: Product, newCategoryCreated?: string) => {
    if (newCategoryCreated) {
      const updatedCats = storageService.addCategory(newCategoryCreated);
      setCategories(updatedCats);
      firestoreSyncService.saveCategories(updatedCats).catch(() => {});
    }

    const existingIndex = products.findIndex((p) => p.id === product.id);
    let updated: Product[];

    if (existingIndex >= 0) {
      updated = [...products];
      updated[existingIndex] = product;
    } else {
      updated = [product, ...products];
    }

    updateProducts(updated);
    firestoreSyncService.saveProduct(product).catch(() => {});
    setIsNewProductOpen(false);
    setEditingProduct(null);

    if (selectedProduct?.id === product.id) {
      setSelectedProduct(product);
    }
  };

  // Handle Delete
  const handleDeleteProduct = (productId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm('Ești sigur că vrei să ștergi acest produs din evidență?')) {
      const updated = products.filter((p) => p.id !== productId);
      updateProducts(updated);
      firestoreSyncService.deleteProduct(productId).catch(() => {});
      if (selectedProduct?.id === productId) {
        setSelectedProduct(null);
      }
    }
  };

  // Handle Campaign Status Update
  const handleUpdateCampaignStatus = (productId: string, newStatus: CampaignStatus) => {
    const updated = products.map((p) => {
      if (p.id === productId) {
        return {
          ...p,
          campaign: {
            ...p.campaign,
            status: newStatus,
          },
        };
      }
      return p;
    });

    updateProducts(updated);
  };

  // Handle Favorite Toggle
  const handleToggleFavorite = (productId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = products.map((p) => {
      if (p.id === productId) {
        return { ...p, isFavorite: !p.isFavorite };
      }
      return p;
    });
    updateProducts(updated);
  };

  // Handle Checklist Update
  const handleUpdateChecklist = (productId: string, newChecklist: ProductChecklist) => {
    const updated = products.map((p) => {
      if (p.id === productId) {
        return { ...p, checklist: newChecklist };
      }
      return p;
    });
    updateProducts(updated);
  };

  // Handle Listing Status Update (planned / in_progress / live)
  const handleUpdateListingStatus = (productId: string, newStatus: ListingStatus) => {
    const updated = products.map((p) => {
      if (p.id === productId) {
        return { ...p, listingStatus: newStatus };
      }
      return p;
    });
    updateProducts(updated);
  };

  // Extract unique target sites for autocomplete & suggestions
  const existingTargetSites = useMemo(() => {
    const list = products
      .map((p) => (p.targetSite || '').trim())
      .filter((s): s is string => Boolean(s));
    return Array.from(new Set(list));
  }, [products]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    const list = Array.isArray(products)
      ? products.filter((p): p is Product => Boolean(p && typeof p === 'object' && p.id))
      : [];

    return list
      .filter((p) => {
        // Search
        if (filterOptions.search) {
          const q = filterOptions.search.toLowerCase().trim();
          const matchTitle = (p.title || '').toLowerCase().includes(q);
          const matchBrand = (p.brand || '').toLowerCase().includes(q);
          const matchStore = (p.storeName || '').toLowerCase().includes(q);
          const matchCategory = (p.category || '').toLowerCase().includes(q);
          const matchPlatform = (p.campaign?.platform || '').toLowerCase().includes(q);
          const matchNotes = (p.campaign?.notes || '').toLowerCase().includes(q) || (p.detailedNotes || '').toLowerCase().includes(q);
          if (!matchTitle && !matchBrand && !matchStore && !matchCategory && !matchPlatform && !matchNotes) {
            return false;
          }
        }

        // Campaign Status
        if (filterOptions.campaignStatus !== 'all' && (p.campaign?.status || 'testing') !== filterOptions.campaignStatus) {
          return false;
        }

        // Category
        if (filterOptions.category !== 'all' && (p.category || '').toLowerCase() !== filterOptions.category.toLowerCase()) {
          return false;
        }

        // Platform
        if (filterOptions.platform !== 'all') {
          const platStr = (p.campaign?.platform || '').toLowerCase();
          const target = filterOptions.platform.toLowerCase();
          if (!platStr.includes(target) && !target.includes(platStr)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (!a && !b) return 0;
        if (!a) return 1;
        if (!b) return -1;
        switch (filterOptions.sortBy) {
          case 'date_desc': {
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            return (Number.isFinite(timeB) ? timeB : 0) - (Number.isFinite(timeA) ? timeA : 0);
          }
          case 'date_asc': {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return (Number.isFinite(timeA) ? timeA : 0) - (Number.isFinite(timeB) ? timeB : 0);
          }
          case 'roas_desc':
            return (Number(b.campaign?.roas) || 0) - (Number(a.campaign?.roas) || 0);
          case 'revenue_desc':
            return (Number(b.campaign?.revenue) || 0) - (Number(a.campaign?.revenue) || 0);
          case 'spend_desc':
            return (Number(b.campaign?.adSpend) || 0) - (Number(a.campaign?.adSpend) || 0);
          case 'price_desc':
            return (Number(b.price) || 0) - (Number(a.price) || 0);
          case 'name_asc':
            return String(a.title || '').localeCompare(String(b.title || ''), 'ro');
          default:
            return 0;
        }
      });
  }, [products, filterOptions]);

  const testingCount = Array.isArray(products)
    ? products.filter((p) => p && (p.campaign?.status || 'testing') === 'testing').length
    : 0;
  const winnersCount = Array.isArray(products)
    ? products.filter((p) => p && p.campaign?.status === 'winner').length
    : 0;

  return (
    <div className="min-h-screen bg-[#f8faf9] text-neutral-900 flex antialiased selection:bg-emerald-100 selection:text-emerald-900 font-sans">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        productsCount={products.length}
        suppliersCount={suppliers.length}
        winnersCount={winnersCount}
        testingCount={testingCount}
        userName={currentUser?.username || "ionutvlss"}
        userEmail={currentUser ? `${currentUser.displayName} • ${currentUser.email}` : "ionutvlss • E-commerce Workspace"}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenDeviceSync={() => {
          setUrlSyncRoomCode(null);
          setIsDeviceSyncOpen(true);
        }}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLockAccess={handleLockAccess}
      />

      {/* Main Content wrapper */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        {/* Header Bar */}
        <HeaderBar
          currentTab={currentTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenExportImport={() => setIsExportImportOpen(true)}
          onOpenDeviceSync={() => {
            setUrlSyncRoomCode(null);
            setIsDeviceSyncOpen(true);
          }}
          onOpenAuth={() => setIsAuthOpen(true)}
          onManualSync={handleManualSync}
          onLockAccess={handleLockAccess}
          onResetToZero={handleGlobalResetToZero}
          isSyncing={isSyncing}
          syncState={serverSyncState}
          currentUser={currentUser}
          userName={currentUser?.username || "ionutvlss"}
        />

        {/* Workspace Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8">
          <ErrorBoundary>
            {/* Tab 1: Dashboard Overview */}
          {currentTab === 'dashboard' && (
            <DashboardOverview
              products={products}
              onSelectProduct={setSelectedProduct}
              onOpenAddModal={() => {
                setEditingProduct(null);
                setIsNewProductOpen(true);
              }}
              userName="ionutvlss"
            />
          )}

          {/* Tab 2: Catalog Produse */}
          {currentTab === 'catalog' && (
            <ErrorBoundary>
              <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                    Produsele mele
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-neutral-500">
                    Explorează produsele, platformele testate (Facebook / TikTok) și metricile campaniilor.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setIsNewProductOpen(true);
                  }}
                  className="px-4 py-2.5 text-xs font-semibold text-white bg-[#0f4a3c] hover:bg-[#0c3c31] rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Adaugă produs & campanie</span>
                </button>
              </div>

              {/* Filter Bar */}
              <FilterBar
                filterOptions={filterOptions}
                categories={categories}
                onFilterChange={(newOpts) => setFilterOptions((prev) => ({ ...prev, ...newOpts }))}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                totalFilteredCount={filteredProducts.length}
              />

              {/* View Render */}
              {products.length === 0 ? (
                <div className="border border-dashed border-neutral-200 rounded-2xl p-12 text-center bg-white">
                  <div className="w-12 h-12 rounded-2xl bg-[#eaf3ee] flex items-center justify-center text-[#0f4a3c] mx-auto mb-3">
                    <Package className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-neutral-900">Nu ai adăugat încă niciun produs</h3>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
                    Apasă pe butonul de mai jos pentru a înregistra primul produs testat pe Facebook Ads sau TikTok Ads.
                  </p>
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setIsNewProductOpen(true);
                    }}
                    className="mt-4 px-4 py-2 bg-[#0f4a3c] hover:bg-[#0c3c31] text-white text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Adaugă primul produs</span>
                  </button>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="border border-dashed border-neutral-200 rounded-2xl p-12 text-center bg-white">
                  <AlertCircle className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-neutral-900">Niciun produs găsit</h3>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
                    Nu am găsit produse care să corespundă filtrelor selectate.
                  </p>
                  <button
                    onClick={() =>
                      setFilterOptions({
                        search: '',
                        campaignStatus: 'all',
                        platform: 'all',
                        category: 'all',
                        sortBy: 'date_desc',
                      })
                    }
                    className="mt-4 px-3.5 py-1.5 bg-[#eaf3ee] hover:bg-[#d8ece1] text-[#0f4a3c] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Resetează filtrele
                  </button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelect={setSelectedProduct}
                      onEdit={(p, e) => {
                        e.stopPropagation();
                        setEditingProduct(p);
                        setIsNewProductOpen(true);
                      }}
                      onDelete={handleDeleteProduct}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
              ) : (
                <TableView
                  products={filteredProducts}
                  onSelectProduct={setSelectedProduct}
                  onEditProduct={(p, e) => {
                    e.stopPropagation();
                    setEditingProduct(p);
                    setIsNewProductOpen(true);
                  }}
                  onDeleteProduct={handleDeleteProduct}
                  onUpdateCampaignStatus={handleUpdateCampaignStatus}
                />
              )}
            </div>
            </ErrorBoundary>
          )}

          {/* Tab 3: Campanii Ads & Rezultate (Facebook & TikTok) */}
          {currentTab === 'campaigns' && (
            <CampaignsView
              products={products}
              onSelectProduct={setSelectedProduct}
              onOpenAddModal={() => {
                setEditingProduct(null);
                setIsNewProductOpen(true);
              }}
            />
          )}

          {/* Tab Furnizori & Contacte (Cerut de utilizator) */}
          {currentTab === 'suppliers' && (
            <SuppliersView
              suppliers={suppliers}
              products={products}
              onOpenAddModal={() => {
                setEditingSupplier(null);
                setIsSupplierModalOpen(true);
              }}
              onEditSupplier={(supplier) => {
                setEditingSupplier(supplier);
                setIsSupplierModalOpen(true);
              }}
              onDeleteSupplier={handleDeleteSupplier}
              onSelectProductByTitle={(title) => {
                const match = products.find((p) => p.title.toLowerCase() === title.toLowerCase());
                if (match) {
                  setSelectedProduct(match);
                } else {
                  setFilterOptions((prev) => ({ ...prev, search: title }));
                  setCurrentTab('catalog');
                }
              }}
            />
          )}

          {/* Tab 4: Gestionare Categorii (Pagina specială cerută de utilizator!) */}
          {currentTab === 'categories' && (
            <CategoriesView
              categories={categories}
              products={products}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
              onRenameCategory={handleRenameCategory}
              onSelectCategoryFilter={(categoryName) => {
                setFilterOptions((prev) => ({ ...prev, category: categoryName }));
                setCurrentTab('catalog');
              }}
            />
          )}

          {/* Tab 5: Workflow Campanii (Kanban) */}
          {currentTab === 'kanban' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                    Workflow & Etape Campanii Ads
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-neutral-500">
                    Avansează produsele prin etapele de testare: În testare → Winner (Scalat) → Promițător → Oprit.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setIsNewProductOpen(true);
                  }}
                  className="px-4 py-2.5 text-xs font-semibold text-white bg-[#0f4a3c] hover:bg-[#0c3c31] rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Adaugă test nou</span>
                </button>
              </div>

              <KanbanView
                products={products}
                onSelectProduct={setSelectedProduct}
                onUpdateCampaignStatus={handleUpdateCampaignStatus}
              />
            </div>
          )}

          {/* Tab 6: Galerie Foto */}
          {currentTab === 'gallery' && (
            <GalleryView
              products={products}
              onSelectProduct={setSelectedProduct}
            />
          )}

          {/* Tab 7: Rapoarte Detaliate & ROAS */}
          {currentTab === 'reports' && (
            <ReportsView
              products={products}
              categories={categories}
              onSelectProduct={setSelectedProduct}
            />
          )}
          </ErrorBoundary>
        </main>
      </div>

      {/* Modals */}
      {selectedProduct && (
        <ErrorBoundary>
          <ProductDetailModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onEdit={(product) => {
              setSelectedProduct(null);
              setEditingProduct(product);
              setIsNewProductOpen(true);
            }}
            onDelete={(productId) => {
              handleDeleteProduct(productId);
            }}
            onUpdateStatus={handleUpdateCampaignStatus}
            onToggleFavorite={handleToggleFavorite}
            onUpdateChecklist={handleUpdateChecklist}
            onUpdateListingStatus={handleUpdateListingStatus}
          />
        </ErrorBoundary>
      )}

      {isNewProductOpen && (
        <ProductFormModal
          initialProduct={editingProduct}
          categories={categories}
          suppliers={suppliers}
          existingTargetSites={existingTargetSites}
          onSave={handleSaveProduct}
          onClose={() => {
            setIsNewProductOpen(false);
            setEditingProduct(null);
          }}
        />
      )}

      {isSupplierModalOpen && (
        <SupplierFormModal
          initialSupplier={editingSupplier}
          catalogProducts={products}
          onSave={handleSaveSupplier}
          onClose={() => {
            setIsSupplierModalOpen(false);
            setEditingSupplier(null);
          }}
        />
      )}

      {isExportImportOpen && (
        <ExportImportModal
          products={products}
          onImportSuccess={(imported) => {
            setProducts(imported);
          }}
          onResetSuccess={(resetList) => {
            setProducts(resetList);
          }}
          onClose={() => setIsExportImportOpen(false)}
          onOpenDeviceSync={() => {
            setIsExportImportOpen(false);
            setUrlSyncRoomCode(null);
            setIsDeviceSyncOpen(true);
          }}
        />
      )}

      {isDeviceSyncOpen && (
        <DeviceSyncModal
          products={products}
          initialSyncCode={urlSyncRoomCode}
          onSyncSuccess={(synced) => {
            updateProducts(synced);
            const freshCategories = storageService.getCategories();
            setCategories(freshCategories);
          }}
          onClose={() => {
            setIsDeviceSyncOpen(false);
            setUrlSyncRoomCode(null);
          }}
        />
      )}

      {isAuthOpen && (
        <AuthModal
          currentUser={currentUser}
          productsCount={products.length}
          onLoginSuccess={(user, loadedProducts) => {
            setCurrentUser(user);
            if (loadedProducts && loadedProducts.length > 0) {
              setProducts(loadedProducts);
              storageService.saveProducts(loadedProducts);
            }
          }}
          onLogout={() => {
            authService.logout();
            setCurrentUser(null);
          }}
          onClose={() => setIsAuthOpen(false)}
        />
      )}

      {/* Ecran de blocare și autentificare securizată cu PIN unic: 6122 */}
      {!isPinUnlocked && (
        <AccessPinModal onSuccess={handlePinSuccess} />
      )}
    </div>
  );
}
