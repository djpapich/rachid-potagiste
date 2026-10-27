import React, { useState } from 'react';
import { CartItem, CustomerOrderInfo, PromoConfig } from '../types/index.ts';
import {
  OrderField,
  checkPromoCode,
  promoErrorMessage,
  promoPercent,
  validateOrderInfo,
} from '../lib/validation.ts';
import { X, Trash2, Plus, Minus, MessageCircle, ShoppingBag, Tag, Check, Sparkles, MapPin } from 'lucide-react';
import { openWhatsApp, getCartWhatsAppUrl, WHATSAPP_DISPLAY_PHONE } from '../lib/whatsapp.ts';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  promo: PromoConfig | null;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  promo,
}) => {
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<OrderField, string>>>({});

  const [customerInfo, setCustomerInfo] = useState<CustomerOrderInfo>({
    nom: '',
    ville: '',
    adresse: '',
    telephone: '',
    notes: '',
  });

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.prix * item.quantity, 0);
  const discountPercentage = promoPercent(promo, appliedPromo);
  const discountAmount = Math.round(subtotal * (discountPercentage / 100));
  const finalTotal = subtotal - discountAmount;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    const result = checkPromoCode(promo, promoCodeInput);

    if (result === 'ok' && promo) {
      setAppliedPromo(promo.code.toUpperCase());
    } else {
      setAppliedPromo(null);
      setPromoError(promoErrorMessage(result, 'fr'));
    }
  };

  const handleSendOrder = () => {
    if (items.length === 0) return;
    const validation = validateOrderInfo(customerInfo, 'fr');
    setErrors(validation.errors);
    if (!validation.ok) return;
    const url = getCartWhatsAppUrl(items, validation.clean, discountPercentage, appliedPromo || '');
    openWhatsApp(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div
        className="w-full max-w-lg bg-[#FBFAF5] h-full shadow-2xl flex flex-col justify-between border-l border-[#E5DFC9] animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#E5DFC9] flex items-center justify-between bg-[#F4F1EA]">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#8C6D23]" />
            <div>
              <h2 className="font-title text-lg sm:text-xl font-black text-[#1F3D2B]">
                Ma Sélection Artisanale
              </h2>
              <span className="text-xs text-[#1F3D2B]/70">
                {items.length} {items.length <= 1 ? 'produit choisi' : 'produits choisis'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#1F3D2B]/70 hover:text-[#1F3D2B] bg-[#EAE4D2] hover:bg-[#E0D7BF] rounded-full transition-colors"
            aria-label="Fermer ma sélection"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-[#EAE4D2] flex items-center justify-center text-[#8C6D23] mb-4">
                <ShoppingBag className="w-8 h-8 opacity-70" />
              </div>
              <h3 className="font-title text-lg font-bold text-[#1F3D2B] mb-2">
                Votre sélection est vide
              </h3>
              <p className="text-xs text-[#1F3D2B]/70 max-w-xs mb-6">
                Parcourez nos légumes lacto-fermentés, huiles de macération, savons luffa et crèmes de soin pour composer votre commande.
              </p>
              <button
                onClick={onClose}
                className="bg-[#1F3D2B] text-[#FBFAF5] hover:bg-[#162D20] px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Parcourir les produits
              </button>
            </div>
          ) : (
            <>
              {/* Product items list */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-3 p-3 bg-[#F4F1EA] rounded-2xl border border-[#E5DFC9] items-center"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.nom}
                      className="w-16 h-16 object-contain bg-white rounded-xl p-1 border border-[#E5DFC9] shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="font-title text-xs sm:text-sm font-bold text-[#1F3D2B] truncate">
                        {item.product.nom}
                      </h4>
                      <p className="text-[11px] text-[#8C6D23] font-medium">
                        {item.product.contenance} · {item.product.prix} DH/u
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity controls */}
                        <div className="flex items-center border border-[#D7CEBA] rounded-lg bg-white overflow-hidden shadow-2xs">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 hover:bg-[#F4F1EA] text-[#1F3D2B] transition-colors"
                            aria-label="Diminuer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold font-mono">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 hover:bg-[#F4F1EA] text-[#1F3D2B] transition-colors"
                            aria-label="Augmenter"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-black text-[#1F3D2B]">
                          {item.product.prix * item.quantity} DH
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="p-1.5 text-stone-400 hover:text-red-700 transition-colors ml-1"
                      title="Retirer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Promo Code box */}
              <div className="bg-[#EFECE3] p-3.5 rounded-2xl border border-[#E5DFC9]">
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 absolute left-3 top-2.5 text-[#8C6D23]" />
                    <input
                      type="text"
                      placeholder="Code promo" maxLength={32} autoComplete="off"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white border border-[#D7CEBA] focus:outline-hidden focus:border-[#1F3D2B] uppercase font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#1F3D2B] hover:bg-[#162D20] text-[#FBFAF5] px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Appliquer
                  </button>
                </form>

                {appliedPromo && (
                  <div className="mt-2 text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>Code {appliedPromo} appliqué (-{discountPercentage}%) !</span>
                  </div>
                )}
                {promoError && (
                  <p className="mt-2 text-xs text-red-700 font-medium">{promoError}</p>
                )}
              </div>

              {/* Customer Delivery Information Form */}
              <div className="bg-[#FBFAF5] p-4 rounded-2xl border border-[#E5DFC9] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F3D2B] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#3F6B2E]" />
                  <span>Vos coordonnées pour la livraison :</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#1F3D2B]/80 mb-1">
                      Nom & Prénom *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Votre nom complet"
                      value={customerInfo.nom}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, nom: e.target.value })}
                      maxLength={80}
                      aria-invalid={Boolean(errors.nom)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#D7CEBA] focus:outline-hidden focus:border-[#1F3D2B]"
                    />
                    {errors.nom && <p className="mt-1 text-[11px] text-red-700 font-medium">{errors.nom}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#1F3D2B]/80 mb-1">
                      Ville *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Casablanca, Rabat, Bouznika..."
                      value={customerInfo.ville}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, ville: e.target.value })}
                      maxLength={60}
                      aria-invalid={Boolean(errors.ville)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#D7CEBA] focus:outline-hidden focus:border-[#1F3D2B]"
                    />
                    {errors.ville && <p className="mt-1 text-[11px] text-red-700 font-medium">{errors.ville}</p>}
                  </div>
                </div>

                <div className="text-xs">
                  <label className="block text-[11px] font-semibold text-[#1F3D2B]/80 mb-1">
                    Adresse complète de livraison *
                  </label>
                  <input
                    type="text"
                    placeholder="Quartier, rue, numéro ou repère"
                    value={customerInfo.adresse}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, adresse: e.target.value })}
                    maxLength={200}
                    aria-invalid={Boolean(errors.adresse)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D7CEBA] focus:outline-hidden focus:border-[#1F3D2B]"
                  />
                  {errors.adresse && <p className="mt-1 text-[11px] text-red-700 font-medium">{errors.adresse}</p>}
                </div>

                <div className="text-xs">
                  <label className="block text-[11px] font-semibold text-[#1F3D2B]/80 mb-1">
                    Téléphone WhatsApp *
                  </label>
                  <input
                    type="tel"
                    placeholder="Ex: 06 00 00 00 00"
                    value={customerInfo.telephone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, telephone: e.target.value })}
                    maxLength={20}
                    aria-invalid={Boolean(errors.telephone)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D7CEBA] focus:outline-hidden focus:border-[#1F3D2B]"
                  />
                  {errors.telephone && <p className="mt-1 text-[11px] text-red-700 font-medium">{errors.telephone}</p>}
                </div>

                <div className="text-xs">
                  <label className="block text-[11px] font-semibold text-[#1F3D2B]/80 mb-1">
                    Note ou question (facultatif)
                  </label>
                  <input
                    type="text"
                    placeholder="Instructions particulières de livraison"
                    value={customerInfo.notes}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                    maxLength={300}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D7CEBA] focus:outline-hidden focus:border-[#1F3D2B]"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer with Totals & WhatsApp CTA */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-[#E5DFC9] bg-[#F4F1EA] space-y-3">
            <div className="space-y-1.5 text-xs text-[#1F3D2B]">
              <div className="flex justify-between">
                <span className="text-[#1F3D2B]/75">Sous-total :</span>
                <span className="font-semibold">{subtotal} DH</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-800 font-semibold">
                  <span>Remise ({appliedPromo} -{discountPercentage}%) :</span>
                  <span>-{discountAmount} DH</span>
                </div>
              )}

              <div className="flex justify-between text-base font-black pt-1.5 border-t border-[#E5DFC9]">
                <span className="font-title">Total estimé :</span>
                <span className="text-lg font-title text-[#1F3D2B]">
                  {finalTotal} <span className="text-sm font-semibold text-[#8C6D23]">DH</span>
                </span>
              </div>
              <p className="text-[10px] text-[#1F3D2B]/60">
                Paiement à la réception en espèces. Frais de port calculés selon votre ville avec Rachid.
              </p>
            </div>

            <button
              onClick={handleSendOrder}
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white py-3.5 px-4 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer pulse-whatsapp"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Envoyer ma commande sur WhatsApp</span>
            </button>

            <button
              onClick={onClearCart}
              className="w-full text-center text-xs text-[#1F3D2B]/60 hover:text-red-700 py-1 transition-colors"
            >
              Vider toute ma sélection
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
