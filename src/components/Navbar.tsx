import React from 'react';
import { Plus, Download, Upload, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  currentTab: 'dashboard' | 'catalog' | 'kanban' | 'campaigns' | 'gallery';
  onTabChange: (tab: 'dashboard' | 'catalog' | 'kanban' | 'campaigns' | 'gallery') => void;
  onOpenNewProduct: () => void;
  onOpenExportImport: () => void;
  productsCount: number;
  testingCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenNewProduct,
  onOpenExportImport,
  productsCount,
  testingCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onTabChange('dashboard')}
              className="text-left group flex items-center gap-2.5 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:border-amber-400 transition-colors">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
                ReviewTracker
              </span>
            </button>
            <span className="hidden sm:inline-block text-xs font-mono text-neutral-500 border-l border-neutral-800 pl-3">
              {testingCount} în teste · {productsCount} total
            </span>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-neutral-900/60 p-1 rounded-xl border border-neutral-800">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'dashboard'
                  ? 'bg-neutral-800 text-amber-400 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Panou Analiză
            </button>
            <button
              onClick={() => onTabChange('catalog')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'catalog'
                  ? 'bg-neutral-800 text-amber-400 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Catalog Produse
            </button>
            <button
              onClick={() => onTabChange('kanban')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'kanban'
                  ? 'bg-neutral-800 text-amber-400 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Tablou Workflow
            </button>
            <button
              onClick={() => onTabChange('campaigns')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'campaigns'
                  ? 'bg-neutral-800 text-amber-400 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Reclame & Campanii
            </button>
            <button
              onClick={() => onTabChange('gallery')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'gallery'
                  ? 'bg-neutral-800 text-amber-400 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Galerie Foto
            </button>
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenExportImport}
              title="Backup, export și import date"
              className="p-2 text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Backup / Export</span>
            </button>

            <button
              onClick={onOpenNewProduct}
              className="px-3.5 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 whitespace-nowrap active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Adaugă Produs</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-between overflow-x-auto py-2 border-t border-neutral-900 gap-1 no-scrollbar text-xs">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
              currentTab === 'dashboard' ? 'bg-neutral-800 text-amber-400 font-semibold' : 'text-neutral-400'
            }`}
          >
            Analiză
          </button>
          <button
            onClick={() => onTabChange('catalog')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
              currentTab === 'catalog' ? 'bg-neutral-800 text-amber-400 font-semibold' : 'text-neutral-400'
            }`}
          >
            Catalog
          </button>
          <button
            onClick={() => onTabChange('kanban')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
              currentTab === 'kanban' ? 'bg-neutral-800 text-amber-400 font-semibold' : 'text-neutral-400'
            }`}
          >
            Workflow
          </button>
          <button
            onClick={() => onTabChange('campaigns')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
              currentTab === 'campaigns' ? 'bg-neutral-800 text-amber-400 font-semibold' : 'text-neutral-400'
            }`}
          >
            Reclame
          </button>
          <button
            onClick={() => onTabChange('gallery')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
              currentTab === 'gallery' ? 'bg-neutral-800 text-amber-400 font-semibold' : 'text-neutral-400'
            }`}
          >
            Galerie
          </button>
        </div>
      </div>
    </header>
  );
};
