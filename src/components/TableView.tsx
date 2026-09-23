import React from 'react';
import { Product, CampaignStatus } from '../types/product';
import { Edit3, Trash2, Megaphone } from 'lucide-react';
import { CAMPAIGN_STATUS_LABELS } from '../data/initialProducts';

interface TableViewProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onEditProduct: (product: Product, e: React.MouseEvent) => void;
  onDeleteProduct: (productId: string, e: React.MouseEvent) => void;
  onUpdateCampaignStatus: (productId: string, newStatus: CampaignStatus) => void;
}

export const TableView: React.FC<TableViewProps> = ({
  products,
  onSelectProduct,
  onEditProduct,
  onDeleteProduct,
  onUpdateCampaignStatus,
}) => {
  return (
    <div className="bg-white border border-neutral-200/80 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-3.5 px-4">Produs & Brand</th>
              <th className="py-3.5 px-4">Categorie</th>
              <th className="py-3.5 px-4">Platformă Ads</th>
              <th className="py-3.5 px-4">Status Campanie</th>
              <th className="py-3.5 px-4">Ad Spend</th>
              <th className="py-3.5 px-4">Venit</th>
              <th className="py-3.5 px-4">ROAS</th>
              <th className="py-3.5 px-4">Comenzi</th>
              <th className="py-3.5 px-4">Preț Produs</th>
              <th className="py-3.5 px-4 text-right">Acțiuni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {products.map((product) => {
              const c = product.campaign || {
                platform: 'TikTok Ads',
                status: 'testing',
                adSpend: 0,
                revenue: 0,
                ordersCount: 0,
                roas: 0
              };
              const statusInfo = CAMPAIGN_STATUS_LABELS[c.status] || CAMPAIGN_STATUS_LABELS.testing;

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
                  <td className="py-3 px-4 text-neutral-700 font-semibold">
                    <span className="bg-neutral-100 px-2 py-0.5 rounded-md">
                      {product.category}
                    </span>
                  </td>

                  {/* Platform */}
                  <td className="py-3 px-4">
                    <span className="font-bold text-neutral-900 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-full text-[11px]">
                      {c.platform}
                    </span>
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={c.status}
                      onChange={(e) => onUpdateCampaignStatus(product.id, e.target.value as CampaignStatus)}
                      className={`text-[11px] font-bold rounded-full px-2.5 py-1 border cursor-pointer focus:outline-none shadow-2xs ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}
                    >
                      <option value="testing">În testare</option>
                      <option value="winner">Winner (Scalat)</option>
                      <option value="promising">Promițător (Break-even)</option>
                      <option value="stopped">Oprit (Necâștigător)</option>
                    </select>
                  </td>

                  {/* Spend */}
                  <td className="py-3 px-4 font-mono font-semibold text-neutral-800 tabular-nums">
                    {c.adSpend.toLocaleString('ro-RO')} {product.currency}
                  </td>

                  {/* Revenue */}
                  <td className="py-3 px-4 font-mono font-bold text-neutral-900 tabular-nums">
                    {c.revenue.toLocaleString('ro-RO')} {product.currency}
                  </td>

                  {/* ROAS */}
                  <td className="py-3 px-4 font-mono font-bold tabular-nums">
                    <span className={`px-2 py-0.5 rounded-md ${
                      c.roas && c.roas >= 2.5
                        ? 'bg-emerald-50 text-emerald-700 font-bold'
                        : c.roas && c.roas >= 1.5
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-neutral-500'
                    }`}>
                      {c.roas && c.roas > 0 ? `${c.roas.toFixed(2)}x` : '—'}
                    </span>
                  </td>

                  {/* Orders */}
                  <td className="py-3 px-4 font-mono text-neutral-700">
                    {c.ordersCount}
                  </td>

                  {/* Selling Price */}
                  <td className="py-3 px-4 font-mono font-bold text-neutral-900 tabular-nums">
                    {product.price.toLocaleString('ro-RO')} {product.currency}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={(e) => onEditProduct(product, e)}
                        className="p-1 rounded-md text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                        title="Editează"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => onDeleteProduct(product.id, e)}
                        className="p-1 rounded-md text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Șterge"
                      >
                        <Trash2 className="w-4 h-4" />
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
