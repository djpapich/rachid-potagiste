import React from 'react';
import { X, Trash2, ArrowRight, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';
import { CartItem, Language } from '../types/index.ts';
import { translations } from '../lib/translations.ts';
import { resolveImageUrl, handleImageError } from '../lib/imageHelper.ts';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currentLang: Language;
  onUpdateQuantity: (productId: number, qty: number) => void;
  onRemoveItem: (productId: number) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  currentLang,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;
  const t = translations[currentLang];

  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const freeShippingThreshold = 25000; // 250 DH in cents
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 3500; // 35 DH
  const total = subtotal + shippingFee;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/50 backdrop-blur-xs flex justify-end animate-in fade-in">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-stone-200 animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-800" />
            <h2 className="text-base font-semibold text-stone-900 font-serif">
              {t.cart} ({items.reduce((acc, i) => acc + i.quantity, 0)})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Notification (250 DH threshold) */}
        {subtotal > 0 && (
          <div className="bg-emerald-50/90 px-4 py-2.5 border-b border-emerald-100 text-xs text-emerald-900">
            {remainingForFreeShipping > 0 ? (
              <div>
                <p className="font-medium">
                  Ajoutez encore <span className="font-bold underline">{(remainingForFreeShipping / 100).toFixed(2)} {t.currency}</span> pour bénéficier de la livraison offerte partout au Maroc !
                </p>
                <div className="w-full bg-emerald-200/80 rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-700 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="font-semibold flex items-center gap-1.5 text-emerald-800">
                <Truck className="w-3.5 h-3.5 text-emerald-700" />
                Félicitations ! Vous profitez de la livraison offerte au Maroc 🌿
              </p>
            )}
          </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400 space-y-3">
              <ShoppingBag className="w-12 h-12 text-stone-300 stroke-1" />
              <p className="text-sm text-stone-600">{t.cartEmpty}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                Découvrir les semences de Rachid
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-stone-100 bg-[#FBFBF9] hover:border-stone-200 transition-colors"
              >
                <img
                  src={resolveImageUrl(item.product.imageUrl)}
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded-lg bg-stone-100 shrink-0"
                  referrerPolicy="no-referrer"
                  onError={handleImageError}
                />

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-stone-900 truncate">
                    {item.product.name}
                  </h4>
                  <p className="text-[11px] text-stone-500 truncate">
                    {item.product.unit}
                  </p>
                  <p className="text-xs font-bold text-stone-900 mt-1 tabular-nums">
                    {((item.product.price * item.quantity) / 100).toFixed(2)} {t.currency}
                  </p>
                </div>

                {/* Quantity adjustments */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className="flex items-center border border-stone-200 rounded-md bg-white">
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                      className="px-2 py-0.5 text-xs text-stone-600 hover:bg-stone-100 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-2 text-xs font-semibold tabular-nums text-stone-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, Math.min(item.product.stock, item.quantity + 1))}
                      disabled={item.quantity >= item.product.stock}
                      className="px-2 py-0.5 text-xs text-stone-600 hover:bg-stone-100 disabled:opacity-30 cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="text-stone-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer & Checkout Action */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-stone-200 bg-[#FBFBF9] space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>{t.subtotal}</span>
                <span className="font-medium text-stone-900 tabular-nums">
                  {(subtotal / 100).toFixed(2)} {t.currency}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>{t.shipping}</span>
                <span className="font-medium tabular-nums">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-semibold">{t.free}</span>
                  ) : (
                    `${(shippingFee / 100).toFixed(2)} ${t.currency}`
                  )}
                </span>
              </div>
              <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-bold text-stone-900">
                <span>{t.total}</span>
                <span className="text-base font-serif tabular-nums">
                  {(total / 100).toFixed(2)} {t.currency}
                </span>
              </div>
            </div>

            <button
              onClick={onProceedToCheckout}
              className="w-full py-3.5 px-4 bg-[#1F3A2B] text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-[#162a1f] transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>{t.checkout}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
              <span>Chiffrement SSL & Paiement Cash à la livraison partout au Maroc</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
