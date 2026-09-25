import React from 'react';
import { Product, CampaignStatus } from '../types/product';
import { Edit3, Trash2, Megaphone, Globe, ListChecks } from 'lucide-react';
import { CAMPAIGN_STATUS_LABELS } from '../data/initialProducts';
import { safeFormatNumber, calculateChecklistStats } from '../utils/productNormalizer';

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
              <th className="py-3.5 px-4">Site Destinație & Checklist</th>
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
              if (!product || !product.id) return null;
              const c = product?.campaign || {
                platform: 'Facebook Ads',
                status: 'testing' as CampaignStatus,
                adSpend: 0,
                revenue: 0,
                ordersCount: 0,
                roas: 0
              };
              const statusInfo = (c?.status && CAMPAIGN_STATUS_LABELS[c.status])
                ? CAMPAIGN_STATUS_LABELS[c.status]
                : (CAMPAIGN_STATUS_LABELS?.testing || {
                    label: 'În testare',
                    color: 'text-amber-700',
                    bg: 'bg-amber-50',
                    border: 'border-amber-200',
                  });

              const adSpend = Number(c?.adSpend) || 0;
              const revenue = Number(c?.revenue) || 0;
              const price = Number(product?.price) || 0;
              const roas = Number(c?.roas) || (adSpend > 0 ? Number((revenue / adSpend).toFixed(2)) : 0);
              const currency = product?.currency || 'RON';

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
                        {product?.images?.[0] ? (
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
                          {product?.title || 'Fără titlu'}
                        </div>
                        <div className="text-[11px] text-neutral-400 truncate">
                          {product?.brand || 'General'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4 text-neutral-700 font-semibold">
                    <span className="bg-neutral-100 px-2 py-0.5 rounded-md">
                      {product?.category || 'Altele'}
                    </span>
                  </td>

                  {/* Site Destinație & Checklist */}
                  <td className="py-3 px-4">
                    {(() => {
                      const chk = calculateChecklistStats(product?.checklist);
                      return (
                        <div className="flex flex-col gap-1 min-w-[140px]">
                          <div className="flex items-center gap-1.5 font-semibold text-neutral-800 text-xs">
                            <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="truncate max-w-[130px]" title={product.targetSite || 'Nespecificat'}>
                              {product.targetSite || '—'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-mono">
                            <span className={`px-1.5 py-0.2 rounded font-bold border ${
                              chk.isReady
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : chk.completed > 0
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                            }`}>
                              {chk.completed}/{chk.total} pași
                            </span>
                            {product.listingStatus === 'live' && (
                              <span className="text-emerald-700 font-bold bg-emerald-50 px-1 rounded">Live</span>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </td>

                  {/* Platform */}
                  <td className="py-3 px-4">
                    <span className="font-bold text-neutral-900 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-full text-[11px]">
                      {c?.platform || 'Facebook Ads'}
                    </span>
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={c?.status || 'untested'}
                      onChange={(e) => onUpdateCampaignStatus(product.id, e.target.value as CampaignStatus)}
                      className={`text-[11px] font-bold rounded-full px-2.5 py-1 border cursor-pointer focus:outline-none shadow-2xs ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}
                    >
                      <option value="untested">Netestat</option>
                      <option value="testing">În testare</option>
                      <option value="winner">Winner (Scalat)</option>
                      <option value="promising">Promițător (Break-even)</option>
                      <option value="stopped">Oprit (Necâștigător)</option>
                    </select>
                  </td>

                  {/* Spend */}
                  <td className="py-3 px-4 font-mono font-semibold text-neutral-800 tabular-nums">
                    {safeFormatNumber(adSpend)} {currency}
                  </td>

                  {/* Revenue */}
                  <td className="py-3 px-4 font-mono font-bold text-neutral-900 tabular-nums">
                    {safeFormatNumber(revenue)} {currency}
                  </td>

                  {/* ROAS */}
                  <td className="py-3 px-4 font-mono font-bold tabular-nums">
                    <span className={`px-2 py-0.5 rounded-md ${
                      roas >= 2.5
                        ? 'bg-emerald-50 text-emerald-700 font-bold'
                        : roas >= 1.5
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-neutral-500'
                    }`}>
                      {roas > 0 ? `${roas.toFixed(2)}x` : '—'}
                    </span>
                  </td>

                  {/* Orders */}
                  <td className="py-3 px-4 font-mono text-neutral-700">
                    {Number(c?.ordersCount) || 0}
                  </td>

                  {/* Selling Price */}
                  <td className="py-3 px-4 font-mono font-bold text-neutral-900 tabular-nums">
                    {safeFormatNumber(price)} {currency}
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
