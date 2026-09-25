import React from 'react';
import { Product, CampaignStatus } from '../types/product';
import { Bookmark, Edit3, Trash2, TrendingUp, Megaphone, Globe, ListChecks } from 'lucide-react';
import { CAMPAIGN_STATUS_LABELS } from '../data/initialProducts';
import { safeFormatNumber, calculateChecklistStats } from '../utils/productNormalizer';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onEdit: (product: Product, e: React.MouseEvent) => void;
  onDelete: (productId: string, e: React.MouseEvent) => void;
  onToggleFavorite: (productId: string, e: React.MouseEvent) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  if (!product || !product.id) return null;

  const campaign = product?.campaign || {
    platform: 'Facebook Ads',
    status: 'testing' as CampaignStatus,
    adSpend: 0,
    revenue: 0,
    ordersCount: 0,
    roas: 0
  };

  const statusInfo = (campaign?.status && CAMPAIGN_STATUS_LABELS[campaign.status])
    ? CAMPAIGN_STATUS_LABELS[campaign.status]
    : (CAMPAIGN_STATUS_LABELS?.testing || {
        label: 'În testare',
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
      });

  const adSpend = Number(campaign?.adSpend) || 0;
  const revenue = Number(campaign?.revenue) || 0;
  const price = Number(product?.price) || 0;
  const roas = Number(campaign?.roas) || (adSpend > 0 ? Number((revenue / adSpend).toFixed(2)) : 0);
  const ordersCount = Number(campaign?.ordersCount) || 0;
  const cpa = Number(campaign?.cpa) || 0;
  const currency = product?.currency || 'RON';
  const checklistStats = calculateChecklistStats(product?.checklist);

  return (
    <div
      onClick={() => onSelect(product)}
      className="group bg-white border border-neutral-200/80 hover:border-neutral-300 rounded-2xl overflow-hidden transition-all duration-200 flex flex-col justify-between cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md"
    >
      <div>
        {/* Image Container with 4:3 ratio */}
        <div className="relative aspect-4/3 w-full bg-neutral-100 overflow-hidden border-b border-neutral-150">
          {product?.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.title || ''}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
              Fără imagine
            </div>
          )}

          {/* Platform & Campaign Status Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 max-w-[80%]">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-neutral-900/90 text-white backdrop-blur-md shadow-2xs">
              {campaign?.platform || 'Facebook Ads'}
            </span>

            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}>
              {statusInfo.label}
            </span>
          </div>

          {/* Favorite Button */}
          <div className="absolute top-3 right-3 flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => onToggleFavorite(product.id, e)}
              className={`p-1.5 rounded-full backdrop-blur-md shadow-2xs transition-colors cursor-pointer ${
                product?.isFavorite
                  ? 'bg-white text-amber-500 fill-amber-500'
                  : 'bg-white/90 text-neutral-600 hover:text-neutral-950'
              }`}
              title="Salvează la favorite"
            >
              <Bookmark className="w-3.5 h-3.5" fill={product?.isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-2.5">
          {/* Metadata: Brand and Category */}
          <div className="text-[11px] text-neutral-500 font-medium truncate">
            <span>{product?.brand || 'General'}</span>
            <span className="mx-1.5 text-neutral-300">·</span>
            <span className="text-neutral-700 font-semibold">{product?.category || 'Altele'}</span>
          </div>

          {/* Title */}
          <h3 className="text-sm font-bold text-neutral-900 group-hover:text-[#0f4a3c] transition-colors line-clamp-2 leading-snug">
            {product?.title || 'Fără titlu'}
          </h3>

          {/* Site Destinație & Progres Checklist Lansare */}
          {(product.targetSite || checklistStats.completed > 0) && (
            <div className="flex items-center justify-between text-[11px] gap-2 py-1 px-2.5 bg-blue-50/70 rounded-xl border border-blue-200/60">
              <span className="font-semibold text-blue-900 truncate flex items-center gap-1.5 min-w-0">
                <Globe className="w-3 h-3 text-blue-600 shrink-0" />
                <span className="truncate">{product.targetSite || 'Site planificat'}</span>
              </span>
              <span className="font-mono text-[10px] font-bold text-blue-700 shrink-0 flex items-center gap-1 bg-white/80 px-1.5 py-0.5 rounded-md border border-blue-200/50">
                <ListChecks className="w-3 h-3 text-blue-600" />
                <span>{checklistStats.completed}/{checklistStats.total}</span>
              </span>
            </div>
          )}

          {/* Campaign Performance Box */}
          <div className="bg-[#f8faf9] border border-neutral-200/60 rounded-xl p-2.5 space-y-1.5">
            {campaign?.status === 'untested' && adSpend === 0 ? (
              <div className="py-0.5 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500 text-[11px]">Performanță Ads:</span>
                  <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[10px]">
                    Netestat încă
                  </span>
                </div>
                <p className="text-[10px] text-neutral-400">
                  Gata pentru testare pe Facebook / TikTok
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500 text-[11px]">Performanță Ads:</span>
                  <span className={`font-mono font-bold text-xs ${
                    roas >= 2.5
                      ? 'text-emerald-700'
                      : roas >= 1.5
                      ? 'text-[#0f4a3c]'
                      : 'text-neutral-700'
                  }`}>
                    {roas > 0 ? `${roas.toFixed(2)}x ROAS` : 'ROAS: —'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-600 tabular-nums">
                  <span>Spend: <strong>{safeFormatNumber(adSpend)} {currency}</strong></span>
                  <span>Venit: <strong className="text-neutral-900">{safeFormatNumber(revenue)} {currency}</strong></span>
                </div>

                {ordersCount > 0 && (
                  <div className="text-[10px] text-neutral-400 font-mono flex items-center justify-between pt-1 border-t border-neutral-100">
                    <span>Comenzi: <strong className="text-neutral-800">{ordersCount}</strong></span>
                    {cpa > 0 && (
                      <span>CPA: <strong className="text-neutral-800">{safeFormatNumber(cpa)} {currency}</strong></span>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer: Selling Price & Actions */}
      <div className="px-4 py-3 border-t border-neutral-100 flex items-center justify-between bg-neutral-50/50">
        <div>
          <span className="text-sm font-mono font-bold text-neutral-900 tabular-nums">
            {safeFormatNumber(price)} {currency}
          </span>
          <span className="text-[10px] text-neutral-400 block -mt-0.5">preț vânzare</span>
        </div>

        <div className="flex items-center gap-1 text-neutral-400" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={(e) => onEdit(product, e)}
            className="p-1 rounded-md hover:bg-neutral-200/60 hover:text-neutral-900 transition-colors cursor-pointer"
            title="Editează"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => onDelete(product.id, e)}
            className="p-1 rounded-md hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
            title="Șterge"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

