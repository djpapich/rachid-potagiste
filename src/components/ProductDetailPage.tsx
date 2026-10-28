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
  Truck,
  Share2,
} from 'lucide-react';
import {
  openWhatsApp,
  WHATSAPP_LINE_1_DISPLAY,
  WHATSAPP_LINE_2_DISPLAY,
  getProductWhatsAppUrl,
} from '../lib/whatsapp.ts';
import { translations } from '../lib/translations.ts';
import { localized } from '../lib/seo.ts';
import { absoluteUrl } from '../lib/router.ts';
import { MAX_QTY } from '../lib/validation.ts';
import { photoFirst } from '../lib/imageHelper.ts';
import { HorizontalProductCarousel } from './HorizontalProductCarousel.tsx';
import { NavLink } from './NavLink.tsx';
import { ProductImage } from './ProductImage.tsx';

interface ProductDetailPageProps {
  product: Product;
  allProducts: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  cartProductIds: Set<string>;
  onNavigate: (page: PageView) => void;
  lang: Language;
  theme: AppTheme;
  whatsappLine: 'line1' | 'line2';
}

type TabId = 'desc' | 'ingredients' | 'usage' | 'precautions';

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  onSelectProduct,
  onAddToCart,
  cartProductIds,
  onNavigate,
  lang,
  theme,
  whatsappLine,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [view, setView] = useState<'photo' | 'cutout'>('photo');
  const [justAdded, setJustAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('desc');

  const t = translations[lang] || translations.fr;
  const isRtl = lang === 'ar';
  const Chevron = isRtl ? ChevronLeft : ChevronRight;

  const title = localized(lang, product.nom, product.nomAr, product.nomEn);
  const familyLabel = localized(lang, product.familleLabel, product.familleLabelAr, product.familleLabelEn);
  const catchphrase = localized(lang, product.accroche, product.accrocheAr, product.accrocheEn);
  const description = localized(lang, product.description, product.descriptionAr, product.descriptionEn);
  const ingredients = localized(lang, product.ingredients, product.ingredientsAr, product.ingredientsEn);
  const conseils = localized(lang, product.conseils, product.conseilsAr, product.conseilsEn);
  const precautions = localized(lang, product.precautions, product.precautionsAr, product.precautionsEn);
  const conservation = localized(lang, product.conservation, product.conservationAr, product.conservationEn);
  const contenance = localized(lang, product.contenance, product.contenanceAr);
  const pointsForts =
    lang === 'ar' ? product.pointsFortsAr || product.pointsForts : lang === 'en' ? product.pointsFortsEn || product.pointsForts : product.pointsForts;

  const total = product.prix * quantity;
  const showCutout = view === 'cutout' && Boolean(product.imagePng);

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1500);
  };

  const shareUrl = `https://wa.me/?text=${encodeURIComponent(`${title} - ${absoluteUrl(`/produit/${product.id}`)}`)}`;

  const relatedProducts = photoFirst(
    allProducts
      .filter((p) => p.id !== product.id && p.famille === product.famille)
      .concat(allProducts.filter((p) => p.famille !== product.famille))
  ).slice(0, 8);

  const tabs: { id: TabId; label: string }[] = [
    { id: 'desc', label: lang === 'ar' ? 'الوصف والمميزات' : lang === 'en' ? 'Description & Highlights' : 'Description & Atouts' },
    { id: 'ingredients', label: t.ingredients },
    { id: 'usage', label: `${t.usageAdvice} & ${t.storageAdvice}` },
    { id: 'precautions', label: t.precautions },
  ];

  const card = 'p-4 rounded-2xl bg-[#F4F1EA] dark:bg-[#1C2D21] border border-[#E5DFC9] dark:border-[#273D2C]';

  return (
    <div className="py-6 sm:py-12 pb-28 lg:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-xs text-[#8C6D23] dark:text-[#E5B834] mb-5 flex-wrap">
          <NavLink page={{ type: 'home' }} onNavigate={onNavigate} className="hover:underline">
            {t.breadcrumbsHome}
          </NavLink>
          <Chevron className="w-3.5 h-3.5" aria-hidden="true" />
          <NavLink page={{ type: 'category', family: product.famille }} onNavigate={onNavigate} className="hover:underline">
            {familyLabel}
          </NavLink>
          <Chevron className="w-3.5 h-3.5" aria-hidden="true" />
          <span aria-current="page" className="font-bold text-[#1F3D2B] dark:text-[#F4F1EA] truncate max-w-[220px]">
            {title}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 bg-[#FBFAF5] dark:bg-[#152219] p-4 sm:p-10 rounded-3xl border border-[#E5DFC9] dark:border-[#273D2C] shadow-sm mb-10">
          {/* Gallery */}
          <div className="lg:col-span-6 flex flex-col gap-3">
            <div className="relative aspect-square w-full bg-[#F4F1EA] dark:bg-[#101A13] rounded-3xl border border-[#E5DFC9] dark:border-[#273D2C] overflow-hidden p-4 sm:p-6">
              <div className="w-full h-full">
                {showCutout ? (
                  <img
                    src={product.imagePng}
                    alt={title}
                    width={640}
                    height={640}
                    className="w-full h-full object-contain drop-shadow-lg"
                  />
                ) : (
                  <ProductImage
                    src={product.image}
                    alt={title}
                    priority
                    lang={lang}
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 flex flex-col gap-1.5 pointer-events-none">
                {product.badges.map((badge, idx) => (
                  <span
                    key={idx}
                    className={`rounded-full text-[10px] font-bold tracking-wide leading-none whitespace-nowrap flex items-center justify-center px-2.5 py-1.5 uppercase shadow-xs ${
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

            {/* Thumbnails: studio photo / cut-out */}
            {product.imagePng && product.image && (
              <div className="flex items-center gap-2" role="group" aria-label="Vues du produit">
                {(['photo', 'cutout'] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setView(v)}
                    aria-pressed={view === v}
                    aria-label={v === 'photo' ? 'Photo' : 'Vue détourée'}
                    className={`w-16 h-16 rounded-xl border-2 overflow-hidden bg-[#F4F1EA] dark:bg-[#101A13] cursor-pointer transition-colors ${
                      view === v ? 'border-[#1F3D2B] dark:border-[#E5B834]' : 'border-[#E5DFC9] dark:border-[#273D2C] hover:border-[#8C6D23]'
                    }`}
                  >
                    <img
                      src={v === 'photo' ? product.image.replace(/-800\.webp$/, '-400.webp') : product.imagePng}
                      alt=""
                      width={64}
                      height={64}
                      loading="lazy"
                      className="w-full h-full object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-[#8C6D23] dark:text-[#E5B834] font-medium px-1">
              <span>🌾 Fait main par Rachid à Bouznika</span>
              <span>{contenance}</span>
            </div>
          </div>

          {/* Buy box */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8C6D23] dark:text-[#E5B834] mb-1">
              <span>{familyLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{contenance}</span>
            </div>

            <h1 className="font-title text-2xl sm:text-3xl md:text-4xl font-black text-[#1F3D2B] dark:text-[#F4F1EA] leading-tight mb-2">
              {title}
            </h1>

            <p className="font-script text-xl sm:text-2xl text-[#8C6D23] dark:text-[#E5B834] font-bold mb-4 italic">« {catchphrase} »</p>

            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mb-5 pb-4 border-b border-[#E5DFC9] dark:border-[#273D2C]">
              <span className="text-3xl sm:text-4xl font-black text-[#1F3D2B] dark:text-[#F4F1EA] font-title">
                {product.prix} <span className="text-xl font-semibold text-[#8C6D23] dark:text-[#E5B834]">{t.currency}</span>
              </span>
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1 rounded-full">
                {t.inStock}
              </span>
            </div>

            <p className="text-sm sm:text-base text-[#1F3D2B]/85 dark:text-[#F4F1EA]/85 leading-relaxed mb-5">{description}</p>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-5 bg-[#F4F1EA] dark:bg-[#1C2D21] p-3.5 rounded-2xl border border-[#E5DFC9] dark:border-[#273D2C]">
              <span id="qty-label" className="text-xs sm:text-sm font-semibold text-[#1F3D2B] dark:text-[#F4F1EA]">
                {t.quantity}
              </span>
              <div
                role="group"
                aria-labelledby="qty-label"
                className="flex items-center border border-[#D7CEBA] dark:border-[#273D2C] rounded-xl bg-white dark:bg-[#152219] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  aria-label={t.decreaseQty}
                  className="p-2.5 text-[#1F3D2B] dark:text-[#F4F1EA] hover:bg-[#F4F1EA] dark:hover:bg-[#1C2D21] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Minus className="w-4 h-4" aria-hidden="true" />
                </button>
                <output aria-live="polite" className="w-10 text-center text-sm font-bold font-mono text-[#1F3D2B] dark:text-[#F4F1EA]">
                  {quantity}
                </output>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(MAX_QTY, quantity + 1))}
                  disabled={quantity >= MAX_QTY}
                  aria-label={t.increaseQty}
                  className="p-2.5 text-[#1F3D2B] dark:text-[#F4F1EA] hover:bg-[#F4F1EA] dark:hover:bg-[#1C2D21] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              <div className="ms-auto text-end">
                <span className="text-xs text-[#1F3D2B]/60 dark:text-[#F4F1EA]/60 block">{t.total}</span>
                <span className="text-lg font-black text-[#1F3D2B] dark:text-[#F4F1EA]">
                  {total} {t.currency}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 mb-5">
              <button
                type="button"
                onClick={handleAddToCart}
                className={`w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl font-bold text-sm border transition-all cursor-pointer shadow-sm active:scale-[0.98] ${
                  justAdded
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-[#1F3D2B] dark:bg-[#E5B834] text-[#FBFAF5] dark:text-[#0D140F] hover:bg-[#162D20] dark:hover:bg-[#D4A92B] border-[#1F3D2B] dark:border-[#E5B834]'
                }`}
              >
                {justAdded ? <Check className="w-4 h-4" aria-hidden="true" /> : <Plus className="w-4 h-4 text-[#C9A227] dark:text-[#0D140F]" aria-hidden="true" />}
                <span>{justAdded ? t.addedToCart : t.addToCart}</span>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(['line1', 'line2'] as const).map((line) => (
                  <button
                    key={line}
                    type="button"
                    onClick={() => openWhatsApp(getProductWhatsAppUrl(product, quantity, line, lang))}
                    className="flex items-center justify-center gap-2 bg-[#0F7A40] hover:bg-[#0C6937] text-white py-3 px-4 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-current shrink-0" aria-hidden="true" />
                    <span>
                      WhatsApp {line === 'line1' ? '1' : '2'} ({line === 'line1' ? WHATSAPP_LINE_1_DISPLAY : WHATSAPP_LINE_2_DISPLAY})
                    </span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => openWhatsApp(shareUrl)}
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#1F3D2B] dark:text-[#F4F1EA] hover:text-[#3F6B2E] dark:hover:text-[#E5B834] cursor-pointer"
              >
                <Share2 className="w-4 h-4" aria-hidden="true" />
                {t.share}
              </button>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-[#1F3D2B]/80 dark:text-[#F4F1EA]/80 pt-3 border-t border-[#E5DFC9] dark:border-[#273D2C]">
              <Truck className="w-4 h-4 text-[#3F6B2E] dark:text-[#528B3E] shrink-0" aria-hidden="true" />
              <span>
                {t.cashOnDelivery} · {t.quickDelivery}
              </span>
            </div>
          </div>
        </div>

        {/* Details tabs */}
        <section className="bg-[#FBFAF5] dark:bg-[#152219] rounded-3xl p-4 sm:p-8 border border-[#E5DFC9] dark:border-[#273D2C] shadow-xs mb-12">
          <div role="tablist" aria-label="Détails du produit" className="flex flex-wrap items-center gap-2 border-b border-[#E5DFC9] dark:border-[#273D2C] pb-4 mb-6 text-xs sm:text-sm font-semibold">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#1F3D2B] text-white dark:bg-[#E5B834] dark:text-[#0D140F]'
                    : 'text-[#1F3D2B] dark:text-[#F4F1EA] hover:bg-[#F4F1EA] dark:hover:bg-[#1C2D21]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div
            id={`panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            className="text-xs sm:text-sm text-[#1F3D2B]/90 dark:text-[#F4F1EA]/90 leading-relaxed"
          >
            {activeTab === 'desc' && (
              <div className="space-y-4">
                <p>{description}</p>
                <div>
                  <h2 className="font-bold text-[#1F3D2B] dark:text-[#F4F1EA] mb-2">{t.pointsForts} :</h2>
                  <ul className="space-y-2">
                    {pointsForts.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#3F6B2E] dark:bg-[#528B3E] mt-1.5 shrink-0" aria-hidden="true"></span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'ingredients' && (
              <div className="space-y-3">
                <div className={card}>
                  <h2 className="font-bold text-[#1F3D2B] dark:text-[#F4F1EA] mb-1">{t.ingredients} :</h2>
                  <p>{ingredients}</p>
                </div>
                <p className="text-xs text-[#8C6D23] dark:text-[#E5B834]">
                  {lang === 'ar'
                    ? 'بدون مواد حافظة صناعية، بدون عطور مصنعة، بدون ملونات.'
                    : lang === 'en'
                    ? 'No artificial preservatives, no synthetic fragrance, no colouring.'
                    : 'Sans conservateur artificiel, sans parfum de synthèse, sans colorant.'}
                </p>
              </div>
            )}

            {activeTab === 'usage' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={card}>
                  <h2 className="font-bold text-[#1F3D2B] dark:text-[#F4F1EA] mb-1">{t.usageAdvice} :</h2>
                  <p>{conseils}</p>
                </div>
                <div className={card}>
                  <h2 className="font-bold text-[#1F3D2B] dark:text-[#F4F1EA] mb-1">{t.storageAdvice} :</h2>
                  <p>{conservation}</p>
                </div>
              </div>
            )}

            {activeTab === 'precautions' && (
              <div className="p-4 rounded-2xl bg-[#F7F2E7] dark:bg-[#202E24] border border-[#DCD3BE] dark:border-[#273D2C] space-y-2">
                <div className="flex items-center gap-2 text-[#8C6D23] dark:text-[#E5B834] font-bold">
                  <ShieldAlert className="w-5 h-5" aria-hidden="true" />
                  <h2>{t.precautions}</h2>
                </div>
                <p>{precautions}</p>
              </div>
            )}
          </div>
        </section>

        <HorizontalProductCarousel
          title={t.relatedProducts}
          subtitle={lang === 'ar' ? 'اكتشف باقي منتجات رشيد المصنوعة يدوياً' : lang === 'en' ? "Discover Rachid's other handmade creations" : 'Découvrez les autres créations faites main de Rachid'}
          products={relatedProducts}
          onSelectProduct={onSelectProduct}
          onAddToCart={(p) => onAddToCart(p, 1)}
          cartProductIds={cartProductIds}
          lang={lang}
          theme={theme}
        />
      </div>

      {/* Sticky buy bar (phones): price, add to cart, WhatsApp - always one tap away */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#FBFAF5]/95 dark:bg-[#152219]/95 backdrop-blur-md border-t border-[#E5DFC9] dark:border-[#273D2C] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center gap-3">
        <div className="min-w-0">
          <span className="block text-[10px] text-[#1F3D2B]/60 dark:text-[#F4F1EA]/60">{quantity > 1 ? `${quantity} ×` : t.total}</span>
          <span className="block text-lg font-black font-title text-[#1F3D2B] dark:text-[#F4F1EA] leading-none">
            {total} <span className="text-xs font-semibold text-[#8C6D23] dark:text-[#E5B834]">{t.currency}</span>
          </span>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer active:scale-[0.98] ${
            justAdded ? 'bg-emerald-700 text-white' : 'bg-[#1F3D2B] dark:bg-[#E5B834] text-[#FBFAF5] dark:text-[#0D140F]'
          }`}
        >
          {justAdded ? <Check className="w-4 h-4" aria-hidden="true" /> : <Plus className="w-4 h-4" aria-hidden="true" />}
          <span>{justAdded ? t.addedToCart : t.addToCart}</span>
        </button>
        <button
          type="button"
          onClick={() => openWhatsApp(getProductWhatsAppUrl(product, quantity, whatsappLine, lang))}
          aria-label={t.orderOnWhatsApp}
          className="w-12 h-12 shrink-0 rounded-xl bg-[#0F7A40] text-white flex items-center justify-center shadow-md cursor-pointer active:scale-95"
        >
          <MessageCircle className="w-6 h-6 fill-current" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
