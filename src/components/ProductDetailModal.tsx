import React, { useState } from 'react';
import { Product, ProductStatus, TestLogEntry } from '../types/product';
import {
  X,
  Star,
  ExternalLink,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  Megaphone,
  Plus,
  Calendar,
  Bookmark,
  Share2
} from 'lucide-react';
import { STATUS_LABELS, VERDICT_LABELS, SPONSORSHIP_LABELS } from '../data/initialProducts';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onUpdateStatus: (productId: string, newStatus: ProductStatus) => void;
  onAddLog: (productId: string, log: Omit<TestLogEntry, 'id'>) => void;
  onToggleFavorite?: (productId: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onEdit,
  onDelete,
  onUpdateStatus,
  onAddLog,
  onToggleFavorite,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // New Log Entry state
  const [newLogDay, setNewLogDay] = useState<number>(
    (product.logs?.length || 0) > 0
      ? (product.logs[product.logs.length - 1].dayNumber || 1) + 1
      : 1
  );
  const [newLogNote, setNewLogNote] = useState('');
  const [newLogSentiment, setNewLogSentiment] = useState<'positive' | 'neutral' | 'negative'>('positive');
  const [showAddLogForm, setShowAddLogForm] = useState(false);

  const images = product.images?.length > 0 ? product.images : [];
  const currentImage = images[activeImageIndex] || '';

  const verdictInfo = product.verdict ? VERDICT_LABELS[product.verdict] : null;
  const sponsorshipInfo = SPONSORSHIP_LABELS[product.sponsorship] || SPONSORSHIP_LABELS.personal;

  const copyDiscountCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCreateLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogNote.trim()) return;

    onAddLog(product.id, {
      dayNumber: Number(newLogDay) || 1,
      date: new Date().toISOString().slice(0, 10),
      note: newLogNote.trim(),
      sentiment: newLogSentiment,
    });

    setNewLogNote('');
    setShowAddLogForm(false);
    setNewLogDay((prev) => prev + 1);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white border border-neutral-200/90 rounded-2xl overflow-hidden shadow-2xl my-8 flex flex-col max-h-[92vh] text-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
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
                className={`p-1.5 rounded-lg border transition-colors ${
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
              className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
              title="Copiază link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => onEdit(product)}
              className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
              title="Editează produsul"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            <button
              onClick={() => onDelete(product.id)}
              className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Șterge produsul"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-neutral-200 mx-1" />

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Main Hero Grid: Images & Overview */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Image Gallery Column (5 cols) */}
            <div className="md:col-span-5 space-y-3">
              <div className="aspect-4/3 w-full bg-neutral-100 rounded-2xl overflow-hidden border border-neutral-200 relative">
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
              </div>

              {/* Thumbnails row if multiple */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                        activeImageIndex === idx ? 'border-[#0f4a3c] ring-2 ring-[#0f4a3c]/20' : 'border-neutral-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Store & Example Site Links */}
              <div className="space-y-2 pt-2">
                {product.storeUrl && (
                  <a
                    href={product.storeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 py-2.5 px-3.5 rounded-xl text-xs font-semibold text-neutral-900 flex items-center justify-between transition-colors"
                  >
                    <span>Vizitează Magazin ({product.storeName || 'Site Achiziție'})</span>
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                  </a>
                )}

                {product.exampleSiteUrl && (
                  <a
                    href={product.exampleSiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#eaf3ee] hover:bg-[#d8ece1] border border-[#cfe5d9] py-2.5 px-3.5 rounded-xl text-xs font-semibold text-[#0f4a3c] flex items-center justify-between transition-colors"
                  >
                    <span>Site Exemplu / Review Video</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Product Meta & Highlights (7 cols) */}
            <div className="md:col-span-7 space-y-4">
              {/* Title & Brand */}
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 leading-tight">
                  {product.title}
                </h1>
                <div className="mt-1 text-xs text-neutral-500 flex items-center gap-2">
                  <span className="text-neutral-800 font-semibold">{product.brand}</span>
                  <span aria-hidden="true">·</span>
                  <span>{product.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>Adăugat la {new Date(product.createdAt).toLocaleDateString('ro-RO')}</span>
                </div>
              </div>

              {/* Price & Status Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-neutral-50 border border-neutral-200/80 rounded-2xl">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase font-bold block">Preț de Achiziție</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-mono font-bold tabular-nums text-neutral-900">
                      {product.price.toLocaleString('ro-RO')} {product.currency}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-xs text-neutral-400 line-through font-mono">
                        {product.originalPrice} {product.currency}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500 font-medium">Status:</span>
                  <select
                    value={product.status}
                    onChange={(e) => onUpdateStatus(product.id, e.target.value as ProductStatus)}
                    className="bg-white border border-neutral-300 text-xs font-semibold rounded-xl px-3 py-1.5 text-neutral-900 focus:outline-none focus:border-[#0f4a3c]"
                  >
                    <option value="to_test">De testat</option>
                    <option value="testing">În testare</option>
                    <option value="tested">Testat & Evaluat</option>
                    <option value="rejected">Respins</option>
                  </select>
                </div>
              </div>

              {/* Rating & Verdict Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-neutral-50 border border-neutral-200/80 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase font-bold block">Scor General</span>
                    {product.overallRating && product.overallRating > 0 ? (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                        <span className="text-2xl font-mono font-bold tabular-nums text-neutral-900">
                          {product.overallRating.toFixed(1)}
                        </span>
                        <span className="text-xs text-neutral-400">/ 5.0</span>
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-400 mt-1 block italic">Netestat / fără notă</span>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-neutral-50 border border-neutral-200/80 rounded-2xl flex flex-col justify-center">
                  <span className="text-[10px] text-neutral-400 uppercase font-bold block">Verdict Final</span>
                  {verdictInfo ? (
                    <span className={`text-xs font-bold mt-1 inline-block ${verdictInfo.color}`}>
                      {verdictInfo.label}
                    </span>
                  ) : (
                    <span className="text-xs text-neutral-400 mt-1 block italic">Verdict în așteptare</span>
                  )}
                </div>
              </div>

              {/* Sponsorship / Ad Campaign Box (if applicable) */}
              {product.sponsorship !== 'personal' && product.adDetails && (
                <div className="p-4 bg-[#f0f7f3] border border-[#d8ece1] rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0f4a3c] flex items-center gap-1.5">
                      <Megaphone className="w-3.5 h-3.5" />
                      {sponsorshipInfo.label}
                    </span>
                    {product.adDetails.deadline && (
                      <span className="text-[11px] font-mono text-neutral-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#0f4a3c]" />
                        Termen: {product.adDetails.deadline}
                      </span>
                    )}
                  </div>

                  {product.adDetails.campaignName && (
                    <div className="text-xs text-neutral-700">
                      Campanie: <strong className="text-neutral-900">{product.adDetails.campaignName}</strong>
                    </div>
                  )}

                  {product.adDetails.deliverableRequirement && (
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      Cerințe: {product.adDetails.deliverableRequirement}
                    </p>
                  )}

                  {product.adDetails.discountCode && (
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-neutral-200">
                      <div>
                        <span className="text-[10px] text-neutral-400 block uppercase font-bold">Cupon Urmăritori:</span>
                        <span className="font-mono font-bold text-[#0f4a3c] text-xs">
                          {product.adDetails.discountCode}
                        </span>
                        {product.adDetails.discountPercentage && (
                          <span className="text-[11px] text-neutral-500 ml-1.5">
                            ({product.adDetails.discountPercentage})
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => copyDiscountCode(product.adDetails!.discountCode!)}
                        className="px-2.5 py-1 text-xs bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg text-neutral-700 flex items-center gap-1 transition-colors"
                      >
                        {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCode ? 'Copiat' : 'Copiază'}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Review Summary */}
              {product.reviewSummary && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                    Concluzie Review
                  </h4>
                  <p className="text-sm text-neutral-700 leading-relaxed bg-neutral-50 p-3.5 rounded-xl border border-neutral-200/80">
                    {product.reviewSummary}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Criteria Breakdown & Pros/Cons Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-200">
            {/* Criteria Breakdown */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-neutral-900">Evaluare pe Criterii</h3>
              {product.ratingCriteria ? (
                <div className="space-y-2.5 bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-neutral-600">Calitate materiale & construcție</span>
                      <span className="font-mono tabular-nums text-neutral-900 font-semibold">
                        {product.ratingCriteria.quality} / 5
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#0f4a3c] h-full rounded-full"
                        style={{ width: `${(product.ratingCriteria.quality / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-neutral-600">Raport Calitate / Preț</span>
                      <span className="font-mono tabular-nums text-neutral-900 font-semibold">
                        {product.ratingCriteria.valueForMoney} / 5
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full"
                        style={{ width: `${(product.ratingCriteria.valueForMoney / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-neutral-600">Ușurință în utilizare</span>
                      <span className="font-mono tabular-nums text-neutral-900 font-semibold">
                        {product.ratingCriteria.usability} / 5
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-teal-600 h-full rounded-full"
                        style={{ width: `${(product.ratingCriteria.usability / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-neutral-600">Performanță reală</span>
                      <span className="font-mono tabular-nums text-neutral-900 font-semibold">
                        {product.ratingCriteria.performance} / 5
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full"
                        style={{ width: `${(product.ratingCriteria.performance / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-neutral-600">Durabilitate & autonomie</span>
                      <span className="font-mono tabular-nums text-neutral-900 font-semibold">
                        {product.ratingCriteria.durability} / 5
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#0f4a3c] h-full rounded-full"
                        style={{ width: `${(product.ratingCriteria.durability / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 text-xs text-neutral-400">
                  Criteriile nu au fost încă evaluate.
                </div>
              )}
            </div>

            {/* Pros & Cons */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Puncte Forte (PRO)
                </h4>
                {product.pros?.length > 0 ? (
                  <ul className="space-y-1.5">
                    {product.pros.map((pro, idx) => (
                      <li key={idx} className="text-xs text-emerald-950 flex items-start gap-2 bg-emerald-50 border border-emerald-200/70 p-2.5 rounded-xl">
                        <span className="text-emerald-600 font-bold shrink-0">+</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs text-neutral-400 italic">Nu sunt specificate pro-uri</div>
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  Puncte Slabe (CONTRA)
                </h4>
                {product.cons?.length > 0 ? (
                  <ul className="space-y-1.5">
                    {product.cons.map((con, idx) => (
                      <li key={idx} className="text-xs text-rose-950 flex items-start gap-2 bg-rose-50 border border-rose-200/70 p-2.5 rounded-xl">
                        <span className="text-rose-600 font-bold shrink-0">-</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs text-neutral-400 italic">Nu sunt specificate contra-uri</div>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Notes if present */}
          {product.detailedNotes && (
            <div className="space-y-2 pt-4 border-t border-neutral-200">
              <h3 className="text-sm font-bold text-neutral-900">Comentarii & Note Personale Detaliate</h3>
              <p className="text-xs text-neutral-700 leading-relaxed whitespace-pre-wrap bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80">
                {product.detailedNotes}
              </p>
            </div>
          )}

          {/* Testing Log / Progress Journal */}
          <div className="space-y-4 pt-4 border-t border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#0f4a3c]" />
                  <span>Jurnal de Testare & Cronologie Impresii</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Înregistrează notițe pe zile pe durata testării produsului.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddLogForm(!showAddLogForm)}
                className="px-3 py-1.5 text-xs font-semibold bg-[#eaf3ee] hover:bg-[#d8ece1] text-[#0f4a3c] rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddLogForm ? 'Anulează' : 'Adaugă Notiță'}</span>
              </button>
            </div>

            {/* Inline Add Log Form */}
            {showAddLogForm && (
              <form onSubmit={handleCreateLog} className="bg-neutral-50 border border-neutral-200 p-4 rounded-2xl space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-neutral-500 block mb-1 font-medium">Ziua de testare:</label>
                    <input
                      type="number"
                      min="0"
                      value={newLogDay}
                      onChange={(e) => setNewLogDay(Number(e.target.value))}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-xs text-neutral-900"
                      placeholder="ex: 1, 3, 14..."
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-500 block mb-1 font-medium">Impresie generală:</label>
                    <select
                      value={newLogSentiment}
                      onChange={(e) => setNewLogSentiment(e.target.value as any)}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-xs text-neutral-900 font-medium"
                    >
                      <option value="positive">Pozitivă (Satisfăcut)</option>
                      <option value="neutral">Neutră (În observație)</option>
                      <option value="negative">Negativă (Probleme/Nemulțumiri)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-neutral-500 block mb-1 font-medium">Notiță / Observație:</label>
                  <textarea
                    rows={2}
                    value={newLogNote}
                    onChange={(e) => setNewLogNote(e.target.value)}
                    placeholder="Ce ai observat azi la produs? (autonomie, ergonomie, comportament...)"
                    className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-xs text-neutral-900 placeholder-neutral-400"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddLogForm(false)}
                    className="px-3 py-1 text-xs text-neutral-500 hover:text-neutral-900"
                  >
                    Renunță
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold bg-[#0f4a3c] hover:bg-[#0c3c31] text-white rounded-xl transition-colors"
                  >
                    Salvează Notița
                  </button>
                </div>
              </form>
            )}

            {/* Log Entries List */}
            {product.logs?.length > 0 ? (
              <div className="space-y-2.5">
                {product.logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 bg-neutral-50 border border-neutral-200/80 rounded-xl text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-neutral-500">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#0f4a3c]">
                          Ziua {log.dayNumber}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="text-[11px]">{log.date}</span>
                      </div>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        log.sentiment === 'positive'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.sentiment === 'negative'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-neutral-200 text-neutral-700'
                      }`}>
                        {log.sentiment === 'positive' ? 'Pozitiv' : log.sentiment === 'negative' ? 'Negativ' : 'Neutru'}
                      </span>
                    </div>
                    <p className="text-neutral-800 leading-relaxed pt-1">
                      {log.note}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-neutral-200 rounded-xl p-6 text-center text-xs text-neutral-400">
                Nicio notiță adăugată încă în jurnalul de testare.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
