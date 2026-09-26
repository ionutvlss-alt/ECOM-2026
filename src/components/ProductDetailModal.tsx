import React, { useState } from 'react';
import { Product, CampaignStatus, ProductChecklist, ListingStatus } from '../types/product';
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
  Play,
  Globe,
  ListChecks,
  Store,
  Compass,
  Video
} from 'lucide-react';
import { CAMPAIGN_STATUS_LABELS } from '../data/initialProducts';
import { safeFormatNumber, calculateChecklistStats, CHECKLIST_ITEMS_CONFIG } from '../utils/productNormalizer';
import { AdPreviewCard } from './AdPreviewCard';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onUpdateStatus?: (productId: string, newStatus: CampaignStatus) => void;
  onUpdateChecklist?: (productId: string, checklist: ProductChecklist) => void;
  onUpdateListingStatus?: (productId: string, newStatus: ListingStatus) => void;
  onToggleFavorite?: (productId: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onEdit,
  onDelete,
  onUpdateStatus,
  onUpdateChecklist,
  onUpdateListingStatus,
  onToggleFavorite,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  const images = (product?.images && Array.isArray(product.images) && product.images.length > 0) ? product.images : [];
  const currentImage = images[activeImageIndex] || '';

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
  const netProfit = revenue - adSpend;
  const roas = Number(campaign?.roas) || (adSpend > 0 ? Number((revenue / adSpend).toFixed(2)) : 0);
  const currency = product?.currency || 'RON';

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const prosList = Array.isArray(product?.pros) ? product.pros.filter(Boolean) : [];
  const consList = Array.isArray(product?.cons) ? product.cons.filter(Boolean) : [];

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
                    <span className="truncate font-medium">Furnizor: {product.storeName || 'Deschide link'}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                ) : (
                  <div className="text-neutral-400 italic text-[11px]">Niciun link de magazin/furnizor salvat</div>
                )}

                {product.targetSite && (
                  <a
                    href={product.targetSiteUrl || '#'}
                    target={product.targetSiteUrl ? "_blank" : undefined}
                    rel="noreferrer"
                    className="flex items-center justify-between text-blue-900 bg-blue-50/70 hover:bg-blue-100/70 p-2 rounded-xl border border-blue-200 transition-colors"
                  >
                    <span className="truncate font-medium">Site destinație: {product.targetSite}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                  </a>
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

            {/* Coloana Dreapta: Titlu, Preț, Notițe, Analiză, și la sfârșit Rezultate Campanie Ads */}
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
                    {safeFormatNumber(price)} {currency}
                  </span>
                  <span className="text-xs text-neutral-500">preț vânzare</span>
                </div>
              </div>

              {/* MODUL NOU: Site Destinație & Checklist Pregătire Lansare */}
              <div className="bg-[#f8fbfd] border border-blue-200/90 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-blue-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-2xs shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-neutral-900 block flex items-center gap-1.5">
                        <span>Site Destinație:</span>
                        <strong className="text-blue-700">
                          {product.targetSite || 'Nespecificat încă'}
                        </strong>
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        {product.targetSiteUrl ? (
                          <a
                            href={product.targetSiteUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline inline-flex items-center gap-1"
                          >
                            <span>Deschide link-ul magazinului</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          'Magazinul unde se listează produsul'
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Status Listare Dropdown / Badge */}
                  {onUpdateListingStatus ? (
                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                      <span className="text-[11px] text-neutral-400 font-medium hidden sm:inline">Stadiu site:</span>
                      <select
                        value={product.listingStatus || 'planned'}
                        onChange={(e) => onUpdateListingStatus(product.id, e.target.value as ListingStatus)}
                        className="text-xs font-bold px-2.5 py-1 rounded-full border border-blue-200 bg-white text-blue-900 shadow-2xs cursor-pointer focus:outline-none"
                      >
                        <option value="planned">În planificare</option>
                        <option value="in_progress">În pregătire</option>
                        <option value="live">Publicat & Live</option>
                      </select>
                    </div>
                  ) : (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 self-start sm:self-auto">
                      {product.listingStatus === 'live'
                        ? 'Publicat pe site'
                        : product.listingStatus === 'in_progress'
                        ? 'În pregătire'
                        : 'În planificare'}
                    </span>
                  )}
                </div>

                {/* Checklist Pregătire Lansare cu bifare interactivă */}
                {(() => {
                  const currentChecklist: ProductChecklist = product.checklist || {
                    supplierFound: false,
                    pageCreated: false,
                    adsPrepared: false,
                    priceCalculated: false,
                    trackingReady: false,
                    liveOnSite: false,
                  };
                  const stats = calculateChecklistStats(currentChecklist);

                  const handleToggle = (key: keyof ProductChecklist) => {
                    if (onUpdateChecklist) {
                      onUpdateChecklist(product.id, {
                        ...currentChecklist,
                        [key]: !currentChecklist[key],
                      });
                    }
                  };

                  return (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-neutral-800 flex items-center gap-1.5">
                          <ListChecks className="w-4 h-4 text-blue-600" />
                          <span>Checklist pregătire înainte de reclame:</span>
                        </span>
                        <span className="font-mono font-bold text-blue-800 text-xs">
                          {stats.completed} din {stats.total} bifate ({stats.percentage}%)
                        </span>
                      </div>

                      {/* Bară Progres */}
                      <div className="w-full h-2 bg-neutral-200/80 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            stats.isReady
                              ? 'bg-emerald-600'
                              : stats.percentage >= 50
                              ? 'bg-blue-600'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${stats.percentage}%` }}
                        />
                      </div>

                      {/* Checklist Items Interactive Buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {CHECKLIST_ITEMS_CONFIG.map((item) => {
                          const isDone = Boolean(currentChecklist[item.key]);
                          return (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => handleToggle(item.key)}
                              disabled={!onUpdateChecklist}
                              className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                                onUpdateChecklist ? 'cursor-pointer hover:shadow-2xs' : 'cursor-default'
                              } ${
                                isDone
                                  ? 'bg-white border-blue-300 ring-1 ring-blue-300/30'
                                  : 'bg-white/80 border-neutral-200 hover:border-neutral-300'
                              }`}
                            >
                              <div className="pt-0.5 shrink-0">
                                {isDone ? (
                                  <div className="w-4 h-4 rounded-md bg-blue-600 text-white flex items-center justify-center">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </div>
                                ) : (
                                  <div className="w-4 h-4 rounded-md border-2 border-neutral-300 bg-white" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <span className={`text-xs font-semibold block ${isDone ? 'text-neutral-900 line-through opacity-75' : 'text-neutral-900'}`}>
                                  {item.label}
                                </span>
                                <span className="text-[10px] text-neutral-400 block leading-tight mt-0.5">
                                  {item.description}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {stats.isReady && (
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Produsul are toți pașii finalizați și este gata pentru testare reclame!</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Notițe adiționale */}
              {product.detailedNotes && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                    Notițe & Detalii Produs
                  </span>
                  <p className="text-xs text-neutral-700 bg-neutral-50 p-3.5 rounded-xl border border-neutral-200/80 leading-relaxed whitespace-pre-wrap">
                    {product.detailedNotes}
                  </p>
                </div>
              )}

              {/* Puncte Forte & Puncte Slabe */}
              {(prosList.length > 0 || consList.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Pros */}
                  {prosList.length > 0 && (
                    <div className="p-4 bg-emerald-50/60 border border-emerald-150 rounded-2xl space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Puncte Tari</span>
                      </div>
                      <ul className="text-xs text-emerald-950 space-y-1 pl-1">
                        {prosList.map((p, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Cons */}
                  {consList.length > 0 && (
                    <div className="p-4 bg-rose-50/60 border border-rose-150 rounded-2xl space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <span>Puncte Slabe</span>
                      </div>
                      <ul className="text-xs text-rose-950 space-y-1 pl-1">
                        {consList.map((c, i) => (
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

              {/* CARDUL ADS: Plasat la sfârșit, sub datele produsului */}
              <div className="bg-[#f5fbf7] border-2 border-emerald-200/80 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-emerald-150">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#0f4a3c] text-white flex items-center justify-center shadow-2xs">
                      <Megaphone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-neutral-900 block">
                        Campanie {campaign?.platform || 'Facebook Ads'}
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        Performanță testare publicitară
                      </span>
                    </div>
                  </div>

                  {onUpdateStatus ? (
                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                      <span className="text-[11px] text-neutral-400 font-semibold hidden sm:inline">Schimbă status:</span>
                      <select
                        value={campaign.status || 'untested'}
                        onChange={(e) => onUpdateStatus(product.id, e.target.value as CampaignStatus)}
                        className={`text-xs font-bold px-3 py-1 rounded-full border shadow-2xs cursor-pointer focus:outline-none ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}
                      >
                        <option value="untested">Netestat</option>
                        <option value="testing">În testare</option>
                        <option value="winner">Winner (Scalat)</option>
                        <option value="promising">Promițător (Break-even)</option>
                        <option value="stopped">Oprit (Necâștigător)</option>
                      </select>
                    </div>
                  ) : (
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border shadow-2xs self-start sm:self-auto ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}>
                      {statusInfo.label}
                    </span>
                  )}
                </div>

                {/* Grid KPI Campanie */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-white border border-emerald-100 rounded-xl p-3 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                      ROAS
                    </span>
                    <span className="text-xl font-mono font-bold text-[#0f4a3c] tabular-nums mt-0.5 block">
                      {roas > 0 ? `${roas.toFixed(2)}x` : '—'}
                    </span>
                  </div>

                  <div className="bg-white border border-emerald-100 rounded-xl p-3 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                      Buget Cheltuit
                    </span>
                    <span className="text-xl font-mono font-bold text-neutral-900 tabular-nums mt-0.5 block">
                      {safeFormatNumber(adSpend)} {currency}
                    </span>
                  </div>

                  <div className="bg-white border border-emerald-100 rounded-xl p-3 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                      Venit (Revenue)
                    </span>
                    <span className="text-xl font-mono font-bold text-neutral-900 tabular-nums mt-0.5 block">
                      {safeFormatNumber(revenue)} {currency}
                    </span>
                  </div>

                  <div className="bg-white border border-emerald-100 rounded-xl p-3 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                      Profit Net Ads
                    </span>
                    <span className={`text-lg font-mono font-bold tabular-nums mt-0.5 block ${
                      netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'
                    }`}>
                      {netProfit >= 0 ? `+${safeFormatNumber(netProfit)}` : safeFormatNumber(netProfit)} {currency}
                    </span>
                  </div>

                  <div className="bg-white border border-emerald-100 rounded-xl p-3 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                      Comenzi
                    </span>
                    <span className="text-lg font-mono font-bold text-neutral-900 tabular-nums mt-0.5 block">
                      {Number(campaign?.ordersCount) || 0} comenzi
                    </span>
                  </div>

                  <div className="bg-white border border-emerald-100 rounded-xl p-3 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                      Cost per Comandă (CPA)
                    </span>
                    <span className="text-lg font-mono font-semibold text-neutral-800 tabular-nums mt-0.5 block">
                      {Number(campaign?.cpa) > 0 ? `${safeFormatNumber(campaign.cpa)} ${currency}` : '—'}
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

                {/* Secțiune Link-uri Reclame & Creativuri cu Preview Video */}
                {((product.adLinks && product.adLinks.length > 0) || campaign.campaignUrl) && (
                  <div className="pt-3 border-t border-emerald-200/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                        <Video className="w-4 h-4 text-[#0f4a3c]" />
                        <span>Reclame & Creativuri Video Atasate ({product.adLinks?.length || 1})</span>
                      </span>
                    </div>

                    <div className="space-y-3">
                      {product.adLinks && product.adLinks.length > 0 ? (
                        product.adLinks.map((ad, idx) => (
                          <AdPreviewCard
                            key={ad.id || idx}
                            url={ad.url}
                            label={ad.label || `Reclamă #${idx + 1}`}
                            notes={ad.notes}
                          />
                        ))
                      ) : campaign.campaignUrl ? (
                        <AdPreviewCard
                          url={campaign.campaignUrl}
                          label="Reclamă Principală"
                        />
                      ) : null}
                    </div>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
