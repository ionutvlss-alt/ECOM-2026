import React, { useState, useMemo } from 'react';
import { Product, AdLink } from '../types/product';
import { AdPreviewCard } from './AdPreviewCard';
import {
  Video,
  Play,
  Search,
  Filter,
  ExternalLink,
  Layers,
  Sparkles,
  Package,
  Plus,
  Tv,
  Film
} from 'lucide-react';

interface AdFeedItem {
  product: Product;
  ad: AdLink;
  index: number;
}

interface AdsGalleryViewProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onOpenAddModal: () => void;
}

export const AdsGalleryView: React.FC<AdsGalleryViewProps> = ({
  products,
  onSelectProduct,
  onOpenAddModal,
}) => {
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>('all');

  // Colectare toate reclamele din toate produsele
  const allAds: AdFeedItem[] = useMemo(() => {
    const list: AdFeedItem[] = [];

    products.forEach((p) => {
      // 1. Link-uri din adLinks
      if (p.adLinks && p.adLinks.length > 0) {
        p.adLinks.forEach((ad, idx) => {
          if (ad.url) {
            list.push({ product: p, ad, index: idx });
          }
        });
      } else if (p.campaign?.campaignUrl) {
        // Fallback dacă are doar link principal
        list.push({
          product: p,
          ad: {
            id: 'main_camp_url',
            url: p.campaign.campaignUrl,
            label: 'Reclamă Principală',
            platform: p.campaign.platform || 'Facebook / TikTok',
            notes: p.campaign.notes,
          },
          index: 0,
        });
      }
    });

    return list;
  }, [products]);

  // Lista unică de platforme detectate
  const platforms = useMemo(() => {
    const set = new Set<string>();
    allAds.forEach((item) => {
      if (item.ad.platform) set.add(item.ad.platform);
    });
    return Array.from(set);
  }, [allAds]);

  // Filtrare reclame
  const filteredAds = useMemo(() => {
    return allAds.filter((item) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = item.product.title.toLowerCase().includes(q);
        const matchBrand = item.product.brand.toLowerCase().includes(q);
        const matchLabel = item.ad.label?.toLowerCase().includes(q);
        const matchUrl = item.ad.url.toLowerCase().includes(q);
        const matchNotes = item.ad.notes?.toLowerCase().includes(q);
        if (!matchTitle && !matchBrand && !matchLabel && !matchUrl && !matchNotes) {
          return false;
        }
      }

      if (platformFilter !== 'all') {
        if (item.ad.platform?.toLowerCase() !== platformFilter.toLowerCase()) {
          return false;
        }
      }

      if (selectedProductFilter !== 'all') {
        if (item.product.id !== selectedProductFilter) {
          return false;
        }
      }

      return true;
    });
  }, [allAds, search, platformFilter, selectedProductFilter]);

  return (
    <div className="space-y-6">
      {/* Header Tab */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#0f4a3c] text-emerald-300 flex items-center justify-center shadow-xs">
              <Tv className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Galerie & Feed Reclame Ads
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-neutral-500">
            Preview interactiv pentru toate reclamele video, link-urile TikTok, Facebook Ad Library și YouTube atașate produselor.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-[#0f4a3c] hover:bg-[#0c3c31] rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Adaugă reclame la produs</span>
        </button>
      </div>

      {/* KPI Cards Reclame */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
            Total Reclame Salvate
          </span>
          <span className="text-2xl font-mono font-bold text-neutral-900 tabular-nums mt-1 block">
            {allAds.length}
          </span>
        </div>

        <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
            Produse cu Reclame
          </span>
          <span className="text-2xl font-mono font-bold text-[#0f4a3c] tabular-nums mt-1 block">
            {new Set(allAds.map((a) => a.product.id)).size}
          </span>
        </div>

        <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
            TikTok Ads & Video
          </span>
          <span className="text-2xl font-mono font-bold text-neutral-900 tabular-nums mt-1 block">
            {allAds.filter((a) => a.ad.platform?.toLowerCase().includes('tiktok')).length}
          </span>
        </div>

        <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
            Meta / Facebook Ads
          </span>
          <span className="text-2xl font-mono font-bold text-blue-700 tabular-nums mt-1 block">
            {allAds.filter((a) => a.ad.platform?.toLowerCase().includes('facebook') || a.ad.platform?.toLowerCase().includes('meta')).length}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Caută după titlu produs, label reclamă, url sau hook..."
            className="w-full bg-neutral-50/80 border border-neutral-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#0f4a3c]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filtru Platformă */}
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="text-xs bg-neutral-50/80 border border-neutral-200 rounded-xl px-3 py-2 text-neutral-700 font-semibold focus:outline-none focus:border-[#0f4a3c] cursor-pointer"
          >
            <option value="all">Toate Platformele</option>
            {platforms.map((plat) => (
              <option key={plat} value={plat}>
                {plat}
              </option>
            ))}
          </select>

          {/* Filtru după Produs */}
          <select
            value={selectedProductFilter}
            onChange={(e) => setSelectedProductFilter(e.target.value)}
            className="text-xs bg-neutral-50/80 border border-neutral-200 rounded-xl px-3 py-2 text-neutral-700 font-semibold focus:outline-none focus:border-[#0f4a3c] cursor-pointer max-w-[200px] truncate"
          >
            <option value="all">Toate Produsele</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>

          <span className="text-xs font-mono text-neutral-500 px-2">
            {filteredAds.length} {filteredAds.length === 1 ? 'reclamă' : 'reclame'}
          </span>
        </div>
      </div>

      {/* Grid Reclame */}
      {filteredAds.length === 0 ? (
        <div className="border border-dashed border-neutral-200 rounded-2xl p-12 text-center bg-white">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#0f4a3c] mx-auto mb-3">
            <Video className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-neutral-900">Nu ai adăugat încă nicio reclamă</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
            Fiecare produs are 3 sloturi STAS pentru link-uri de reclame TikTok, Meta Ads Library sau YouTube. Adaugă primul link la un produs!
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-[#0f4a3c] hover:bg-[#0c3c31] rounded-xl transition-colors cursor-pointer"
          >
            Adaugă primul produs cu reclame
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAds.map((item, idx) => (
            <div
              key={`${item.product.id}_${item.ad.id || idx}`}
              className="bg-white border border-neutral-200/90 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Product header tag */}
              <div
                onClick={() => onSelectProduct(item.product)}
                className="p-3 bg-neutral-50/70 border-b border-neutral-150 flex items-center justify-between gap-2 cursor-pointer hover:bg-emerald-50/60 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {item.product.images?.[0] ? (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-7 h-7 rounded-lg object-cover border border-neutral-200 shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-neutral-200 flex items-center justify-center text-neutral-600 font-bold text-[10px] shrink-0">
                      PROD
                    </div>
                  )}
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-neutral-900 block truncate">
                      {item.product.title}
                    </span>
                    <span className="text-[10px] font-semibold text-neutral-400 block truncate">
                      {item.product.category} · {item.product.price} {item.product.currency}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold shrink-0">
                  Vezi Produs →
                </span>
              </div>

              {/* Preview Reclamă */}
              <div className="p-3 flex-1 flex flex-col justify-between">
                <AdPreviewCard
                  url={item.ad.url}
                  label={item.ad.label || `Reclamă #${item.index + 1}`}
                  notes={item.ad.notes}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
