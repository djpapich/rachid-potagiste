import React, { useState } from 'react';
import { Product, Language, AppTheme } from '../types/index.ts';
import { MessageCircle, Plus, Check, Eye } from 'lucide-react';
import { getProductWhatsAppUrl } from '../lib/whatsapp.ts';
import { translations } from '../lib/translations.ts';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  isInCart?: boolean;
  lang?: Language;
  theme?: AppTheme;
  whatsappLine?: 'line1' | 'line2';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onAddToCart,
  isInCart = false,
  lang = 'fr',
  theme = 'light',
  whatsappLine = 'line1',
}) => {
  const [justAdded, setJustAdded] = useState(false);
  const t = translations[lang] || translations.fr;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(getProductWhatsAppUrl(product, 1, whatsappLine, lang), '_blank');
  };

  const title = lang === 'ar' ? (product.nomAr || product.nom) : lang === 'en' ? (product.nomEn || product.nom) : product.nom;
  const familyLabel = lang === 'ar' ? (product.familleLabelAr || product.familleLabel) : lang === 'en' ? (product.familleLabelEn || product.familleLabel) : product.familleLabel;
  const catchphrase = lang === 'ar' ? (product.accrocheAr || product.accroche) : lang === 'en' ? (product.accrocheEn || product.accroche) : product.accroche;
  const desc = lang === 'ar' ? (product.descriptionAr || product.description) : lang === 'en' ? (product.descriptionEn || product.description) : product.description;

  return (
    <article
      onClick={() => onSelect(product)}
      className="group bg-[#FBFAF5] dark:bg-[#152219] rounded-2xl border border-[#E5DFC9] dark:border-[#273D2C] hover:border-[#1F3D2B]/50 dark:hover:border-[#E5B834]/60 transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden cursor-pointer relative h-full"
    >
      {/* Top Image Container */}
      <div className="relative aspect-square w-full bg-[#F4F1EA] dark:bg-[#101A13] overflow-hidden flex items-center justify-center p-4">
        
        {/* Real product photo */}
        <img
          src={product.image}
          alt={title}
          className="w-full h-full object-contain object-center transform group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Circular artisanal stamps directly like the real label */}
        <div className="absolute top-2.5 left-2.5 rtl:left-auto rtl:right-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.badges.map((badge, idx) => {
            const isGreen = badge.type === 'green';
            const isDarkGreen = badge.type === 'darkgreen';
            const labelText = (lang === 'ar' && badge.labelAr) ? badge.labelAr : badge.label;
            return (
              <span
                key={idx}
                className={`w-13 h-13 rounded-full text-[9px] font-bold tracking-tight leading-tight flex items-center justify-center text-center p-1 uppercase shadow-xs ${
                  isGreen
                    ? 'bg-[#3F6B2E] text-white'
                    : isDarkGreen
                    ? 'bg-[#1F3D2B] dark:bg-[#0D140F] text-[#FBFAF5] border border-[#C9A227]/40'
                    : 'bg-[#1C201D] text-[#FBFAF5]'
                }`}
              >
                {labelText}
              </span>
            );
          })}
        </div>

        {/* Quick view button on hover */}
        <div className="absolute inset-0 bg-[#1F3D2B]/15 dark:bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-[#FBFAF5] dark:bg-[#152219] text-[#1F3D2B] dark:text-[#F4F1EA] text-xs font-semibold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5" />
            {t.viewDetails}
          </span>
        </div>

        {/* Contenance pill */}
        <div className="absolute bottom-2.5 right-2.5 rtl:right-auto rtl:left-2.5 bg-[#FBFAF5]/90 dark:bg-[#152219]/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-semibold text-[#1F3D2B] dark:text-[#F4F1EA] border border-[#E5DFC9] dark:border-[#273D2C] shadow-2xs">
          {lang === 'ar' ? (product.contenanceAr || product.contenance) : product.contenance}
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category / Family text */}
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#8C6D23] dark:text-[#E5B834] mb-1">
            {familyLabel}
          </div>

          {/* Title */}
          <h3 className="font-title text-base sm:text-lg font-bold text-[#1F3D2B] dark:text-[#F4F1EA] group-hover:text-[#3F6B2E] dark:group-hover:text-[#E5B834] transition-colors leading-snug line-clamp-2">
            {title}
          </h3>

          {/* Handwritten Artisanal Catchphrase */}
          <p className="font-script text-base sm:text-lg text-[#8C6D23] dark:text-[#E5B834] font-semibold italic mt-1 line-clamp-1">
            « {catchphrase} »
          </p>

          {/* Description snippet */}
          <p className="text-xs text-[#1F3D2B]/70 dark:text-[#F4F1EA]/70 mt-2 line-clamp-2">
            {desc}
          </p>
        </div>

        {/* Price & Action Buttons */}
        <div className="pt-4 mt-3 border-t border-[#E5DFC9]/70 dark:border-[#273D2C] flex flex-col gap-2.5">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xl sm:text-2xl font-black text-[#1F3D2B] dark:text-[#F4F1EA] font-title">
                {product.prix} <span className="text-sm font-semibold text-[#8C6D23] dark:text-[#E5B834]">{t.currency}</span>
              </span>
              <span className="text-[10px] text-[#1F3D2B]/60 dark:text-[#F4F1EA]/60 block">{t.inStock}</span>
            </div>

            {/* "Ajouter au panier" quick button */}
            <button
              onClick={handleAdd}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                justAdded
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : isInCart
                  ? 'bg-[#EAE4D2] dark:bg-[#203325] text-[#1F3D2B] dark:text-[#F4F1EA] border-[#D7CEBA] dark:border-[#273D2C]'
                  : 'bg-[#FBFAF5] dark:bg-[#152219] text-[#1F3D2B] dark:text-[#F4F1EA] border-[#D7CEBA] dark:border-[#273D2C] hover:bg-[#1F3D2B] hover:text-[#FBFAF5] dark:hover:bg-[#E5B834] dark:hover:text-[#0D140F]'
              }`}
              title={t.addToCart}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{t.addedToCart}</span>
                </>
              ) : isInCart ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                  <span>✓</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 text-[#C9A227] dark:text-[#E5B834]" />
                  <span>{t.addToCart}</span>
                </>
              )}
            </button>
          </div>

          {/* Direct WhatsApp CTA Button */}
          <button
            onClick={handleWhatsApp}
            className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white py-2 px-3 rounded-xl font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-current shrink-0" />
            <span className="truncate">{t.orderOnWhatsApp}</span>
          </button>
        </div>
      </div>
    </article>
  );
};
