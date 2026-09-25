import React, { useState } from 'react';
import { Supplier } from '../types/supplier';
import { Product } from '../types/product';
import {
  Building2,
  Plus,
  Search,
  ExternalLink,
  Phone,
  Mail,
  MessageSquare,
  Star,
  Package,
  Edit3,
  Trash2,
  Copy,
  Check,
  Globe,
  User,
  ShoppingBag,
  Award,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface SuppliersViewProps {
  suppliers: Supplier[];
  products: Product[];
  onOpenAddModal: () => void;
  onEditSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (supplierId: string) => void;
  onSelectProductByTitle?: (productTitle: string) => void;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({
  suppliers,
  products,
  onOpenAddModal,
  onEditSupplier,
  onDeleteSupplier,
  onSelectProductByTitle,
}) => {
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Platform badges styling
  const getPlatformBadge = (platform: string) => {
    const p = (platform || '').toLowerCase();
    if (p.includes('aliexpress')) {
      return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
    }
    if (p.includes('1688')) {
      return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
    }
    if (p.includes('alibaba')) {
      return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' };
    }
    if (p.includes('cj')) {
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    }
    if (p.includes('taobao')) {
      return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
    }
    if (p.includes('temu')) {
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    }
    if (p.includes('local') || p.includes('românia')) {
      return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
    }
    return { bg: 'bg-neutral-100', text: 'text-neutral-700', border: 'border-neutral-200' };
  };

  const handleCopyWeChat = (wechat: string, id: string) => {
    navigator.clipboard.writeText(wechat);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Calcule statistici
  const totalSuppliers = suppliers.length;
  const uniquePlatforms = Array.from(new Set(suppliers.map((s) => s.platform).filter(Boolean))).length;
  const totalProductsPurchased = suppliers.reduce((sum, s) => sum + (s.purchasedProducts?.length || 0), 0);
  const topRatedCount = suppliers.filter((s) => (s.rating || 5) >= 5).length;

  // Extragere platforme unice pentru filtrare
  const allPlatforms = Array.from(new Set(suppliers.map((s) => s.platform).filter(Boolean)));

  // Filtrare furnizori
  const filteredSuppliers = suppliers.filter((s) => {
    const q = search.toLowerCase().trim();
    if (platformFilter !== 'all' && s.platform !== platformFilter) {
      return false;
    }

    if (!q) return true;

    const matchName = (s.name || '').toLowerCase().includes(q);
    const matchPlatform = (s.platform || '').toLowerCase().includes(q);
    const matchContact = (s.contactPerson || '').toLowerCase().includes(q);
    const matchPhone = (s.phone || '').toLowerCase().includes(q);
    const matchEmail = (s.email || '').toLowerCase().includes(q);
    const matchWechat = (s.wechat || '').toLowerCase().includes(q);
    const matchNotes = (s.notes || '').toLowerCase().includes(q);
    const matchProduct = (s.purchasedProducts || []).some((prod) => prod.toLowerCase().includes(q));

    return (
      matchName ||
      matchPlatform ||
      matchContact ||
      matchPhone ||
      matchEmail ||
      matchWechat ||
      matchNotes ||
      matchProduct
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & Buton Adăugare */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#0f4a3c]" />
            <span>Contacte Furnizori</span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Agenda ta de furnizori (AliExpress, 1688, Alibaba, CJ, Fabrici), date de contact și istoricul produselor cumpărate.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0f4a3c] hover:bg-[#0c3c31] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Adaugă Furnizor</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Total Furnizori
            </span>
            <Building2 className="w-4 h-4 text-[#0f4a3c]" />
          </div>
          <span className="font-mono font-bold text-neutral-900 text-xl sm:text-2xl tabular-nums mt-1 block">
            {totalSuppliers}
          </span>
          <span className="text-[10px] text-neutral-400 mt-0.5 block">parteneri înregistrați</span>
        </div>

        <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Platforme Sursă
            </span>
            <Globe className="w-4 h-4 text-blue-600" />
          </div>
          <span className="font-mono font-bold text-neutral-900 text-xl sm:text-2xl tabular-nums mt-1 block">
            {uniquePlatforms}
          </span>
          <span className="text-[10px] text-neutral-400 mt-0.5 block">canale aprovizionare</span>
        </div>

        <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Produse Aprovizionate
            </span>
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="font-mono font-bold text-neutral-900 text-xl sm:text-2xl tabular-nums mt-1 block">
            {totalProductsPurchased}
          </span>
          <span className="text-[10px] text-neutral-400 mt-0.5 block">asocieri cu catalogul</span>
        </div>

        <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Rating 5 Stele
            </span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <span className="font-mono font-bold text-amber-700 text-xl sm:text-2xl tabular-nums mt-1 block">
            {topRatedCount}
          </span>
          <span className="text-[10px] text-neutral-400 mt-0.5 block">furnizori de încredere</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Căutare */}
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Caută furnizor, produs cumpărat, WhatsApp, WeChat..."
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#0f4a3c] focus:bg-white transition-all"
            />
          </div>

          <span className="text-xs font-mono text-neutral-500 tabular-nums self-end sm:self-center">
            {filteredSuppliers.length} {filteredSuppliers.length === 1 ? 'furnizor găsit' : 'furnizori găsiți'}
          </span>
        </div>

        {/* Platform Chips */}
        {allPlatforms.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-neutral-100">
            <button
              onClick={() => setPlatformFilter('all')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer shrink-0 ${
                platformFilter === 'all'
                  ? 'bg-[#0f4a3c] text-white font-semibold'
                  : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Toate ({suppliers.length})
            </button>
            {allPlatforms.map((plat) => {
              const count = suppliers.filter((s) => s.platform === plat).length;
              return (
                <button
                  key={plat}
                  onClick={() => setPlatformFilter(plat)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer shrink-0 ${
                    platformFilter === plat
                      ? 'bg-[#0f4a3c] text-white font-semibold'
                      : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {plat} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid Furnizori */}
      {filteredSuppliers.length === 0 ? (
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-12 text-center shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              {search || platformFilter !== 'all' ? 'Niciun furnizor nu corespunde căutării' : 'Niciun furnizor adăugat încă'}
            </h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1">
              {search || platformFilter !== 'all'
                ? 'Încearcă să resetezi filtrele sau termenul de căutare.'
                : 'Păstrează o evidență clară a agenților, magazinelor de pe AliExpress/1688 și a produselor pe care le comanzi de la fiecare.'}
            </p>
          </div>
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0f4a3c] text-white rounded-xl text-xs font-semibold hover:bg-[#0c3c31] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adaugă primul tău furnizor</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredSuppliers.map((supplier) => {
            const badgeStyle = getPlatformBadge(supplier.platform);
            const cleanPhone = (supplier.phone || '').replace(/[^0-9]/g, '');

            return (
              <div
                key={supplier.id}
                className="bg-white border border-neutral-200/80 hover:border-neutral-300 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                {/* Header Card: Platformă, Nume, Rating & Link */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                    >
                      {supplier.platform}
                    </span>

                    {/* Rating stele */}
                    <div className="flex items-center gap-0.5" title={`Rating: ${supplier.rating || 5} din 5`}>
                      {[1, 2, 3, 4, 5].map((st) => (
                        <Star
                          key={st}
                          className={`w-3.5 h-3.5 ${
                            st <= (supplier.rating || 5)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-neutral-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-neutral-900 leading-snug">
                      {supplier.name}
                    </h3>
                    {supplier.contactPerson && (
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-0.5">
                        <User className="w-3 h-3 text-neutral-400" />
                        <span>Contact: <strong>{supplier.contactPerson}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Link Magazin */}
                  {supplier.link && (
                    <a
                      href={supplier.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#0f4a3c] font-semibold hover:underline bg-[#eaf3ee] px-2.5 py-1 rounded-lg border border-[#cfe5d9] transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Deschide Magazin / Profil</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  )}
                </div>

                {/* Date de Contact Rapide */}
                <div className="bg-neutral-50 border border-neutral-200/60 rounded-xl p-3 space-y-2 text-xs">
                  {supplier.phone && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-neutral-400 text-[11px] flex items-center gap-1">
                        <Phone className="w-3 h-3" /> Tel/WhatsApp:
                      </span>
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${supplier.phone}`}
                          className="font-mono font-medium text-neutral-800 hover:text-[#0f4a3c] hover:underline"
                        >
                          {supplier.phone}
                        </a>
                        {cleanPhone.length >= 8 && (
                          <a
                            href={`https://wa.me/${cleanPhone}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded text-[10px] font-bold transition-colors"
                            title="Chat WhatsApp"
                          >
                            WA
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {supplier.email && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-neutral-400 text-[11px] flex items-center gap-1">
                        <Mail className="w-3 h-3" /> Email:
                      </span>
                      <a
                        href={`mailto:${supplier.email}`}
                        className="font-medium text-neutral-800 hover:text-[#0f4a3c] hover:underline truncate max-w-[180px]"
                        title={supplier.email}
                      >
                        {supplier.email}
                      </a>
                    </div>
                  )}

                  {supplier.wechat && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-neutral-400 text-[11px] flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> WeChat ID:
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono font-semibold text-neutral-800 bg-white px-1.5 py-0.5 rounded border border-neutral-200 text-[11px]">
                          {supplier.wechat}
                        </span>
                        <button
                          onClick={() => handleCopyWeChat(supplier.wechat!, supplier.id)}
                          className="p-1 text-neutral-400 hover:text-neutral-700 rounded transition-colors cursor-pointer"
                          title="Copiază ID WeChat"
                        >
                          {copiedId === supplier.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {!supplier.phone && !supplier.email && !supplier.wechat && (
                    <span className="text-[11px] text-neutral-400 italic block">
                      Fără detalii de telefon sau chat salvate
                    </span>
                  )}
                </div>

                {/* Produse cumpărate de la el */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-[#0f4a3c]" />
                      <span>Produse Cumpărate:</span>
                    </span>
                    <span className="font-mono text-neutral-400 font-normal">
                      {supplier.purchasedProducts?.length || 0}
                    </span>
                  </div>

                  {supplier.purchasedProducts && supplier.purchasedProducts.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {supplier.purchasedProducts.map((prodName, idx) => {
                        const inCatalog = products.some(
                          (p) => p.title.toLowerCase() === prodName.toLowerCase()
                        );
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              if (inCatalog && onSelectProductByTitle) {
                                onSelectProductByTitle(prodName);
                              }
                            }}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                              inCatalog
                                ? 'bg-[#f0f7f3] text-[#0f4a3c] border border-[#cfe5d9] hover:bg-[#e2f1e8] cursor-pointer'
                                : 'bg-neutral-100 text-neutral-700 border border-neutral-200/80 cursor-default'
                            }`}
                            title={inCatalog ? 'Vezi produsul în catalog' : ''}
                          >
                            <span>{prodName}</span>
                            {inCatalog && <ArrowUpRight className="w-3 h-3 opacity-60" />}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-xs text-neutral-400 italic py-1">
                      Niciun produs asociat încă
                    </div>
                  )}
                </div>

                {/* Note despre furnizor */}
                {supplier.notes && (
                  <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-2.5 text-xs text-amber-950 leading-relaxed">
                    <span className="font-bold text-amber-800 text-[10px] uppercase tracking-wider block mb-0.5">
                      Note & Condiții:
                    </span>
                    <p className="line-clamp-2">{supplier.notes}</p>
                  </div>
                )}

                {/* Footer Card: Acțiuni Editează / Șterge */}
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
                  <span className="text-[10px] font-mono">
                    Adăugat pe {supplier.createdAt}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditSupplier(supplier)}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                      title="Editează furnizor"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Ești sigur că vrei să ștergi furnizorul "${supplier.name}"?`)) {
                          onDeleteSupplier(supplier.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Șterge furnizor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
