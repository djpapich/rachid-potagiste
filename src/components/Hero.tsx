import React from 'react';
import { ProductFamily, Language, AppTheme, PageView } from '../types/index.ts';
import { ArrowRight, ArrowLeft, MessageCircle, Leaf, ShieldCheck, HeartHandshake } from 'lucide-react';
import { getGeneralInquiryWhatsAppUrl, WHATSAPP_LINE_1_DISPLAY, WHATSAPP_LINE_2_DISPLAY } from '../lib/whatsapp.ts';
import { translations } from '../lib/translations.ts';

interface HeroProps {
  onNavigate: (page: PageView) => void;
  lang: Language;
  theme: AppTheme;
  whatsappLine: 'line1' | 'line2';
}

export const Hero: React.FC<HeroProps> = ({
  onNavigate,
  lang,
  theme,
  whatsappLine,
}) => {
  const t = translations[lang] || translations.fr;
  const isRtl = lang === 'ar';
  const displayPhone = whatsappLine === 'line2' ? WHATSAPP_LINE_2_DISPLAY : WHATSAPP_LINE_1_DISPLAY;

  const categoriesCards: {
    label: string;
    sub: string;
    family: ProductFamily;
    img: string;
    priceSnippet: string;
  }[] = [
    {
      label: lang === 'ar' ? 'خضر مخمرة حية' : 'Légumes lacto-fermentés',
      sub: lang === 'ar' ? 'أواني زجاجية' : 'Bocaux en verre',
      family: 'lacto-fermentes',
      img: '/assets/products/photos-fond-transparent/chou-vert-carotte-lacto-fermente.png',
      priceSnippet: '70 - 80 DH',
    },
    {
      label: lang === 'ar' ? 'زيوت التقطير البطيء' : 'Huiles de macération',
      sub: lang === 'ar' ? 'قوارير مضخة 50 مل' : 'Flacons pompe 50 ml',
      family: 'huiles',
      img: '/assets/products/photos-fond-transparent/huile-ortie.png',
      priceSnippet: '70 - 80 DH',
    },
    {
      label: lang === 'ar' ? 'صابون بليفة البستان' : 'Savons à la luffa',
      sub: lang === 'ar' ? 'تقشير طبيعي' : 'Exfoliation douce',
      family: 'savons',
      img: '/assets/products/photos-fond-transparent/savon-luffa-ortie.png',
      priceSnippet: '45 DH',
    },
    {
      label: lang === 'ar' ? 'مراهم وعناية طبيعية' : 'Crèmes & Baumes',
      sub: lang === 'ar' ? 'علب معدنية 50 غ' : 'Boîtes métal 50 g',
      family: 'cremes',
      img: '/assets/products/photos-fond-transparent/creme-ortie.png',
      priceSnippet: '70 - 80 DH',
    },
  ];

  return (
    <section className="relative pt-6 pb-12 sm:pt-10 sm:pb-16 overflow-hidden bg-potager-grain">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Main Grid: Left copy, Right 4 quick category cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-7 flex flex-col items-start text-left rtl:text-right rtl:items-start">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8E2D2] dark:bg-[#1C2D21] border border-[#D7CEBA] dark:border-[#273D2C] text-xs font-semibold text-[#1F3D2B] dark:text-[#F4F1EA] mb-4 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#3F6B2E] dark:bg-[#528B3E]"></span>
              <span>{t.heroBadge}</span>
              <span className="text-[#8C6D23] dark:text-[#E5B834]">★ 100% Terroir</span>
            </div>

            <h1 className="font-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#1F3D2B] dark:text-[#F4F1EA] leading-[1.1] mb-3">
              {t.heroTitle}
            </h1>

            <p className="font-script text-2xl sm:text-3xl text-[#8C6D23] dark:text-[#E5B834] font-bold mb-4 italic">
              « {t.heroSubtitle} »
            </p>

            <p className="text-sm sm:text-base text-[#1F3D2B]/80 dark:text-[#F4F1EA]/80 max-w-xl leading-relaxed mb-6">
              {lang === 'ar'
                ? 'مرحباً بكم في متجر رشيد صاحب البستان، خضر مخمرة حية بالملح البحري بدون مواد حافظة، زيوت نباتية مستخلصة ببطء 50 مل، صابون بلدي بليفة نباتية حقيقية، ومراهم طبيعية مركزة في علب معدنية.'
                : 'Découvrez les 4 collections faites maison par Rachid Potagiste : légumes lacto-fermentés vivants (70 & 80 DH), huiles végétales de macération 50 ml (70 & 80 DH), savons surgras à la luffa (45 DH) et baumes de soin 50 g (70 & 80 DH).'}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto mb-8">
              <button
                onClick={() => onNavigate({ type: 'category', family: 'lacto-fermentes' })}
                className="inline-flex items-center justify-center gap-2 bg-[#1F3D2B] dark:bg-[#E5B834] text-white dark:text-[#0D140F] hover:bg-[#162D20] px-6 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <span>{t.seeCatalog}</span>
                {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>

              <a
                href={getGeneralInquiryWhatsAppUrl(whatsappLine, lang)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 pulse-whatsapp"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>{t.orderOnWhatsApp}</span>
              </a>
            </div>

            {/* Reassurance line */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-3 text-xs font-medium text-[#1F3D2B]/75 dark:text-[#F4F1EA]/75 border-t border-[#E5DFC9] dark:border-[#273D2C] pt-3 w-full">
              <span className="flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-[#3F6B2E] dark:text-[#528B3E]" />
                100% Ingrédients Naturels
              </span>
              <span className="text-[#C9A227]">·</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#3F6B2E] dark:text-[#528B3E]" />
                Zéro Conservateur Chimique
              </span>
              <span className="text-[#C9A227]">·</span>
              <span className="flex items-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-[#3F6B2E] dark:text-[#528B3E]" />
                {t.cashOnDelivery}
              </span>
            </div>

          </div>

          {/* Right Showcase: 4 Real Category Cards (Jumia / Amazon Quick category gateway) */}
          <div className="lg:col-span-5">
            <div className="bg-[#FBFAF5] dark:bg-[#152219] rounded-3xl p-5 sm:p-6 shadow-xl border border-[#E5DFC9] dark:border-[#273D2C] relative">
              
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E5DFC9] dark:border-[#273D2C]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6D23] dark:text-[#E5B834] block">
                    {t.categories}
                  </span>
                  <h3 className="font-title text-base sm:text-lg font-black text-[#1F3D2B] dark:text-[#F4F1EA]">
                    Les 4 Ateliers du Terroir
                  </h3>
                </div>
                <span className="text-xs font-bold text-[#3F6B2E] dark:text-[#528B3E]">
                  Fait main
                </span>
              </div>

              {/* 2x2 Grid with real transparent product photos */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {categoriesCards.map((cat) => (
                  <button
                    key={cat.family}
                    onClick={() => onNavigate({ type: 'category', family: cat.family })}
                    className="group bg-[#F4F1EA] dark:bg-[#1C2D21] p-3 rounded-2xl border border-[#E5DFC9] dark:border-[#273D2C] hover:border-[#1F3D2B] dark:hover:border-[#E5B834] transition-all text-center cursor-pointer flex flex-col justify-between"
                  >
                    <div className="h-24 sm:h-28 flex items-center justify-center overflow-hidden mb-2">
                      <img
                        src={cat.img}
                        alt={cat.label}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-sm"
                        loading="eager"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8C6D23] dark:text-[#E5B834] font-semibold block">
                        {cat.sub}
                      </span>
                      <span className="text-xs font-bold text-[#1F3D2B] dark:text-[#F4F1EA] block leading-tight mt-0.5 line-clamp-1">
                        {cat.label}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-[#3F6B2E] dark:text-[#528B3E] block mt-1">
                        {cat.priceSnippet}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-[#E5DFC9] dark:border-[#273D2C] flex items-center justify-between text-xs text-[#1F3D2B]/80 dark:text-[#F4F1EA]/80">
                <span>Expédition rapide 24h-48h</span>
                <span className="font-bold text-[#8C6D23] dark:text-[#E5B834]">
                  {displayPhone}
                </span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
