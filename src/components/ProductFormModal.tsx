import React, { useState } from 'react';
import {
  Product,
  ProductCategory,
  ProductStatus,
  RatingCriteria,
  SponsorshipType,
  VerdictType
} from '../types/product';
import { CATEGORIES_LIST } from '../data/initialProducts';
import {
  X,
  Upload,
  Plus,
  Trash2,
  Star,
  Megaphone
} from 'lucide-react';

interface ProductFormModalProps {
  initialProduct?: Product | null;
  onSave: (product: Product) => void;
  onClose: () => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  initialProduct,
  onSave,
  onClose,
}) => {
  const isEditing = Boolean(initialProduct);

  const [title, setTitle] = useState(initialProduct?.title || '');
  const [brand, setBrand] = useState(initialProduct?.brand || '');
  const [category, setCategory] = useState<ProductCategory>(
    initialProduct?.category || 'Tech & Gadgets'
  );
  const [status, setStatus] = useState<ProductStatus>(initialProduct?.status || 'to_test');
  const [price, setPrice] = useState<number>(initialProduct?.price || 0);
  const [currency, setCurrency] = useState<'RON' | 'EUR' | 'USD'>(initialProduct?.currency || 'RON');
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(initialProduct?.originalPrice);
  const [storeName, setStoreName] = useState(initialProduct?.storeName || '');
  const [storeUrl, setStoreUrl] = useState(initialProduct?.storeUrl || '');
  const [exampleSiteUrl, setExampleSiteUrl] = useState(initialProduct?.exampleSiteUrl || '');
  const [targetTestingDays, setTargetTestingDays] = useState<number>(initialProduct?.targetTestingDays || 14);

  // Images state
  const [images, setImages] = useState<string[]>(initialProduct?.images || []);
  const [imageUrlInput, setImageUrlInput] = useState('');

  // Sponsorship & Ad Details
  const [sponsorship, setSponsorship] = useState<SponsorshipType>(
    initialProduct?.sponsorship || 'personal'
  );
  const [campaignName, setCampaignName] = useState(initialProduct?.adDetails?.campaignName || '');
  const [sponsorName, setSponsorName] = useState(initialProduct?.adDetails?.sponsorName || '');
  const [discountCode, setDiscountCode] = useState(initialProduct?.adDetails?.discountCode || '');
  const [discountPercentage, setDiscountPercentage] = useState(initialProduct?.adDetails?.discountPercentage || '');
  const [deadline, setDeadline] = useState(initialProduct?.adDetails?.deadline || '');
  const [deliverables, setDeliverables] = useState(initialProduct?.adDetails?.deliverableRequirement || '');

  // Criteria ratings
  const [criteria, setCriteria] = useState<RatingCriteria>({
    quality: initialProduct?.ratingCriteria?.quality || 4,
    valueForMoney: initialProduct?.ratingCriteria?.valueForMoney || 4,
    usability: initialProduct?.ratingCriteria?.usability || 4,
    performance: initialProduct?.ratingCriteria?.performance || 4,
    durability: initialProduct?.ratingCriteria?.durability || 4,
  });

  const [overallRating, setOverallRating] = useState<number>(
    initialProduct?.overallRating || 4.0
  );

  // Pros & Cons
  const [pros, setPros] = useState<string[]>(
    initialProduct?.pros?.length ? initialProduct.pros : ['']
  );
  const [cons, setCons] = useState<string[]>(
    initialProduct?.cons?.length ? initialProduct.cons : ['']
  );

  // Verdict & Notes
  const [verdict, setVerdict] = useState<VerdictType>(
    initialProduct?.verdict || 'recommended'
  );
  const [reviewSummary, setReviewSummary] = useState(initialProduct?.reviewSummary || '');
  const [detailedNotes, setDetailedNotes] = useState(initialProduct?.detailedNotes || '');

  // Handle local file uploads
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
  const handleRemovePro = (index: number) => {
    setPros((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddCon = () => setCons((prev) => [...prev, '']);
  const handleUpdateCon = (index: number, val: string) => {
    setCons((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };
  const handleRemoveCon = (index: number) => {
    setCons((prev) => prev.filter((_, i) => i !== index));
  };

  // Re-calculate overall score on criteria changes
  const updateCriteriaField = (field: keyof RatingCriteria, value: number) => {
    const nextCriteria = { ...criteria, [field]: value };
    setCriteria(nextCriteria);
    const avg = (
      (nextCriteria.quality +
        nextCriteria.valueForMoney +
        nextCriteria.usability +
        nextCriteria.performance +
        nextCriteria.durability) /
      5
    );
    setOverallRating(Number(avg.toFixed(1)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Te rugăm să introduci numele produsului.');
      return;
    }

    const filteredPros = pros.filter((p) => p.trim() !== '');
    const filteredCons = cons.filter((c) => c.trim() !== '');

    const productPayload: Product = {
      id: initialProduct?.id || `prod-${Date.now()}`,
      title: title.trim(),
      brand: brand.trim() || 'Generic',
      category,
      status,
      price: Number(price) || 0,
      currency,
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      storeName: storeName.trim(),
      storeUrl: storeUrl.trim(),
      exampleSiteUrl: exampleSiteUrl.trim(),
      images,
      sponsorship,
      adDetails:
        sponsorship !== 'personal'
          ? {
              campaignName: campaignName.trim(),
              sponsorName: sponsorName.trim(),
              discountCode: discountCode.trim(),
              discountPercentage: discountPercentage.trim(),
              deadline: deadline.trim(),
              deliverableRequirement: deliverables.trim(),
            }
          : undefined,
      targetTestingDays: Number(targetTestingDays) || 14,
      startedTestingAt: initialProduct?.startedTestingAt || (status === 'testing' ? new Date().toISOString().slice(0, 10) : undefined),
      completedTestingAt: initialProduct?.completedTestingAt || (status === 'tested' ? new Date().toISOString().slice(0, 10) : undefined),
      createdAt: initialProduct?.createdAt || new Date().toISOString(),
      ratingCriteria: criteria,
      overallRating: Number(overallRating) || 0,
      pros: filteredPros,
      cons: filteredCons,
      verdict,
      reviewSummary: reviewSummary.trim(),
      detailedNotes: detailedNotes.trim(),
      logs: initialProduct?.logs || [],
      isFavorite: initialProduct?.isFavorite || false,
    };

    onSave(productPayload);
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
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-150 bg-white/95 sticky top-0 z-10 backdrop-blur-md">
          <h2 className="text-base font-bold text-neutral-900">
            {isEditing ? 'Editează Produsul & Recenzia' : 'Adaugă Produs Nou în Jurnal'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Photos Upload */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block">
              1. Fotografii Produs (Încărcare din computer sau URL)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* File upload input */}
              <label className="cursor-pointer border-2 border-dashed border-[#cfe5d9] hover:border-[#0f4a3c] bg-[#f4f8f5] rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-colors">
                <Upload className="w-6 h-6 text-[#0f4a3c] mb-2" />
                <span className="text-xs font-semibold text-neutral-900">Alege poze de pe computer</span>
                <span className="text-[11px] text-neutral-500 mt-0.5">PNG, JPG, WEBP suportate</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* URL input */}
              <div className="border border-neutral-200 bg-neutral-50 rounded-2xl p-4 flex flex-col justify-center gap-2">
                <span className="text-xs font-semibold text-neutral-700">Sau adaugă un link direct (URL):</span>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="https://site.ro/poza.jpg"
                    className="flex-1 bg-white border border-neutral-200 rounded-xl px-2.5 py-1.5 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#0f4a3c]"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3 py-1.5 bg-[#0f4a3c] hover:bg-[#0c3c31] text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    Adaugă
                  </button>
                </div>
              </div>
            </div>

            {/* Images Preview List */}
            {images.length > 0 && (
              <div className="flex items-center gap-3 overflow-x-auto py-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-neutral-200 shrink-0 group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Șterge imaginea"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Core Details */}
          <div className="space-y-4 pt-4 border-t border-neutral-200">
            <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block">
              2. Detalii Generale Produs
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-neutral-700 block mb-1">Nume Produs *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ex: Căști Bose QuietComfort Ultra"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:bg-white focus:border-[#0f4a3c]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">Brand / Producător</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="ex: Bose, Apple, Philips..."
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:bg-white focus:border-[#0f4a3c]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">Categorie</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:bg-white focus:border-[#0f4a3c]"
                >
                  {CATEGORIES_LIST.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">Stadiu Monitorizare</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProductStatus)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:bg-white focus:border-[#0f4a3c] font-semibold"
                >
                  <option value="to_test">De testat (Wishlist / Backlog)</option>
                  <option value="testing">În testare activă</option>
                  <option value="tested">Testat și evaluat</option>
                  <option value="rejected">Respins / Abandonat</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">Zile Țintă Testare</label>
                <input
                  type="number"
                  min="1"
                  value={targetTestingDays}
                  onChange={(e) => setTargetTestingDays(Number(e.target.value))}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:bg-white focus:border-[#0f4a3c] font-mono"
                />
              </div>
            </div>

            {/* Price & Currency */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">Preț Curent / Achiziție</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="ex: 499"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 font-mono focus:outline-none focus:bg-white focus:border-[#0f4a3c]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">Monedă</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as any)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:bg-white focus:border-[#0f4a3c]"
                >
                  <option value="RON">RON</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">Preț Inițial (Opțional)</label>
                <input
                  type="number"
                  value={originalPrice || ''}
                  onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="ex: 699"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 font-mono focus:outline-none focus:bg-white focus:border-[#0f4a3c]"
                />
              </div>
            </div>

            {/* Store & Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">Nume Magazin / Sursă</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="ex: eMAG, Altex, Amazon, Flanco..."
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:bg-white focus:border-[#0f4a3c]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">Link Direct Produs</label>
                <input
                  type="url"
                  value={storeUrl}
                  onChange={(e) => setStoreUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:bg-white focus:border-[#0f4a3c]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-neutral-700 block mb-1">Site Exemplu / Link Recenzie Video externă</label>
                <input
                  type="url"
                  value={exampleSiteUrl}
                  onChange={(e) => setExampleSiteUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?... sau site oficial"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:bg-white focus:border-[#0f4a3c]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Sponsorship & Advertising Campaign */}
          <div className="space-y-4 pt-4 border-t border-neutral-200">
            <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block">
              3. Tip Finanțare & Reclamă / Campanie
            </label>

            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">Proveniență Produs</label>
              <select
                value={sponsorship}
                onChange={(e) => setSponsorship(e.target.value as SponsorshipType)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:bg-white focus:border-[#0f4a3c] font-semibold"
              >
                <option value="personal">Achiziție personală (din fonduri proprii)</option>
                <option value="sponsored">Parteneriat plătit (Reclamă comercială)</option>
                <option value="pr_gift">PR Sample / Produs primit cadou pentru testare</option>
                <option value="affiliate">Link afiliat / Comision vânzare</option>
              </select>
            </div>

            {sponsorship !== 'personal' && (
              <div className="p-4 bg-[#f0f7f3] border border-[#d8ece1] rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0f4a3c]">
                  <Megaphone className="w-4 h-4" />
                  <span>Detalii Campanie Publicitară & Colaborare</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-neutral-600 block mb-1 font-medium">Nume Campanie</label>
                    <input
                      type="text"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      placeholder="ex: Lansare toamnă 2026"
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-xs text-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-600 block mb-1 font-medium">Brand Sponsor / Agenție</label>
                    <input
                      type="text"
                      value={sponsorName}
                      onChange={(e) => setSponsorName(e.target.value)}
                      placeholder="ex: Brand PR Team"
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-xs text-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-600 block mb-1 font-medium">Cod Reducere Urmăritori</label>
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      placeholder="ex: TESTER15"
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-xs font-mono text-[#0f4a3c] font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-600 block mb-1 font-medium">Termen Limită Livrabil</label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-xs text-neutral-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-neutral-600 block mb-1 font-medium">Livrabile Convenite</label>
                  <input
                    type="text"
                    value={deliverables}
                    onChange={(e) => setDeliverables(e.target.value)}
                    placeholder="ex: 1x Review blog detaliat + 1x Video demonstrativ"
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-xs text-neutral-900"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Rating Criteria */}
          <div className="space-y-4 pt-4 border-t border-neutral-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block">
                4. Criterii de Notare & Calificative (1 - 5)
              </label>
              <div className="flex items-center gap-1.5 bg-[#eaf3ee] px-3 py-1 rounded-full">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="text-xs font-mono font-bold text-[#0f4a3c] tabular-nums">
                  Scor Mediu: {overallRating} / 5
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-50 p-4 rounded-2xl border border-neutral-200 text-xs">
              <div>
                <div className="flex justify-between text-neutral-700 mb-1 font-medium">
                  <span>Calitate & Finisaje:</span>
                  <span className="font-mono font-bold text-[#0f4a3c]">{criteria.quality}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={criteria.quality}
                  onChange={(e) => updateCriteriaField('quality', parseFloat(e.target.value))}
                  className="w-full accent-[#0f4a3c] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-neutral-700 mb-1 font-medium">
                  <span>Raport Calitate / Preț:</span>
                  <span className="font-mono font-bold text-[#0f4a3c]">{criteria.valueForMoney}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={criteria.valueForMoney}
                  onChange={(e) => updateCriteriaField('valueForMoney', parseFloat(e.target.value))}
                  className="w-full accent-[#0f4a3c] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-neutral-700 mb-1 font-medium">
                  <span>Ușurință în Utilizare:</span>
                  <span className="font-mono font-bold text-[#0f4a3c]">{criteria.usability}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={criteria.usability}
                  onChange={(e) => updateCriteriaField('usability', parseFloat(e.target.value))}
                  className="w-full accent-[#0f4a3c] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-neutral-700 mb-1 font-medium">
                  <span>Performanță Reală:</span>
                  <span className="font-mono font-bold text-[#0f4a3c]">{criteria.performance}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={criteria.performance}
                  onChange={(e) => updateCriteriaField('performance', parseFloat(e.target.value))}
                  className="w-full accent-[#0f4a3c] cursor-pointer"
                />
              </div>

              <div className="sm:col-span-2">
                <div className="flex justify-between text-neutral-700 mb-1 font-medium">
                  <span>Durabilitate & Autonomie:</span>
                  <span className="font-mono font-bold text-[#0f4a3c]">{criteria.durability}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={criteria.durability}
                  onChange={(e) => updateCriteriaField('durability', parseFloat(e.target.value))}
                  className="w-full accent-[#0f4a3c] cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">Verdict Final Recomandare</label>
              <select
                value={verdict}
                onChange={(e) => setVerdict(e.target.value as VerdictType)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:bg-white focus:border-[#0f4a3c] font-semibold"
              >
                <option value="highly_recommended">Recomand cu căldură (Alegere de top)</option>
                <option value="recommended">Recomandat (Solid în clasa sa)</option>
                <option value="wait_for_sale">Merită doar la reducere / promoție</option>
                <option value="neutral">Neutru / Cu rezerve</option>
                <option value="not_recommended">Nu recomand (Probleme majore)</option>
              </select>
            </div>
          </div>

          {/* Section 5: Pros & Cons */}
          <div className="space-y-4 pt-4 border-t border-neutral-200">
            <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block">
              5. Puncte Forte (PRO) și Slabe (CONTRA)
            </label>

            {/* Pros */}
            <div className="space-y-2">
              <span className="text-xs text-emerald-700 font-bold block">Puncte Forte:</span>
              {pros.map((p, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={p}
                    onChange={(e) => handleUpdatePro(idx, e.target.value)}
                    placeholder="Adaugă un plus al produsului..."
                    className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-1.5 text-xs text-neutral-900"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePro(idx)}
                    className="p-1.5 text-neutral-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddPro}
                className="text-xs text-[#0f4a3c] hover:underline flex items-center gap-1 font-semibold mt-1"
              >
                <Plus className="w-3 h-3" />
                <span>Adaugă alt plus</span>
              </button>
            </div>

            {/* Cons */}
            <div className="space-y-2 pt-2">
              <span className="text-xs text-rose-700 font-bold block">Puncte Slabe:</span>
              {cons.map((c, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={c}
                    onChange={(e) => handleUpdateCon(idx, e.target.value)}
                    placeholder="Adaugă un minus al produsului..."
                    className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-1.5 text-xs text-neutral-900"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCon(idx)}
                    className="p-1.5 text-neutral-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddCon}
                className="text-xs text-rose-700 hover:underline flex items-center gap-1 font-semibold mt-1"
              >
                <Plus className="w-3 h-3" />
                <span>Adaugă alt minus</span>
              </button>
            </div>
          </div>

          {/* Section 6: Summary & Detailed Notes */}
          <div className="space-y-4 pt-4 border-t border-neutral-200">
            <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block">
              6. Concluzie Review & Comentarii Personale
            </label>

            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">Rezumat Recenzie (1-2 fraze)</label>
              <textarea
                rows={2}
                value={reviewSummary}
                onChange={(e) => setReviewSummary(e.target.value)}
                placeholder="Concluzia pe scurt a recenziei tale..."
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs text-neutral-900 focus:outline-none focus:bg-white focus:border-[#0f4a3c]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">Notițe și Comentarii Detaliate</label>
              <textarea
                rows={4}
                value={detailedNotes}
                onChange={(e) => setDetailedNotes(e.target.value)}
                placeholder="Detalii extinse despre experiența ta de testare în viața reală..."
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs text-neutral-900 focus:outline-none focus:bg-white focus:border-[#0f4a3c]"
              />
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white/95 py-3 backdrop-blur-md">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Anulează
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-[#0f4a3c] hover:bg-[#0c3c31] text-white rounded-xl transition-colors shadow-xs"
            >
              {isEditing ? 'Salvează Modificările' : 'Adaugă Produsul în Jurnal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
