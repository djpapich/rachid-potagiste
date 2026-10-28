import React from 'react';
import { Language, AppTheme, PageView } from '../types/index.ts';
import { translations } from '../lib/translations.ts';
import { MapPin, MessageCircle, ExternalLink, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { getGeneralInquiryWhatsAppUrl } from '../lib/whatsapp.ts';
import { NavLink } from './NavLink.tsx';
import { VideoShowcase } from './VideoShowcase.tsx';

interface AboutPageProps {
  onNavigate: (page: PageView) => void;
  lang: Language;
  theme: AppTheme;
  whatsappLine: 'line1' | 'line2';
}

// Real product cut-outs (photos supplied by the shop), shown as a collage
const COLLAGE = [
  { src: '/assets/products-web/chou-vert-carotte-lacto-fermente-cutout.webp', alt: 'Chou vert et carotte lacto-fermenté' },
  { src: '/assets/products-web/huile-ortie-cutout.webp', alt: "Huile d'ortie" },
  { src: '/assets/products-web/savon-luffa-ortie-cutout.webp', alt: 'Savon luffa et ortie' },
  { src: '/assets/products-web/creme-ortie-cutout.webp', alt: "Crème d'ortie" },
];

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, lang, whatsappLine }) => {
  const t = translations[lang] || translations.fr;
  const Chevron = lang === 'ar' ? ChevronLeft : ChevronRight;

  const skills = [
    {
      title: 'La lacto-fermentation spontanée :',
      text: 'conservation vivante au sel marin pur non raffiné, sans vinaigre ni cuisson, pour enrichir naturellement le microbiote.',
    },
    {
      title: 'La macération botanique lente :',
      text: "extraction douce des principes actifs de l'ortie, du marrube blanc, du thym et du romarin dans l'huile d'amande douce et de jojoba.",
    },
    {
      title: 'La luffa végétale du jardin :',
      text: 'de véritables éponges de courges séchées découpées à la main et coulées dans nos savons surgras.',
    },
    {
      title: 'Les baumes sans eau ajoutée :',
      text: 'concentrés purs de karité brut et de cire d\'abeille dans des boîtes en métal de 50 g.',
    },
  ];

  return (
    <div className="py-6 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-xs text-[#8C6D23] dark:text-[#E5B834] mb-5">
          <NavLink page={{ type: 'home' }} onNavigate={onNavigate} className="hover:underline">
            {t.breadcrumbsHome}
          </NavLink>
          <Chevron className="w-3.5 h-3.5" aria-hidden="true" />
          <span aria-current="page" className="font-bold text-[#1F3D2B] dark:text-[#F4F1EA]">
            {t.navAbout}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center bg-[#FBFAF5] dark:bg-[#152219] p-5 sm:p-10 rounded-3xl border border-[#E5DFC9] dark:border-[#273D2C] shadow-xs mb-12">
          {/* Real products collage */}
          <div className="lg:col-span-5">
            <div className="grid grid-cols-2 gap-3 rounded-3xl bg-[#F4F1EA] dark:bg-[#101A13] border border-[#E5DFC9] dark:border-[#273D2C] p-4">
              {COLLAGE.map((item) => (
                <div key={item.src} className="aspect-square rounded-2xl bg-[#FBFAF5] dark:bg-[#152219] p-2">
                  <img src={item.src} alt={item.alt} width={640} height={640} loading="lazy" decoding="async" className="w-full h-full object-contain" />
                </div>
              ))}
            </div>
            <div className="mt-4 inline-block bg-[#1F3D2B] dark:bg-[#0D140F] text-[#FBFAF5] p-4 rounded-2xl border border-[#C9A227] shadow-lg">
              <p className="text-xs font-bold uppercase tracking-wider text-[#C9A227]">Rachid Potagiste</p>
              <p className="text-[11px] text-[#E5DFC9] mt-0.5 leading-snug">Technicien horticole & permaculteur</p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAE4D2] dark:bg-[#1C2D21] text-xs font-semibold text-[#8C6D23] dark:text-[#E5B834] mb-4">
              <MapPin className="w-3.5 h-3.5 text-[#3F6B2E] dark:text-[#528B3E]" aria-hidden="true" />
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
                Technicien spécialisé en production horticole et passionné de permaculture basé à Bouznika, Rachid transforme patiemment les récoltes de son jardin potager.
              </p>
              <p>Notre travail repose sur 4 savoir-faire :</p>
              <ul className="space-y-2">
                {skills.map((skill) => (
                  <li key={skill.title} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#3F6B2E] dark:text-[#528B3E] shrink-0 mt-0.5" aria-hidden="true" />
                    <span>
                      <strong>{skill.title}</strong> {skill.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href={getGeneralInquiryWhatsAppUrl(whatsappLine, lang)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#0F7A40] hover:bg-[#0C6937] text-white px-5 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-current" aria-hidden="true" />
                <span>Poser une question à Rachid</span>
              </a>

              <a
                href="https://www.facebook.com/61567836723896"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F3D2B] dark:text-[#F4F1EA] hover:text-[#3F6B2E] dark:hover:text-[#E5B834] p-2"
              >
                <span>Page officielle Facebook</span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        <VideoShowcase lang={lang} />
      </div>
    </div>
  );
};
