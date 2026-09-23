/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Product, ProductStatus, FilterOptions, TestLogEntry } from './types/product';
import { storageService } from './services/storageService';
import { Sidebar } from './components/Sidebar';
import { HeaderBar } from './components/HeaderBar';
import { DashboardOverview } from './components/DashboardOverview';
import { FilterBar } from './components/FilterBar';
import { ProductCard } from './components/ProductCard';
import { TableView } from './components/TableView';
import { KanbanView } from './components/KanbanView';
import { CampaignsView } from './components/CampaignsView';
import { GalleryView } from './components/GalleryView';
import { ReportsView } from './components/ReportsView';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ProductFormModal } from './components/ProductFormModal';
import { ExportImportModal } from './components/ExportImportModal';
import { Plus, AlertCircle } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>(() => storageService.getProducts());
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'catalog' | 'kanban' | 'campaigns' | 'gallery' | 'reports'>('dashboard');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Filter state
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    search: '',
    status: 'all',
    category: 'all',
    sponsorship: 'all',
    minRating: 0,
    sortBy: 'date_desc',
  });

  // Modal states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);

  // Sync to storage on products change
  const updateProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    storageService.saveProducts(newProducts);
  };

  // Keep selectedProduct in sync if it is updated
  useEffect(() => {
    if (selectedProduct) {
      const updated = products.find((p) => p.id === selectedProduct.id);
      if (updated) {
        setSelectedProduct(updated);
      }
    }
  }, [products]);

  // Handle Save (Create or Edit)
  const handleSaveProduct = (product: Product) => {
    const existingIndex = products.findIndex((p) => p.id === product.id);
    let updated: Product[];

    if (existingIndex >= 0) {
      updated = [...products];
      updated[existingIndex] = product;
    } else {
      updated = [product, ...products];
    }

    updateProducts(updated);
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
      if (selectedProduct?.id === productId) {
        setSelectedProduct(null);
      }
    }
  };

  // Handle Status Update
  const handleUpdateStatus = (productId: string, newStatus: ProductStatus) => {
    const updated = products.map((p) => {
      if (p.id === productId) {
        return {
          ...p,
          status: newStatus,
          startedTestingAt:
            newStatus === 'testing' && !p.startedTestingAt
              ? new Date().toISOString().slice(0, 10)
              : p.startedTestingAt,
          completedTestingAt:
            newStatus === 'tested' && !p.completedTestingAt
              ? new Date().toISOString().slice(0, 10)
              : p.completedTestingAt,
        };
      }
      return p;
    });

    updateProducts(updated);
  };

  // Handle Add Log Entry
  const handleAddLog = (productId: string, logData: Omit<TestLogEntry, 'id'>) => {
    const updated = products.map((p) => {
      if (p.id === productId) {
        const newLog: TestLogEntry = {
          ...logData,
          id: `log-${Date.now()}`,
        };
        return {
          ...p,
          logs: [...(p.logs || []), newLog],
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

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search
        if (filterOptions.search) {
          const q = filterOptions.search.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchBrand = p.brand.toLowerCase().includes(q);
          const matchStore = (p.storeName || '').toLowerCase().includes(q);
          const matchNotes = (p.detailedNotes || '').toLowerCase().includes(q);
          const matchSummary = (p.reviewSummary || '').toLowerCase().includes(q);
          const matchCategory = p.category.toLowerCase().includes(q);
          if (!matchTitle && !matchBrand && !matchStore && !matchNotes && !matchSummary && !matchCategory) {
            return false;
          }
        }

        // Status
        if (filterOptions.status !== 'all' && p.status !== filterOptions.status) {
          return false;
        }

        // Category
        if (filterOptions.category !== 'all' && p.category !== filterOptions.category) {
          return false;
        }

        // Sponsorship
        if (filterOptions.sponsorship !== 'all' && p.sponsorship !== filterOptions.sponsorship) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (filterOptions.sortBy) {
          case 'date_desc':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'date_asc':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case 'rating_desc':
            return (b.overallRating || 0) - (a.overallRating || 0);
          case 'rating_asc':
            return (a.overallRating || 0) - (b.overallRating || 0);
          case 'price_desc':
            return b.price - a.price;
          case 'price_asc':
            return a.price - b.price;
          case 'name_asc':
            return a.title.localeCompare(b.title, 'ro');
          default:
            return 0;
        }
      });
  }, [products, filterOptions]);

  const testingCount = products.filter((p) => p.status === 'testing').length;
  const testedCount = products.filter((p) => p.status === 'tested').length;

  return (
    <div className="min-h-screen bg-[#f8faf9] text-neutral-900 flex antialiased selection:bg-emerald-100 selection:text-emerald-900 font-sans">
      {/* Left Sidebar adhering to Collective Product Journal layout */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        productsCount={products.length}
        testedCount={testedCount}
        testingCount={testingCount}
        userName="ionutvlss"
        userEmail="ionutvlss • Personal workspace"
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content wrapper pushed by fixed sidebar on md+ */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        {/* Sticky Header with breadcrumbs and actions */}
        <HeaderBar
          currentTab={currentTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenExportImport={() => setIsExportImportOpen(true)}
          userName="ionutvlss"
        />

        {/* Workspace Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8">
          {/* Tab 1: Dashboard Overview (matching screenshot) */}
          {currentTab === 'dashboard' && (
            <DashboardOverview
              products={products}
              onSelectProduct={setSelectedProduct}
              onNavigateToCatalog={(statusFilter) => {
                if (statusFilter) {
                  setFilterOptions((prev) => ({ ...prev, status: statusFilter as any }));
                }
                setCurrentTab('catalog');
              }}
              onNavigateToCampaigns={() => setCurrentTab('campaigns')}
              onOpenNewProduct={() => {
                setEditingProduct(null);
                setIsNewProductOpen(true);
              }}
              userName="ionutvlss"
            />
          )}

          {/* Tab 2: Catalog Produse */}
          {currentTab === 'catalog' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                    Produsele mele
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-neutral-500">
                    Explorează, filtrează și gestionează toate produsele din colecția ta.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setIsNewProductOpen(true);
                  }}
                  className="px-4 py-2.5 text-xs font-semibold text-white bg-[#0f4a3c] hover:bg-[#0c3c31] rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Adaugă produs</span>
                </button>
              </div>

              {/* Filter Bar */}
              <FilterBar
                filterOptions={filterOptions}
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
                  <h3 className="text-base font-bold text-neutral-900">Jurnalul tău de produse este gol</h3>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
                    Începe evidența apăsând pe butonul de mai jos pentru a adăuga primul dispozitiv sau articol pe care dorești să-l testezi.
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
                    Nu am găsit produse care să corespundă filtrelor tale. Încearcă să resetezi termenii de căutare.
                  </p>
                  <button
                    onClick={() =>
                      setFilterOptions({
                        search: '',
                        status: 'all',
                        category: 'all',
                        sponsorship: 'all',
                        minRating: 0,
                        sortBy: 'date_desc',
                      })
                    }
                    className="mt-4 px-3.5 py-1.5 bg-[#eaf3ee] hover:bg-[#d8ece1] text-[#0f4a3c] text-xs font-semibold rounded-xl transition-colors"
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
                  onUpdateStatus={handleUpdateStatus}
                />
              )}
            </div>
          )}

          {/* Tab 3: Tablou Kanban Workflow */}
          {currentTab === 'kanban' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                    Colecții & Flux de Testare (Kanban)
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-neutral-500">
                    Urmărește și avansează fiecare produs prin etape: De testat → În testare → Evaluat.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setIsNewProductOpen(true);
                  }}
                  className="px-4 py-2.5 text-xs font-semibold text-white bg-[#0f4a3c] hover:bg-[#0c3c31] rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Adaugă produs</span>
                </button>
              </div>

              <KanbanView
                products={products}
                onSelectProduct={setSelectedProduct}
                onUpdateStatus={handleUpdateStatus}
              />
            </div>
          )}

          {/* Tab 4: Reclame & Campanii Sponsorizate */}
          {currentTab === 'campaigns' && (
            <CampaignsView
              products={products}
              onSelectProduct={setSelectedProduct}
            />
          )}

          {/* Tab 5: Galerie Foto */}
          {currentTab === 'gallery' && (
            <GalleryView
              products={products}
              onSelectProduct={setSelectedProduct}
            />
          )}

          {/* Tab 6: Rapoarte Detaliate */}
          {currentTab === 'reports' && (
            <ReportsView
              products={products}
              onSelectProduct={setSelectedProduct}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      {selectedProduct && (
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
          onUpdateStatus={handleUpdateStatus}
          onAddLog={handleAddLog}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {isNewProductOpen && (
        <ProductFormModal
          initialProduct={editingProduct}
          onSave={handleSaveProduct}
          onClose={() => {
            setIsNewProductOpen(false);
            setEditingProduct(null);
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
        />
      )}
    </div>
  );
}
