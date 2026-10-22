import React from 'react';
import { Language, AppTheme, PageView } from '../types/index.ts';
import { translations } from '../lib/translations.ts';
import {
  MapPin,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sprout,
  ShieldCheck
} from 'lucide-react';
import { getGeneralInquiryWhatsAppUrl, WHATSAPP_LINE_1_DISPLAY } from '../lib/whatsapp.ts';

interface AboutPageProps {
  onNavigate: (page: PageView) => void;
  lang: Language;
  theme: AppTheme;
  whatsappLine: 'line1' | 'line2';
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onNavigate,
  lang,
  theme,
  whatsappLine,
}) => {
  const t = translations[lang] || translations.fr;
  const isRtl = lang === 'ar';

  return (
    <div className="py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
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
            {t.navAbout}
          </span>
        </div>

        {/* Hero Section of About */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-[#FBFAF5] dark:bg-[#152219] p-6 sm:p-10 rounded-3xl border border-[#E5DFC9] dark:border-[#273D2C] shadow-xs mb-12">
          
          <div className="lg:col-span-5 relative">
            <div className="aspect-4/5 rounded-3xl overflow-hidden shadow-lg border-4 border-[#F4F1EA] dark:border-[#1C2D21]">
              <img
                src="/images/rachid_portrait_potagiste_1791482658073.jpg"
                alt="Rachid Potagiste"
                className="w-full h-full object-cover object-center"
              />
            </div>

            <div className="absolute -bottom-4 -right-4 bg-[#1F3D2B] dark:bg-[#0D140F] text-[#FBFAF5] p-4 rounded-2xl border border-[#C9A227] shadow-lg max-w-[200px]">
              <p className="text-xs font-bold uppercase tracking-wider text-[#C9A227]">
                Rachid Potagiste
              </p>
              <p className="text-[11px] text-[#E5DFC9] mt-0.5 leading-snug">
                Technicien horticole & permaculteur
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAE4D2] dark:bg-[#1C2D21] text-xs font-semibold text-[#8C6D23] dark:text-[#E5B834] mb-4">
              <MapPin className="w-3.5 h-3.5 text-[#3F6B2E] dark:text-[#528B3E]" />
              <span>Bouznika, Maroc · Terroir Vivant</span>
            </div>

            <h1 className="font-title text-2xl sm:text-3xl md:text-4xl font-black text-[#1F3D2B] dark:text-[#F4F1EA] mb-3">
              L'Artisanat du Potager au Service de Votre Foyer
            </h1>

            <p className="font-script text-xl sm:text-2xl text-[#8C6D23] dark:text-[#E5B834] font-bold italic mb-4">
              « Faire revivre la fermentation et les macérats purs du Maroc »
            </p>

            <div className="space-y-3.5 text-xs sm:text-sm text-[#1F3D2B]/85 dark:text-[#F4F1EA]/85 leading-relaxed mb-6">
              <p>
                Technicien spécialisé en production horticole et passionné de permaculture basé à Bouznika, Rachid transforme patiemment les récoltes de son jardin potager et des collines marocaines.
              </p>
              <p>
                Notre travail repose sur 4 savoir-faire ancestraux :
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#3F6B2E] dark:text-[#528B3E] shrink-0 mt-0.5" />
                  <span><strong>La lacto-fermentation spontanée :</strong> conservation vivante au sel marin pur non raffiné, sans vinaigre ni cuisson, pour enrichir naturellement le microbiote.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#3F6B2E] dark:text-[#528B3E] shrink-0 mt-0.5" />
                  <span><strong>La macération botanique lente :</strong> extraction douce des principes actifs de l'ortie, du marrube blanc, de la camomille et du thym dans l'huile d'amande douce et de jojoba.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#3F6B2E] dark:text-[#528B3E] shrink-0 mt-0.5" />
                  <span><strong>La luffa végétale du jardin :</strong> de véritables éponges de courges séchées découpées à la main et coulées dans nos savons surgras.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#3F6B2E] dark:text-[#528B3E] shrink-0 mt-0.5" />
                  <span><strong>Les baumes sans eau ajoutée :</strong> concentrés purs de karité brut et de cire d'abeille dans des boîtes en métal de 50 g.</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href={getGeneralInquiryWhatsAppUrl(whatsappLine, lang)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white px-5 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Poser une question à Rachid</span>
              </a>

              <a
                href="https://www.facebook.com/61567836723896"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F3D2B] dark:text-[#F4F1EA] hover:text-[#3F6B2E] dark:hover:text-[#E5B834] p-2"
              >
                <span>Page officielle Facebook</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
