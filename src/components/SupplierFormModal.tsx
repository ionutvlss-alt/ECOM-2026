import React, { useState } from 'react';
import { Supplier } from '../types/supplier';
import { Product } from '../types/product';
import {
  X,
  Building2,
  Globe,
  Phone,
  Mail,
  MessageSquare,
  Star,
  Plus,
  Trash2,
  Package,
  Check,
  Link as LinkIcon,
  User,
  FileText
} from 'lucide-react';

interface SupplierFormModalProps {
  initialSupplier?: Supplier | null;
  catalogProducts: Product[];
  onSave: (supplier: Supplier) => void;
  onClose: () => void;
}

const COMMON_PLATFORMS = [
  'AliExpress',
  '1688',
  'Alibaba',
  'CJ Dropshipping',
  'Taobao',
  'Temu',
  'Furnizor Local (România)',
  'Fabrică Directă',
  'Altă Platformă',
];

export const SupplierFormModal: React.FC<SupplierFormModalProps> = ({
  initialSupplier,
  catalogProducts,
  onSave,
  onClose,
}) => {
  const isEditing = Boolean(initialSupplier);

  const [name, setName] = useState(initialSupplier?.name || '');
  const [platform, setPlatform] = useState(initialSupplier?.platform || 'AliExpress');
  const [customPlatform, setCustomPlatform] = useState('');
  const [link, setLink] = useState(initialSupplier?.link || '');
  const [contactPerson, setContactPerson] = useState(initialSupplier?.contactPerson || '');
  const [phone, setPhone] = useState(initialSupplier?.phone || '');
  const [email, setEmail] = useState(initialSupplier?.email || '');
  const [wechat, setWechat] = useState(initialSupplier?.wechat || '');
  const [rating, setRating] = useState<number>(initialSupplier?.rating || 5);
  const [notes, setNotes] = useState(initialSupplier?.notes || '');

  // Produse cumpărate
  const [purchasedProducts, setPurchasedProducts] = useState<string[]>(
    initialSupplier?.purchasedProducts || []
  );
  const [customProductInput, setCustomProductInput] = useState('');

  const handleToggleCatalogProduct = (productTitle: string) => {
    if (purchasedProducts.includes(productTitle)) {
      setPurchasedProducts((prev) => prev.filter((p) => p !== productTitle));
    } else {
      setPurchasedProducts((prev) => [...prev, productTitle]);
    }
  };

  const handleAddCustomProduct = () => {
    const trimmed = customProductInput.trim();
    if (!trimmed) return;
    if (!purchasedProducts.includes(trimmed)) {
      setPurchasedProducts((prev) => [...prev, trimmed]);
    }
    setCustomProductInput('');
  };

  const handleRemoveProduct = (prodName: string) => {
    setPurchasedProducts((prev) => prev.filter((p) => p !== prodName));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalPlatform = platform === 'Altă Platformă' && customPlatform.trim()
      ? customPlatform.trim()
      : platform;

    const supplierData: Supplier = {
      id: initialSupplier?.id || `supp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim() || 'Furnizor fără nume',
      platform: finalPlatform,
      link: link.trim() || undefined,
      contactPerson: contactPerson.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      wechat: wechat.trim() || undefined,
      purchasedProducts: purchasedProducts,
      rating: rating,
      notes: notes.trim() || undefined,
      createdAt: initialSupplier?.createdAt || new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    onSave(supplierData);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white border border-neutral-200/90 rounded-2xl overflow-hidden shadow-2xl my-6 flex flex-col max-h-[92vh] text-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-150 bg-white/95 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0f4a3c] text-white flex items-center justify-center shadow-2xs">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                {isEditing ? 'Editează Date Furnizor' : 'Adaugă Contact Furnizor Nou'}
              </h2>
              <p className="text-xs text-neutral-500">
                Completează datele de contact, platforma și produsele achiziționate.
              </p>
            </div>
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Nume & Platformă */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Nume Furnizor / Fabrică / Magazin *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: Shenzhen Electronics Co., Guangzhou Apparel"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#0f4a3c] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Platformă Aprovizionare *
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#0f4a3c] focus:bg-white cursor-pointer"
              >
                {COMMON_PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {platform === 'Altă Platformă' && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Specifică platforma / sursa
              </label>
              <input
                type="text"
                value={customPlatform}
                onChange={(e) => setCustomPlatform(e.target.value)}
                placeholder="ex: Made-in-China, Direct Agent, Yiwu Market"
                className="w-full bg-white border border-[#0f4a3c] rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none"
              />
            </div>
          )}

          {/* Link Magazin / Catalog */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Link către Magazin / Profil Furnizor
            </label>
            <div className="relative">
              <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://aliexpress.com/store/... sau https://1688.com/..."
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#0f4a3c] focus:bg-white"
              />
            </div>
          </div>

          {/* Date de Contact */}
          <div className="bg-neutral-50/70 border border-neutral-200/80 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
              Persoană & Canale de Contact
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                  Persoană de Contact / Agent
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="ex: David Chen, Maria Ionescu"
                    className="w-full bg-white border border-neutral-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-[#0f4a3c]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                  Telefon / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+86 138... sau +40 7..."
                    className="w-full bg-white border border-neutral-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-[#0f4a3c]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                  Adresă Email
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="furnizor@exemplu.com"
                    className="w-full bg-white border border-neutral-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-[#0f4a3c]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                  WeChat ID (util pentru China)
                </label>
                <div className="relative">
                  <MessageSquare className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={wechat}
                    onChange={(e) => setWechat(e.target.value)}
                    placeholder="ID WeChat furnizor"
                    className="w-full bg-white border border-neutral-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-[#0f4a3c]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Ce produse am cumpărat de la el */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-neutral-700">
                Ce produse am cumpărat de la acest furnizor:
              </label>
              <span className="text-[11px] text-neutral-400">
                {purchasedProducts.length} selectate
              </span>
            </div>

            {/* Input adăugare produs manual */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customProductInput}
                onChange={(e) => setCustomProductInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomProduct();
                  }
                }}
                placeholder="Scrie un produs cumpărat și apasă Enter sau Adaugă..."
                className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#0f4a3c] focus:bg-white"
              />
              <button
                type="button"
                onClick={handleAddCustomProduct}
                className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Adaugă
              </button>
            </div>

            {/* Sugestii rapide din catalogul de produse */}
            {catalogProducts.length > 0 && (
              <div>
                <span className="text-[11px] text-neutral-500 font-medium block mb-1.5">
                  Selectează rapid din catalogul tău de produse:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-neutral-50 border border-neutral-200 rounded-xl">
                  {catalogProducts.map((p) => {
                    const isSelected = purchasedProducts.includes(p.title);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleToggleCatalogProduct(p.title)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? 'bg-[#0f4a3c] text-white border-[#0f4a3c] shadow-2xs font-semibold'
                            : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span className="truncate max-w-[200px]">{p.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Produse alese / salvate */}
            {purchasedProducts.length > 0 && (
              <div className="pt-1">
                <span className="text-[11px] text-neutral-400 block mb-1">
                  Produse atașate acestui furnizor:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {purchasedProducts.map((prod) => (
                    <span
                      key={prod}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-medium"
                    >
                      <Package className="w-3 h-3 text-emerald-700" />
                      <span>{prod}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(prod)}
                        className="hover:text-rose-600 transition-colors cursor-pointer"
                        title="Elimină"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Rating de Încredere */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Rating & Fiabilitate Furnizor
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-neutral-300 hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-neutral-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-semibold text-neutral-600 font-mono">
                {rating} / 5 stele
              </span>
            </div>
          </div>

          {/* Note & Observații */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Notițe despre Furnizor (Timp livrare, MOQ, discount negociat, calitatea mărfii)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ex: Timp de livrare: 7-10 zile. MOQ: 20 bucăți. Oferă discount de 10% la comenzi de peste 100 de bucăți. Calitate foarte bună a ambalajului."
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs text-neutral-900 focus:outline-none focus:border-[#0f4a3c] resize-none"
            />
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
              {isEditing ? 'Salvează modificările' : 'Adaugă Furnizor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
