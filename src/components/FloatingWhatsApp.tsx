import React from 'react';
import { MessageCircle } from 'lucide-react';
import { getGeneralInquiryWhatsAppUrl, WHATSAPP_DISPLAY_PHONE } from '../lib/whatsapp.ts';

export const FloatingWhatsApp: React.FC = () => {
  return (
    <aside
      aria-label="Contact direct WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 group"
    >
      <span className="hidden sm:inline-block bg-[#FBFAF5] text-[#1F3D2B] text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg border border-[#E5DFC9] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        Commander sur WhatsApp
      </span>

      <a
        href={getGeneralInquiryWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20BA5A] text-white flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 pulse-whatsapp"
        title={`Contacter Rachid sur WhatsApp : ${WHATSAPP_DISPLAY_PHONE}`}
        aria-label="Contacter Rachid Potagiste sur WhatsApp"
      >
        <MessageCircle className="w-7 h-7 fill-current" />
      </a>
    </aside>
  );
};
