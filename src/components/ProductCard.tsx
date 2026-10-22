import React, { useState } from 'react';
import { Product } from '../types/index.ts';
import { MessageCircle, Plus, Check, Eye } from 'lucide-react';
import { getProductWhatsAppUrl } from '../lib/whatsapp.ts';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  isInCart?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onAddToCart,
  isInCart = false,
}) => {
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(getProductWhatsAppUrl(product, 1), '_blank');
  };

  return (
    <article
      onClick={() => onSelect(product)}
      className="group bg-[#FBFAF5] rounded-2xl border border-[#E5DFC9] hover:border-[#1F3D2B]/50 transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden cursor-pointer relative"
    >
      {/* Top Image Container */}
      <div className="relative aspect-square w-full bg-[#F4F1EA] overflow-hidden flex items-center justify-center p-4">
        
        {/* Product photo */}
        <img
          src={product.image}
          alt={product.nom}
          className="w-full h-full object-contain object-center transform group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Circular artisanal stamps directly like the real Moroccan label */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.badges.map((badge, idx) => {
            const isGreen = badge.type === 'green';
            const isDarkGreen = badge.type === 'darkgreen';
            return (
              <span
                key={idx}
                className={`w-14 h-14 rounded-full text-[9px] font-bold tracking-tight leading-tight flex items-center justify-center text-center p-1.5 uppercase shadow-xs ${
                  isGreen
                    ? 'bg-[#3F6B2E] text-white'
                    : isDarkGreen
                    ? 'bg-[#1F3D2B] text-[#FBFAF5] border border-[#C9A227]/40'
                    : 'bg-[#1C201D] text-[#FBFAF5]'
                }`}
              >
                {badge.label}
              </span>
            );
          })}
        </div>

        {/* Quick view button on hover */}
        <div className="absolute inset-0 bg-[#1F3D2B]/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-[#FBFAF5] text-[#1F3D2B] text-xs font-semibold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5" />
            Voir la fiche
          </span>
        </div>

        {/* Contenance pill */}
        <div className="absolute bottom-2.5 right-2.5 bg-[#FBFAF5]/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-semibold text-[#1F3D2B] border border-[#E5DFC9] shadow-2xs">
          {product.contenance}
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category / Family text (unboxed quiet metadata) */}
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#8C6D23] mb-1">
            {product.familleLabel}
          </div>

          {/* Title */}
          <h3 className="font-title text-base sm:text-lg font-bold text-[#1F3D2B] group-hover:text-[#3F6B2E] transition-colors leading-snug line-clamp-2">
            {product.nom}
          </h3>

          {/* Handwritten Artisanal Catchphrase */}
          <p className="font-script text-base sm:text-lg text-[#8C6D23] font-semibold italic mt-1 line-clamp-1">
            « {product.accroche} »
          </p>

          {/* Ingredients snippet */}
          <p className="text-xs text-[#1F3D2B]/70 mt-2 line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* Price & Action Buttons */}
        <div className="pt-4 mt-3 border-t border-[#E5DFC9]/70 flex flex-col gap-2.5">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-lg sm:text-xl font-black text-[#1F3D2B] font-title">
                {product.prix} <span className="text-sm font-semibold text-[#8C6D23]">DH</span>
              </span>
              <span className="text-[11px] text-[#1F3D2B]/60 block">Paiement à la livraison</span>
            </div>

            {/* "Ajouter à ma sélection" quick button */}
            <button
              onClick={handleAdd}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                justAdded
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : isInCart
                  ? 'bg-[#EAE4D2] text-[#1F3D2B] border-[#D7CEBA] hover:bg-[#E0D7BF]'
                  : 'bg-[#FBFAF5] text-[#1F3D2B] border-[#D7CEBA] hover:bg-[#1F3D2B] hover:text-[#FBFAF5] hover:border-[#1F3D2B]'
              }`}
              title="Ajouter à ma sélection"
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Ajouté</span>
                </>
              ) : isInCart ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Sélectionné</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>Sélectionner</span>
                </>
              )}
            </button>
          </div>

          {/* Direct WhatsApp CTA Button */}
          <button
            onClick={handleWhatsApp}
            className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white py-2 px-3 rounded-xl font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Commander sur WhatsApp</span>
          </button>
        </div>
      </div>
    </article>
  );
};
