import React from 'react';
import { Product, ProductStatus } from '../types/product';
import { Star, ChevronRight, ChevronLeft } from 'lucide-react';

interface KanbanViewProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onUpdateStatus: (productId: string, newStatus: ProductStatus) => void;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  products,
  onSelectProduct,
  onUpdateStatus,
}) => {
  const columns: { status: ProductStatus; title: string; color: string; dotColor: string }[] = [
    { status: 'to_test', title: 'De testat (Wishlist)', color: 'text-neutral-700', dotColor: 'bg-neutral-400' },
    { status: 'testing', title: 'În testare activă', color: 'text-amber-800', dotColor: 'bg-amber-500' },
    { status: 'tested', title: 'Testate & Evaluat', color: 'text-emerald-800', dotColor: 'bg-emerald-600' },
    { status: 'rejected', title: 'Respins / Renunțat', color: 'text-rose-800', dotColor: 'bg-rose-500' },
  ];

  const getNextStatus = (current: ProductStatus): ProductStatus | null => {
    switch (current) {
      case 'to_test':
        return 'testing';
      case 'testing':
        return 'tested';
      case 'tested':
        return null;
      default:
        return null;
    }
  };

  const getPrevStatus = (current: ProductStatus): ProductStatus | null => {
    switch (current) {
      case 'testing':
        return 'to_test';
      case 'tested':
        return 'testing';
      case 'rejected':
        return 'to_test';
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {columns.map((col) => {
        const colProducts = products.filter((p) => p.status === col.status);
        const colValue = colProducts.reduce((sum, p) => sum + (p.price || 0), 0);

        return (
          <div
            key={col.status}
            className="bg-[#f5f8f6] border border-neutral-200/80 rounded-2xl p-4 flex flex-col h-full min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200/80 mb-3">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                <h3 className={`text-xs font-bold tracking-tight uppercase ${col.color}`}>
                  {col.title}
                </h3>
              </div>
              <span className="font-mono text-xs tabular-nums text-neutral-600 bg-white border border-neutral-200 px-2 py-0.5 rounded-full font-medium">
                {colProducts.length}
              </span>
            </div>

            {/* Column Total Value */}
            <div className="text-[11px] text-neutral-500 font-mono tabular-nums mb-3 px-1 flex justify-between">
              <span>Valoare:</span>
              <span className="text-neutral-900 font-semibold">{colValue.toLocaleString('ro-RO')} RON</span>
            </div>

            {/* Cards List */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {colProducts.length === 0 ? (
                <div className="border border-dashed border-neutral-300 rounded-xl p-6 text-center text-xs text-neutral-400 bg-white/50">
                  Niciun produs în această etapă
                </div>
              ) : (
                colProducts.map((product) => {
                  const nextStatus = getNextStatus(product.status);
                  const prevStatus = getPrevStatus(product.status);

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
                          <span className="text-[10px] text-neutral-400 block truncate font-medium">
                            {product.brand} · {product.category}
                          </span>
                          <h4 className="text-xs font-bold text-neutral-900 group-hover:text-[#0f4a3c] transition-colors line-clamp-2">
                            {product.title}
                          </h4>
                        </div>
                      </div>

                      {/* Price and Rating */}
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-100">
                        <span className="font-mono tabular-nums font-semibold text-neutral-900">
                          {product.price.toLocaleString('ro-RO')} {product.currency}
                        </span>

                        {product.overallRating && product.overallRating > 0 ? (
                          <div className="flex items-center gap-1 text-[11px] font-mono text-amber-500 font-semibold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{product.overallRating.toFixed(1)}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-neutral-400">—</span>
                        )}
                      </div>

                      {/* Quick Move Workflow Controls */}
                      <div
                        className="flex items-center justify-between pt-2 border-t border-neutral-100 text-[11px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {prevStatus ? (
                          <button
                            type="button"
                            onClick={() => onUpdateStatus(product.id, prevStatus)}
                            className="text-neutral-500 hover:text-neutral-900 flex items-center gap-0.5 hover:bg-neutral-100 px-2 py-0.5 rounded transition-colors"
                            title="Mută înapoi"
                          >
                            <ChevronLeft className="w-3 h-3" />
                            <span>Înapoi</span>
                          </button>
                        ) : (
                          <span />
                        )}

                        {nextStatus ? (
                          <button
                            type="button"
                            onClick={() => onUpdateStatus(product.id, nextStatus)}
                            className="text-[#0f4a3c] hover:text-[#0c3c31] font-semibold flex items-center gap-0.5 bg-[#eaf3ee] hover:bg-[#d8ece1] px-2 py-0.5 rounded transition-colors"
                            title="Avansează în următoarea etapă"
                          >
                            <span>Avansează</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span />
                        )}
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
