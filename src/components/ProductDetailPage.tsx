import React, { useState } from 'react';
import { Product, Language, AppTheme, PageView } from '../types/index.ts';
import {
  MessageCircle,
  Plus,
  Minus,
  Check,
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
  Info,
  Sparkles,
  ArrowLeft,
  Truck,
  Leaf
} from 'lucide-react';
import {
  WHATSAPP_LINE_1_DISPLAY,
  WHATSAPP_LINE_2_DISPLAY,
  getProductWhatsAppUrl
} from '../lib/whatsapp.ts';
import { translations } from '../lib/translations.ts';
import { HorizontalProductCarousel } from './HorizontalProductCarousel.tsx';

interface ProductDetailPageProps {
  product: Product;
  allProducts: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  cartProductIds: Set<string>;
  onNavigate: (page: PageView) => void;
  lang: Language;
  theme: AppTheme;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  onSelectProduct,
  onAddToCart,
  cartProductIds,
  onNavigate,
  lang,
  theme,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [useTransparentView, setUseTransparentView] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'ingredients' | 'usage' | 'precautions'>('desc');

  const t = translations[lang] || translations.fr;
  const isRtl = lang === 'ar';

  const title = lang === 'ar' ? (product.nomAr || product.nom) : lang === 'en' ? (product.nomEn || product.nom) : product.nom;
  const familyLabel = lang === 'ar' ? (product.familleLabelAr || product.familleLabel) : lang === 'en' ? (product.familleLabelEn || product.familleLabel) : product.familleLabel;
  const catchphrase = lang === 'ar' ? (product.accrocheAr || product.accroche) : lang === 'en' ? (product.accrocheEn || product.accroche) : product.accroche;
  const description = lang === 'ar' ? (product.descriptionAr || product.description) : lang === 'en' ? (product.descriptionEn || product.description) : product.description;
  const ingredients = lang === 'ar' ? (product.ingredientsAr || product.ingredients) : lang === 'en' ? (product.ingredientsEn || product.ingredients) : product.ingredients;
  const pointsForts = lang === 'ar' ? (product.pointsFortsAr || product.pointsForts) : lang === 'en' ? (product.pointsFortsEn || product.pointsForts) : product.pointsForts;
  const conseils = lang === 'ar' ? (product.conseilsAr || product.conseils) : lang === 'en' ? (product.conseilsEn || product.conseils) : product.conseils;
  const precautions = lang === 'ar' ? (product.precautionsAr || product.precautions) : lang === 'en' ? (product.precautionsEn || product.precautions) : product.precautions;
  const conservation = lang === 'ar' ? (product.conservationAr || product.conservation) : lang === 'en' ? (product.conservationEn || product.conservation) : product.conservation;
  const contenance = lang === 'ar' ? (product.contenanceAr || product.contenance) : product.contenance;

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleDirectWhatsApp = (line: 'line1' | 'line2') => {
    window.open(getProductWhatsAppUrl(product, quantity, line, lang), '_blank');
  };

  // Related products from the same family or others
  const relatedProducts = allProducts.filter((p) => p.id !== product.id && p.famille === product.famille).concat(
    allProducts.filter((p) => p.famille !== product.famille)
  ).slice(0, 8);

