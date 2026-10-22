import React from 'react';
import { Award, Heart, MessageCircle, ExternalLink, MapPin, CheckCircle2 } from 'lucide-react';
import { getGeneralInquiryWhatsAppUrl, WHATSAPP_DISPLAY_PHONE } from '../lib/whatsapp.ts';

export const AboutRachid: React.FC = () => {
  return (
    <section id="a-propos" className="py-16 sm:py-20 bg-[#F4F1EA] border-b border-[#E5DFC9] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Image & credentials */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm">
              <div className="aspect-4/5 rounded-3xl overflow-hidden shadow-xl border-4 border-[#FBFAF5]">
                <img
                  src="/images/rachid_portrait_potagiste_1791482658073.jpg"
                  alt="Rachid Potagiste dans son potager"
                  className="w-full h-full object-cover object-center"
                />
              </div>

              {/* Gold seal overlay */}
              <div className="absolute -bottom-4 -right-4 bg-[#1F3D2B] text-[#FBFAF5] p-4 rounded-2xl border border-[#C9A227] shadow-lg max-w-[200px]">
                <p className="text-xs font-bold uppercase tracking-wider text-[#C9A227]">
                  Rachid Potagiste
                </p>
                <p className="text-[11px] text-[#E5DFC9] mt-0.5 leading-snug">
                  Technicien horticole & permaculteur au Maroc
                </p>
              </div>
            </div>
          </div>

          {/* Biography & Mission */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAE4D2] text-xs font-semibold text-[#8C6D23] mb-4">
              <MapPin className="w-3.5 h-3.5 text-[#3F6B2E]" />
              <span>Bouznika & Terroir Marocain</span>
            </div>

            <h2 className="font-title text-2xl sm:text-3xl md:text-4xl font-black text-[#1F3D2B] mb-2">
              L'Artisan Derrière le Potager
            </h2>

            <p className="font-script text-xl sm:text-2xl text-[#8C6D23] font-bold italic mb-4">
              « Remettre les plantes de notre pays au centre de nos foyers »
            </p>

            <div className="space-y-3.5 text-xs sm:text-sm text-[#1F3D2B]/85 leading-relaxed mb-6">
              <p>
                Bonjour, je suis <strong className="text-[#1F3D2B] font-semibold">Rachid Potagiste</strong>, technicien spécialisé en production horticole et passionné de permaculture basé à Bouznika, entre Casablanca et Rabat.
              </p>
              <p>
                Mon travail au quotidien consiste à cultiver des légumes sans chimie, à récolter des plantes aromatiques à la main et à les transformer selon des méthodes artisanales patientes :
                <span className="font-semibold text-[#1F3D2B]"> la lacto-fermentation spontanée</span> pour enrichir notre alimentation quotidienne en micro-organismes vivants, et 
                <span className="font-semibold text-[#1F3D2B]"> les macérats botaniques</span> (ortie, marrube blanc, thym, lavande) pour prendre soin de nos corps avec douceur.
              </p>
              <p>
                Chaque bocal, chaque flacon et chaque savon est conditionné avec soin, de façon artisanale et en séries limitées. Je réponds moi-même à toutes vos questions sur WhatsApp pour vous conseiller sur le meilleur usage de ces trésors végétaux.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-xs">
              <div className="flex items-center gap-2 p-3 bg-[#FBFAF5] rounded-xl border border-[#E5DFC9]">
                <CheckCircle2 className="w-4 h-4 text-[#3F6B2E] shrink-0" />
                <span>Conseils personnalisés directs sur WhatsApp</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-[#FBFAF5] rounded-xl border border-[#E5DFC9]">
                <CheckCircle2 className="w-4 h-4 text-[#3F6B2E] shrink-0" />
                <span>Expédition soignée partout au Maroc</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href={getGeneralInquiryWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white px-5 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Échanger directement avec Rachid ({WHATSAPP_DISPLAY_PHONE})</span>
              </a>

              <a
                href="https://www.facebook.com/61567836723896"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F3D2B] hover:text-[#3F6B2E] p-2"
              >
                <span>Suivre les vidéos sur Facebook</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
