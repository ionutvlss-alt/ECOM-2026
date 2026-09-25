import React, { useState } from 'react';
import { Product } from '../types/product';
import { X, Eye, ExternalLink } from 'lucide-react';
import { CAMPAIGN_STATUS_LABELS } from '../data/initialProducts';
import { safeFormatNumber } from '../utils/productNormalizer';

interface GalleryViewProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  products,
  onSelectProduct,
}) => {
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; product: Product } | null>(null);

  const allImages = products.flatMap((product) =>
    (product.images || []).map((img, idx) => ({
      url: img,
      title: product.title,
      brand: product.brand,
      price: product.price,
      currency: product.currency,
      category: product.category,
      campaign: product.campaign,
      product: product,
      imageIndex: idx,
    }))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            Galerie Foto Produse
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Examinare vizuală a fotografiilor încărcate pentru fiecare produs testat.
          </p>
        </div>
        <span className="text-xs font-mono text-neutral-500 bg-white border border-neutral-200 px-3 py-1 rounded-full">
          {allImages.length} imagini în catalog
        </span>
      </div>

      {allImages.length === 0 ? (
        <div className="border border-dashed border-neutral-200 bg-white rounded-2xl p-12 text-center text-neutral-400">
          Nu există încă imagini încărcate. Adaugă fotografii când creezi sau editezi un produs!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {allImages.map((item, index) => {
            const statusInfo = CAMPAIGN_STATUS_LABELS[item.campaign?.status || 'testing'] || CAMPAIGN_STATUS_LABELS.testing;

            return (
              <div
                key={`${item.product.id}-${index}`}
                className="group relative aspect-4/3 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200/80 hover:border-neutral-300 transition-all cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md"
                onClick={() => onSelectProduct(item.product)}
              >
                <img
                  src={item.url}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />

                {/* Scrim overlay with product details */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent opacity-80 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold bg-white/95 px-2 py-0.5 rounded-md text-neutral-900 backdrop-blur-sm shadow-2xs">
                      {item.brand}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-neutral-900/90 text-white backdrop-blur-sm">
                      {item.campaign?.platform || 'Ads'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white line-clamp-1">
                      {item.title}
                    </h4>
                    <div className="flex items-center justify-between mt-1 text-[11px] text-neutral-200">
                      <span className="font-mono tabular-nums font-semibold">
                        {safeFormatNumber(item.price)} {item.currency || 'RON'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxImage({ url: item.url, title: item.title, product: item.product });
                        }}
                        className="text-white hover:text-emerald-300 flex items-center gap-1 font-medium"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Zoom</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white border border-neutral-200 rounded-2xl overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-neutral-100">
              <h3 className="text-sm font-bold text-neutral-900 truncate max-w-md">
                {lightboxImage.title}
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const p = lightboxImage.product;
                    setLightboxImage(null);
                    onSelectProduct(p);
                  }}
                  className="text-xs text-[#0f4a3c] font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Detalii produs</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setLightboxImage(null)}
                  className="p-1 rounded-md text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 bg-neutral-950 flex items-center justify-center overflow-hidden flex-1">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
