import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, Lock, CheckCircle2, ArrowRight, Truck, Sparkles } from 'lucide-react';
import { CartItem, Language, Order } from '../types/index.ts';
import { translations } from '../lib/translations.ts';
import { storeService } from '../services/storeService.ts';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currentLang: Language;
  onOrderCompleted: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  currentLang,
  onOrderCompleted,
}) => {
  const t = translations[currentLang];

  const [step, setStep] = useState<'details' | 'payment' | 'processing' | 'success'>('details');
  const [customerName, setCustomerName] = useState('Mehdi Ait Aissa');
  const [customerEmail, setCustomerEmail] = useState('majdaitaissa@gmail.com');
  const [customerPhone, setCustomerPhone] = useState('+212 6 61 23 45 67');
  const [address, setAddress] = useState('15 Boulevard d\'Anfa');
  const [city, setCity] = useState('Casablanca');
  const [postalCode, setPostalCode] = useState('20000');

  const [paymentMethod, setPaymentMethod] = useState<'stripe_card' | 'cod'>('cod');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('884');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const freeShippingThreshold = 25000; // 250 DH
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 3500; // 35 DH
  const total = subtotal + shippingFee;

  const handleFillTestCard = () => {
    setCardNumber('4242 4242 4242 4242');
    setCardExpiry('08/29');
    setCardCvc('314');
  };

  const handleProcessPayment = () => {
    setStep('processing');
    setTimeout(() => {
      const order = storeService.createOrder({
        userId: 'user_active',
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress: address,
        shippingCity: city,
        shippingPostalCode: postalCode,
        paymentMethod,
        items,
      });

      setCompletedOrder(order);
      setStep('success');
      onOrderCompleted(order);
    }, 1300);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div className="relative bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-stone-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-[#FBFBF9]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-800" />
            <h2 className="text-base font-semibold text-stone-900 font-serif">
              {step === 'success' ? 'Commande Confirmée' : 'Finaliser la Commande · Rachid Le Potagiste'}
            </h2>
          </div>
          {step !== 'processing' && (
            <button
              onClick={onClose}
              className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Step: Details */}
        {step === 'details' && (
          <div className="p-6 space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-stone-900 mb-1">
                1. Vos coordonnées de livraison au Maroc
              </h3>
              <p className="text-xs text-stone-500">
                Expédition rapide par transporteur express (Amana Messagerie). Vous recevrez un suivi par email.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-stone-600 font-medium">Nom complet</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-emerald-700 bg-stone-50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-stone-600 font-medium">Email (Notifications de suivi)</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-emerald-700 bg-stone-50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-stone-600 font-medium">Téléphone portable (Livreur)</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+212 6..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-emerald-700 bg-stone-50"
                  required
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-stone-600 font-medium">Adresse de livraison (Quartier, Rue, N°)</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-emerald-700 bg-stone-50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-stone-600 font-medium">Ville au Maroc</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-emerald-700 bg-stone-50"
                >
                  <option value="Casablanca">Casablanca</option>
                  <option value="Rabat">Rabat</option>
                  <option value="Marrakech">Marrakech</option>
                  <option value="Tanger">Tanger</option>
                  <option value="Fès">Fès</option>
                  <option value="Agadir">Agadir</option>
                  <option value="Meknès">Meknès</option>
                  <option value="Oujda">Oujda</option>
                  <option value="Salé">Salé</option>
                  <option value="Kénitra">Kénitra</option>
                  <option value="Autre ville">Autre ville</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-stone-600 font-medium">Code postal</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-emerald-700 bg-stone-50"
                  required
                />
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
              <div className="text-xs text-stone-600">
                Total à régler : <span className="font-bold text-stone-900 tabular-nums">{(total / 100).toFixed(2)} {t.currency}</span>
              </div>
              <button
                onClick={() => setStep('payment')}
                className="px-5 py-2.5 bg-[#1F3A2B] text-white text-xs font-semibold rounded-lg hover:bg-[#162a1f] flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continuer vers le paiement</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step: Payment */}
        {step === 'payment' && (
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-stone-900 mb-1">
                  2. Mode de règlement en Dirhams (DH)
                </h3>
                <p className="text-xs text-stone-500">
                  Paiement sécurisé ou paiement en espèces directement au livreur.
                </p>
              </div>

              {paymentMethod === 'stripe_card' && (
                <button
                  onClick={handleFillTestCard}
                  className="px-2.5 py-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-emerald-700" />
                  <span>Test Stripe 4242</span>
                </button>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  paymentMethod === 'cod'
                    ? 'border-emerald-700 bg-emerald-50/50 ring-1 ring-emerald-700'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <Truck className="w-4 h-4 text-emerald-800 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-stone-900">Paiement à la Livraison</div>
                  <div className="text-[11px] text-stone-500">Espèces au livreur (Maroc)</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('stripe_card')}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  paymentMethod === 'stripe_card'
                    ? 'border-emerald-700 bg-emerald-50/50 ring-1 ring-emerald-700'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <CreditCard className="w-4 h-4 text-emerald-800 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-stone-900">Carte Bancaire (Stripe)</div>
                  <div className="text-[11px] text-stone-500">Sécurisé 3D-Secure</div>
                </div>
              </button>
            </div>

            {/* Conditional fields */}
            {paymentMethod === 'stripe_card' ? (
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/90 space-y-3">
                <div className="flex items-center justify-between text-xs text-stone-600 pb-1 border-b border-stone-200">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-700" />
                    Chiffrement bancaire Stripe TLS 256-bit
                  </span>
                  <span className="text-[11px] text-emerald-800 font-medium">Conformité PCI-DSS</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-stone-600 font-medium">Numéro de carte</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4242 4242 4242 4242"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:border-emerald-700 bg-white font-mono tracking-wider"
                    />
                    <CreditCard className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-stone-600 font-medium">Expiration</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/AA"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:border-emerald-700 bg-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-stone-600 font-medium">Code CVC</label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="123"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:border-emerald-700 bg-white font-mono"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200/80 text-xs text-emerald-950 space-y-1.5">
                <p className="font-semibold text-emerald-900 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-700" />
                  <span>Paiement en espèces à la livraison (Recommandé au Maroc)</span>
                </p>
                <p className="text-emerald-800 leading-relaxed">
                  Vous réglerez le montant exact de <strong className="font-bold text-stone-900">{(total / 100).toFixed(2)} {t.currency}</strong> au livreur à la réception de votre colis.
                </p>
              </div>
            )}

            {/* Total and Submit */}
            <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
              <button
                onClick={() => setStep('details')}
                className="text-xs text-stone-500 hover:text-stone-900 cursor-pointer"
              >
                ← Modifier l'adresse
              </button>

              <button
                onClick={handleProcessPayment}
                className="px-6 py-3 bg-[#1F3A2B] text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-[#162a1f] flex items-center gap-2 cursor-pointer shadow-xs active:scale-98"
              >
                <Lock className="w-4 h-4" />
                <span>Confirmer {(total / 100).toFixed(2)} {t.currency}</span>
              </button>
            </div>
          </div>
        )}

        {/* Step: Processing */}
        {step === 'processing' && (
          <div className="p-12 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full border-3 border-emerald-200 border-t-emerald-800 animate-spin" />
            <h3 className="text-base font-semibold text-stone-900 font-serif">
              Validation de votre commande potagère en cours...
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Réservation immédiate du stock en pépinière et transmission du bon de livraison.
            </p>
          </div>
        )}

        {/* Step: Success */}
        {step === 'success' && completedOrder && (
          <div className="p-6 sm:p-8 text-center space-y-5 animate-in zoom-in-95">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-serif font-bold text-stone-900">
                Commande Validée avec Succès !
              </h3>
              <p className="text-xs text-stone-600">
                Numéro de commande : <span className="font-mono font-bold text-emerald-900">{completedOrder.orderNumber}</span>
              </p>
            </div>

            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-left text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Notification de commande transmise par email</span>
              </div>
              <p className="text-emerald-800">
                Un récapitulatif a été envoyé à : <span className="font-medium underline">{completedOrder.customerEmail}</span>.
              </p>
              <div className="pt-1 text-[11px] text-emerald-700 font-mono">
                Suivi d'expédition : {completedOrder.trackingNumber} (Amana Express)
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-3 px-4 bg-[#1F3A2B] text-white text-xs font-semibold rounded-lg hover:bg-[#162a1f] transition-colors cursor-pointer"
              >
                Suivre l'acheminement de mon colis
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
