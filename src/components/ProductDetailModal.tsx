import React, { useState, useEffect } from 'react';
import { X, Check, Star, ShieldCheck, Truck, Sparkles, Leaf, Plus } from 'lucide-react';
import { Product, Language } from '../types/index.ts';
import { translations } from '../lib/translations.ts';
import { storeService } from '../services/storeService.ts';
import { ProductReviewsSection } from './ProductReviewsSection.tsx';
import { resolveImageUrl, handleImageError } from '../lib/imageHelper.ts';

interface ProductDetailModalProps {
  product: Product | null;
  currentLang: Language;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onSelectRecommendedProduct?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  currentLang,
  onClose,
  onAddToCart,
  onSelectRecommendedProduct,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (product) {
      storeService.trackProductView('user_active', product.id);
      setQuantity(1);
    }
  }, [product?.id]);

  if (!product) return null;
  const t = translations[currentLang];

  const recommendations = storeService.getRecommendations(product.id);

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200">
        
        {/* Sticky Close Button */}
        <button
          onClick={onClose}
          className="sticky top-4 right-4 ml-auto z-20 w-9 h-9 rounded-full bg-stone-100/90 backdrop-blur-xs text-stone-600 hover:bg-stone-200 hover:text-stone-900 flex items-center justify-center transition-colors cursor-pointer shadow-xs mr-4"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 space-y-8 -mt-6">
          
          {/* Main Top Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Left Column: Visual Asset */}
            <div className="relative bg-[#F7F7F5] rounded-xl overflow-hidden aspect-4/3 flex items-center justify-center border border-stone-200">
              <img
                src={resolveImageUrl(product.imageUrl)}
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={handleImageError}
              />
              <div className="absolute bottom-3 left-3 bg-white/95 px-3 py-1 rounded-md text-xs font-medium text-stone-800 shadow-xs flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-emerald-700" />
                <span>{product.certification}</span>
              </div>
            </div>

            {/* Right Column: Contiguous Purchase Module */}
            <div className="flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-stone-500 uppercase tracking-wider">
                  <span>{product.origin}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-800 font-semibold">{product.unit}</span>
                </div>

                <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 leading-tight">
                  {product.name}
                </h1>

                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center text-amber-500">
                    <Star className="w-4 h-4 fill-amber-500" />
                    <span className="font-semibold text-stone-800 ml-1">{product.rating}</span>
                  </div>
                  <span className="text-stone-400">·</span>
                  <span className="text-stone-500">{product.reviewCount} avis certifiés</span>
                </div>

                {/* Price in Dirhams (DH) */}
                <div className="pt-2 flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-stone-900 tabular-nums">
                    {(product.price / 100).toFixed(2)} {t.currency}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-stone-400 line-through tabular-nums">
                      {(product.originalPrice / 100).toFixed(2)} {t.currency}
                    </span>
                  )}
                  <span className="text-xs text-stone-500">Net</span>
                </div>

                {/* Stock condition */}
                <div className="text-xs">
                  {isOutOfStock ? (
                    <span className="text-rose-700 font-semibold">{t.outOfStock}</span>
                  ) : product.stock <= 10 ? (
                    <span className="text-amber-800 font-medium">
                      ⚠️ {t.lowStock.replace('{count}', product.stock.toString())}
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-medium">
                      ✓ {t.inStock} ({product.stock} disponibles en pépinière)
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed pt-1">
                  {product.description}
                </p>

                {/* Benefits */}
                {product.benefits && (
                  <div className="bg-emerald-50/70 p-3.5 rounded-lg border border-emerald-100 text-xs text-emerald-900 space-y-1">
                    <span className="font-semibold">{t.benefits} :</span>
                    <p className="text-emerald-800">{product.benefits}</p>
                  </div>
                )}
              </div>

              {/* Contiguous Purchase Block */}
              <div className="pt-4 border-t border-stone-200 space-y-4">
                <div className="flex items-center gap-3">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-stone-50">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1 || isOutOfStock}
                      className="px-3 py-2 text-sm text-stone-700 hover:bg-stone-200 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-4 text-xs font-semibold tabular-nums text-stone-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock || isOutOfStock}
                      className="px-3 py-2 text-sm text-stone-700 hover:bg-stone-200 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Primary Buy CTA */}
                  <button
                    onClick={handleAdd}
                    disabled={isOutOfStock}
                    className={`flex-1 py-3 px-5 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 ${
                      isOutOfStock
                        ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                        : justAdded
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-[#1F3A2B] text-white hover:bg-[#162a1f] shadow-xs'
                    }`}
                  >
                    {justAdded ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Ajouté au panier potager !</span>
                      </>
                    ) : (
                      <>
                        <span>{t.addToCart}</span>
                        <span className="tabular-nums">
                          · {((product.price * quantity) / 100).toFixed(2)} {t.currency}
                        </span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-500 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-stone-600" />
                    <span>Livraison Amana partout au Maroc</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-stone-600" />
                    <span>Semences paysannes 100% reproductibles</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Complementary Product Recommendations Module */}
          {recommendations.length > 0 && (
            <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-900">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>Associations & Produits complémentaires recommandés</span>
                </div>
                <span className="text-[11px] text-stone-500">Par Rachid Le Potagiste</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {recommendations.map((rec) => (
                  <div
                    key={`rec-modal-${rec.product.id}`}
                    className="bg-white p-3 rounded-lg border border-emerald-200/80 flex flex-col justify-between space-y-2 hover:shadow-xs transition-shadow"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={resolveImageUrl(rec.product.imageUrl)}
                        alt={rec.product.name}
                        className="w-12 h-12 rounded object-cover bg-stone-100 shrink-0"
                        referrerPolicy="no-referrer"
                        onError={handleImageError}
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-stone-900 truncate">
                          {rec.product.name}
                        </h4>
                        <p className="text-[10px] text-stone-500">{rec.product.unit}</p>
                        <span className="text-xs font-bold text-stone-900 tabular-nums">
                          {(rec.product.price / 100).toFixed(2)} {t.currency}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-emerald-800 line-clamp-2 italic">
                      "{rec.reason}"
                    </p>

                    <button
                      onClick={() => onAddToCart(rec.product, 1)}
                      className="w-full py-1.5 bg-[#1F3A2B] text-white text-[11px] font-semibold rounded hover:bg-[#162a1f] flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Ajouter au panier</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Reviews Section */}
          <ProductReviewsSection
            product={product}
            currentLang={currentLang}
          />

        </div>
      </div>
    </div>
  );
};
