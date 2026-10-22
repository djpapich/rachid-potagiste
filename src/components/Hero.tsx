import React from 'react';
import { ArrowDown, MessageCircle, Sparkles, ShieldCheck, HeartHandshake, Leaf } from 'lucide-react';
import { getGeneralInquiryWhatsAppUrl, WHATSAPP_DISPLAY_PHONE } from '../lib/whatsapp.ts';

export const Hero: React.FC = () => {
  return (
    <section id="accueil" className="relative pt-8 pb-16 md:py-20 overflow-hidden bg-potager-grain">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* Kicker Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8E2D2] border border-[#D7CEBA] text-xs font-semibold text-[#1F3D2B] mb-5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#3F6B2E]"></span>
              <span>Atelier Artisanal · Bouznika, Maroc</span>
              <span className="text-[#8C6D23]">★ Fait main</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#1F3D2B] leading-[1.1] mb-4">
              L'Artisanat du Potager & Soins Naturels
            </h1>

            {/* Handwritten artisanal subtitle */}
            <p className="font-script text-2xl sm:text-3xl text-[#8C6D23] font-bold mb-4 tracking-wide transform -rotate-1">
              Des bocaux vivants aux baumes fondants, la nature marocaine mise en flacon
            </p>

            {/* Body Description */}
            <p className="text-base sm:text-lg text-[#1F3D2B]/80 max-w-2xl leading-relaxed mb-8">
              Découvrez les 4 collections faites maison par Rachid Potagiste : 
              <strong className="text-[#1F3D2B] font-semibold"> légumes lacto-fermentés</strong> pour votre microbiote, 
              <strong className="text-[#1F3D2B] font-semibold"> huiles de macération lente</strong> en flacon pompe 50 ml, 
              <strong className="text-[#1F3D2B] font-semibold"> savons exfoliants à la luffa végétale</strong> et 
              <strong className="text-[#1F3D2B] font-semibold"> crèmes de soin</strong> en boîte métal. 
              Tout est préparé avec des plantes de notre potager sans aucun produit chimique de synthèse.
            </p>

            {/* Main CTAs */}
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto mb-10">
              <a
                href="#lacto-fermentes"
                className="inline-flex items-center justify-center gap-2 bg-[#1F3D2B] hover:bg-[#162D20] text-[#FBFAF5] px-6 py-3.5 rounded-xl font-semibold text-sm sm:text-base shadow-md transition-all active:scale-95"
              >
                <span>Découvrir nos 18 créations</span>
                <ArrowDown className="w-4 h-4 text-[#C9A227]" />
              </a>

              <a
                href={getGeneralInquiryWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white px-6 py-3.5 rounded-xl font-semibold text-sm sm:text-base shadow-md transition-all active:scale-95 pulse-whatsapp"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>Commander sur WhatsApp</span>
              </a>
            </div>

            {/* Reassurance pills (unboxed text with separators per design rules) */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-3 text-xs sm:text-sm font-medium text-[#1F3D2B]/75 border-t border-[#E5DFC9] pt-4 w-full">
              <span className="flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-[#3F6B2E]" />
                100% Ingrédients Naturels
              </span>
              <span className="text-[#C9A227] font-bold">·</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#3F6B2E]" />
                Zéro Conservateur Chimique
              </span>
              <span className="text-[#C9A227] font-bold">·</span>
              <span className="flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-[#3F6B2E]" />
                Paiement à la livraison au Maroc
              </span>
            </div>

          </div>

          {/* Right Visual Showcase: 4 artisanal creations spotlight */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Artisanal Framing background */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#E6E0CE] to-[#F1EBDC] rounded-3xl transform rotate-1 scale-95 border border-[#DACFBA]"></div>

              {/* Main Card Spotlight */}
              <div className="relative bg-[#FBFAF5] rounded-3xl p-6 sm:p-8 shadow-xl border border-[#E5DFC9] overflow-hidden">
                
                {/* Gold seal top right */}
                <div className="absolute -top-3 -right-3 w-20 h-20 bg-[#C9A227] rounded-full flex items-center justify-center text-[#1F3D2B] font-title font-black text-[11px] uppercase tracking-wider text-center p-2 shadow-sm transform rotate-12">
                  <span>Fait Main<br/>Maroc</span>
                </div>

                <div className="text-xs uppercase tracking-widest text-[#8C6D23] font-bold mb-1">
                  Les 4 Familles du Terroir
                </div>
                <h3 className="font-title text-xl sm:text-2xl font-black text-[#1F3D2B] mb-4">
                  Fraîcheur & Authenticité
                </h3>

                {/* 2x2 Grid of real products */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-5">
                  
                  {/* Item 1: Bocal */}
                  <a href="#lacto-fermentes" className="group bg-[#F4F1EA] p-3 rounded-2xl border border-[#E5DFC9] text-center hover:border-[#1F3D2B] transition-all">
                    <div className="h-28 flex items-center justify-center overflow-hidden mb-2">
                      <img
                        src="/assets/products/photos-fond-transparent/chou-vert-carotte-lacto-fermente.png"
                        alt="Chou vert & carotte lacto-fermenté"
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
                        loading="eager"
                      />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#3F6B2E] block">Bocaux 380g</span>
                    <span className="text-xs font-semibold text-[#1F3D2B] block leading-tight">Lacto-fermentation</span>
                  </a>

                  {/* Item 2: Huile */}
                  <a href="#huiles" className="group bg-[#F4F1EA] p-3 rounded-2xl border border-[#E5DFC9] text-center hover:border-[#1F3D2B] transition-all">
                    <div className="h-28 flex items-center justify-center overflow-hidden mb-2">
                      <img
                        src="/assets/products/photos-fond-transparent/huile-ortie.png"
                        alt="Huile d'ortie 50ml"
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
                        loading="eager"
                      />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#3F6B2E] block">Flacon 50 ml</span>
                    <span className="text-xs font-semibold text-[#1F3D2B] block leading-tight">Huiles de macération</span>
                  </a>

                  {/* Item 3: Savon luffa */}
                  <a href="#savons" className="group bg-[#F4F1EA] p-3 rounded-2xl border border-[#E5DFC9] text-center hover:border-[#1F3D2B] transition-all">
                    <div className="h-28 flex items-center justify-center overflow-hidden mb-2">
                      <img
                        src="/assets/products/photos-fond-transparent/savon-luffa-ortie.png"
                        alt="Savon luffa & ortie"
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
                        loading="eager"
                      />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#3F6B2E] block">Luffa 110g</span>
                    <span className="text-xs font-semibold text-[#1F3D2B] block leading-tight">Savons gommants</span>
                  </a>

                  {/* Item 4: Crème */}
                  <a href="#cremes" className="group bg-[#F4F1EA] p-3 rounded-2xl border border-[#E5DFC9] text-center hover:border-[#1F3D2B] transition-all">
                    <div className="h-28 flex items-center justify-center overflow-hidden mb-2">
                      <img
                        src="/assets/products/photos-fond-transparent/creme-ortie.png"
                        alt="Crème d'ortie boîte métal 50g"
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
                        loading="eager"
                      />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#3F6B2E] block">Boîte métal 50g</span>
                    <span className="text-xs font-semibold text-[#1F3D2B] block leading-tight">Crèmes de soin</span>
                  </a>

                </div>

                <div className="bg-[#EAE4D2] p-3 rounded-xl border border-[#D8CEB7] flex items-center justify-between text-xs text-[#1F3D2B]">
                  <span className="font-medium">Directement de notre potager à votre table</span>
                  <a href="#lacto-fermentes" className="font-bold text-[#8C6D23] hover:underline">
                    Tout voir →
                  </a>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
