import React, { useState } from 'react';
import { CartItem, CustomerOrderInfo, PromoConfig, Language, AppTheme, PageView } from '../types/index.ts';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  MessageCircle,
  Tag,
  Check,
  ChevronRight,
  ChevronLeft,
  Truck,
  ShieldCheck,
  MapPin
} from 'lucide-react';
import {
  WHATSAPP_LINE_1,
  WHATSAPP_LINE_1_DISPLAY,
  WHATSAPP_LINE_2,
  WHATSAPP_LINE_2_DISPLAY,
  getCartWhatsAppUrl
} from '../lib/whatsapp.ts';
import { translations } from '../lib/translations.ts';

interface CartPageProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  promo: PromoConfig | null;
  onNavigate: (page: PageView) => void;
  lang: Language;
  theme: AppTheme;
  whatsappLine: 'line1' | 'line2';
  onWhatsappLineChange: (line: 'line1' | 'line2') => void;
}

export const CartPage: React.FC<CartPageProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  promo,
  onNavigate,
  lang,
  theme,
  whatsappLine,
  onWhatsappLineChange,
}) => {
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  const [customerInfo, setCustomerInfo] = useState<CustomerOrderInfo>({
    nom: '',
    ville: '',
    adresse: '',
    telephone: '',
    notes: '',
  });

  const t = translations[lang] || translations.fr;
  const isRtl = lang === 'ar';

  const subtotal = items.reduce((sum, item) => sum + item.product.prix * item.quantity, 0);
  const discountPercentage = appliedPromo ? (promo?.remisePourcentage || 10) : 0;
  const discountAmount = Math.round(subtotal * (discountPercentage / 100));
  const finalTotal = subtotal - discountAmount;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    const clean = promoCodeInput.trim().toUpperCase();

    if (promo && promo.active && clean === promo.code.toUpperCase()) {
      setAppliedPromo(clean);
    } else {
      setPromoError(lang === 'ar' ? 'كود تخفيض غير صالح. جرب POTAGER10' : 'Code promo invalide. Essayez POTAGER10');
    }
  };

  const handleSendOrder = () => {
    if (items.length === 0) return;
    const url = getCartWhatsAppUrl(
      items,
      customerInfo,
      discountPercentage,
      appliedPromo || '',
      whatsappLine,
      lang
    );
    window.open(url, '_blank');
  };

  return (
    <div className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#8C6D23] dark:text-[#E5B834] mb-6">
          <button
            onClick={() => onNavigate({ type: 'home' })}
            className="hover:underline cursor-pointer"
          >
            {t.breadcrumbsHome}
          </button>
          {isRtl ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          <span className="font-bold text-[#1F3D2B] dark:text-[#F4F1EA]">
            {t.cartTitle}
          </span>
        </div>

        <h1 className="font-title text-2xl sm:text-3xl md:text-4xl font-black text-[#1F3D2B] dark:text-[#F4F1EA] mb-8">
          {t.cartTitle} ({items.length})
        </h1>

        {items.length === 0 ? (
          /* Empty state */
          <div className="bg-[#FBFAF5] dark:bg-[#152219] rounded-3xl border border-[#E5DFC9] dark:border-[#273D2C] p-12 text-center max-w-xl mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#F4F1EA] dark:bg-[#1C2D21] flex items-center justify-center text-[#8C6D23] dark:text-[#E5B834] mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 opacity-75" />
            </div>
            <h2 className="font-title text-xl font-bold text-[#1F3D2B] dark:text-[#F4F1EA] mb-2">
              {t.cartEmpty}
            </h2>
            <p className="text-xs sm:text-sm text-[#1F3D2B]/75 dark:text-[#F4F1EA]/75 mb-6">
              {t.cartEmptyDesc}
            </p>
            <button
              onClick={() => onNavigate({ type: 'home' })}
              className="bg-[#1F3D2B] dark:bg-[#E5B834] text-white dark:text-[#0D140F] px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              {t.seeCatalog}
            </button>
          </div>
        ) : (
          /* Cart with items (Amazon / Jumia 2-column layout) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Products list */}
            <div className="lg:col-span-7 space-y-4">
              
              <div className="bg-[#FBFAF5] dark:bg-[#152219] rounded-3xl border border-[#E5DFC9] dark:border-[#273D2C] p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E5DFC9] dark:border-[#273D2C]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8C6D23] dark:text-[#E5B834]">
                    {items.length} {items.length > 1 ? 'articles sélectionnés' : 'article sélectionné'}
                  </span>
                  <button
                    onClick={onClearCart}
                    className="text-xs text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                  >
                    {t.clearCart}
                  </button>
                </div>

                <div className="space-y-4">
                  {items.map((item) => {
                    const title = lang === 'ar' ? (item.product.nomAr || item.product.nom) : lang === 'en' ? (item.product.nomEn || item.product.nom) : item.product.nom;
                    const contenance = lang === 'ar' ? (item.product.contenanceAr || item.product.contenance) : item.product.contenance;
                    return (
                      <div
                        key={item.product.id}
                        className="flex gap-4 p-3.5 bg-[#F4F1EA] dark:bg-[#1C2D21] rounded-2xl border border-[#E5DFC9] dark:border-[#273D2C] items-center"
                      >
                        <img
                          src={item.product.image}
                          alt={title}
                          className="w-20 h-20 object-contain bg-white rounded-xl p-1 border border-[#E5DFC9] shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <h3 className="font-title text-sm sm:text-base font-bold text-[#1F3D2B] dark:text-[#F4F1EA] truncate">
                            {title}
                          </h3>
                          <p className="text-xs text-[#8C6D23] dark:text-[#E5B834] font-medium">
                            {contenance} · {item.product.prix} {t.currency}
                          </p>

                          <div className="flex items-center justify-between mt-3">
                            {/* Quantity controls */}
                            <div className="flex items-center border border-[#D7CEBA] dark:border-[#273D2C] rounded-xl bg-white dark:bg-[#152219] overflow-hidden">
                              <button
                                onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                                className="p-1.5 hover:bg-[#F4F1EA] text-[#1F3D2B] dark:text-[#F4F1EA] cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-8 text-center text-xs font-bold font-mono text-[#1F3D2B] dark:text-[#F4F1EA]">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                                className="p-1.5 hover:bg-[#F4F1EA] text-[#1F3D2B] dark:text-[#F4F1EA] cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <span className="text-sm sm:text-base font-black text-[#1F3D2B] dark:text-[#F4F1EA]">
                              {item.product.prix * item.quantity} {t.currency}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="p-2 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Promo code box */}
              <div className="bg-[#FBFAF5] dark:bg-[#152219] rounded-3xl border border-[#E5DFC9] dark:border-[#273D2C] p-4 sm:p-5 shadow-sm">
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 absolute left-3 rtl:left-auto rtl:right-3 top-3 text-[#8C6D23] dark:text-[#E5B834]" />
                    <input
                      type="text"
                      placeholder="Code promo (ex: POTAGER10)"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                      className="w-full pl-9 pr-3 rtl:pr-9 rtl:pl-3 py-2 text-xs rounded-xl bg-white dark:bg-[#1C2D21] text-[#1F3D2B] dark:text-[#F4F1EA] border border-[#D7CEBA] dark:border-[#273D2C] uppercase font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#1F3D2B] dark:bg-[#E5B834] text-white dark:text-[#0D140F] px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    {t.applyPromo}
                  </button>
                </form>

                {appliedPromo && (
                  <div className="mt-2 text-xs font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>Code {appliedPromo} appliqué (-{discountPercentage}%) !</span>
                  </div>
                )}
                {promoError && (
                  <p className="mt-2 text-xs text-red-600 dark:text-red-400 font-medium">{promoError}</p>
                )}
              </div>

            </div>

            {/* Right: Delivery details and WhatsApp line dispatcher */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Delivery Details Form */}
              <div className="bg-[#FBFAF5] dark:bg-[#152219] rounded-3xl border border-[#E5DFC9] dark:border-[#273D2C] p-5 sm:p-6 shadow-sm space-y-4">
                <h2 className="font-title text-base sm:text-lg font-bold text-[#1F3D2B] dark:text-[#F4F1EA] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#3F6B2E] dark:text-[#528B3E]" />
                  <span>{t.deliveryFormTitle}</span>
                </h2>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#1F3D2B]/80 dark:text-[#F4F1EA]/80 mb-1">
                      {t.fullName}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Mohamed Alami"
                      value={customerInfo.nom}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, nom: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1C2D21] text-[#1F3D2B] dark:text-[#F4F1EA] border border-[#D7CEBA] dark:border-[#273D2C]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#1F3D2B]/80 dark:text-[#F4F1EA]/80 mb-1">
                      {t.city}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Casablanca, Rabat, Marrakech, Bouznika..."
                      value={customerInfo.ville}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, ville: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1C2D21] text-[#1F3D2B] dark:text-[#F4F1EA] border border-[#D7CEBA] dark:border-[#273D2C]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#1F3D2B]/80 dark:text-[#F4F1EA]/80 mb-1">
                      {t.address}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Quartier, rue, numéro de maison ou repère"
                      value={customerInfo.adresse}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, adresse: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1C2D21] text-[#1F3D2B] dark:text-[#F4F1EA] border border-[#D7CEBA] dark:border-[#273D2C]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#1F3D2B]/80 dark:text-[#F4F1EA]/80 mb-1">
                      {t.phone}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ex: 06 12 34 56 78"
                      value={customerInfo.telephone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, telephone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1C2D21] text-[#1F3D2B] dark:text-[#F4F1EA] border border-[#D7CEBA] dark:border-[#273D2C]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#1F3D2B]/80 dark:text-[#F4F1EA]/80 mb-1">
                      {t.notes}
                    </label>
                    <input
                      type="text"
                      placeholder="Instructions de livraison éventuelles"
                      value={customerInfo.notes}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1C2D21] text-[#1F3D2B] dark:text-[#F4F1EA] border border-[#D7CEBA] dark:border-[#273D2C]"
                    />
                  </div>
                </div>

                {/* WhatsApp Line Selector */}
                <div className="pt-2 border-t border-[#E5DFC9] dark:border-[#273D2C]">
                  <label className="block text-[11px] font-bold text-[#1F3D2B] dark:text-[#F4F1EA] mb-2">
                    {t.chooseWhatsAppNumber}
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => onWhatsappLineChange('line1')}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        whatsappLine === 'line1'
                          ? 'bg-[#1F3D2B] text-white dark:bg-[#E5B834] dark:text-[#0D140F] border-[#1F3D2B] dark:border-[#E5B834] font-bold'
                          : 'bg-white dark:bg-[#1C2D21] text-[#1F3D2B] dark:text-[#F4F1EA] border-[#D7CEBA] dark:border-[#273D2C]'
                      }`}
                    >
                      <span className="block text-[10px] opacity-75">WhatsApp 1</span>
                      <span className="font-mono text-xs">{WHATSAPP_LINE_1_DISPLAY}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onWhatsappLineChange('line2')}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        whatsappLine === 'line2'
                          ? 'bg-[#1F3D2B] text-white dark:bg-[#E5B834] dark:text-[#0D140F] border-[#1F3D2B] dark:border-[#E5B834] font-bold'
                          : 'bg-white dark:bg-[#1C2D21] text-[#1F3D2B] dark:text-[#F4F1EA] border-[#D7CEBA] dark:border-[#273D2C]'
                      }`}
                    >
                      <span className="block text-[10px] opacity-75">WhatsApp 2</span>
                      <span className="font-mono text-xs">{WHATSAPP_LINE_2_DISPLAY}</span>
                    </button>
                  </div>
                </div>

                {/* Totals & Submit */}
                <div className="pt-4 border-t border-[#E5DFC9] dark:border-[#273D2C] space-y-2 text-xs">
                  <div className="flex justify-between text-[#1F3D2B]/80 dark:text-[#F4F1EA]/80">
                    <span>{t.subtotal} :</span>
                    <span className="font-semibold">{subtotal} {t.currency}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-semibold">
                      <span>{t.discount} ({appliedPromo} -{discountPercentage}%) :</span>
                      <span>-{discountAmount} {t.currency}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-base sm:text-lg font-black text-[#1F3D2B] dark:text-[#F4F1EA] pt-2 border-t border-[#E5DFC9] dark:border-[#273D2C]">
                    <span className="font-title">{t.totalEstimated} :</span>
                    <span className="font-title text-[#1F3D2B] dark:text-[#E5B834]">
                      {finalTotal} {t.currency}
                    </span>
                  </div>

                  <p className="text-[10px] text-[#1F3D2B]/60 dark:text-[#F4F1EA]/60">
                    * Règlement en espèces (Cash on Delivery) à la livraison.
                  </p>
                </div>

                {/* Dispatch Button */}
                <button
                  onClick={handleSendOrder}
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white py-3.5 px-4 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer pulse-whatsapp"
                >
                  <MessageCircle className="w-5 h-5 fill-current shrink-0" />
                  <span>{t.sendOrderWhatsApp}</span>
                </button>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
