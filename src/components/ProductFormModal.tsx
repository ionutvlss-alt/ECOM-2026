import React, { useState } from 'react';
import { Product, CampaignResults, CampaignStatus, ProductChecklist, ListingStatus, AdLink } from '../types/product';
import { Supplier } from '../types/supplier';
import { CAMPAIGN_STATUS_LABELS } from '../data/initialProducts';
import { CHECKLIST_ITEMS_CONFIG, calculateChecklistStats, detectAdPlatform } from '../utils/productNormalizer';
import {
  X,
  Upload,
  Plus,
  Trash2,
  Megaphone,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Link as LinkIcon,
  Layers,
  Sparkles,
  Info,
  Loader2,
  Building2,
  ExternalLink,
  Globe,
  ListChecks,
  Check,
  CheckCircle2,
  Clock,
  Video,
  Film,
  Eye,
  Play
} from 'lucide-react';
import { compressImageFile, compressBase64Image } from '../utils/imageCompressor';
import { AdPreviewCard } from './AdPreviewCard';

interface ProductFormModalProps {
  initialProduct?: Product | null;
  categories: string[];
  suppliers?: Supplier[];
  existingTargetSites?: string[];
  onSave: (product: Product, newCategoryCreated?: string) => void;
  onClose: () => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  initialProduct,
  categories,
  suppliers = [],
  existingTargetSites = [],
  onSave,
  onClose,
}) => {
  const isEditing = Boolean(initialProduct);

  // Informații produs
  const [title, setTitle] = useState(initialProduct?.title || '');
  const [brand, setBrand] = useState(initialProduct?.brand || '');
  const [category, setCategory] = useState(
    initialProduct?.category || (categories[0] || 'Gadgets & Tech')
  );
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [isTypingCustomCategory, setIsTypingCustomCategory] = useState(false);

  const [price, setPrice] = useState<number>(initialProduct?.price || 0);
  const [currency, setCurrency] = useState<'RON' | 'EUR' | 'USD'>(initialProduct?.currency || 'RON');
  const [storeName, setStoreName] = useState(initialProduct?.storeName || '');
  const [storeUrl, setStoreUrl] = useState(initialProduct?.storeUrl || '');
  const [exampleSiteUrl, setExampleSiteUrl] = useState(initialProduct?.exampleSiteUrl || '');

  // Secțiunea Nouă: Site Destinație & Checklist
  const [targetSite, setTargetSite] = useState(initialProduct?.targetSite || '');
  const [targetSiteUrl, setTargetSiteUrl] = useState(initialProduct?.targetSiteUrl || '');
  const [listingStatus, setListingStatus] = useState<ListingStatus>(
    initialProduct?.listingStatus || 'planned'
  );
  const [checklist, setChecklist] = useState<ProductChecklist>({
    supplierFound: initialProduct?.checklist?.supplierFound ?? false,
    pageCreated: initialProduct?.checklist?.pageCreated ?? false,
    adsPrepared: initialProduct?.checklist?.adsPrepared ?? false,
    priceCalculated: initialProduct?.checklist?.priceCalculated ?? false,
    trackingReady: initialProduct?.checklist?.trackingReady ?? false,
    liveOnSite: initialProduct?.checklist?.liveOnSite ?? false,
  });

  const toggleChecklistItem = (key: keyof ProductChecklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const checklistStats = calculateChecklistStats(checklist);

  // Imagini
  const [images, setImages] = useState<string[]>(initialProduct?.images || []);
  const [imageUrlInput, setImageUrlInput] = useState('');

  // Campanie & Rezultate Ads (Facebook / TikTok etc.) - Plasată ULTIMA
  const [platform, setPlatform] = useState<string>(
    initialProduct?.campaign?.platform || 'TikTok Ads'
  );
  const [customPlatform, setCustomPlatform] = useState('');
  const [campaignStatus, setCampaignStatus] = useState<CampaignStatus>(
    initialProduct?.campaign?.status || 'untested'
  );
  const [adSpend, setAdSpend] = useState<number>(initialProduct?.campaign?.adSpend || 0);
  const [revenue, setRevenue] = useState<number>(initialProduct?.campaign?.revenue || 0);
  const [ordersCount, setOrdersCount] = useState<number>(initialProduct?.campaign?.ordersCount || 0);
  const [campaignUrl, setCampaignUrl] = useState(initialProduct?.campaign?.campaignUrl || '');
  const [campaignNotes, setCampaignNotes] = useState(initialProduct?.campaign?.notes || '');
  const [cpc, setCpc] = useState<number | undefined>(initialProduct?.campaign?.cpc);
  const [ctr, setCtr] = useState<number | undefined>(initialProduct?.campaign?.ctr);

  // Secțiune link-uri cu reclame: 3 sloturi STAS implicite + adăugare dinamică
  const [adLinkSlots, setAdLinkSlots] = useState<{
    url: string;
    label: string;
    notes?: string;
  }[]>(() => {
    const existing = initialProduct?.adLinks || [];
    // Dacă existau link-uri salvate anterior
    if (existing.length > 0) {
      const mapped = existing.map((l) => ({
        url: l.url || '',
        label: l.label || '',
        notes: l.notes || '',
      }));
      // Asigurăm minim 3 sloturi STAS
      while (mapped.length < 3) {
        mapped.push({ url: '', label: '', notes: '' });
      }
      return mapped;
    }
    // Dacă exista doar vechiul campaignUrl
    if (initialProduct?.campaign?.campaignUrl) {
      return [
        { url: initialProduct.campaign.campaignUrl, label: 'Reclamă Principală', notes: '' },
        { url: '', label: '', notes: '' },
        { url: '', label: '', notes: '' },
      ];
    }
    // STAS 3 sloturi libere
    return [
      { url: '', label: '', notes: '' },
      { url: '', label: '', notes: '' },
      { url: '', label: '', notes: '' },
    ];
  });

  const handleUpdateAdSlot = (index: number, field: 'url' | 'label' | 'notes', value: string) => {
    setAdLinkSlots((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddExtraAdSlot = () => {
    setAdLinkSlots((prev) => [...prev, { url: '', label: '', notes: '' }]);
  };

  const handleRemoveAdSlot = (index: number) => {
    setAdLinkSlots((prev) => {
      // Dacă avem mai mult de 3 sloturi, putem elimina slotul
      if (prev.length > 3) {
        return prev.filter((_, i) => i !== index);
      }
      // Dacă avem 3 sloturi stas, doar îi golim valorile
      const copy = [...prev];
      copy[index] = { url: '', label: '', notes: '' };
      return copy;
    });
  };

  // Puncte forte & slabe
  const [pros, setPros] = useState<string[]>(
    initialProduct?.pros?.length ? initialProduct.pros : ['']
  );
  const [cons, setCons] = useState<string[]>(
    initialProduct?.cons?.length ? initialProduct.cons : ['']
  );
  const [detailedNotes, setDetailedNotes] = useState(initialProduct?.detailedNotes || '');

  // Calcul automat ROAS și CPA
  const calculatedRoas = adSpend > 0 ? Number((revenue / adSpend).toFixed(2)) : 0;
  const calculatedCpa = ordersCount > 0 ? Number((adSpend / ordersCount).toFixed(1)) : 0;

  const [isCompressingImages, setIsCompressingImages] = useState(false);

  // Încărcare imagini locale cu optimizare și compresie automată
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressingImages(true);
    try {
      const fileList = Array.from(files);
      const compressedResults = await Promise.all(
        fileList.map((file) => compressImageFile(file, 1200, 1200, 0.8))
      );
      const valid = compressedResults.filter((img) => Boolean(img));
      setImages((prev) => [...prev, ...valid]);
    } catch (err) {
      console.error('Eroare optimizare imagini:', err);
    } finally {
      setIsCompressingImages(false);
      e.target.value = '';
    }
  };

  const handleAddImageUrl = async () => {
    const input = imageUrlInput.trim();
    if (!input) return;
    if (input.startsWith('data:image')) {
      const compressed = await compressBase64Image(input, 1200, 1200, 0.8);
      setImages((prev) => [...prev, compressed]);
    } else {
      setImages((prev) => [...prev, input]);
    }
    setImageUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddPro = () => setPros((prev) => [...prev, '']);
  const handleUpdatePro = (index: number, val: string) => {
    setPros((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };
  const handleRemovePro = (index: number) => setPros((prev) => prev.filter((_, i) => i !== index));

  const handleAddCon = () => setCons((prev) => [...prev, '']);
  const handleUpdateCon = (index: number, val: string) => {
    setCons((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };
  const handleRemoveCon = (index: number) => setCons((prev) => prev.filter((_, i) => i !== index));

  const handleSelectSupplier = (s: Supplier) => {
    setStoreName(s.name);
    if (s.link && !storeUrl) {
      setStoreUrl(s.link);
    }
    if (!brand) {
      setBrand(s.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Determinare categorie finală
    let finalCategory = category;
    let newCategoryAdded: string | undefined;

    if (isTypingCustomCategory && customCategoryInput.trim()) {
      finalCategory = customCategoryInput.trim();
      newCategoryAdded = finalCategory;
    }

    // Determinare platformă finală
    const finalPlatform = platform === 'custom' && customPlatform.trim() ? customPlatform.trim() : platform;

    // Construire listă de link-uri reclame valide
    const validAdLinks: AdLink[] = adLinkSlots
      .filter((slot) => Boolean(slot.url && slot.url.trim()))
      .map((slot, idx) => ({
        id: `ad_link_${idx}_${Date.now()}`,
        url: slot.url.trim(),
        label: slot.label.trim() || `Reclamă #${idx + 1}`,
        platform: detectAdPlatform(slot.url.trim()),
        notes: slot.notes?.trim() || undefined,
        addedAt: new Date().toISOString().slice(0, 10),
      }));

    // Dacă utilizatorul a introdus link-uri în sloturi, primul devine și linkul principal al campaniei
    const effectiveCampaignUrl = validAdLinks.length > 0 
      ? validAdLinks[0].url 
      : (campaignUrl.trim() || undefined);

    const campaignResults: CampaignResults = {
      platform: finalPlatform,
      status: campaignStatus,
      adSpend: Number(adSpend) || 0,
      revenue: Number(revenue) || 0,
      roas: calculatedRoas,
      ordersCount: Number(ordersCount) || 0,
      cpa: calculatedCpa,
      cpc: cpc ? Number(cpc) : undefined,
      ctr: ctr ? Number(ctr) : undefined,
      campaignUrl: effectiveCampaignUrl,
      notes: campaignNotes.trim() || undefined,
      testedAt: initialProduct?.campaign?.testedAt || new Date().toISOString().slice(0, 10),
    };

    const updatedProduct: Product = {
      id: initialProduct?.id || `prod_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title: title.trim() || 'Produs fără titlu',
      brand: brand.trim() || 'Brand generic',
      category: finalCategory,
      price: Number(price) || 0,
      currency,
      storeName: storeName.trim() || 'Magazin online',
      storeUrl: storeUrl.trim() || '',
      exampleSiteUrl: exampleSiteUrl.trim() || undefined,
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'],
      createdAt: initialProduct?.createdAt || new Date().toISOString().slice(0, 10),
      
      // Date Site Destinație & Checklist
      targetSite: targetSite.trim() || undefined,
      targetSiteUrl: targetSiteUrl.trim() || undefined,
      listingStatus: listingStatus,
      checklist: checklist,

      // Partea de ADS (rămâne ultima)
      campaign: campaignResults,
      adLinks: validAdLinks,
      detailedNotes: detailedNotes.trim() || undefined,
      pros: pros.filter((p) => p.trim().length > 0),
      cons: cons.filter((c) => c.trim().length > 0),
      isFavorite: initialProduct?.isFavorite ?? false,
    };

    onSave(updatedProduct, newCategoryAdded);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white border border-neutral-200/90 rounded-2xl overflow-hidden shadow-2xl my-6 flex flex-col max-h-[92vh] text-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-150 bg-white/95 sticky top-0 z-20 backdrop-blur-md">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-neutral-900">
              {isEditing ? 'Editează Produsul & Planificarea' : 'Adaugă Produs & Planificare Lansare'}
            </h2>
            <p className="text-xs text-neutral-500">
              Date produs, furnizor, site destinație, checklist de pregătire și rezultate campanie Ads.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SECȚIUNEA 1: Informații de bază despre Produs & Furnizor Sursă */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-neutral-100">
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0f4a3c]" />
                <span>1. Date Generale Produs & Furnizor Sursă</span>
              </h3>
            </div>

            {/* Titlu & Brand */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Titlu produs *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ex: Husă Magnetică cu Încărcare Wireless 3-in-1"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#0f4a3c] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Brand / Etichetă
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="ex: Brand Personal sau General"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#0f4a3c] focus:bg-white"
                />
              </div>
            </div>

            {/* Furnizor / Magazin Sursă */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-neutral-700">
                  Furnizor Sursă / Proveniență
                </label>
                {suppliers.length > 0 && (
                  <span className="text-[11px] text-neutral-400">
                    Alege rapid din furnizorii salvați:
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="ex: AliExpress, Shenzhen Factory, 1688, Taobao..."
                  className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#0f4a3c] focus:bg-white"
                />
                {suppliers.length > 0 && (
                  <select
                    onChange={(e) => {
                      const found = suppliers.find((s) => s.id === e.target.value);
                      if (found) handleSelectSupplier(found);
                    }}
                    defaultValue=""
                    className="bg-neutral-100 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-700 font-medium cursor-pointer"
                  >
                    <option value="" disabled>Alege furnizor din listă...</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.platform})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Categorie: Dropdown + Adăugare manuală directă */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-neutral-700">
                  Categorie produs *
                </label>
                <button
                  type="button"
                  onClick={() => setIsTypingCustomCategory(!isTypingCustomCategory)}
                  className="text-[11px] text-[#0f4a3c] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>{isTypingCustomCategory ? 'Alege din lista existentă' : 'Scrie o categorie nouă'}</span>
                </button>
              </div>

              {!isTypingCustomCategory ? (
                <div className="flex gap-2">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#0f4a3c] focus:bg-white cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <input
                  type="text"
                  autoFocus
                  value={customCategoryInput}
                  onChange={(e) => setCustomCategoryInput(e.target.value)}
                  placeholder="Scrie noua categorie (ex: Articole Bebelusi, Scule Auto)..."
                  className="w-full bg-white border border-[#0f4a3c] rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none"
                />
              )}
            </div>

            {/* Preț & Monedă */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Preț vânzare planificat / recomandat *
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={price || ''}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  placeholder="ex: 149"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-neutral-900 focus:outline-none focus:border-[#0f4a3c] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Monedă
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as any)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs font-mono text-neutral-900 focus:outline-none focus:border-[#0f4a3c] focus:bg-white cursor-pointer"
                >
                  <option value="RON">RON</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>

            {/* Link-uri: Furnizor Sursă & Concurență */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Link Furnizor (AliExpress/1688) / Mostră
                </label>
                <input
                  type="url"
                  value={storeUrl}
                  onChange={(e) => setStoreUrl(e.target.value)}
                  placeholder="https://aliexpress.com/... sau link furnizor"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#0f4a3c] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Link Exemplu / Magazin Concurent / Landing Page
                </label>
                <input
                  type="url"
                  value={exampleSiteUrl}
                  onChange={(e) => setExampleSiteUrl(e.target.value)}
                  placeholder="https://exemplu-site.com/landing-page"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#0f4a3c] focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* SECȚIUNEA 2: Site Destinație & Checklist Pregătire Lansare (Cerută de utilizator!) */}
          <div className="bg-[#f8fbfd] border border-blue-200 rounded-2xl p-5 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-blue-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-2xs shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                    <span>2. Site Destinație & Checklist Pregătire Lansare</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {checklistStats.completed}/{checklistStats.total} ({checklistStats.percentage}%)
                    </span>
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Pe ce magazin/site adaugi produsul și care sunt pașii finalizați înainte de reclame.
                  </p>
                </div>
              </div>

              {/* Status Listare */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                <span className="text-[11px] font-semibold text-neutral-600">Stadiu:</span>
                <select
                  value={listingStatus}
                  onChange={(e) => setListingStatus(e.target.value as ListingStatus)}
                  className="text-xs font-bold rounded-xl px-3 py-1.5 border border-blue-200 bg-white text-blue-900 cursor-pointer focus:outline-none shadow-2xs"
                >
                  <option value="planned">În planificare</option>
                  <option value="in_progress">În pregătire</option>
                  <option value="live">Publicat & Activ pe site</option>
                </select>
              </div>
            </div>

            {/* Unde urmează să fie adăugat produsul */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Pe ce site urmează să fie adăugat? (Nume magazin / Brand)
                </label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={targetSite}
                    onChange={(e) => setTargetSite(e.target.value)}
                    placeholder="ex: MagazinulMeu.ro, TrendZone.ro, Brand Shopify..."
                    className="w-full bg-white border border-neutral-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                {existingTargetSites.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 mt-1.5">
                    <span className="text-[10px] text-neutral-400">Sugestii:</span>
                    {existingTargetSites.slice(0, 4).map((site) => (
                      <button
                        key={site}
                        type="button"
                        onClick={() => setTargetSite(site)}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-neutral-200 hover:border-blue-400 text-neutral-700 transition-colors cursor-pointer"
                      >
                        {site}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Link către produs pe site (sau link magazin destinație)
                </label>
                <div className="relative">
                  <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="url"
                    value={targetSiteUrl}
                    onChange={(e) => setTargetSiteUrl(e.target.value)}
                    placeholder="https://magazinulmeu.ro/products/produs-nou"
                    className="w-full bg-white border border-neutral-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Checklist Pregătire Lansare */}
            <div className="space-y-2 pt-2 border-t border-blue-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-700 flex items-center gap-1.5">
                  <ListChecks className="w-4 h-4 text-blue-600" />
                  <span>Checklist etape înainte de lansare:</span>
                </span>
                <span className="font-mono font-bold text-blue-800 text-xs">
                  {checklistStats.percentage}% completat
                </span>
              </div>

              {/* Bară de Progres dinamică */}
              <div className="w-full h-2 bg-neutral-200/80 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    checklistStats.isReady
                      ? 'bg-emerald-600'
                      : checklistStats.percentage >= 50
                      ? 'bg-blue-600'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${checklistStats.percentage}%` }}
                />
              </div>

              {/* Opțiuni bifabile din checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {CHECKLIST_ITEMS_CONFIG.map((item) => {
                  const isChecked = Boolean(checklist[item.key]);
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => toggleChecklistItem(item.key)}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-white border-blue-400 shadow-2xs ring-1 ring-blue-400/20'
                          : 'bg-white/80 border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="pt-0.5 shrink-0">
                        {isChecked ? (
                          <div className="w-4 h-4 rounded-md bg-blue-600 text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-md border-2 border-neutral-300 bg-white" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className={`text-xs font-bold block ${isChecked ? 'text-neutral-900 line-through opacity-80' : 'text-neutral-900'}`}>
                          {item.label}
                        </span>
                        <span className="text-[11px] text-neutral-500 block leading-tight mt-0.5">
                          {item.description}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECȚIUNEA 3: Imagini Produs */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between pb-1 border-b border-neutral-100">
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0f4a3c]" />
                <span>3. Galerie Imagini Produs</span>
              </h3>
            </div>

            {/* Adăugare link URL sau fișier */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="Inserează URL imagine (ex: https://...)"
                className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#0f4a3c] focus:bg-white"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0"
              >
                Adaugă URL
              </button>
              <label className="px-4 py-2 bg-[#eaf3ee] hover:bg-[#d8ece1] text-[#0f4a3c] text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors shrink-0">
                {isCompressingImages ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Se optimizează...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Încarcă fișier</span>
                  </>
                )}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  disabled={isCompressingImages}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Thumbnail-uri */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                      title="Șterge imagine"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECȚIUNEA 4: Puncte Tari, Puncte Slabe & Note */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between pb-1 border-b border-neutral-100">
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0f4a3c]" />
                <span>4. Analiză Produs (Pros & Cons + Notițe)</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pros */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-800">
                  <span>Puncte Tari (Ce a mers bine)</span>
                  <button
                    type="button"
                    onClick={handleAddPro}
                    className="text-[#0f4a3c] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Adaugă
                  </button>
                </div>
                {pros.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={p}
                      onChange={(e) => handleUpdatePro(i, e.target.value)}
                      placeholder="ex: Rata mare de conversie la public tânăr"
                      className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-[#0f4a3c]"
                    />
                    {pros.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePro(i)}
                        className="text-neutral-400 hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Cons */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-rose-800">
                  <span>Puncte Slabe (Probleme / Retururi)</span>
                  <button
                    type="button"
                    onClick={handleAddCon}
                    className="text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Adaugă
                  </button>
                </div>
                {cons.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={c}
                      onChange={(e) => handleUpdateCon(i, e.target.value)}
                      placeholder="ex: Timp mare de livrare de la furnizor"
                      className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-[#0f4a3c]"
                    />
                    {cons.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCon(i)}
                        className="text-neutral-400 hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Note generale */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Notițe adiționale despre produs
              </label>
              <textarea
                rows={2}
                value={detailedNotes}
                onChange={(e) => setDetailedNotes(e.target.value)}
                placeholder="Observații despre stoc, marjă de profit, furnizori alternativi etc."
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs text-neutral-900 focus:outline-none focus:border-[#0f4a3c] resize-none"
              />
            </div>
          </div>

          {/* SECȚIUNEA 5 (ULTIMA, SUB TOATE DATELE PRODUSULUI): Platformă Ads & Rezultate Campanie */}
          <div className="bg-[#f5fbf7] border-2 border-emerald-300/80 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#0f4a3c] text-white flex items-center justify-center shadow-2xs shrink-0">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                    <span>5. Campanie ADS & Rezultate Testare</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      Ads Section
                    </span>
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Alege statusul (inclusiv NETESTAT) și datele de performanță din Ads Manager (Facebook / TikTok).
                  </p>
                </div>
              </div>

              {/* Status Campanie Badge cu NETESTAT inclus */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                <span className="text-[11px] font-semibold text-neutral-600">Status:</span>
                <select
                  value={campaignStatus}
                  onChange={(e) => setCampaignStatus(e.target.value as CampaignStatus)}
                  className={`text-xs font-bold rounded-xl px-3 py-1.5 border cursor-pointer focus:outline-none shadow-2xs ${
                    CAMPAIGN_STATUS_LABELS[campaignStatus]?.bg || 'bg-white'
                  } ${CAMPAIGN_STATUS_LABELS[campaignStatus]?.color || 'text-neutral-800'} ${
                    CAMPAIGN_STATUS_LABELS[campaignStatus]?.border || 'border-neutral-300'
                  }`}
                >
                  <option value="untested">Netestat</option>
                  <option value="testing">În testare</option>
                  <option value="winner">Winner (Scalat)</option>
                  <option value="promising">Promițător (Break-even)</option>
                  <option value="stopped">Oprit (Necâștigător)</option>
                </select>
              </div>
            </div>

            {/* Platform Selection */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-2">
                Platforma unde ai testat:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['TikTok Ads', 'Facebook Ads', 'Google Ads', 'custom'].map((plat) => {
                  const isSelected = plat === 'custom' ? platform === 'custom' : platform === plat;
                  const label = plat === 'custom' ? 'Altă platformă' : plat;

                  return (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => setPlatform(plat)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0f4a3c] text-white border-[#0f4a3c] shadow-xs'
                          : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {platform === 'custom' && (
                <input
                  type="text"
                  value={customPlatform}
                  onChange={(e) => setCustomPlatform(e.target.value)}
                  placeholder="Introdu numele platformei (ex: Instagram, Pinterest, Snapchat)..."
                  className="mt-2 w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#0f4a3c]"
                />
              )}
            </div>

            {/* Metrics Inputs: Spend, Revenue, ROAS, Orders */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                  Buget cheltuit (Ad Spend)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={adSpend || ''}
                    onChange={(e) => setAdSpend(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-neutral-900 focus:outline-none focus:border-[#0f4a3c]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-neutral-400">
                    {currency}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                  Venit generat (Revenue)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={revenue || ''}
                    onChange={(e) => setRevenue(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-neutral-900 focus:outline-none focus:border-[#0f4a3c]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-neutral-400">
                    {currency}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                  ROAS calculat
                </label>
                <div className="w-full bg-neutral-100 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-mono font-bold flex items-center justify-between text-[#0f4a3c]">
                  <span>{calculatedRoas > 0 ? `${calculatedRoas}x` : '—'}</span>
                  <span className="text-[10px] text-neutral-400 font-normal">Auto</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                  Număr comenzi
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={ordersCount || ''}
                  onChange={(e) => setOrdersCount(parseInt(e.target.value, 10) || 0)}
                  placeholder="0"
                  className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-neutral-900 focus:outline-none focus:border-[#0f4a3c]"
                />
              </div>
            </div>

            {/* Optional Ad Metrics: CPA, CPC, CTR */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div>
                <span className="text-[11px] text-neutral-500 block mb-1">CPA (Cost per comandă)</span>
                <div className="bg-white border border-neutral-200 rounded-xl px-3 py-1.5 font-mono text-neutral-800 font-semibold">
                  {calculatedCpa > 0 ? `${calculatedCpa} ${currency}` : '—'}
                </div>
              </div>

              <div>
                <span className="text-[11px] text-neutral-500 block mb-1">CPC (Cost per Click)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={cpc || ''}
                  onChange={(e) => setCpc(parseFloat(e.target.value) || undefined)}
                  placeholder="ex: 0.85 RON"
                  className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-1.5 font-mono text-xs text-neutral-800 focus:outline-none focus:border-[#0f4a3c]"
                />
              </div>

              <div>
                <span className="text-[11px] text-neutral-500 block mb-1">CTR (%)</span>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={ctr || ''}
                  onChange={(e) => setCtr(parseFloat(e.target.value) || undefined)}
                  placeholder="ex: 2.4%"
                  className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-1.5 font-mono text-xs text-neutral-800 focus:outline-none focus:border-[#0f4a3c]"
                />
              </div>
            </div>

            {/* Secțiune Specială: Link-uri cu Reclame (3 Sloturi STAS + Adăugare opțională) */}
            <div className="pt-3 border-t border-emerald-200/60 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-[#0f4a3c]" />
                    <span>Link-uri Reclame & Creativuri Video</span>
                  </label>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    3 sloturi STAS libere pentru link-uri TikTok, Facebook Ads Library, YouTube sau Instagram (plus adăugare opțională).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddExtraAdSlot}
                  className="px-2.5 py-1 text-[11px] font-semibold text-[#0f4a3c] bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1 border border-emerald-200/80 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Adaugă slot ({adLinkSlots.length + 1})</span>
                </button>
              </div>

              {/* Sloturi Reclame */}
              <div className="space-y-3">
                {adLinkSlots.map((slot, index) => {
                  const detected = slot.url ? detectAdPlatform(slot.url) : null;
                  const isStas = index < 3;

                  return (
                    <div
                      key={index}
                      className="p-3 bg-white/90 border border-emerald-150 rounded-xl shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#0f4a3c] text-white flex items-center justify-center font-bold text-[10px]">
                            {index + 1}
                          </span>
                          <span className="font-semibold text-neutral-800">
                            {isStas ? `Slot STAS #${index + 1}` : `Slot Suplimentar #${index + 1}`}
                          </span>
                          {detected && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {detected}
                            </span>
                          )}
                        </div>

                        {/* Buton ștergere slot */}
                        {(adLinkSlots.length > 3 || slot.url) && (
                          <button
                            type="button"
                            onClick={() => handleRemoveAdSlot(index)}
                            className="text-[11px] text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer flex items-center gap-1"
                            title={isStas ? 'Golește acest slot' : 'Șterge acest slot'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{isStas ? 'Golește' : 'Șterge slot'}</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                        {/* Denumire / Etichetă Slot */}
                        <div className="sm:col-span-4">
                          <input
                            type="text"
                            value={slot.label}
                            onChange={(e) => handleUpdateAdSlot(index, 'label', e.target.value)}
                            placeholder={index === 0 ? "ex: Video Hook Problemă" : index === 1 ? "ex: Video UGC Testimonial" : "ex: Reclamă Meta Câștigătoare"}
                            className="w-full bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-[#0f4a3c]"
                          />
                        </div>

                        {/* URL Link Reclamă */}
                        <div className="sm:col-span-8">
                          <input
                            type="url"
                            value={slot.url}
                            onChange={(e) => handleUpdateAdSlot(index, 'url', e.target.value)}
                            placeholder="https://tiktok.com/@... sau https://facebook.com/ads/library/..."
                            className="w-full bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-neutral-900 focus:outline-none focus:border-[#0f4a3c]"
                          />
                        </div>
                      </div>

                      {/* Notă scurtă opțională despre reclama din acest slot */}
                      <input
                        type="text"
                        value={slot.notes || ''}
                        onChange={(e) => handleUpdateAdSlot(index, 'notes', e.target.value)}
                        placeholder="Notă opțională (ex: Creativul cu unghi de ofertă 1+1 Gratis, ROAS 3.2x)"
                        className="w-full bg-neutral-50/80 border border-neutral-200/80 rounded-lg px-2.5 py-1 text-[11px] text-neutral-700 focus:outline-none focus:border-[#0f4a3c]"
                      />

                      {/* Mini Preview rapid dacă este introdus URL */}
                      {slot.url && (
                        <div className="pt-1">
                          <AdPreviewCard
                            url={slot.url}
                            label={slot.label || `Reclamă #${index + 1}`}
                            compact={true}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Concluzii campanie & Creativ câștigător */}
            <div className="pt-2 border-t border-emerald-200/60">
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Concluzii campanie & Creativ câștigător:
              </label>
              <textarea
                rows={2}
                value={campaignNotes}
                onChange={(e) => setCampaignNotes(e.target.value)}
                placeholder="Ex: Hook-ul din primele 3 secunde cu demonstrația a adus 70% din comenzi. Audiența Broad a funcționat mai bine decât targetarea pe interese."
                className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-xs text-neutral-900 focus:outline-none focus:border-[#0f4a3c] resize-none"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-neutral-150 flex items-center justify-end gap-3 sticky bottom-0 bg-white/95 pb-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              Anulează
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-[#0f4a3c] hover:bg-[#0c3c31] text-white shadow-xs transition-colors cursor-pointer"
            >
              {isEditing ? 'Salvează modificările' : 'Adaugă produsul'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
