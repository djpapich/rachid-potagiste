import React, { useState } from 'react';
import { MessageCircle, Phone, X } from 'lucide-react';
import {
  WHATSAPP_LINE_1,
  WHATSAPP_LINE_1_DISPLAY,
  WHATSAPP_LINE_2,
  WHATSAPP_LINE_2_DISPLAY,
  getGeneralInquiryWhatsAppUrl
} from '../lib/whatsapp.ts';
import { Language } from '../types/index.ts';

interface FloatingWhatsAppProps {
  lang?: Language;
  /** Hidden on small screens where a sticky action bar already offers WhatsApp (product page). */
  hideOnMobile?: boolean;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ lang = 'fr', hideOnMobile = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside
      aria-label="Contact direct WhatsApp"
      className={`fixed bottom-5 right-5 rtl:right-auto rtl:left-5 z-50 flex-col items-end rtl:items-start gap-2 ${hideOnMobile ? 'hidden lg:flex' : 'flex'}`}
    >
      {/* Popover showing both WhatsApp options */}
      {isOpen && (
        <div className="bg-[#FBFAF5] dark:bg-[#152219] p-4 rounded-2xl shadow-2xl border border-[#E5DFC9] dark:border-[#273D2C] text-[#1F3D2B] dark:text-[#F4F1EA] max-w-xs w-72 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#E5DFC9] dark:border-[#273D2C]">
            <span className="text-xs font-bold text-[#1F3D2B] dark:text-[#F4F1EA] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Nos lignes WhatsApp 7j/7</span>
            </span>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Fermer"
              className="p-1 hover:bg-[#EAE4D2] dark:hover:bg-[#1C2D21] rounded-lg text-stone-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <a
              href={getGeneralInquiryWhatsAppUrl('line1', lang)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-xs font-bold text-[#1F3D2B] dark:text-[#F4F1EA] transition-colors"
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#25D366] fill-current" />
                <span>Ligne 1</span>
              </div>
              <span className="font-mono text-emerald-800 dark:text-emerald-400">{WHATSAPP_LINE_1_DISPLAY}</span>
            </a>

            <a
              href={getGeneralInquiryWhatsAppUrl('line2', lang)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-xs font-bold text-[#1F3D2B] dark:text-[#F4F1EA] transition-colors"
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#25D366] fill-current" />
                <span>Ligne 2</span>
              </div>
              <span className="font-mono text-emerald-800 dark:text-emerald-400">{WHATSAPP_LINE_2_DISPLAY}</span>
            </a>
          </div>

          <p className="text-[10px] text-[#1F3D2B]/60 dark:text-[#F4F1EA]/60 text-center mt-2.5">
            Paiement à la livraison partout au Maroc.
          </p>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20BA5A] text-white flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 pulse-whatsapp cursor-pointer"
        title="Contacter Rachid sur WhatsApp (07 86 73 16 66 / 07 21 04 58 01)"
        aria-label="Contacter Rachid Potagiste sur WhatsApp"
      >
        <MessageCircle className="w-7 h-7 fill-current" />
      </button>
    </aside>
  );
};
