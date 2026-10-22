import React from 'react';
import { PromoConfig } from '../types/index.ts';
import { Sparkles, MessageCircle, Check, Gift } from 'lucide-react';
import { getPackDecouverteWhatsAppUrl } from '../lib/whatsapp.ts';

interface PackDecouverteProps {
  promo: PromoConfig | null;
}

export const PackDecouverte: React.FC<PackDecouverteProps> = ({ promo }) => {
  const pack = promo?.packDecouverte || {
    titre: 'Pack Découverte Potager & Soins',
    description: '1 Légume lacto-fermenté + 1 Huile de macération 50 ml + 1 Savon luffa + 1 Crème de soin 50 g',
    prixNormal: 240,
    prixPromo: 210,
    economie: "30 DH d'économie"
  };

  const packWhatsAppUrl = getPackDecouverteWhatsAppUrl(pack.titre, pack.prixPromo);

  return (
    <section className="py-12 bg-[#EFECE3] border-y border-[#E5DFC9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-[#1F3D2B] rounded-3xl p-6 sm:p-10 text-[#FBFAF5] shadow-xl relative overflow-hidden border border-[#C9A227]/30">
          
          {/* Subtle background ornamentation */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-[#C9A227]/10 pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Left text */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A227] text-[#1F3D2B] text-xs font-bold uppercase tracking-wider mb-4">
                <Gift className="w-3.5 h-3.5" />
                <span>Offre Privilège Terroir</span>
              </div>

              <h2 className="font-title text-2xl sm:text-3xl md:text-4xl font-black text-[#FBFAF5] mb-3">
                {pack.titre}
              </h2>

              <p className="font-script text-xl sm:text-2xl text-[#C9A227] mb-4">
                L'essentiel de nos 4 savoir-faire réunis dans un coffret sur-mesure
              </p>

              <p className="text-sm sm:text-base text-[#E5DFC9] mb-6 leading-relaxed">
                Composez vous-même votre rituel complet du potager : choisissez votre bocal de légumes vivants, votre huile de macération végétale 50 ml, votre savon exfoliant à la luffa et votre crème de soin en boîte métallique.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-xs sm:text-sm text-[#FBFAF5]">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#3F6B2E] text-white flex items-center justify-center font-bold text-xs">✓</span>
                  <span>1 Bocal lacto-fermenté au choix (380 g)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#3F6B2E] text-white flex items-center justify-center font-bold text-xs">✓</span>
                  <span>1 Huile de macération au choix (50 ml)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#3F6B2E] text-white flex items-center justify-center font-bold text-xs">✓</span>
                  <span>1 Savon artisanal à la luffa végétale</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#3F6B2E] text-white flex items-center justify-center font-bold text-xs">✓</span>
                  <span>1 Crème de soin au choix (50 g)</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <a
                  href={packWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#C9A227] hover:bg-[#B38F1E] text-[#1F3D2B] px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base shadow-lg transition-transform active:scale-95"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>Commander le Pack à {pack.prixPromo} DH</span>
                </a>
                <span className="text-xs text-[#E5DFC9]/80">
                  Paiement à la réception · Choix des parfums direct sur WhatsApp
                </span>
              </div>
            </div>

            {/* Right price block & visual preview */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center bg-[#14281C] p-6 sm:p-8 rounded-2xl border border-[#C9A227]/40 text-center">
              <span className="text-xs uppercase tracking-widest text-[#E5DFC9]/70 font-semibold mb-1">
                Tarif Exceptionnel
              </span>
              
              <div className="flex items-baseline justify-center gap-3 mb-2">
                <span className="text-3xl sm:text-4xl md:text-5xl font-black text-[#FBFAF5] font-title">
                  {pack.prixPromo} <span className="text-2xl text-[#C9A227]">DH</span>
                </span>
                <span className="text-lg line-through text-[#E5DFC9]/50">
                  {pack.prixNormal} DH
                </span>
              </div>

              <span className="inline-block bg-[#3F6B2E] text-[#FBFAF5] text-xs font-bold px-3 py-1 rounded-full mb-6">
                {pack.economie}
              </span>

              {/* 4 small product thumbnails */}
              <div className="flex items-center justify-center gap-2 py-3 px-4 bg-[#1F3D2B] rounded-xl border border-[#3F6B2E]/40 w-full mb-3">
                <img
                  src="/assets/products/photos-fond-transparent/chou-vert-lacto-fermente.png"
                  alt="Bocal"
                  className="h-12 w-12 object-contain"
                />
                <span className="text-[#C9A227] font-bold">+</span>
                <img
                  src="/assets/products/photos-fond-transparent/huile-thym.png"
                  alt="Huile"
                  className="h-12 w-12 object-contain"
                />
                <span className="text-[#C9A227] font-bold">+</span>
                <img
                  src="/assets/products/photos-fond-transparent/savon-luffa-ortie.png"
                  alt="Savon"
                  className="h-12 w-12 object-contain"
                />
                <span className="text-[#C9A227] font-bold">+</span>
                <img
                  src="/assets/products/photos-fond-transparent/creme-marrube-blanc.png"
                  alt="Crème"
                  className="h-12 w-12 object-contain"
                />
              </div>

              <p className="text-[11px] text-[#E5DFC9]/70">
                Préparations artisanales fraîches faites main au Maroc.
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
