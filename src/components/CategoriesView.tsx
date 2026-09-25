import React, { useState } from 'react';
import { Product } from '../types/product';
import { FolderTree, Plus, Trash2, ArrowUpRight, TrendingUp, Layers, Check, Sparkles, Edit2, X } from 'lucide-react';
import { safeFormatNumber } from '../utils/productNormalizer';

interface CategoriesViewProps {
  categories: string[];
  products: Product[];
  onAddCategory: (categoryName: string) => void;
  onDeleteCategory: (categoryName: string) => void;
  onRenameCategory?: (oldName: string, newName: string) => void;
  onSelectCategoryFilter: (categoryName: string) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  products,
  onAddCategory,
  onDeleteCategory,
  onRenameCategory,
  onSelectCategoryFilter,
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) {
      setErrorMsg('Te rugăm să introduci un nume pentru categorie.');
      return;
    }
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMsg('Această categorie există deja.');
      return;
    }

    onAddCategory(trimmed);
    setNewCatName('');
    setErrorMsg('');
    setIsAdding(false);
  };

  const handleSaveRename = (oldName: string) => {
    const trimmed = editingCatName.trim();
    if (!trimmed) {
      setEditingCat(null);
      return;
    }
    if (trimmed.toLowerCase() !== oldName.toLowerCase() && categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      alert('Există deja o categorie cu acest nume.');
      return;
    }

    if (onRenameCategory) {
      onRenameCategory(oldName, trimmed);
    }
    setEditingCat(null);
    setEditingCatName('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-[#0f4a3c]" />
            <span>Gestionare Categorii Produse</span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Adaugă și organizează categoriile manual. Toate categoriile definite aici vor apărea la adăugarea produselor și în filtre.
          </p>
        </div>

        <button
          onClick={() => {
            setIsAdding(!isAdding);
            setErrorMsg('');
          }}
          className="self-start sm:self-auto bg-[#0f4a3c] hover:bg-[#0c3c31] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{isAdding ? 'Anulează' : 'Adaugă categorie nouă'}</span>
        </button>
      </div>

      {/* Inline Add Category Form */}
      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="bg-white border-2 border-[#0f4a3c]/30 rounded-2xl p-5 shadow-sm space-y-3 animate-in fade-in duration-200"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-[#0f4a3c] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Creează o categorie nouă</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              autoFocus
              value={newCatName}
              onChange={(e) => {
                setNewCatName(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="Ex: Electrocasnice & Bucătărie, Ceasuri Smart, Bijuterii..."
              className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#0f4a3c] focus:bg-white"
            />
            <button
              type="submit"
              className="bg-[#0f4a3c] hover:bg-[#0c3c31] text-white px-5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Salvează categoria</span>
            </button>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-600 font-medium">{errorMsg}</p>
          )}
        </form>
      )}

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className="border border-dashed border-neutral-200 bg-white rounded-2xl p-12 text-center">
          <Layers className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-neutral-900">Nicio categorie creată încă</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
            Apasă pe butonul de mai sus pentru a defini prima ta categorie de produse.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const catProducts = products.filter((p) => (p.category || '').toLowerCase() === cat.toLowerCase());
            const totalSpend = catProducts.reduce((sum, p) => sum + (p.campaign?.adSpend || 0), 0);
            const totalRev = catProducts.reduce((sum, p) => sum + (p.campaign?.revenue || 0), 0);
            const avgRoas = totalSpend > 0 ? (totalRev / totalSpend).toFixed(2) : '-';
            const winnerCount = catProducts.filter((p) => p.campaign?.status === 'winner').length;

            return (
              <div
                key={cat}
                className="bg-white border border-neutral-200/80 hover:border-neutral-300 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    {editingCat === cat ? (
                      <div className="flex items-center gap-1.5 flex-1 mr-2">
                        <input
                          type="text"
                          value={editingCatName}
                          autoFocus
                          onChange={(e) => setEditingCatName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(cat);
                            if (e.key === 'Escape') setEditingCat(null);
                          }}
                          className="w-full text-xs font-bold bg-neutral-50 border border-[#0f4a3c] rounded-lg px-2 py-1 text-neutral-900 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveRename(cat)}
                          className="p-1 bg-[#0f4a3c] text-white rounded-md hover:bg-[#0c3c31] transition-colors cursor-pointer"
                          title="Salvează"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCat(null)}
                          className="p-1 text-neutral-400 hover:text-neutral-700 rounded-md transition-colors cursor-pointer"
                          title="Anulează"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-neutral-900 bg-neutral-100 group-hover:bg-[#eaf3ee] group-hover:text-[#0f4a3c] transition-colors px-3 py-1 rounded-xl">
                        {cat}
                      </span>
                    )}

                    {editingCat !== cat && (
                      <div className="flex items-center gap-1">
                        {onRenameCategory && (
                          <button
                            onClick={() => {
                              setEditingCat(cat);
                              setEditingCatName(cat);
                            }}
                            className="p-1 text-neutral-400 hover:text-[#0f4a3c] hover:bg-[#eaf3ee] rounded-lg transition-colors cursor-pointer"
                            title="Redenumește categoria"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (window.confirm(`Ești sigur că vrei să ștergi categoria "${cat}"?`)) {
                              onDeleteCategory(cat);
                            }
                          }}
                          className="p-1 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Șterge categoria"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-neutral-100 text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-400 block uppercase font-medium">Produse</span>
                      <span className="font-mono font-bold text-neutral-900 tabular-nums">
                        {catProducts.length} {catProducts.length === 1 ? 'produs' : 'produse'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-neutral-400 block uppercase font-medium">Campanii Winner</span>
                      <span className="font-mono font-bold text-emerald-700 tabular-nums">
                        {winnerCount}
                      </span>
                    </div>

                    <div className="mt-1">
                      <span className="text-[10px] text-neutral-400 block uppercase font-medium">Spend Total</span>
                      <span className="font-mono font-semibold text-neutral-700 tabular-nums">
                        {safeFormatNumber(totalSpend)} RON
                      </span>
                    </div>

                    <div className="mt-1">
                      <span className="text-[10px] text-neutral-400 block uppercase font-medium">ROAS Mediu</span>
                      <span className="font-mono font-bold text-[#0f4a3c] tabular-nums">
                        {avgRoas !== '-' ? `${avgRoas}x` : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <button
                    onClick={() => onSelectCategoryFilter(cat)}
                    className="text-xs text-[#0f4a3c] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Filtrează produsele</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    {totalRev > 0 ? `Venit: ${safeFormatNumber(totalRev)} RON` : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
