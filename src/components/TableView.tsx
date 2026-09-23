import React from 'react';
import { Product, ProductStatus } from '../types/product';
import { Star, ExternalLink, Edit3, Trash2 } from 'lucide-react';
import { STATUS_LABELS, VERDICT_LABELS, SPONSORSHIP_LABELS } from '../data/initialProducts';

interface TableViewProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onEditProduct: (product: Product, e: React.MouseEvent) => void;
  onDeleteProduct: (productId: string, e: React.MouseEvent) => void;
  onUpdateStatus: (productId: string, newStatus: ProductStatus) => void;
}

export const TableView: React.FC<TableViewProps> = ({
  products,
  onSelectProduct,
  onEditProduct,
  onDeleteProduct,
  onUpdateStatus,
}) => {
  return (
    <div className="bg-white border border-neutral-200/80 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-3.5 px-4">Produs & Brand</th>
              <th className="py-3.5 px-4">Categorie</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Preț</th>
              <th className="py-3.5 px-4">Rating</th>
              <th className="py-3.5 px-4">Verdict</th>
              <th className="py-3.5 px-4">Finanțare</th>
              <th className="py-3.5 px-4 text-right">Acțiuni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {products.map((product) => {
              const statusInfo = STATUS_LABELS[product.status] || STATUS_LABELS.to_test;
              const verdictInfo = product.verdict ? VERDICT_LABELS[product.verdict] : null;
              const sponsorshipInfo = SPONSORSHIP_LABELS[product.sponsorship];

              return (
                <tr
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="hover:bg-neutral-50/80 transition-colors cursor-pointer group"
                >
                  {/* Product Title & Thumbnail */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-400">
                            N/A
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 max-w-xs">
                        <div className="font-bold text-neutral-900 truncate group-hover:text-[#0f4a3c] transition-colors">
                          {product.title}
                        </div>
                        <div className="text-[11px] text-neutral-400 truncate">
                          {product.brand}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4 text-neutral-600 font-medium">
                    {product.category}
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={product.status}
                      onChange={(e) => onUpdateStatus(product.id, e.target.value as ProductStatus)}
                      className={`text-[11px] font-semibold rounded-full px-2.5 py-1 border cursor-pointer focus:outline-none ${
                        product.status === 'tested'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : product.status === 'testing'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : product.status === 'rejected'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                      }`}
                    >
                      <option value="to_test">De testat</option>
                      <option value="testing">În testare</option>
                      <option value="tested">Testat</option>
                      <option value="rejected">Respins</option>
                    </select>
                  </td>

                  {/* Price */}
                  <td className="py-3 px-4 font-mono font-bold text-neutral-900 tabular-nums">
                    {product.price.toLocaleString('ro-RO')} {product.currency}
                  </td>

                  {/* Rating */}
                  <td className="py-3 px-4">
                    {product.overallRating && product.overallRating > 0 ? (
                      <div className="flex items-center gap-1 font-mono text-xs text-neutral-900 font-semibold">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>{product.overallRating.toFixed(1)}</span>
                      </div>
                    ) : (
                      <span className="text-neutral-400 italic text-[11px]">—</span>
                    )}
                  </td>

                  {/* Verdict */}
                  <td className="py-3 px-4">
                    {verdictInfo ? (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${verdictInfo.border} ${verdictInfo.color}`}>
                        {verdictInfo.label}
                      </span>
                    ) : (
                      <span className="text-neutral-400 italic text-[11px]">—</span>
                    )}
                  </td>

                  {/* Sponsorship */}
                  <td className="py-3 px-4">
                    <span className="text-[11px] text-neutral-600">
                      {sponsorshipInfo?.label.split(' ')[0]}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1 text-neutral-400">
                      <button
                        type="button"
                        onClick={(e) => onEditProduct(product, e)}
                        className="p-1 rounded hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                        title="Editează"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => onDeleteProduct(product.id, e)}
                        className="p-1 rounded hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        title="Șterge"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
