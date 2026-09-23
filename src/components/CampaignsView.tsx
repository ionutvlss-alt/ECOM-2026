import React, { useState } from 'react';
import { Product } from '../types/product';
import { Megaphone, Copy, Check, ExternalLink, Calendar, Tag } from 'lucide-react';
import { SPONSORSHIP_LABELS } from '../data/initialProducts';

interface CampaignsViewProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const CampaignsView: React.FC<CampaignsViewProps> = ({
  products,
  onSelectProduct,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const sponsoredProducts = products.filter(
    (p) => p.sponsorship === 'sponsored' || p.sponsorship === 'pr_gift' || p.sponsorship === 'affiliate'
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const totalSponsoredValue = sponsoredProducts.reduce((sum, p) => sum + (p.price || 0), 0);
  const activeCampaigns = sponsoredProducts.filter((p) => p.status === 'testing');

  return (
    <div className="space-y-6">
      {/* Header & KPI Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[#0f4a3c]" />
            <span>Reclame, Parteneriate & Campanii Sponsorizate</span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Centralizator pentru contractele de testare, cerințele de livrabile, cupoane promoționale și termene limită.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-neutral-200/80 px-4 py-2 rounded-xl text-xs shadow-2xs">
            <span className="text-neutral-400 block text-[10px] uppercase font-bold">Campanii Active</span>
            <span className="font-mono font-bold text-[#0f4a3c] text-lg tabular-nums">
              {activeCampaigns.length}
            </span>
          </div>
          <div className="bg-white border border-neutral-200/80 px-4 py-2 rounded-xl text-xs shadow-2xs">
            <span className="text-neutral-400 block text-[10px] uppercase font-bold">Valoare Produse PR</span>
            <span className="font-mono font-bold text-neutral-900 text-lg tabular-nums">
              {totalSponsoredValue.toLocaleString('ro-RO')} RON
            </span>
          </div>
        </div>
      </div>

      {/* Campaigns Grid */}
      {sponsoredProducts.length === 0 ? (
        <div className="border border-dashed border-neutral-200 bg-white rounded-2xl p-12 text-center">
          <Megaphone className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-neutral-900">Nicio campanie de reclamă sau sponsorizare înregistrată</h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1">
            Când adaugi un produs, alege tipul de finanțare „Parteneriat (Reclamă)” sau „PR Sample” pentru a activa urmărirea campaniei.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sponsoredProducts.map((product) => {
            const ad = product.adDetails;
            const isFinished = product.status === 'tested';

            return (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="cursor-pointer group bg-white hover:border-neutral-300 border border-neutral-200/80 rounded-2xl p-5 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Bar: Brand, Type and Status */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#0f4a3c] bg-[#eaf3ee] px-2.5 py-0.5 rounded-full">
                        {SPONSORSHIP_LABELS[product.sponsorship]?.label}
                      </span>
                      {ad?.sponsorName && (
                        <span className="text-xs text-neutral-500">
                          Sponsor: <strong className="text-neutral-800">{ad.sponsorName}</strong>
                        </span>
                      )}
                    </div>

                    <span className={`text-xs font-mono px-2.5 py-0.5 rounded-full font-medium ${
                      isFinished
                        ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                        : 'text-amber-700 bg-amber-50 border border-amber-200'
                    }`}>
                      {isFinished ? 'Recenzie Publicată' : 'În Desfășurare'}
                    </span>
                  </div>

                  {/* Product info preview */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                      {product.images?.[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-neutral-900 group-hover:text-[#0f4a3c] transition-colors truncate">
                        {product.title}
                      </h3>
                      <div className="text-xs text-neutral-500 mt-0.5">
                        Campanie: <span className="text-neutral-800 font-medium">{ad?.campaignName || 'Campanie de testare'}</span>
                      </div>
                      <div className="text-xs font-mono tabular-nums text-neutral-600 mt-1">
                        Valoare produs: <strong className="text-neutral-900">{product.price.toLocaleString('ro-RO')} {product.currency}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Deliverables / Requirements Box */}
                  {ad?.deliverableRequirement && (
                    <div className="mt-4 p-3 bg-neutral-50 border border-neutral-200/80 rounded-xl text-xs space-y-1">
                      <span className="text-neutral-500 font-semibold block">Livrabile convenite:</span>
                      <p className="text-neutral-800 leading-relaxed">
                        {ad.deliverableRequirement}
                      </p>
                    </div>
                  )}

                  {/* Discount Code & Deadline Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-neutral-100">
                    {ad?.discountCode ? (
                      <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-neutral-400 uppercase font-bold block">Cod Cupon Urmăritori</span>
                          <span className="font-mono font-bold text-[#0f4a3c] text-xs">{ad.discountCode}</span>
                          {ad.discountPercentage && (
                            <span className="text-[10px] text-neutral-500 ml-1.5 font-medium">({ad.discountPercentage})</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(ad.discountCode!);
                          }}
                          className="p-1.5 text-neutral-600 hover:text-neutral-900 bg-white hover:bg-neutral-100 rounded-md border border-neutral-200 transition-colors shadow-2xs"
                          title="Copiază codul"
                        >
                          {copiedCode === ad.discountCode ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-neutral-400 italic p-2">Fără cod promoțional</div>
                    )}

                    {ad?.deadline ? (
                      <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#0f4a3c] shrink-0" />
                        <div>
                          <span className="text-[10px] text-neutral-400 uppercase font-bold block">Termen Livrare</span>
                          <span className="font-mono text-xs text-neutral-800 font-semibold">{ad.deadline}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-neutral-400 italic p-2">Fără termen specificat</div>
                    )}
                  </div>
                </div>

                {/* Footer links */}
                <div className="pt-2 flex items-center justify-between text-xs text-neutral-500 border-t border-neutral-100">
                  <span className="text-[11px] group-hover:text-[#0f4a3c] font-medium transition-colors">
                    Click pentru detalii complete →
                  </span>
                  {product.exampleSiteUrl && (
                    <a
                      href={product.exampleSiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-[#0f4a3c] hover:underline font-semibold transition-colors"
                    >
                      <span>Site exemplu / Demo</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
