import React, { useState } from 'react';
import { Product, CampaignStatus } from '../types/product';
import {
  Megaphone,
  TrendingUp,
  ExternalLink,
  DollarSign,
  ShoppingCart,
  Play,
  CheckCircle2,
  Filter,
  Sparkles
} from 'lucide-react';
import { CAMPAIGN_STATUS_LABELS } from '../data/initialProducts';
import { safeFormatNumber } from '../utils/productNormalizer';

interface CampaignsViewProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onOpenAddModal?: () => void;
}

export const CampaignsView: React.FC<CampaignsViewProps> = ({
  products,
  onSelectProduct,
  onOpenAddModal,
}) => {
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all');

  // Calcule totale
  const totalSpend = products.reduce((sum, p) => sum + (Number(p?.campaign?.adSpend) || 0), 0);
  const totalRevenue = products.reduce((sum, p) => sum + (Number(p?.campaign?.revenue) || 0), 0);
  const totalOrders = products.reduce((sum, p) => sum + (Number(p?.campaign?.ordersCount) || 0), 0);
  const globalRoas = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(2) : '0';
  const totalProfit = totalRevenue - totalSpend;
  const winnersCount = products.filter((p) => p?.campaign?.status === 'winner').length;

  // Filtrare produse
  const filteredProducts = products.filter((p) => {
    const c = p?.campaign;
    if (!c) return false;

    const plat = (c.platform || '').toLowerCase();

    if (platformFilter !== 'all') {
      if (platformFilter === 'tiktok' && !plat.includes('tiktok')) return false;
      if (platformFilter === 'facebook' && !plat.includes('facebook') && !plat.includes('meta')) return false;
      if (platformFilter === 'google' && !plat.includes('google')) return false;
    }

    if (statusFilter !== 'all' && (c.status || 'testing') !== statusFilter) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & KPI Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[#0f4a3c]" />
            <span>Campanii Ads & Rezultate Testare (Facebook & TikTok)</span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Monitorizează bugetele de reclamă, veniturile obținute, ROAS-ul și creativurile câștigătoare pentru fiecare produs.
          </p>
        </div>

        {onOpenAddModal && (
          <button
            onClick={onOpenAddModal}
            className="self-start sm:self-auto bg-[#0f4a3c] hover:bg-[#0c3c31] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <span>+ Adaugă test campanie</span>
          </button>
        )}
      </div>

      {/* KPI Global Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
            Buget Total Cheltuit
          </span>
          <span className="font-mono font-bold text-neutral-900 text-lg sm:text-xl tabular-nums mt-1 block">
            {safeFormatNumber(totalSpend)} RON
          </span>
        </div>

        <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
            Venit Total Generat
          </span>
          <span className="font-mono font-bold text-neutral-900 text-lg sm:text-xl tabular-nums mt-1 block">
            {safeFormatNumber(totalRevenue)} RON
          </span>
        </div>

        <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
            ROAS Global
          </span>
          <span className="font-mono font-bold text-[#0f4a3c] text-lg sm:text-xl tabular-nums mt-1 block">
            {globalRoas}x
          </span>
        </div>

        <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
            Profit Net Ads
          </span>
          <span className={`font-mono font-bold text-lg sm:text-xl tabular-nums mt-1 block ${
            totalProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'
          }`}>
            {totalProfit >= 0 ? `+${safeFormatNumber(totalProfit)}` : safeFormatNumber(totalProfit)} RON
          </span>
        </div>

        <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
            Campanii Winner
          </span>
          <span className="font-mono font-bold text-emerald-700 text-lg sm:text-xl tabular-nums mt-1 block">
            {winnersCount} {winnersCount === 1 ? 'produs' : 'produse'}
          </span>
        </div>
      </div>

      {/* Filter Tabs for Platforms & Status */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Platform Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'all', label: 'Toate platformele' },
            { id: 'tiktok', label: 'TikTok Ads' },
            { id: 'facebook', label: 'Facebook Ads' },
            { id: 'google', label: 'Google Ads' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPlatformFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                platformFilter === tab.id
                  ? 'bg-[#0f4a3c] text-white shadow-2xs'
                  : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-400 font-medium">Status campanie:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-1.5 text-xs text-neutral-700 font-semibold focus:outline-none focus:border-[#0f4a3c] cursor-pointer"
          >
            <option value="all">Toate stările</option>
            <option value="untested">Netestat</option>
            <option value="winner">Winner (Scalat)</option>
            <option value="testing">În testare</option>
            <option value="promising">Promițător (Break-even)</option>
            <option value="stopped">Oprit (Necâștigător)</option>
          </select>
        </div>
      </div>

      {/* Campaigns Grid */}
      {filteredProducts.length === 0 ? (
        <div className="border border-dashed border-neutral-200 bg-white rounded-2xl p-12 text-center">
          <Megaphone className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-neutral-900">
            {products.length === 0
              ? 'Nicio campanie adăugată încă'
              : 'Nicio campanie nu corespunde filtrelor selectate'}
          </h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1">
            Adaugă un produs specificând platforma (Facebook Ads / TikTok Ads), bugetul cheltuit și vânzările obținute.
          </p>
          {onOpenAddModal && (
            <button
              onClick={onOpenAddModal}
              className="mt-4 px-4 py-2 bg-[#0f4a3c] hover:bg-[#0c3c31] text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Adaugă primul produs cu campanie
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredProducts.map((product) => {
            const c = product.campaign || {
              platform: 'TikTok Ads',
              status: 'testing',
              adSpend: 0,
              revenue: 0,
              ordersCount: 0,
              roas: 0
            };
            const statusInfo = CAMPAIGN_STATUS_LABELS[c.status] || CAMPAIGN_STATUS_LABELS.testing;
            const net = (c.revenue || 0) - (c.adSpend || 0);

            return (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="cursor-pointer group bg-white hover:border-neutral-300 border border-neutral-200/80 rounded-2xl p-5 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Bar: Platform & Status */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white bg-neutral-900 px-3 py-1 rounded-full shadow-2xs">
                        {c.platform}
                      </span>
                      <span className="text-xs text-neutral-500 font-medium">
                        {product.category}
                      </span>
                    </div>

                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Product preview */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-400">
                          N/A
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-neutral-900 group-hover:text-[#0f4a3c] transition-colors truncate">
                        {product.title}
                      </h3>
                      <div className="text-xs text-neutral-400 mt-0.5">
                        Brand: <span className="text-neutral-700 font-medium">{product.brand}</span> · Preț: <span className="text-neutral-800 font-mono font-semibold">{safeFormatNumber(product.price)} {product.currency || 'RON'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Metrics Box */}
                  <div className="mt-4 grid grid-cols-3 gap-2 bg-[#f8faf9] p-3 rounded-xl border border-neutral-200/60 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block">Buget Cheltuit</span>
                      <span className="font-mono font-bold text-neutral-900 tabular-nums">
                        {safeFormatNumber(c?.adSpend)} {product?.currency || 'RON'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block">Venit Generat</span>
                      <span className="font-mono font-bold text-neutral-900 tabular-nums">
                        {safeFormatNumber(c?.revenue)} {product?.currency || 'RON'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block">ROAS</span>
                      <span className="font-mono font-bold text-[#0f4a3c] tabular-nums">
                        {Number(c?.roas) > 0 ? `${Number(c.roas).toFixed(2)}x` : '—'}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-neutral-100">
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block">Comenzi</span>
                      <span className="font-mono font-semibold text-neutral-800 tabular-nums">
                        {Number(c?.ordersCount) || 0} comenzi
                      </span>
                    </div>

                    <div className="pt-2 border-t border-neutral-100">
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block">CPA</span>
                      <span className="font-mono font-semibold text-neutral-800 tabular-nums">
                        {Number(c?.cpa) > 0 ? `${safeFormatNumber(c.cpa)} ${product?.currency || 'RON'}` : '—'}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-neutral-100">
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block">Profit Net</span>
                      <span className={`font-mono font-bold tabular-nums ${
                        net >= 0 ? 'text-emerald-700' : 'text-rose-600'
                      }`}>
                        {net >= 0 ? `+${safeFormatNumber(net)}` : safeFormatNumber(net)} {product?.currency || 'RON'}
                      </span>
                    </div>
                  </div>

                  {/* Notes / Creative info */}
                  {c.notes && (
                    <div className="mt-3 p-3 bg-white border border-neutral-200/80 rounded-xl text-xs space-y-1">
                      <span className="text-[10px] font-bold text-[#0f4a3c] uppercase block">
                        Creativ câștigător & Note:
                      </span>
                      <p className="text-neutral-700 line-clamp-2 leading-relaxed">
                        {c.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Link & Action */}
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                  {c.campaignUrl ? (
                    <a
                      href={c.campaignUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-neutral-800 hover:text-[#0f4a3c] font-semibold flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Vezi reclama / creativul video</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-neutral-400 italic text-[11px]">Fără link video/reclamă</span>
                  )}

                  <span className="text-[11px] text-neutral-400 font-mono">
                    Testat pe {c.testedAt || product.createdAt}
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
