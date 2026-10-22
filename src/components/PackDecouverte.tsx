import React from 'react';
import { PromoConfig, Language, AppTheme } from '../types/index.ts';
import { Sparkles, MessageCircle, Gift } from 'lucide-react';
import { getPackDecouverteWhatsAppUrl } from '../lib/whatsapp.ts';
import { translations } from '../lib/translations.ts';

interface PackDecouverteProps {
  promo: PromoConfig | null;
  lang: Language;
  theme: AppTheme;
  whatsappLine: 'line1' | 'line2';
}

export const PackDecouverte: React.FC<PackDecouverteProps> = ({
  promo,
  lang,
  theme,
  whatsappLine,
}) => {
  const t = translations[lang] || translations.fr;
  const isRtl = lang === 'ar';

  const pack = promo?.packDecouverte || {
    titre: 'Pack Découverte Potager & Soins',
    description: '1 Bocal au choix + 1 Huile 50 ml + 1 Savon luffa + 1 Crème 50 g',
    prixNormal: 275,
    prixPromo: 240,
    economie: "35 DH d'économie"
  };

  const packTitle = lang === 'ar' ? 'باقة الاكتشاف الشاملة' : pack.titre;
  const packDesc = lang === 'ar' ? '1 قنينة خضر مخمرة + 1 زيت 50 مل + 1 صابون بالليفة + 1 مرهم 50 غ' : pack.description;

  const handleOrderPack = () => {
    const url = getPackDecouverteWhatsAppUrl(packTitle, pack.prixPromo);
    window.open(url, '_blank');
  };

  return (
    <section className="py-10 bg-[#EFECE3] dark:bg-[#111A13] border-y border-[#E5DFC9] dark:border-[#273D2C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-[#1F3D2B] dark:bg-[#152219] rounded-3xl p-6 sm:p-10 text-[#FBFAF5] shadow-xl relative overflow-hidden border border-[#C9A227]/30">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Left text */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A227] text-[#1F3D2B] text-xs font-bold uppercase tracking-wider mb-4">
                <Gift className="w-3.5 h-3.5" />
                <span>Offre Spéciale Découverte</span>
              </div>

              <h2 className="font-title text-2xl sm:text-3xl md:text-4xl font-black text-[#FBFAF5] mb-2">
                {packTitle}
              </h2>

              <p className="font-script text-xl sm:text-2xl text-[#C9A227] mb-3">
                L'essentiel de nos 4 savoir-faire réunis dans un coffret sur-mesure
              </p>

              <p className="text-xs sm:text-sm text-[#E5DFC9] mb-6 leading-relaxed">
                {packDesc}. Composez votre rituel : choisissez votre bocal de légumes vivants, votre huile de macération 50 ml, votre savon exfoliant à la luffa et votre crème de soin en boîte métallique.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={handleOrderPack}
                  className="inline-flex items-center justify-center gap-2 bg-[#C9A227] hover:bg-[#B38F1E] text-[#1F3D2B] px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base shadow-lg transition-transform active:scale-95 cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>Commander le Pack à {pack.prixPromo} {t.currency}</span>
                </button>
                <span className="text-xs text-[#E5DFC9]/80">
                  {t.cashOnDelivery}
                </span>
              </div>
            </div>

            {/* Right price block */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center bg-[#14281C] dark:bg-[#0D140F] p-6 sm:p-8 rounded-2xl border border-[#C9A227]/40 text-center">
              <span className="text-xs uppercase tracking-widest text-[#E5DFC9]/70 font-semibold mb-1">
                Tarif Privilège
              </span>
              
              <div className="flex items-baseline justify-center gap-3 mb-2">
                <span className="text-3xl sm:text-4xl md:text-5xl font-black text-[#FBFAF5] font-title">
                  {pack.prixPromo} <span className="text-2xl text-[#C9A227]">{t.currency}</span>
                </span>
                <span className="text-base line-through text-[#E5DFC9]/50">
                  {pack.prixNormal} {t.currency}
                </span>
              </div>

              {/* 4 real transparent product cutouts */}
              <div className="flex items-center justify-center gap-2 py-3 px-4 bg-[#1F3D2B] dark:bg-[#152219] rounded-xl border border-[#3F6B2E]/40 w-full mb-3">
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
                100% fait main à Bouznika avec les récoltes du potager.
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
