import React from 'react';
import { Product } from '../types/product';
import { Bookmark, Edit3, Trash2, TrendingUp, Megaphone } from 'lucide-react';
import { CAMPAIGN_STATUS_LABELS } from '../data/initialProducts';

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
  const campaign = product.campaign || {
    platform: 'TikTok Ads',
    status: 'testing',
    adSpend: 0,
    revenue: 0,
    ordersCount: 0,
    roas: 0
  };

  const statusInfo = CAMPAIGN_STATUS_LABELS[campaign.status] || CAMPAIGN_STATUS_LABELS.testing;

  return (
    <div
      onClick={() => onSelect(product)}
      className="group bg-white border border-neutral-200/80 hover:border-neutral-300 rounded-2xl overflow-hidden transition-all duration-200 flex flex-col justify-between cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md"
    >
      <div>
        {/* Image Container with 4:3 ratio */}
        <div className="relative aspect-4/3 w-full bg-neutral-100 overflow-hidden border-b border-neutral-150">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.title}
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
              {campaign.platform || 'Ads'}
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
                product.isFavorite
                  ? 'bg-white text-amber-500 fill-amber-500'
                  : 'bg-white/90 text-neutral-600 hover:text-neutral-950'
              }`}
              title="Salvează la favorite"
            >
              <Bookmark className="w-3.5 h-3.5" fill={product.isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-2.5">
          {/* Metadata: Brand and Category */}
          <div className="text-[11px] text-neutral-500 font-medium truncate">
            <span>{product.brand}</span>
            <span className="mx-1.5 text-neutral-300">·</span>
            <span className="text-neutral-700 font-semibold">{product.category}</span>
          </div>

          {/* Title */}
          <h3 className="text-sm font-bold text-neutral-900 group-hover:text-[#0f4a3c] transition-colors line-clamp-2 leading-snug">
            {product.title}
          </h3>

          {/* Campaign Performance Box */}
          <div className="bg-[#f8faf9] border border-neutral-200/60 rounded-xl p-2.5 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500 text-[11px]">Performanță Ads:</span>
              <span className={`font-mono font-bold text-xs ${
                campaign.roas && campaign.roas >= 2.5
                  ? 'text-emerald-700'
                  : campaign.roas && campaign.roas >= 1.5
                  ? 'text-[#0f4a3c]'
                  : 'text-neutral-700'
              }`}>
                {campaign.roas && campaign.roas > 0 ? `${campaign.roas.toFixed(2)}x ROAS` : 'ROAS: —'}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-600 tabular-nums">
              <span>Spend: <strong>{campaign.adSpend.toLocaleString('ro-RO')} {product.currency}</strong></span>
              <span>Venit: <strong className="text-neutral-900">{campaign.revenue.toLocaleString('ro-RO')} {product.currency}</strong></span>
            </div>

            {campaign.ordersCount > 0 && (
              <div className="text-[10px] text-neutral-400 font-mono flex items-center justify-between pt-1 border-t border-neutral-100">
                <span>Comenzi: <strong className="text-neutral-800">{campaign.ordersCount}</strong></span>
                {campaign.cpa && campaign.cpa > 0 && (
                  <span>CPA: <strong className="text-neutral-800">{campaign.cpa} {product.currency}</strong></span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer: Selling Price & Actions */}
      <div className="px-4 py-3 border-t border-neutral-100 flex items-center justify-between bg-neutral-50/50">
        <div>
          <span className="text-sm font-mono font-bold text-neutral-900 tabular-nums">
            {product.price.toLocaleString('ro-RO')} {product.currency}
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
