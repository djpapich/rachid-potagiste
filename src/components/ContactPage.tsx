import React from 'react';
import { Language, AppTheme, PageView } from '../types/index.ts';
import {
  MessageCircle,
  Phone,
  MapPin,
  Clock,
  Truck,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ShieldCheck
} from 'lucide-react';
import {
  WHATSAPP_LINE_1,
  WHATSAPP_LINE_1_DISPLAY,
  WHATSAPP_LINE_2,
  WHATSAPP_LINE_2_DISPLAY,
  getGeneralInquiryWhatsAppUrl
} from '../lib/whatsapp.ts';
import { translations } from '../lib/translations.ts';

interface ContactPageProps {
  onNavigate: (page: PageView) => void;
  lang: Language;
  theme: AppTheme;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate, lang, theme }) => {
  const t = translations[lang] || translations.fr;
  const isRtl = lang === 'ar';

  return (
    <div className="py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#8C6D23] dark:text-[#E5B834] mb-6">
          <button
            onClick={() => onNavigate({ type: 'home' })}
            className="hover:underline cursor-pointer"
          >
            {t.breadcrumbsHome}
          </button>
          {isRtl ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          <span className="font-bold text-[#1F3D2B] dark:text-[#F4F1EA]">
            {t.contactTitle}
          </span>
        </div>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="font-title text-2xl sm:text-3xl md:text-4xl font-black text-[#1F3D2B] dark:text-[#F4F1EA] mb-3">
            {t.contactTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[#1F3D2B]/80 dark:text-[#F4F1EA]/80 leading-relaxed">
            {t.contactSubtitle}
          </p>
        </div>

        {/* 2 WhatsApp Phone Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          
          {/* Card WhatsApp 1 */}
          <div className="bg-[#FBFAF5] dark:bg-[#152219] p-6 sm:p-8 rounded-3xl border-2 border-[#3F6B2E] dark:border-[#528B3E] shadow-sm flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 text-xs font-bold mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{t.phoneLine1}</span>
              </div>

              <h2 className="font-mono text-2xl sm:text-3xl font-black text-[#1F3D2B] dark:text-[#F4F1EA] mb-2">
                {WHATSAPP_LINE_1_DISPLAY}
              </h2>

              <p className="text-xs text-[#1F3D2B]/75 dark:text-[#F4F1EA]/75 leading-relaxed mb-6">
                Ligne directe pour vos commandes de légumes lacto-fermentés, huiles de macération 50 ml, savons luffa et crèmes de soin.
              </p>
            </div>

            <a
              href={getGeneralInquiryWhatsAppUrl('line1', lang)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white py-3.5 px-4 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>{t.callOrChat} ({WHATSAPP_LINE_1_DISPLAY})</span>
            </a>
          </div>

          {/* Card WhatsApp 2 */}
          <div className="bg-[#FBFAF5] dark:bg-[#152219] p-6 sm:p-8 rounded-3xl border-2 border-[#C9A227] dark:border-[#E5B834] shadow-sm flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-400 text-xs font-bold mb-4">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>{t.phoneLine2}</span>
              </div>

              <h2 className="font-mono text-2xl sm:text-3xl font-black text-[#1F3D2B] dark:text-[#F4F1EA] mb-2">
                {WHATSAPP_LINE_2_DISPLAY}
              </h2>

              <p className="text-xs text-[#1F3D2B]/75 dark:text-[#F4F1EA]/75 leading-relaxed mb-6">
                Deuxième ligne directe dédiée aux commandes expresses et aux conseils personnalisés sur les préparations du potager.
              </p>
            </div>

            <a
              href={getGeneralInquiryWhatsAppUrl('line2', lang)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white py-3.5 px-4 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>{t.callOrChat} ({WHATSAPP_LINE_2_DISPLAY})</span>
            </a>
          </div>

        </div>

        {/* Workshop & Service details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#FBFAF5] dark:bg-[#152219] p-6 sm:p-8 rounded-3xl border border-[#E5DFC9] dark:border-[#273D2C] shadow-xs mb-8">
          
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-2xl bg-[#F4F1EA] dark:bg-[#1C2D21] border border-[#E5DFC9] dark:border-[#273D2C] text-[#8C6D23] dark:text-[#E5B834] shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1F3D2B] dark:text-[#F4F1EA] mb-1">
                Atelier Artisanal
              </h3>
              <p className="text-xs text-[#1F3D2B]/75 dark:text-[#F4F1EA]/75">
                Bouznika & Mohammedia, Maroc.<br/>
                Expédition dans tout le Royaume.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-3 rounded-2xl bg-[#F4F1EA] dark:bg-[#1C2D21] border border-[#E5DFC9] dark:border-[#273D2C] text-[#8C6D23] dark:text-[#E5B834] shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1F3D2B] dark:text-[#F4F1EA] mb-1">
                Disponibilité 7j/7
              </h3>
              <p className="text-xs text-[#1F3D2B]/75 dark:text-[#F4F1EA]/75">
                Réponses WhatsApp rapides<br/>
                de 8h00 à 20h00, du lundi au dimanche.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-3 rounded-2xl bg-[#F4F1EA] dark:bg-[#1C2D21] border border-[#E5DFC9] dark:border-[#273D2C] text-[#8C6D23] dark:text-[#E5B834] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1F3D2B] dark:text-[#F4F1EA] mb-1">
                Cash on Delivery
              </h3>
              <p className="text-xs text-[#1F3D2B]/75 dark:text-[#F4F1EA]/75">
                Paiement en espèces à la livraison<br/>
                directement auprès du livreur.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
