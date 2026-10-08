import React, { useState } from 'react';
import { Search, Package, Clock, CheckCircle2, Truck, Mail, MapPin } from 'lucide-react';
import { Order, Language, OrderStatus } from '../types/index.ts';
import { translations } from '../lib/translations.ts';
import { storeService } from '../services/storeService.ts';
import { resolveImageUrl, handleImageError } from '../lib/imageHelper.ts';

interface OrderTrackingViewProps {
  currentLang: Language;
  onOpenEmailSim: () => void;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  currentLang,
  onOpenEmailSim,
}) => {
  const t = translations[currentLang];
  const allOrders = storeService.getOrders();
  const [selectedOrderNumber, setSelectedOrderNumber] = useState(
    allOrders.length > 0 ? allOrders[0].orderNumber : 'RP-2026-7840'
  );
  const [searchQuery, setSearchQuery] = useState('');

  const currentOrder = storeService.getOrderByNumber(selectedOrderNumber) || allOrders[0];

  const handleSimulateNextStep = (order: Order) => {
    const sequence: OrderStatus[] = ['confirmed', 'preparing', 'shipped', 'delivered'];
    const currentIndex = sequence.indexOf(order.status);
    if (currentIndex >= 0 && currentIndex < sequence.length - 1) {
      const nextStatus = sequence[currentIndex + 1];
      storeService.updateOrderStatus(order.orderNumber, nextStatus);
    }
  };

  const stepsConfig: { status: OrderStatus; label: string; icon: any }[] = [
    { status: 'confirmed', label: 'Paiement Validé', icon: CheckCircle2 },
    { status: 'preparing', label: 'Préparation Pépinière', icon: Package },
    { status: 'shipped', label: 'Expédié Amana Express', icon: Truck },
    { status: 'delivered', label: 'Colis Remis au Client', icon: CheckCircle2 },
  ];

  const getStepIndex = (status: OrderStatus) => {
    const map: Record<OrderStatus, number> = {
      confirmed: 0,
      preparing: 1,
      shipped: 2,
      delivered: 3,
      cancelled: -1,
    };
    return map[status] ?? 0;
  };

  const activeStepIdx = currentOrder ? getStepIndex(currentOrder.status) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title & Lookup */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            {t.clientSpace}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Suivi des expéditions de semences et plants de Rachid Le Potagiste partout au Maroc.
          </p>
        </div>

        {/* Search Input for order */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Numéro (ex: RP-2026-7840)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:border-emerald-700 bg-white w-48 sm:w-60 font-mono"
            />
          </div>
          <button
            onClick={() => {
              if (searchQuery.trim()) setSelectedOrderNumber(searchQuery.trim());
            }}
            className="px-3.5 py-2 bg-[#1F3A2B] text-white text-xs font-semibold rounded-lg hover:bg-[#162a1f] transition-colors cursor-pointer"
          >
            Rechercher
          </button>
        </div>
      </div>

      {/* Main Order View */}
      {currentOrder ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (8 cols): Progress tracker and timeline */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Live Status Bar Card */}
            <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-stone-500">
                    <span>COMMANDE :</span>
                    <span className="font-bold text-stone-900">{currentOrder.orderNumber}</span>
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    Passée le {new Date(currentOrder.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {t.orderStatus[currentOrder.status]}
                  </span>
                  
                  {currentOrder.status !== 'delivered' && (
                    <button
                      onClick={() => handleSimulateNextStep(currentOrder)}
                      className="px-2.5 py-1 text-[11px] font-medium text-emerald-900 bg-stone-100 hover:bg-stone-200 rounded border border-stone-200 transition-colors cursor-pointer"
                      title="Faire progresser le statut pour tester"
                    >
                      Étape suivante →
                    </button>
                  )}
                </div>
              </div>

              {/* Step Flow visualization */}
              <div className="pt-2">
                <div className="relative flex items-center justify-between">
                  <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-stone-200 -z-0" />
                  <div
                    className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-emerald-700 transition-all duration-500 -z-0"
                    style={{
                      width: `${(activeStepIdx / (stepsConfig.length - 1)) * 90}%`
                    }}
                  />

                  {stepsConfig.map((s, idx) => {
                    const isCompleted = idx <= activeStepIdx;
                    const isCurrent = idx === activeStepIdx;
                    const Icon = s.icon;

                    return (
                      <div key={s.status} className="flex flex-col items-center relative z-10">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                            isCompleted
                              ? 'bg-emerald-800 text-white ring-4 ring-emerald-50'
                              : 'bg-white border-2 border-stone-300 text-stone-400'
                          } ${isCurrent ? 'scale-110 shadow-sm' : ''}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`text-[11px] font-medium mt-2 text-center max-w-[85px] leading-tight ${
                          isCompleted ? 'text-stone-900 font-semibold' : 'text-stone-400'
                        }`}>
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Carrier details */}
              <div className="bg-[#FBFBF9] p-4 rounded-lg border border-stone-200/90 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-emerald-800" />
                  <div>
                    <span className="text-stone-500">Messagerie Express : </span>
                    <span className="font-semibold text-stone-900">Amana Express Maroc (Poste Maroc)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-emerald-900">
                  <span className="text-stone-500 font-sans">N° Amana :</span>
                  <span className="font-bold underline">{currentOrder.trackingNumber || 'AMANA-MA-784091X'}</span>
                </div>
              </div>

            </div>

            {/* Detailed Timeline Events */}
            <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-stone-600" />
                  <span>Journal des étapes d'acheminement & Notifications</span>
                </h3>
                
                <button
                  onClick={onOpenEmailSim}
                  className="text-xs text-emerald-800 hover:text-emerald-900 font-medium underline flex items-center gap-1 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Voir les emails envoyés</span>
                </button>
              </div>

              <div className="space-y-4">
                {(currentOrder.timeline || []).map((event, idx) => (
                  <div key={idx} className="flex items-start gap-3.5 relative">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-700 mt-1.5 shrink-0" />
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-xs font-semibold text-stone-900">
                          {event.title}
                        </h4>
                        <span className="text-[11px] text-stone-400 font-mono">
                          {new Date(event.createdAt).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        {event.description}
                      </p>
                      {event.emailNotificationSent === 1 && (
                        <div className="inline-flex items-center gap-1 text-[11px] text-emerald-800 font-medium bg-emerald-50 px-2 py-0.5 rounded">
                          <Mail className="w-3 h-3" />
                          <span>Notification email automatique expédiée</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column (4 cols): Order Items & Delivery Address */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Items Summary in Dirhams */}
            <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider pb-2 border-b border-stone-100">
                Articles commandés ({currentOrder.items.length})
              </h3>

              <div className="space-y-3">
                {currentOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <img
                      src={resolveImageUrl(item.imageUrl)}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover bg-stone-100 shrink-0"
                      referrerPolicy="no-referrer"
                      onError={handleImageError}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-stone-900 truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        Qté : {item.quantity} · {item.unit}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-stone-900 tabular-nums">
                      {((item.price * item.quantity) / 100).toFixed(2)} {t.currency}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-stone-100 text-xs space-y-1">
                <div className="flex justify-between text-stone-600">
                  <span>Total commande</span>
                  <span className="font-bold text-stone-900 tabular-nums">
                    {(currentOrder.totalAmount / 100).toFixed(2)} {t.currency}
                  </span>
                </div>
                <div className="flex justify-between text-stone-500 text-[11px]">
                  <span>Mode de paiement</span>
                  <span className="font-medium text-emerald-800">
                    {currentOrder.paymentMethod === 'stripe_card' ? 'Stripe Carte' : 'Paiement à la livraison (Cash)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Destination Address */}
            <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-3 text-xs">
              <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider pb-2 border-b border-stone-100 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-stone-700" />
                <span>Adresse de livraison au Maroc</span>
              </h3>

              <div className="space-y-1 text-stone-700">
                <p className="font-semibold text-stone-900">{currentOrder.customerName}</p>
                <p>{currentOrder.shippingAddress}</p>
                <p>{currentOrder.shippingPostalCode} {currentOrder.shippingCity}</p>
                <p className="text-stone-500">{currentOrder.customerPhone}</p>
                <p className="text-emerald-800 underline">{currentOrder.customerEmail}</p>
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="p-12 text-center text-stone-400">
          <Package className="w-12 h-12 mx-auto stroke-1 mb-2" />
          <p>Aucune commande trouvée pour cette référence.</p>
        </div>
      )}

    </div>
  );
};
