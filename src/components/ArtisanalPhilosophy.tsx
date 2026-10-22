import React from 'react';
import { Sparkles, SunMedium, ShieldAlert, Heart, Sprout } from 'lucide-react';

export const ArtisanalPhilosophy: React.FC = () => {
  const pillars = [
    {
      title: 'Lacto-Fermentation Vivante',
      subtitle: 'Alimentation Vivante',
      description: 'Nos légumes ne sont ni cuits, ni pasteurisés, ni trempés dans du vinaigre industriel. Ils fermentent spontanément au sel marin pur, développant des millions de bactéries probiotiques indispensables à la digestion.',
      badge: 'Zéro vinaigre'
    },
    {
      title: 'Macération Solaire Lente',
      subtitle: 'Soin des Plantes',
      description: 'Chaque plante cueillie (thym, ortie, marrube blanc, lavande, romarin) repose plusieurs semaines sous le soleil marocain dans une base noble d\'huile d\'amande douce et de jojoba. Aucun solvant, aucune chimie.',
      badge: 'Sans solvant'
    },
    {
      title: 'Luffa Végétale du Potager',
      subtitle: 'Exfoliation Pure',
      description: 'Nos éponges de luffa proviennent de nos propres courges grimpantes. Séchées puis découpées à la main, elles sont coulées dans un savon artisanal surgras sans microplastiques polluants.',
      badge: '100% végétal'
    },
    {
      title: 'Crèmes Sans Eau Ajoutée',
      subtitle: '100% Principes Actifs',
      description: 'Contrairement aux crèmes industrielles coupées à 80% d\'eau, nos baumes en boîte métallique sont concentrés en karité brut, macérats et cires protectrices. Une infime noisette suffit.',
      badge: 'Boîte métal 50g'
    }
  ];

  return (
    <section id="pourquoi" className="py-16 sm:py-20 bg-[#FBFAF5] border-b border-[#E5DFC9] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAE4D2] text-xs font-semibold text-[#8C6D23] mb-3">
            <Sprout className="w-3.5 h-3.5 text-[#3F6B2E]" />
            <span>La Charte du Potager</span>
          </div>

          <h2 className="font-title text-2xl sm:text-3xl md:text-4xl font-black text-[#1F3D2B] mb-3">
            Pourquoi Choisir Nos Préparations Faites Main ?
          </h2>

          <p className="font-script text-xl sm:text-2xl text-[#8C6D23] font-bold italic mb-2">
            « Nous fabriquons ce que nous offrons à nos propres enfants »
          </p>
          <p className="text-xs sm:text-sm text-[#1F3D2B]/75">
            Une approche respectueuse des rythmes de la nature, de la terre marocaine et de votre bien-être.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, i) => (
            <div
              key={i}
              className="bg-[#F4F1EA] rounded-2xl p-6 border border-[#E5DFC9] hover:border-[#3F6B2E]/60 transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-[#8C6D23] bg-[#EAE4D2] px-2 py-0.5 rounded-md">
                    0{i + 1}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#3F6B2E]">
                    {pillar.badge}
                  </span>
                </div>

                <h3 className="font-title text-lg font-bold text-[#1F3D2B] mb-1">
                  {pillar.title}
                </h3>

                <p className="text-[11px] font-bold uppercase tracking-wider text-[#8C6D23] mb-3">
                  {pillar.subtitle}
                </p>

                <p className="text-xs text-[#1F3D2B]/80 leading-relaxed">
                  {pillar.description}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-[#E5DFC9] text-[11px] font-semibold text-[#3F6B2E] flex items-center gap-1">
                <span>✓ Conforme à nos principes</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
