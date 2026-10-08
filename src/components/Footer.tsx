import React from 'react';
import { Leaf, ShieldCheck, Heart, Youtube } from 'lucide-react';
import { Language } from '../types/index.ts';
import { translations } from '../lib/translations.ts';

interface FooterProps {
  currentLang: Language;
  onNavigate: (view: 'shop' | 'blog' | 'tracking' | 'admin') => void;
}

export const Footer: React.FC<FooterProps> = ({ currentLang, onNavigate }) => {
  const t = translations[currentLang];

  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-serif text-base font-bold">
                RP
              </div>
              <div>
                <span className="text-xl font-serif font-bold text-white tracking-tight block">
                  RACHID POTAGISTE
                </span>
                <span className="text-[11px] text-emerald-400 font-sans block">
                  {t.developedBy}
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
              Boutique officielle de Rachid Le Potagiste : semences paysannes non-hybrides reproductibles, lombricompost artisanal vivant, plants bio prêts à planter et purins naturels expédiés dans toutes les villes du Maroc.
            </p>

            <div className="pt-2">
              <a
                href="https://www.youtube.com/@Rachid_Le_Potagiste"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-950/80 text-red-300 border border-red-800/60 hover:bg-red-900 transition-colors text-xs font-medium cursor-pointer"
              >
                <Youtube className="w-4 h-4 text-red-400" />
                <span>Rejoindre la communauté YouTube (+200k abonnés)</span>
              </a>
            </div>
          </div>

          {/* Nav: Semences & Produits */}
          <div className="space-y-3 text-xs">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Catalogue Potager
            </h4>
            <ul className="space-y-2 text-stone-400">
              <li><button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors cursor-pointer">Semences Paysannes Reproductibles</button></li>
              <li><button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors cursor-pointer">Vermicompost Vivant (10 kg)</button></li>
              <li><button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors cursor-pointer">Pack 12 Plants Bio Racines Nues</button></li>
              <li><button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors cursor-pointer">Extrait Fermenté d'Ortie & Prêle</button></li>
              <li><button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors cursor-pointer">Paniers Récolte du Jour (7 kg)</button></li>
            </ul>
          </div>

          {/* Nav: Guides & Service */}
          <div className="space-y-3 text-xs">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Conseils & Suivi
            </h4>
            <ul className="space-y-2 text-stone-400">
              <li><button onClick={() => onNavigate('tracking')} className="hover:text-white transition-colors cursor-pointer">Suivi de Colis Amana en Direct</button></li>
              <li><button onClick={() => onNavigate('blog')} className="hover:text-white transition-colors cursor-pointer">Tutos & Guides de Semis au Maroc</button></li>
              <li><button onClick={() => onNavigate('admin')} className="hover:text-white transition-colors cursor-pointer">Modération des Avis & Stocks</button></li>
              <li><a href="https://www.youtube.com/@Rachid_Le_Potagiste" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Vidéos YouTube de Rachid</a></li>
            </ul>
          </div>

          {/* Delivery & Community */}
          <div className="space-y-3 text-xs">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Livraison au Maroc
            </h4>
            <p className="text-stone-400 text-[11px] leading-relaxed">
              Expéditions sécurisées vers Casablanca, Rabat, Marrakech, Tanger, Fès, Agadir, Oujda et tout le Maroc sous 24-48h.
            </p>
            <div className="flex items-center gap-1.5 text-stone-400 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Paiement en Dirhams (DH) ou Cash</span>
            </div>
          </div>

        </div>

        {/* Bottom Sub-bar */}
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
          <div>
            &copy; 2026 RACHID POTAGISTE · Plateforme d'agriculture naturelle au Maroc.
          </div>
          <div className="text-emerald-400 font-medium">
            {t.developedBy}
          </div>
        </div>

      </div>
    </footer>
  );
};
