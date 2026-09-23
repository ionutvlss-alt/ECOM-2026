import React, { useState } from 'react';
import { Product, CampaignStatus } from '../types/product';
import {
  X,
  ExternalLink,
  Edit3,
  Trash2,
  Bookmark,
  Share2,
  Check,
  Megaphone,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Play
} from 'lucide-react';
import { CAMPAIGN_STATUS_LABELS } from '../data/initialProducts';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onUpdateStatus?: (productId: string, newStatus: CampaignStatus) => void;
  onToggleFavorite?: (productId: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onEdit,
  onDelete,
  onUpdateStatus,
  onToggleFavorite,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  const images = product.images?.length > 0 ? product.images : [];
  const currentImage = images[activeImageIndex] || '';

  const campaign = product.campaign || {
    platform: 'TikTok Ads',
    status: 'testing',
    adSpend: 0,
    revenue: 0,
    ordersCount: 0,
    roas: 0
  };

  const statusInfo = CAMPAIGN_STATUS_LABELS[campaign.status] || CAMPAIGN_STATUS_LABELS.testing;
  const netProfit = (campaign.revenue || 0) - (campaign.adSpend || 0);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white border border-neutral-200/90 rounded-2xl overflow-hidden shadow-2xl my-6 flex flex-col max-h-[92vh] text-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-150 bg-white/95 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-neutral-500 font-semibold">
              {product.brand} · {product.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => onToggleFavorite(product.id)}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  product.isFavorite
                    ? 'border-amber-300 bg-amber-50 text-amber-600'
                    : 'border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
                title={product.isFavorite ? 'Elimină din favorite' : 'Salvează la favorite'}
              >
                <Bookmark className="w-4 h-4" fill={product.isFavorite ? 'currentColor' : 'none'} />
              </button>
            )}

            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-colors cursor-pointer"
              title="Copiază link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => onEdit(product)}
              className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-colors cursor-pointer"
              title="Editează produsul"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            <button
              onClick={() => onDelete(product.id)}
              className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Șterge produsul"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-neutral-200 mx-1" />

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Coloana Stânga: Imagini & Link-uri magazin/furnizor */}
            <div className="lg:col-span-5 space-y-4">
              {/* Imagine principală */}
              <div className="relative aspect-4/3 w-full rounded-2xl bg-neutral-100 overflow-hidden border border-neutral-200 shadow-2xs">
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt={product.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
                    Fără imagine
                  </div>
                )}

                {/* Badge platformă & status pe imagine */}
                <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-neutral-900/90 text-white backdrop-blur-md shadow-2xs">
                    {campaign.platform || 'Platformă'}
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}>
                    {statusInfo.label}
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-[#0f4a3c] ring-2 ring-[#0f4a3c]/20'
                          : 'border-neutral-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Link-uri externe utile */}
              <div className="bg-neutral-50 border border-neutral-200/80 rounded-2xl p-4 space-y-2.5 text-xs">
                <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider block">
                  Link-uri rapide
                </span>

                {product.storeUrl ? (
                  <a
                    href={product.storeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between text-neutral-700 hover:text-[#0f4a3c] p-2 bg-white rounded-xl border border-neutral-200/60 transition-colors"
                  >
                    <span className="truncate font-medium">Magazin / Furnizor: {product.storeName || 'Deschide link'}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                ) : (
                  <div className="text-neutral-400 italic text-[11px]">Niciun link de magazin/furnizor salvat</div>
                )}

                {product.exampleSiteUrl && (
                  <a
                    href={product.exampleSiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between text-neutral-700 hover:text-[#0f4a3c] p-2 bg-white rounded-xl border border-neutral-200/60 transition-colors"
                  >
                    <span className="truncate font-medium">Exemplu site / Magazin concurent</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                )}
              </div>
            </div>

            {/* Coloana Dreapta: Titlu, Preț, Rezultate Campanie Ads, Analiză */}
            <div className="lg:col-span-7 space-y-5">
              {/* Titlu & Preț */}
              <div>
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    {product.brand} · {product.category}
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">
                    Adăugat pe {product.createdAt}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 leading-snug">
                  {product.title}
                </h1>

                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-mono font-bold text-neutral-900 tabular-nums">
                    {product.price.toLocaleString('ro-RO')} {product.currency}
                  </span>
                  <span className="text-xs text-neutral-500">preț vânzare</span>
                </div>
              </div>

              {/* CARDUL PRINCIPAL: Rezultate Campanie Ads (Facebook / TikTok) */}
              <div className="bg-[#f5fbf7] border border-emerald-200/80 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-emerald-150">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#0f4a3c] text-white flex items-center justify-center shadow-2xs">
                      <Megaphone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-neutral-900 block">
                        Campanie {campaign.platform}
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        Performanță testare publicitară
                      </span>
                    </div>
                  </div>

                  <span className={`text-xs font-bold px-3 py-1 rounded-full border shadow-2xs self-start sm:self-auto ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}>
                    {statusInfo.label}
                  </span>
                </div>

                {/* Grid KPI Campanie */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-white border border-emerald-100 rounded-xl p-3 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                      ROAS
                    </span>
                    <span className="text-xl font-mono font-bold text-[#0f4a3c] tabular-nums mt-0.5 block">
                      {campaign.roas && campaign.roas > 0 ? `${campaign.roas.toFixed(2)}x` : '—'}
                    </span>
                  </div>

                  <div className="bg-white border border-emerald-100 rounded-xl p-3 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                      Buget Cheltuit
                    </span>
                    <span className="text-xl font-mono font-bold text-neutral-900 tabular-nums mt-0.5 block">
                      {campaign.adSpend.toLocaleString('ro-RO')} {product.currency}
                    </span>
                  </div>

                  <div className="bg-white border border-emerald-100 rounded-xl p-3 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                      Venit (Revenue)
                    </span>
                    <span className="text-xl font-mono font-bold text-neutral-900 tabular-nums mt-0.5 block">
                      {campaign.revenue.toLocaleString('ro-RO')} {product.currency}
                    </span>
                  </div>

                  <div className="bg-white border border-emerald-100 rounded-xl p-3 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                      Profit Net Ads
                    </span>
                    <span className={`text-lg font-mono font-bold tabular-nums mt-0.5 block ${
                      netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'
                    }`}>
                      {netProfit >= 0 ? `+${netProfit.toLocaleString('ro-RO')}` : netProfit.toLocaleString('ro-RO')} {product.currency}
                    </span>
                  </div>

                  <div className="bg-white border border-emerald-100 rounded-xl p-3 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                      Comenzi
                    </span>
                    <span className="text-lg font-mono font-bold text-neutral-900 tabular-nums mt-0.5 block">
                      {campaign.ordersCount} comenzi
                    </span>
                  </div>

                  <div className="bg-white border border-emerald-100 rounded-xl p-3 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                      Cost per Comandă (CPA)
                    </span>
                    <span className="text-lg font-mono font-semibold text-neutral-800 tabular-nums mt-0.5 block">
                      {campaign.cpa && campaign.cpa > 0 ? `${campaign.cpa} ${product.currency}` : '—'}
                    </span>
                  </div>
                </div>

                {/* CPC & CTR dacă există */}
                {(campaign.cpc || campaign.ctr) && (
                  <div className="flex items-center gap-4 text-xs font-mono text-neutral-600 bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                    {campaign.cpc && (
                      <span>CPC: <strong>{campaign.cpc} {product.currency}</strong></span>
                    )}
                    {campaign.ctr && (
                      <span>CTR: <strong>{campaign.ctr}%</strong></span>
                    )}
                  </div>
                )}

                {/* Link Reclamă / Creativ Video */}
                {campaign.campaignUrl && (
                  <div className="pt-2">
                    <a
                      href={campaign.campaignUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Deschide reclama / creativul video testat pe {campaign.platform}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {/* Concluzii campanie & Creativ câștigător */}
                {campaign.notes && (
                  <div className="pt-3 border-t border-emerald-200/60 space-y-1">
                    <span className="text-[11px] font-bold text-[#0f4a3c] uppercase tracking-wider block">
                      Concluzii campanie & Creativ câștigător:
                    </span>
                    <p className="text-xs text-neutral-800 leading-relaxed bg-white/90 p-3 rounded-xl border border-emerald-150">
                      {campaign.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Puncte Forte & Puncte Slabe */}
              {(product.pros.length > 0 || product.cons.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Pros */}
                  {product.pros.length > 0 && (
                    <div className="p-4 bg-emerald-50/60 border border-emerald-150 rounded-2xl space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Puncte Tari</span>
                      </div>
                      <ul className="text-xs text-emerald-950 space-y-1 pl-1">
                        {product.pros.map((p, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Cons */}
                  {product.cons.length > 0 && (
                    <div className="p-4 bg-rose-50/60 border border-rose-150 rounded-2xl space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <span>Puncte Slabe</span>
                      </div>
                      <ul className="text-xs text-rose-950 space-y-1 pl-1">
                        {product.cons.map((c, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-rose-500 font-bold">•</span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Notițe adiționale */}
              {product.detailedNotes && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                    Notițe adiționale
                  </span>
                  <p className="text-xs text-neutral-700 bg-neutral-50 p-3.5 rounded-xl border border-neutral-200/80 leading-relaxed whitespace-pre-wrap">
                    {product.detailedNotes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
