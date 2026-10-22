import React from 'react';
import { MapPin, Phone, MessageCircle, Heart, ShieldAlert, ExternalLink } from 'lucide-react';
import { WHATSAPP_DISPLAY_PHONE, getGeneralInquiryWhatsAppUrl } from '../lib/whatsapp.ts';

export const Footer: React.FC = () => {
  return (
    <footer id="contact" className="bg-[#14281C] text-[#FBFAF5] pt-14 pb-10 border-t border-[#C9A227]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Brand Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FBFAF5] border border-[#C9A227] flex items-center justify-center p-1">
                <svg viewBox="0 0 100 100" className="w-full h-full text-[#C9A227]">
                  <circle cx="50" cy="50" r="46" fill="#14281C" />
                  <path d="M50 15 C32 30 30 65 50 82 C70 65 68 30 50 15 Z" fill="#C9A227" />
                  <path d="M50 20 L50 78 M50 35 L38 45 M50 48 L36 58 M50 35 L62 45 M50 48 L64 58" stroke="#14281C" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>

              <div>
                <span className="font-title text-lg font-black tracking-wider text-[#FBFAF5] uppercase block">
                  Rachid Potagiste
                </span>
                <span className="text-[10px] tracking-widest font-semibold text-[#C9A227] uppercase block">
                  Fait main · Maroc
                </span>
              </div>
            </div>

            <p className="text-xs text-[#E5DFC9]/80 leading-relaxed max-w-sm">
              Artisanat du terroir marocain : légumes lacto-fermentés vivants en bocal doré, huiles de macération lente 50 ml, savons à la luffa végétale et crèmes de soin 100% pures. Cultivé et préparé avec respect à Bouznika.
            </p>

            <div className="flex items-center gap-3 text-xs text-[#E5DFC9]/80 pt-1">
              <MapPin className="w-4 h-4 text-[#C9A227] shrink-0" />
              <span>Bouznika & Mohammedia, Maroc · Expédition tout le Royaume</span>
            </div>
          </div>

          {/* Catalog Navigation */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-title text-sm font-bold uppercase tracking-wider text-[#C9A227]">
              Les 4 Familles
            </h4>
            <ul className="space-y-2 text-xs text-[#E5DFC9]">
              <li>
                <a href="#lacto-fermentes" className="hover:text-white transition-colors">
                  Légumes lacto-fermentés (Bocaux 380 g)
                </a>
              </li>
              <li>
                <a href="#huiles" className="hover:text-white transition-colors">
                  Huiles de macération (Flacons 50 ml)
                </a>
              </li>
              <li>
                <a href="#savons" className="hover:text-white transition-colors">
                  Savons artisanaux à la luffa (~110 g)
                </a>
              </li>
              <li>
                <a href="#cremes" className="hover:text-white transition-colors">
                  Crèmes de soin (Boîtes métal 50 g)
                </a>
              </li>
              <li>
                <a href="#pourquoi" className="hover:text-white transition-colors">
                  Notre charte qualité fait main
                </a>
              </li>
            </ul>
          </div>

          {/* Direct WhatsApp Ordering */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-title text-sm font-bold uppercase tracking-wider text-[#C9A227]">
              Commandes & Contact Direct
            </h4>
            
            <p className="text-xs text-[#E5DFC9]/80 leading-relaxed">
              Toutes nos commandes s'effectuent simplement par échange WhatsApp. Nous répondons 7j/7 de 8h à 20h.
            </p>

            <a
              href={getGeneralInquiryWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Écrire à Rachid : {WHATSAPP_DISPLAY_PHONE}</span>
            </a>

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

        {/* Health disclaimer banner in footer */}
        <div className="p-4 rounded-2xl bg-[#0E1C13] border border-[#3F6B2E]/40 text-xs text-[#E5DFC9]/75 mb-8 flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-[#C9A227]">Mentions légales et d'usage :</span>
            <p className="text-[11px] leading-relaxed">
              Les huiles de macération, savons et crèmes de soin sont exclusivement destinés à un <strong>usage externe</strong>. Nos préparations artisanales du potager sont issues de traditions ancestrales et ne constituent en aucun cas des médicaments ni des allégations thérapeutiques. En cas de doute médical ou dermatologique, consultez un médecin.
            </p>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="border-t border-[#1F3D2B] pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#E5DFC9]/60 gap-3">
          <p>© 2026 Rachid Potagiste. Tous droits réservés.</p>
          <p className="flex items-center gap-1">
            <span>Fait avec amour au Maroc</span>
            <Heart className="w-3 h-3 text-red-500 fill-current" />
            <span>· Bouznika</span>
          </p>
        </div>

      </div>
    </footer>
  );
};
