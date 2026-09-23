import React, { useState, useEffect } from 'react';
import { Product, CampaignResults, CampaignStatus } from '../types/product';
import { AD_PLATFORMS, CAMPAIGN_STATUS_LABELS } from '../data/initialProducts';
import {
  X,
  Upload,
  Plus,
  Trash2,
  Megaphone,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Link,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

interface ProductFormModalProps {
  initialProduct?: Product | null;
  categories: string[];
  onSave: (product: Product, newCategoryCreated?: string) => void;
  onClose: () => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  initialProduct,
  categories,
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

  // Imagini
  const [images, setImages] = useState<string[]>(initialProduct?.images || []);
  const [imageUrlInput, setImageUrlInput] = useState('');

  // Campanie & Rezultate Ads (Facebook / TikTok etc.)
  const [platform, setPlatform] = useState<string>(
    initialProduct?.campaign?.platform || 'TikTok Ads'
  );
  const [customPlatform, setCustomPlatform] = useState('');
  const [campaignStatus, setCampaignStatus] = useState<CampaignStatus>(
    initialProduct?.campaign?.status || 'testing'
  );
  const [adSpend, setAdSpend] = useState<number>(initialProduct?.campaign?.adSpend || 0);
  const [revenue, setRevenue] = useState<number>(initialProduct?.campaign?.revenue || 0);
  const [ordersCount, setOrdersCount] = useState<number>(initialProduct?.campaign?.ordersCount || 0);
  const [campaignUrl, setCampaignUrl] = useState(initialProduct?.campaign?.campaignUrl || '');
  const [campaignNotes, setCampaignNotes] = useState(initialProduct?.campaign?.notes || '');
  const [cpc, setCpc] = useState<number | undefined>(initialProduct?.campaign?.cpc);
  const [ctr, setCtr] = useState<number | undefined>(initialProduct?.campaign?.ctr);

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

  // Încărcare imagini locale
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64Url = uploadEvent.target?.result as string;
        if (base64Url) {
          setImages((prev) => [...prev, base64Url]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages((prev) => [...prev, imageUrlInput.trim()]);
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
      campaignUrl: campaignUrl.trim() || undefined,
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
      campaign: campaignResults,
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
              {isEditing ? 'Editează Produsul & Campania' : 'Adaugă Produs & Rezultate Campanie'}
            </h2>
            <p className="text-xs text-neutral-500">
              Înregistrează produsul, platforma pe care ai testat (TikTok/Facebook) și metricele campaniei.
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
          {/* SECȚIUNEA 1: Platformă Ads & Rezultate Campanie (Facebook / TikTok) */}
          <div className="bg-[#f5fbf7] border border-emerald-200/80 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#0f4a3c] text-white flex items-center justify-center shadow-2xs">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Platformă de Testare & Rezultate Campanie
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Alege platforma (TikTok Ads, Facebook Ads etc.) și introdu cifrele din Ads Manager.
                  </p>
                </div>
              </div>

              {/* Status Campanie Badge */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-neutral-500 hidden sm:inline">Status:</span>
                <select
                  value={campaignStatus}
                  onChange={(e) => setCampaignStatus(e.target.value as CampaignStatus)}
                  className={`text-xs font-bold rounded-xl px-3 py-1.5 border cursor-pointer focus:outline-none shadow-2xs ${
                    CAMPAIGN_STATUS_LABELS[campaignStatus]?.bg || 'bg-white'
                  } ${CAMPAIGN_STATUS_LABELS[campaignStatus]?.color || 'text-neutral-800'} ${
                    CAMPAIGN_STATUS_LABELS[campaignStatus]?.border || 'border-neutral-300'
                  }`}
                >
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

            {/* Link Campanie & Concluzii / Unghi de vânzare */}
            <div className="space-y-2 pt-2 border-t border-emerald-200/60">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                  Link campanie / Video creativ (TikTok sau Facebook Ads Library):
                </label>
                <input
                  type="url"
                  value={campaignUrl}
                  onChange={(e) => setCampaignUrl(e.target.value)}
                  placeholder="https://tiktok.com/@... sau https://facebook.com/ads/library/..."
                  className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#0f4a3c]"
                />
              </div>

              <div>
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
          </div>

          {/* SECȚIUNEA 2: Informații de bază despre Produs & Categorie */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Date Generale Produs
            </h3>

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
                  Brand / Furnizor
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="ex: Brand Personal sau Furnizor"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#0f4a3c] focus:bg-white"
                />
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
                  Preț vânzare produs *
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

            {/* Link-uri: Magazin & Concurență */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Link Magazin propriu / Furnizor
                </label>
                <input
                  type="url"
                  value={storeUrl}
                  onChange={(e) => setStoreUrl(e.target.value)}
                  placeholder="https://magazin.ro/produs sau link furnizor"
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

          {/* SECȚIUNEA 3: Imagini Produs */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Galerie Imagini Produs
            </h3>

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
                <Upload className="w-3.5 h-3.5" />
                <span>Încarcă fișier</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
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
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Analiză Produs (Pros & Cons)
            </h3>

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
              {isEditing ? 'Salvează modificările' : 'Adaugă produsul & campania'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
