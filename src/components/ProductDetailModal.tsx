import React, { useState } from 'react';
import { Product } from '../types/index.ts';
import { X, MessageCircle, Plus, Minus, Check, ShieldAlert, Sparkles, CheckCircle2, Info } from 'lucide-react';
import { getProductWhatsAppUrl } from '../lib/whatsapp.ts';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  isInCart?: boolean;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  isInCart = false,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [useTransparentView, setUseTransparentView] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleDirectWhatsApp = () => {
    window.open(getProductWhatsAppUrl(product, quantity), '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative bg-[#FBFAF5] rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#E5DFC9] p-5 sm:p-8 text-[#1F3D2B]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-[#1F3D2B]/70 hover:text-[#1F3D2B] bg-[#EAE4D2] hover:bg-[#E0D7BF] rounded-full transition-colors"
          aria-label="Fermer la fiche produit"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* Left Column: Big Product Image */}
          <div className="md:col-span-5 flex flex-col gap-3">
            <div className="relative aspect-square w-full bg-[#F4F1EA] rounded-2xl border border-[#E5DFC9] flex items-center justify-center p-4 overflow-hidden">
              <img
                src={useTransparentView && product.imagePng ? product.imagePng : product.image}
                alt={product.nom}
                className="w-full h-full object-contain drop-shadow-md transition-all duration-300"
              />

              {/* View switch button */}
              {product.imagePng && (
                <button
                  onClick={() => setUseTransparentView(!useTransparentView)}
                  className="absolute bottom-2.5 left-2.5 text-[10px] font-semibold bg-[#FBFAF5]/90 backdrop-blur-xs px-2.5 py-1 rounded-md border border-[#E5DFC9] text-[#1F3D2B] hover:bg-white"
                >
                  {useTransparentView ? 'Voir photo complète' : 'Voir détouré'}
                </button>
              )}

              {/* Circular label stamps */}
              <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 pointer-events-none">
                {product.badges.map((badge, idx) => (
                  <span
                    key={idx}
                    className={`w-14 h-14 rounded-full text-[9px] font-bold tracking-tight leading-tight flex items-center justify-center text-center p-1.5 uppercase shadow-xs ${
                      badge.type === 'green'
                        ? 'bg-[#3F6B2E] text-white'
                        : badge.type === 'darkgreen'
                        ? 'bg-[#1F3D2B] text-[#FBFAF5] border border-[#C9A227]/40'
                        : 'bg-[#1C201D] text-[#FBFAF5]'
                    }`}
                  >
                    {badge.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-center text-xs text-[#8C6D23] font-medium flex items-center justify-center gap-1.5">
              <span>🌾 Fait main par Rachid Potagiste</span>
              <span>·</span>
              <span>{product.contenance}</span>
            </div>
          </div>

          {/* Right Column: Details & Ordering */}
          <div className="md:col-span-7 flex flex-col">
            
            <div className="text-xs font-bold uppercase tracking-widest text-[#8C6D23] mb-1">
              {product.familleLabel}
            </div>

            <h2 className="font-title text-2xl sm:text-3xl font-black text-[#1F3D2B] leading-tight mb-1">
              {product.nom}
            </h2>

            <p className="font-script text-xl sm:text-2xl text-[#8C6D23] font-bold mb-3 italic">
              « {product.accroche} »
            </p>

            <div className="flex items-baseline gap-3 mb-4 pb-3 border-b border-[#E5DFC9]">
              <span className="text-2xl sm:text-3xl font-black text-[#1F3D2B] font-title">
                {product.prix} <span className="text-lg font-semibold text-[#8C6D23]">DH</span>
              </span>
              <span className="text-xs text-[#3F6B2E] font-semibold bg-[#EAE8DD] px-2.5 py-0.5 rounded-full">
                En stock artisanal
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-[#1F3D2B]/85 leading-relaxed mb-4">
              {product.description}
            </p>

            {/* Ingrédients */}
            <div className="mb-4 bg-[#F4F1EA] p-3 rounded-xl border border-[#E5DFC9]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F3D2B] mb-1 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#3F6B2E]" />
                <span>Ingrédients 100% naturels :</span>
              </h4>
              <p className="text-xs text-[#1F3D2B]/80 leading-normal">
                {product.ingredients}
              </p>
            </div>

            {/* Points Forts (Bullet points like the posters) */}
            <div className="mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F3D2B] mb-2">
                Les points forts du potager :
              </h4>
              <ul className="space-y-1.5 text-xs text-[#1F3D2B]/85">
                {product.pointsForts.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#3F6B2E] mt-1 shrink-0"></span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Conseils & Conservation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 text-xs">
              <div className="bg-[#FBFAF5] p-2.5 rounded-lg border border-[#E5DFC9]">
                <span className="font-bold text-[#1F3D2B] block mb-0.5">Conseils d'utilisation :</span>
                <span className="text-[#1F3D2B]/75 leading-tight">{product.conseils}</span>
              </div>
              <div className="bg-[#FBFAF5] p-2.5 rounded-lg border border-[#E5DFC9]">
                <span className="font-bold text-[#1F3D2B] block mb-0.5">Conservation :</span>
                <span className="text-[#1F3D2B]/75 leading-tight">{product.conservation}</span>
              </div>
            </div>

            {/* Mandatory Legal & Safety Disclaimers */}
            <div className="bg-[#F7F2E7] p-3 rounded-xl border border-[#DCD3BE] text-xs mb-6 text-[#1F3D2B]/90">
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-[#8C6D23] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-[#8C6D23]">Précautions & Mentions :</p>
                  <p className="text-[11px] leading-relaxed">{product.precautions}</p>
                </div>
              </div>
            </div>

            {/* Order Controls & Actions */}
            <div className="pt-4 border-t border-[#E5DFC9] flex flex-col gap-3">
              
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#1F3D2B]">Quantité :</span>
                  <div className="flex items-center border border-[#D7CEBA] rounded-xl bg-white overflow-hidden shadow-2xs">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 text-[#1F3D2B] hover:bg-[#F4F1EA] transition-colors"
                      aria-label="Diminuer la quantité"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold font-mono text-[#1F3D2B]">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 text-[#1F3D2B] hover:bg-[#F4F1EA] transition-colors"
                      aria-label="Augmenter la quantité"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-[#1F3D2B]/60 block">Total pour {quantity} :</span>
                  <span className="text-lg font-black text-[#1F3D2B]">
                    {product.prix * quantity} DH
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                {/* Direct WhatsApp Order */}
                <button
                  onClick={handleDirectWhatsApp}
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white py-3 px-4 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Commander sur WhatsApp</span>
                </button>

                {/* Add to "Ma sélection" */}
                <button
                  onClick={handleAdd}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm border transition-all cursor-pointer ${
                    justAdded
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-[#1F3D2B] text-[#FBFAF5] hover:bg-[#162D20] border-[#1F3D2B]'
                  }`}
                >
                  {justAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Ajouté à ma sélection !</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 text-[#C9A227]" />
                      <span>Ajouter à ma sélection</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-center text-[#1F3D2B]/65 mt-1">
                Paiement sécurisé en espèces à la livraison (Cash on Delivery) partout au Maroc.
              </p>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
