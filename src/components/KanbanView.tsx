import React from 'react';
import { Product, CampaignStatus } from '../types/product';
import { Megaphone, ArrowRight, ArrowLeft, CheckCircle2, TrendingUp, XCircle, Clock } from 'lucide-react';
import { CAMPAIGN_STATUS_LABELS } from '../data/initialProducts';

interface KanbanViewProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onUpdateCampaignStatus: (productId: string, newStatus: CampaignStatus) => void;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  products,
  onSelectProduct,
  onUpdateCampaignStatus,
}) => {
  const columns: { status: CampaignStatus; title: string; color: string; dotColor: string }[] = [
    { status: 'testing', title: 'În testare activă', color: 'text-amber-800', dotColor: 'bg-amber-500' },
    { status: 'winner', title: 'Winner (Scalat)', color: 'text-emerald-800', dotColor: 'bg-emerald-600' },
    { status: 'promising', title: 'Promițător (Break-even)', color: 'text-blue-800', dotColor: 'bg-blue-500' },
    { status: 'stopped', title: 'Oprit (Necâștigător)', color: 'text-rose-800', dotColor: 'bg-rose-500' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {columns.map((col) => {
        const colProducts = products.filter((p) => (p.campaign?.status || 'testing') === col.status);
        const colSpend = colProducts.reduce((sum, p) => sum + (p.campaign?.adSpend || 0), 0);
        const colRevenue = colProducts.reduce((sum, p) => sum + (p.campaign?.revenue || 0), 0);
        const colRoas = colSpend > 0 ? (colRevenue / colSpend).toFixed(2) : '-';

        return (
          <div
            key={col.status}
            className="bg-[#f5f8f6] border border-neutral-200/80 rounded-2xl p-4 flex flex-col h-full min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200/80 mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                <h3 className={`text-xs font-bold tracking-tight uppercase ${col.color}`}>
                  {col.title}
                </h3>
              </div>
              <span className="font-mono text-xs tabular-nums text-neutral-600 bg-white border border-neutral-200 px-2 py-0.5 rounded-full font-medium">
                {colProducts.length}
              </span>
            </div>

            {/* Column Summary (Spend & Revenue) */}
            <div className="text-[11px] text-neutral-500 font-mono tabular-nums mb-3 px-1 flex justify-between border-b border-neutral-200/60 pb-2">
              <span>Spend: <strong className="text-neutral-900">{colSpend.toLocaleString('ro-RO')} RON</strong></span>
              <span>ROAS: <strong className="text-[#0f4a3c]">{colRoas !== '-' ? `${colRoas}x` : '—'}</strong></span>
            </div>

            {/* Cards List */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {colProducts.length === 0 ? (
                <div className="border border-dashed border-neutral-300 rounded-xl p-6 text-center text-xs text-neutral-400 bg-white/50">
                  Nicio campanie în această etapă
                </div>
              ) : (
                colProducts.map((product) => {
                  const c = product.campaign || {
                    platform: 'TikTok Ads',
                    status: 'testing',
                    adSpend: 0,
                    revenue: 0,
                    ordersCount: 0,
                    roas: 0
                  };

                  return (
                    <div
                      key={product.id}
                      onClick={() => onSelectProduct(product)}
                      className="group cursor-pointer bg-white border border-neutral-200/80 hover:border-neutral-300 rounded-xl p-3.5 transition-all space-y-2.5 shadow-2xs hover:shadow-xs"
                    >
                      {/* Product Header */}
                      <div className="flex items-start gap-2.5">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt=""
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
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-neutral-900 text-white">
                              {c.platform}
                            </span>
                            <span className="text-[10px] text-neutral-400 truncate">
                              {product.category}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-neutral-900 group-hover:text-[#0f4a3c] transition-colors line-clamp-2">
                            {product.title}
                          </h4>
                        </div>
                      </div>

                      {/* Performance KPIs */}
                      <div className="bg-neutral-50 p-2 rounded-lg text-[11px] font-mono grid grid-cols-2 gap-1 border border-neutral-100">
                        <div>
                          <span className="text-[9px] text-neutral-400 uppercase block">Spend:</span>
                          <span className="font-semibold text-neutral-800">{c.adSpend} RON</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-neutral-400 uppercase block">ROAS:</span>
                          <span className="font-bold text-[#0f4a3c]">{c.roas && c.roas > 0 ? `${c.roas.toFixed(2)}x` : '—'}</span>
                        </div>
                      </div>

                      {/* Quick Move Workflow Controls */}
                      <div
                        className="flex items-center justify-between pt-2 border-t border-neutral-100 text-[11px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-[10px] text-neutral-400 font-medium">Schimbă:</span>
                        <div className="flex items-center gap-1">
                          {col.status !== 'winner' && (
                            <button
                              type="button"
                              onClick={() => onUpdateCampaignStatus(product.id, 'winner')}
                              className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                              title="Setează ca Winner"
                            >
                              Winner
                            </button>
                          )}
                          {col.status !== 'promising' && (
                            <button
                              type="button"
                              onClick={() => onUpdateCampaignStatus(product.id, 'promising')}
                              className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                              title="Setează ca Promițător"
                            >
                              Promițător
                            </button>
                          )}
                          {col.status !== 'stopped' && (
                            <button
                              type="button"
                              onClick={() => onUpdateCampaignStatus(product.id, 'stopped')}
                              className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                              title="Oprește campania"
                            >
                              Oprește
                            </button>
                          )}
                          {col.status !== 'testing' && (
                            <button
                              type="button"
                              onClick={() => onUpdateCampaignStatus(product.id, 'testing')}
                              className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
                              title="Trece înapoi în testare"
                            >
                              Testare
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
