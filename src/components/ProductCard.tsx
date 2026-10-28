import React, { useState } from 'react';
import { Product, Language, AppTheme, PageView } from '../types/index.ts';
import { MessageCircle, Plus, Check } from 'lucide-react';
import { openWhatsApp, getProductWhatsAppUrl } from '../lib/whatsapp.ts';
import { translations } from '../lib/translations.ts';
import { localized } from '../lib/seo.ts';
import { NavLink } from './NavLink.tsx';
import { ProductImage } from './ProductImage.tsx';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  isInCart?: boolean;
  lang?: Language;
  theme?: AppTheme;
  whatsappLine?: 'line1' | 'line2';
  /** First cards of a page: photo loaded immediately. */
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onAddToCart,
  isInCart = false,
  lang = 'fr',
  whatsappLine = 'line1',
  priority = false,
}) => {
  const [justAdded, setJustAdded] = useState(false);
  const t = translations[lang] || translations.fr;
  const page: PageView = { type: 'product', productId: product.id };

  const title = localized(lang, product.nom, product.nomAr, product.nomEn);
  const familyLabel = localized(lang, product.familleLabel, product.familleLabelAr, product.familleLabelEn);
  const catchphrase = localized(lang, product.accroche, product.accrocheAr, product.accrocheEn);
  const desc = localized(lang, product.description, product.descriptionAr, product.descriptionEn);
  const contenance = localized(lang, product.contenance, product.contenanceAr);

  const handleAdd = () => {
    onAddToCart(product);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <article className="group card-lift bg-[#FBFAF5] dark:bg-[#152219] rounded-2xl border border-[#E5DFC9] dark:border-[#273D2C] hover:border-[#1F3D2B]/50 dark:hover:border-[#E5B834]/60 shadow-xs hover:shadow-lg flex flex-col overflow-hidden relative h-full">
      {/* Photo: the whole picture is a link to the product page */}
      <NavLink
        page={page}
        onNavigate={() => onSelect(product)}
        tabIndex={-1}
        aria-hidden="true"
        className="relative block aspect-square w-full bg-[#F4F1EA] dark:bg-[#101A13] overflow-hidden p-3"
      >
        <span className="block w-full h-full transform group-hover:scale-105 transition-transform duration-500">
          <ProductImage src={product.image} alt="" priority={priority} lang={lang} />
        </span>

        {/* Artisanal stamps (as on the real labels) */}
        <span className="absolute top-2.5 left-2.5 rtl:left-auto rtl:right-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.badges.map((badge, idx) => {
            const text = lang === 'ar' && badge.labelAr ? badge.labelAr : badge.label;
            const tone =
              badge.type === 'green'
                ? 'bg-[#3F6B2E] text-white'
                : badge.type === 'darkgreen'
                ? 'bg-[#1F3D2B] dark:bg-[#0D140F] text-[#FBFAF5] border border-[#C9A227]/40'
                : 'bg-[#1C201D] text-[#FBFAF5]';
            return (
              <span
                key={idx}
                className={`rounded-full text-[10px] font-bold tracking-wide leading-none whitespace-nowrap flex items-center justify-center px-2.5 py-1.5 uppercase shadow-xs ${tone}`}
              >
                {text}
              </span>
            );
          })}
        </span>

        <span className="absolute bottom-2.5 right-2.5 rtl:right-auto rtl:left-2.5 bg-[#FBFAF5]/90 dark:bg-[#152219]/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-semibold text-[#1F3D2B] dark:text-[#F4F1EA] border border-[#E5DFC9] dark:border-[#273D2C] shadow-2xs">
          {contenance}
        </span>
      </NavLink>

      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#8C6D23] dark:text-[#E5B834] mb-1">{familyLabel}</div>

          <h3 className="font-title text-base sm:text-lg font-bold text-[#1F3D2B] dark:text-[#F4F1EA] group-hover:text-[#3F6B2E] dark:group-hover:text-[#E5B834] transition-colors leading-snug line-clamp-2">
            <NavLink
              page={page}
              onNavigate={() => onSelect(product)}
              className="after:absolute after:inset-0 after:content-[''] after:z-[1]"
            >
              {title}
            </NavLink>
          </h3>

          <p className="font-script text-base sm:text-lg text-[#8C6D23] dark:text-[#E5B834] font-semibold italic mt-1 line-clamp-1">
            « {catchphrase} »
          </p>

          <p className="text-xs text-[#1F3D2B]/70 dark:text-[#F4F1EA]/70 mt-2 line-clamp-2">{desc}</p>
        </div>

        {/* Price and actions sit above the card-wide link so they stay clickable */}
        <div className="relative z-[2] pt-4 mt-3 border-t border-[#E5DFC9]/70 dark:border-[#273D2C] flex flex-col gap-2.5">
          <div className="flex items-end justify-between gap-2">
            <div>
              <span className="text-xl sm:text-2xl font-black text-[#1F3D2B] dark:text-[#F4F1EA] font-title">
                {product.prix} <span className="text-sm font-semibold text-[#8C6D23] dark:text-[#E5B834]">{t.currency}</span>
              </span>
              <span className="text-[10px] text-[#1F3D2B]/60 dark:text-[#F4F1EA]/60 block">{t.inStock}</span>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border transition-all cursor-pointer active:scale-95 ${
                justAdded
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : isInCart
                  ? 'bg-[#EAE4D2] dark:bg-[#203325] text-[#1F3D2B] dark:text-[#F4F1EA] border-[#D7CEBA] dark:border-[#273D2C]'
                  : 'bg-[#FBFAF5] dark:bg-[#152219] text-[#1F3D2B] dark:text-[#F4F1EA] border-[#D7CEBA] dark:border-[#273D2C] hover:bg-[#1F3D2B] hover:text-[#FBFAF5] dark:hover:bg-[#E5B834] dark:hover:text-[#0D140F]'
              }`}
              aria-label={`${t.addToCart} : ${title}`}
            >
              {justAdded || isInCart ? (
                <Check className="w-3.5 h-3.5 text-current" aria-hidden="true" />
              ) : (
                <Plus className="w-3.5 h-3.5 text-[#C9A227] dark:text-[#E5B834]" aria-hidden="true" />
              )}
              <span>{justAdded ? t.addedToCart : t.addToCart}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => openWhatsApp(getProductWhatsAppUrl(product, 1, whatsappLine, lang))}
            className="w-full flex items-center justify-center gap-2 bg-[#0F7A40] hover:bg-[#0C6937] text-white py-2.5 px-3 rounded-xl font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-current shrink-0" aria-hidden="true" />
            <span className="truncate">{t.orderOnWhatsApp}</span>
          </button>
        </div>
      </div>
    </article>
  );
};
