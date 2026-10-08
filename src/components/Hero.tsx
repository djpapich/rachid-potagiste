import React from 'react';
import { ArrowRight, Leaf, Shield, Award, Youtube } from 'lucide-react';
import { Language } from '../types/index.ts';
import { translations } from '../lib/translations.ts';
import { resolveImageUrl, handleImageError } from '../lib/imageHelper.ts';

interface HeroProps {
  currentLang: Language;
  onExplore: () => void;
  onViewBlog: () => void;
}

export const Hero: React.FC<HeroProps> = ({ currentLang, onExplore, onViewBlog }) => {
  const t = translations[currentLang];

  return (
    <section className="relative overflow-hidden bg-[#FBFBF9] border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Brand Headline & Credential */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">
              <Leaf className="w-4 h-4 text-emerald-700" />
              <span>{t.heroKicker}</span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className="text-stone-500">Maroc & Méditerranée</span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className="text-emerald-900 font-bold">{t.developedBy}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 leading-[1.15] text-balance">
              {t.heroTitle}
            </h1>

            <p className="text-base sm:text-lg text-stone-600 max-w-2xl font-normal leading-relaxed">
              {t.heroSubtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onExplore}
                className="px-6 py-3.5 bg-[#1F3A2B] text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-[#162a1f] transition-all shadow-sm flex items-center gap-2 group cursor-pointer active:scale-98"
              >
                <span>{t.discoverCatalog}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href="https://www.youtube.com/@Rachid_Le_Potagiste"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 bg-red-600 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Youtube className="w-4 h-4" />
                <span>Voir les Tutos YouTube</span>
              </a>

              <button
                onClick={onViewBlog}
                className="px-4 py-3.5 bg-stone-100 text-stone-800 text-xs sm:text-sm font-medium rounded-lg hover:bg-stone-200 transition-colors border border-stone-200 cursor-pointer"
              >
                {t.viewBlog}
              </button>
            </div>

            {/* Unboxed Trust Credentials (No pills) */}
            <div className="pt-6 border-t border-stone-200/80 flex flex-wrap items-center gap-5 text-xs text-stone-600">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-800" />
                <span>Paiement en Dirhams (DH) ou Cash</span>
              </div>
              <span aria-hidden="true" className="text-stone-300">/</span>
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-800" />
                <span>Semences 100% Reproductibles</span>
              </div>
              <span aria-hidden="true" className="text-stone-300">/</span>
              <div className="flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-emerald-800" />
                <span>Lombricompost Vivant Artisanal</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Asset (Rachid Portrait & Harvest) */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-stone-200/90 aspect-square group">
              <img
                src={resolveImageUrl('/images/rachid_portrait_potagiste_1791482658073.jpg')}
                alt="Rachid Le Potagiste avec sa récolte de légumes bio"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 ease-out"
                referrerPolicy="no-referrer"
                onError={handleImageError}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent flex flex-col justify-end p-5 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold tracking-wider uppercase text-emerald-300">
                    Rachid Le Potagiste · Maître Jardinier
                  </span>
                  <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 font-semibold">
                    <Youtube className="w-3 h-3" />
                    <span>59K+</span>
                  </span>
                </div>
                <p className="text-sm font-serif font-medium text-stone-100">
                  « Pour que chaque foyer au Maroc puisse récolter ses propres légumes sains et savoureux. »
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
