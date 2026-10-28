import React from 'react';
import { Language, AppTheme, PageView } from '../types/index.ts';
import { MapPin, Phone, MessageCircle, Heart, ShieldAlert, ExternalLink } from 'lucide-react';
import {
  WHATSAPP_LINE_1_DISPLAY,
  WHATSAPP_LINE_2_DISPLAY,
  getGeneralInquiryWhatsAppUrl
} from '../lib/whatsapp.ts';
import { translations } from '../lib/translations.ts';
import { NavLink } from './NavLink.tsx';

interface FooterProps {
  onNavigate: (page: PageView) => void;
  lang: Language;
  theme: AppTheme;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, lang, theme }) => {
  const t = translations[lang] || translations.fr;

  return (
    <footer className="bg-[#14281C] dark:bg-[#0A100C] text-[#FBFAF5] pt-14 pb-10 border-t border-[#C9A227]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-4">
            <NavLink
              page={{ type: 'home' }}
              onNavigate={onNavigate}
              className="flex items-center gap-3 text-left rtl:text-right"
            >
              <div data-fixed-colors className="w-10 h-10 rounded-full bg-[#FBFAF5] border border-[#C9A227] flex items-center justify-center p-1">
                <svg viewBox="0 0 100 100" className="w-full h-full text-[#C9A227]">
                  <circle cx="50" cy="50" r="46" fill="#14281C" />
                  <path d="M50 15 C32 30 30 65 50 82 C70 65 68 30 50 15 Z" fill="#C9A227" />
                  <path d="M50 20 L50 78 M50 35 L38 45 M50 48 L36 58 M50 35 L62 45 M50 48 L64 58" stroke="#14281C" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>

              <div>
                <span className="font-title text-lg font-black tracking-wider text-[#FBFAF5] uppercase block">
                  {t.siteTitle}
                </span>
                <span className="text-[10px] tracking-widest font-semibold text-[#C9A227] uppercase block">
                  {t.tagline}
                </span>
              </div>
            </NavLink>

            <p className="text-xs text-[#E5DFC9]/80 leading-relaxed max-w-sm">
              Artisanat du potager & préparations naturelles faites main au Maroc. Légumes lacto-fermentés vivants, huiles de macération 50 ml, savons à la luffa végétale et crèmes concentrées en boîte métal.
            </p>

            <div className="flex items-center gap-2 text-xs text-[#E5DFC9]/80 pt-1">
              <MapPin className="w-4 h-4 text-[#C9A227] shrink-0" />
              <span>Bouznika & Mohammedia, Maroc · Livraison partout au Royaume</span>
            </div>
          </div>

          {/* Catalog Categories */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-title text-sm font-bold uppercase tracking-wider text-[#C9A227]">
              {t.categories}
            </h4>
            <ul className="space-y-2 text-xs text-[#E5DFC9]">
              <li>
                <NavLink
                  page={{ type: 'category', family: 'lacto-fermentes' }}
                  onNavigate={onNavigate}
                  className="hover:text-white transition-colors"
                >
                  {t.navLacto} (70 - 80 DH)
                </NavLink>
              </li>
              <li>
                <NavLink
                  page={{ type: 'category', family: 'huiles' }}
                  onNavigate={onNavigate}
                  className="hover:text-white transition-colors"
                >
                  {t.navOils} (70 - 80 DH)
                </NavLink>
              </li>
              <li>
                <NavLink
                  page={{ type: 'category', family: 'savons' }}
                  onNavigate={onNavigate}
                  className="hover:text-white transition-colors"
                >
                  {t.navSoaps} (45 DH)
                </NavLink>
              </li>
              <li>
                <NavLink
                  page={{ type: 'category', family: 'cremes' }}
                  onNavigate={onNavigate}
                  className="hover:text-white transition-colors"
                >
                  {t.navCreams} (70 - 80 DH)
                </NavLink>
              </li>
              <li>
                <NavLink
                  page={{ type: 'about' }}
                  onNavigate={onNavigate}
                  className="hover:text-white transition-colors"
                >
                  {t.navAbout}
                </NavLink>
              </li>
            </ul>
          </div>

          {/* TWO WhatsApp Lines and Contact */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-title text-sm font-bold uppercase tracking-wider text-[#C9A227]">
              Commandes WhatsApp 7j/7
            </h4>
            
            <p className="text-xs text-[#E5DFC9]/80 leading-relaxed">
              Pour commander ou demander conseil, contactez-nous directement sur nos deux lignes :
            </p>

            <div className="space-y-2 pt-1">
              <a
                href={getGeneralInquiryWhatsAppUrl('line1', lang)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#0F7A40] hover:bg-[#0C6937] text-white px-3.5 py-2 rounded-xl font-bold text-xs shadow-md transition-all w-full justify-center sm:justify-start"
              >
                <MessageCircle className="w-4 h-4 fill-current shrink-0" />
                <span>WhatsApp 1 : {WHATSAPP_LINE_1_DISPLAY}</span>
              </a>

              <a
                href={getGeneralInquiryWhatsAppUrl('line2', lang)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#0F7A40] hover:bg-[#0C6937] text-white px-3.5 py-2 rounded-xl font-bold text-xs shadow-md transition-all w-full justify-center sm:justify-start"
              >
                <MessageCircle className="w-4 h-4 fill-current shrink-0" />
                <span>WhatsApp 2 : {WHATSAPP_LINE_2_DISPLAY}</span>
              </a>
            </div>

            <div className="pt-2">
              <a
                href="https://www.facebook.com/61567836723896"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] text-[#C9A227] hover:underline"
              >
                <span>Page officielle Facebook : Rachid potagiste</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

        </div>

        {/* Legal Disclaimer */}
        <div className="p-4 rounded-2xl bg-[#0E1C13] dark:bg-[#080D09] border border-[#3F6B2E]/40 text-xs text-[#E5DFC9]/75 mb-8 flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-[#C9A227]">Avertissements d'usage :</span>
            <p className="text-[11px] leading-relaxed">
              Les huiles de macération, crèmes et savons artisanaux sont strictement réservés à un <strong>usage externe</strong>. Nos produits naturels ne se substituent pas à un avis ou diagnostic médical.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-[#1F3D2B] pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#E5DFC9]/60 gap-3">
          <p>© 2026 Rachid Potagiste. Tous droits réservés.</p>
          <p className="flex items-center gap-1">
            <span>Fait avec passion au Maroc</span>
            <Heart className="w-3 h-3 text-red-500 fill-current" />
            <span>· Bouznika</span>
          </p>
        </div>

      </div>
    </footer>
  );
};
