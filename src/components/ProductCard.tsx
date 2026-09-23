import React from 'react';
import { Product } from '../types/product';
import { Star, Bookmark, ExternalLink, MoreVertical, Edit3, Trash2 } from 'lucide-react';
import { STATUS_LABELS, VERDICT_LABELS, SPONSORSHIP_LABELS } from '../data/initialProducts';

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
  const statusInfo = STATUS_LABELS[product.status] || STATUS_LABELS.to_test;
  const verdictInfo = product.verdict ? VERDICT_LABELS[product.verdict] : null;
  const sponsorshipInfo = SPONSORSHIP_LABELS[product.sponsorship];

  return (
    <div
      onClick={() => onSelect(product)}
      className="group bg-white border border-neutral-200/80 hover:border-neutral-300 rounded-2xl overflow-hidden transition-all duration-200 flex flex-col justify-between cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md"
    >
      <div>
        {/* Image Container with 4:3 ratio */}
        <div className="relative aspect-4/3 w-full bg-neutral-100 overflow-hidden border-b border-neutral-100">
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

          {/* Status Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-md shadow-2xs ${
                product.status === 'tested'
                  ? 'bg-emerald-600 text-white'
                  : product.status === 'testing'
                  ? 'bg-amber-500 text-white'
                  : product.status === 'rejected'
                  ? 'bg-rose-500 text-white'
                  : 'bg-neutral-800 text-white'
              }`}
            >
              {statusInfo.label}
            </span>

            {product.sponsorship !== 'personal' && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/95 text-neutral-800 backdrop-blur-md shadow-2xs border border-neutral-200/60">
                {sponsorshipInfo?.label.split(' ')[0]}
              </span>
            )}
          </div>

          {/* Favorite & Quick Actions */}
          <div className="absolute top-3 right-3 flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => onToggleFavorite(product.id, e)}
              className={`p-1.5 rounded-full backdrop-blur-md shadow-2xs transition-colors ${
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
            <span>{product.category}</span>
          </div>

          {/* Title */}
          <h3 className="text-sm font-bold text-neutral-900 group-hover:text-[#0f4a3c] transition-colors line-clamp-2 leading-snug">
            {product.title}
          </h3>

          {/* Rating and Verdict */}
          <div className="flex items-center justify-between pt-1">
            {product.overallRating && product.overallRating > 0 ? (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </div>
                <span className="text-xs font-mono font-bold text-neutral-900 tabular-nums">
                  {product.overallRating.toFixed(1)}
                </span>
                <span className="text-[10px] text-neutral-400">/ 5.0</span>
              </div>
            ) : (
              <span className="text-[11px] text-neutral-400 italic">Netestat</span>
            )}

            {verdictInfo && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${verdictInfo.border} ${verdictInfo.color}`}>
                {verdictInfo.label}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer: Price and Actions */}
      <div className="px-4 py-3 border-t border-neutral-100 flex items-center justify-between bg-neutral-50/50">
        <div>
          <span className="text-sm font-mono font-bold text-neutral-900 tabular-nums">
            {product.price.toLocaleString('ro-RO')} {product.currency}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-[11px] text-neutral-400 line-through ml-1.5 font-mono">
              {product.originalPrice}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-neutral-400" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={(e) => onEdit(product, e)}
            className="p-1 rounded hover:bg-neutral-200/60 hover:text-neutral-900 transition-colors"
            title="Editează"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => onDelete(product.id, e)}
            className="p-1 rounded hover:bg-rose-50 hover:text-rose-600 transition-colors"
            title="Șterge"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