  return (
    <div className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Breadcrumb row */}
        <div className="flex items-center gap-2 text-xs text-[#8C6D23] dark:text-[#E5B834] mb-6">
          <button
            onClick={() => onNavigate({ type: 'home' })}
            className="hover:underline cursor-pointer"
          >
            {t.breadcrumbsHome}
          </button>
          {isRtl ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          <button
            onClick={() => onNavigate({ type: 'category', family: product.famille })}
            className="hover:underline cursor-pointer"
          >
            {familyLabel}
          </button>
          {isRtl ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          <span className="font-bold text-[#1F3D2B] dark:text-[#F4F1EA] truncate max-w-[200px]">
            {title}
          </span>
        </div>

        {/* Product Showcase (Amazon / Jumia 2-column detailed layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-[#FBFAF5] dark:bg-[#152219] p-6 sm:p-10 rounded-3xl border border-[#E5DFC9] dark:border-[#273D2C] shadow-sm mb-12">
          
          {/* Left Column: Big Product Photo Gallery */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="relative aspect-square w-full bg-[#F4F1EA] dark:bg-[#101A13] rounded-3xl border border-[#E5DFC9] dark:border-[#273D2C] flex items-center justify-center p-6 overflow-hidden">
              <img
                src={useTransparentView && product.imagePng ? product.imagePng : product.image}
                alt={title}
                className="w-full h-full object-contain drop-shadow-lg transition-transform duration-300 hover:scale-105"
              />

              {/* View switch button */}
              {product.imagePng && (
                <button
                  onClick={() => setUseTransparentView(!useTransparentView)}
                  className="absolute bottom-4 left-4 rtl:left-auto rtl:right-4 text-xs font-semibold bg-[#FBFAF5]/95 dark:bg-[#152219]/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-[#E5DFC9] dark:border-[#273D2C] text-[#1F3D2B] dark:text-[#F4F1EA] shadow-xs cursor-pointer hover:bg-white"
                >
                  {useTransparentView ? 'Photo originale' : 'Vue détourée'}
                </button>
              )}

              {/* Circular stamps */}
              <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4 flex flex-col gap-1.5 pointer-events-none">
                {product.badges.map((badge, idx) => (
                  <span
                    key={idx}
                    className={`w-14 h-14 rounded-full text-[9px] font-bold tracking-tight leading-tight flex items-center justify-center text-center p-1 uppercase shadow-xs ${
                      badge.type === 'green'
                        ? 'bg-[#3F6B2E] text-white'
                        : badge.type === 'darkgreen'
                        ? 'bg-[#1F3D2B] text-[#FBFAF5] border border-[#C9A227]/40'
                        : 'bg-[#1C201D] text-[#FBFAF5]'
                    }`}
                  >
                    {lang === 'ar' && badge.labelAr ? badge.labelAr : badge.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#8C6D23] dark:text-[#E5B834] font-medium px-2">
              <span>🌾 Fait main par Rachid à Bouznika</span>
              <span>·</span>
              <span>{contenance}</span>
            </div>
          </div>

          {/* Right Column: Title, Prices, Quantity, and TWO WhatsApp Order Buttons */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8C6D23] dark:text-[#E5B834] mb-1">
                <span>{familyLabel}</span>
                <span>·</span>
                <span>{contenance}</span>
              </div>

              <h1 className="font-title text-2xl sm:text-3xl md:text-4xl font-black text-[#1F3D2B] dark:text-[#F4F1EA] leading-tight mb-2">
                {title}
              </h1>

              <p className="font-script text-xl sm:text-2xl text-[#8C6D23] dark:text-[#E5B834] font-bold mb-4 italic">
                « {catchphrase} »
              </p>

              {/* Price & Stock Badge */}
              <div className="flex items-baseline gap-4 mb-6 pb-4 border-b border-[#E5DFC9] dark:border-[#273D2C]">
                <span className="text-3xl sm:text-4xl font-black text-[#1F3D2B] dark:text-[#F4F1EA] font-title">
                  {product.prix} <span className="text-xl font-semibold text-[#8C6D23] dark:text-[#E5B834]">{t.currency}</span>
                </span>
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1 rounded-full">
                  {t.inStock}
                </span>
              </div>

              {/* Short description */}
              <p className="text-sm sm:text-base text-[#1F3D2B]/85 dark:text-[#F4F1EA]/85 leading-relaxed mb-6">
                {description}
              </p>

              {/* Quantity selector */}
              <div className="flex items-center gap-4 mb-6 bg-[#F4F1EA] dark:bg-[#1C2D21] p-3.5 rounded-2xl border border-[#E5DFC9] dark:border-[#273D2C]">
                <span className="text-xs sm:text-sm font-semibold text-[#1F3D2B] dark:text-[#F4F1EA]">
                  Quantité :
                </span>
                <div className="flex items-center border border-[#D7CEBA] dark:border-[#273D2C] rounded-xl bg-white dark:bg-[#152219] overflow-hidden shadow-2xs">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-[#1F3D2B] dark:text-[#F4F1EA] hover:bg-[#F4F1EA] dark:hover:bg-[#1C2D21] transition-colors cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-bold font-mono text-[#1F3D2B] dark:text-[#F4F1EA]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 text-[#1F3D2B] dark:text-[#F4F1EA] hover:bg-[#F4F1EA] dark:hover:bg-[#1C2D21] transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="ml-auto rtl:mr-auto rtl:ml-0 text-right rtl:text-left">
                  <span className="text-xs text-[#1F3D2B]/60 dark:text-[#F4F1EA]/60 block">Total :</span>
                  <span className="text-lg font-black text-[#1F3D2B] dark:text-[#F4F1EA]">
                    {product.prix * quantity} {t.currency}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Add to cart + TWO WhatsApp order buttons */}
              <div className="space-y-3 mb-6">
                
                {/* Add to Cart button */}
                <button
                  onClick={handleAddToCart}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-sm border transition-all cursor-pointer shadow-sm ${
                    justAdded
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-[#1F3D2B] dark:bg-[#E5B834] text-[#FBFAF5] dark:text-[#0D140F] hover:bg-[#162D20] dark:hover:bg-[#D4A92B] border-[#1F3D2B] dark:border-[#E5B834]'
                  }`}
                >
                  {justAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{t.addedToCart}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 text-[#C9A227] dark:text-[#0D140F]" />
                      <span>{t.addToCart}</span>
                    </>
                  )}
                </button>

                {/* TWO WhatsApp Order Buttons (Line 1 & Line 2) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={() => handleDirectWhatsApp('line1')}
                    className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white py-3 px-4 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                    title={`Commander via ${WHATSAPP_LINE_1_DISPLAY}`}
                  >
                    <MessageCircle className="w-4 h-4 fill-current shrink-0" />
                    <span>WhatsApp 1 ({WHATSAPP_LINE_1_DISPLAY})</span>
                  </button>

                  <button
                    onClick={() => handleDirectWhatsApp('line2')}
                    className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white py-3 px-4 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                    title={`Commander via ${WHATSAPP_LINE_2_DISPLAY}`}
                  >
                    <MessageCircle className="w-4 h-4 fill-current shrink-0" />
                    <span>WhatsApp 2 ({WHATSAPP_LINE_2_DISPLAY})</span>
                  </button>
                </div>
              </div>

              {/* Delivery notice */}
              <div className="flex items-center gap-2.5 text-xs text-[#1F3D2B]/80 dark:text-[#F4F1EA]/80 pt-2 border-t border-[#E5DFC9] dark:border-[#273D2C]">
                <Truck className="w-4 h-4 text-[#3F6B2E] dark:text-[#528B3E] shrink-0" />
                <span>{t.cashOnDelivery} · {t.quickDelivery}</span>
              </div>

            </div>
          </div>

        </div>

        {/* Tabbed Detailed Specifications (Amazon / Jumia Product Specs) */}
        <div className="bg-[#FBFAF5] dark:bg-[#152219] rounded-3xl p-6 sm:p-8 border border-[#E5DFC9] dark:border-[#273D2C] shadow-xs mb-12">
          
          {/* Tab selector */}
          <div className="flex flex-wrap items-center gap-2 border-b border-[#E5DFC9] dark:border-[#273D2C] pb-4 mb-6 text-xs sm:text-sm font-semibold">
            <button
              onClick={() => setActiveTab('desc')}
              className={`px-4 py-2 rounded-xl transition-colors cursor-pointer ${
                activeTab === 'desc'
                  ? 'bg-[#1F3D2B] text-white dark:bg-[#E5B834] dark:text-[#0D140F]'
                  : 'text-[#1F3D2B] dark:text-[#F4F1EA] hover:bg-[#F4F1EA] dark:hover:bg-[#1C2D21]'
              }`}
            >
              Description & Atouts
            </button>
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`px-4 py-2 rounded-xl transition-colors cursor-pointer ${
                activeTab === 'ingredients'
                  ? 'bg-[#1F3D2B] text-white dark:bg-[#E5B834] dark:text-[#0D140F]'
                  : 'text-[#1F3D2B] dark:text-[#F4F1EA] hover:bg-[#F4F1EA] dark:hover:bg-[#1C2D21]'
              }`}
            >
              {t.ingredients}
            </button>
            <button
              onClick={() => setActiveTab('usage')}
              className={`px-4 py-2 rounded-xl transition-colors cursor-pointer ${
                activeTab === 'usage'
                  ? 'bg-[#1F3D2B] text-white dark:bg-[#E5B834] dark:text-[#0D140F]'
                  : 'text-[#1F3D2B] dark:text-[#F4F1EA] hover:bg-[#F4F1EA] dark:hover:bg-[#1C2D21]'
              }`}
            >
              {t.usageAdvice} & {t.storageAdvice}
            </button>
            <button
              onClick={() => setActiveTab('precautions')}
              className={`px-4 py-2 rounded-xl transition-colors cursor-pointer ${
                activeTab === 'precautions'
                  ? 'bg-[#1F3D2B] text-white dark:bg-[#E5B834] dark:text-[#0D140F]'
                  : 'text-[#1F3D2B] dark:text-[#F4F1EA] hover:bg-[#F4F1EA] dark:hover:bg-[#1C2D21]'
              }`}
            >
              {t.precautions}
            </button>
          </div>

          {/* Tab Content */}
          <div className="text-xs sm:text-sm text-[#1F3D2B]/90 dark:text-[#F4F1EA]/90 leading-relaxed">
            {activeTab === 'desc' && (
              <div className="space-y-4">
                <p>{description}</p>
                <div>
                  <h4 className="font-bold text-[#1F3D2B] dark:text-[#F4F1EA] mb-2">{t.pointsForts} :</h4>
                  <ul className="space-y-2">
                    {pointsForts.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#3F6B2E] dark:bg-[#528B3E] mt-1.5 shrink-0"></span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'ingredients' && (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-[#F4F1EA] dark:bg-[#1C2D21] border border-[#E5DFC9] dark:border-[#273D2C]">
                  <h4 className="font-bold text-[#1F3D2B] dark:text-[#F4F1EA] mb-1">{t.ingredients} :</h4>
                  <p>{ingredients}</p>
                </div>
                <p className="text-xs text-[#8C6D23] dark:text-[#E5B834]">
                  Sans conservateur artificiel, sans parfum de synthèse, sans colorant.
                </p>
              </div>
            )}

            {activeTab === 'usage' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#F4F1EA] dark:bg-[#1C2D21] border border-[#E5DFC9] dark:border-[#273D2C]">
                  <h4 className="font-bold text-[#1F3D2B] dark:text-[#F4F1EA] mb-1">{t.usageAdvice} :</h4>
                  <p>{conseils}</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#F4F1EA] dark:bg-[#1C2D21] border border-[#E5DFC9] dark:border-[#273D2C]">
                  <h4 className="font-bold text-[#1F3D2B] dark:text-[#F4F1EA] mb-1">{t.storageAdvice} :</h4>
                  <p>{conservation}</p>
                </div>
              </div>
            )}

            {activeTab === 'precautions' && (
              <div className="p-4 rounded-2xl bg-[#F7F2E7] dark:bg-[#202E24] border border-[#DCD3BE] dark:border-[#273D2C] space-y-2">
                <div className="flex items-center gap-2 text-[#8C6D23] dark:text-[#E5B834] font-bold">
                  <ShieldAlert className="w-5 h-5" />
                  <span>{t.precautions}</span>
                </div>
                <p>{precautions}</p>
              </div>
            )}
          </div>

        </div>

        {/* Horizontal Carousel: "Vous aimerez aussi / Produits similaires" */}
        <HorizontalProductCarousel
          title={t.relatedProducts}
          subtitle="Découvrez les autres créations faites main de Rachid"
          products={relatedProducts}
          onSelectProduct={onSelectProduct}
          onAddToCart={(p) => onAddToCart(p, 1)}
          cartProductIds={cartProductIds}
          lang={lang}
          theme={theme}
        />

      </div>
    </div>
  );
};
