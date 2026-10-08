import React from 'react';
import { Plus, Check, Star } from 'lucide-react';
import { Product, Language } from '../types/index.ts';
import { translations } from '../lib/translations.ts';
import { resolveImageUrl, handleImageError } from '../lib/imageHelper.ts';

interface ProductCardProps {
  product: Product;
  currentLang: Language;
  onAddToCart: (product: Product) => void;
  onOpenDetail: (product: Product) => void;
  isAddedJustNow?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currentLang,
  onAddToCart,
  onOpenDetail,
  isAddedJustNow = false,
}) => {
  const t = translations[currentLang];
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 10;

  return (
    <div className="group bg-white rounded-xl border border-stone-200/90 overflow-hidden flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      {/* Product Image Slot */}
      <div 
        onClick={() => onOpenDetail(product)}
        className="relative bg-[#F7F7F5] aspect-4/3 overflow-hidden cursor-pointer"
      >
        <img
          src={resolveImageUrl(product.imageUrl)}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out"
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={handleImageError}
        />

        {/* Quiet top corner badges */}
        {product.originalPrice && (
          <span className="absolute top-3 left-3 bg-stone-900/85 text-white text-[11px] font-semibold px-2 py-0.5 rounded-sm tracking-wide">
            -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
          </span>
        )}

        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-sm text-[11px] text-stone-700 font-medium shadow-2xs">
          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
          <span className="tabular-nums font-semibold">{product.rating}</span>
          <span className="text-stone-400 text-[10px]">({product.reviewCount})</span>
        </div>
      </div>

      {/* Card Info Details */}
      <div className="p-4 flex flex-col flex-grow justify-between gap-3">
        <div>
          {/* Metadata line: Origin & Unit (Zero-pill text) */}
          <div className="flex items-center gap-1.5 text-xs text-stone-500 uppercase tracking-wider mb-1 truncate">
            <span>{product.origin.split('-')[0].trim()}</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="text-emerald-800 font-medium">{product.unit}</span>
          </div>

          {/* Product Name */}
          <h3 
            onClick={() => onOpenDetail(product)}
            className="text-sm sm:text-base font-semibold text-stone-900 group-hover:text-emerald-900 transition-colors line-clamp-2 cursor-pointer leading-snug"
          >
            {product.name}
          </h3>
        </div>

        {/* Stock Status Indicator */}
        <div className="text-xs">
          {isOutOfStock ? (
            <span className="text-rose-700 font-medium">{t.outOfStock}</span>
          ) : isLowStock ? (
            <span className="text-amber-700 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping inline-block" />
              {t.lowStock.replace('{count}', product.stock.toString())}
            </span>
          ) : (
            <span className="text-emerald-700 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
              {t.inStock} ({product.stock})
            </span>
          )}
        </div>

        {/* Baseline: Price in Dirhams (DH) & Add to Cart button */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base sm:text-lg font-bold text-stone-900 tabular-nums">
              {(product.price / 100).toFixed(2)} {t.currency}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-stone-400 line-through tabular-nums">
                {(product.originalPrice / 100).toFixed(2)} {t.currency}
              </span>
            )}
          </div>

          <button
            onClick={() => onAddToCart(product)}
            disabled={isOutOfStock}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
              isOutOfStock
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : isAddedJustNow
                ? 'bg-emerald-700 text-white'
                : 'bg-[#1F3A2B] text-white hover:bg-[#162a1f]'
            }`}
          >
            {isAddedJustNow ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ajouté</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>{t.addToCart}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
