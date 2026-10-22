import React, { useState, useEffect } from 'react';
import { PromoConfig, Language, AppTheme } from '../types/index.ts';
import { Copy, Check, Clock } from 'lucide-react';
import { translations } from '../lib/translations.ts';

interface PromoBannerProps {
  promo: PromoConfig | null;
  lang: Language;
  theme: AppTheme;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ promo, lang, theme }) => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 4,
    hours: 18,
    minutes: 32,
    seconds: 45
  });

  const t = translations[lang] || translations.fr;

  useEffect(() => {
    if (!promo?.dateFin) return;
    const target = new Date(promo.dateFin).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [promo]);

  if (!promo || !promo.active) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(promo.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const message = lang === 'ar'
    ? 'عرض الافتتاح الطبيعي : خصم 10% على طلبيتك باستعمال الكود'
    : lang === 'en'
    ? 'Artisan launch offer: -10% on your order with promo code'
    : promo.message;

  return (
    <div className="bg-[#14281C] dark:bg-[#080E0A] text-[#FBFAF5] py-2 px-3 text-xs sm:text-sm border-b border-[#C9A227]/40 relative z-30">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#C9A227] text-[#1F3D2B] font-bold text-[10px]">
            %
          </span>
          <span className="font-medium text-[#FBFAF5]">
            {message}{' '}
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 font-mono font-bold text-[#C9A227] bg-[#0E1C13] px-2 py-0.5 rounded border border-[#C9A227]/40 hover:bg-[#C9A227] hover:text-[#1F3D2B] transition-colors cursor-pointer ml-1 rtl:mr-1 rtl:ml-0"
              title="Copier le code promo"
            >
              <span>{promo.code}</span>
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 opacity-70" />}
            </button>
          </span>
          <span className="hidden md:inline text-[#E5DFC9]/70">· {t.cashOnDelivery}</span>
        </div>

        {/* Countdown */}
        <div className="flex items-center gap-2 text-[11px] sm:text-xs text-[#E5DFC9]">
          <span className="flex items-center gap-1 text-[#C9A227]">
            <Clock className="w-3 h-3" />
            <span className="hidden sm:inline">Offre limitée :</span>
          </span>
          <div className="flex items-center gap-1 font-mono font-semibold">
            <span className="bg-[#0E1C13] px-1.5 py-0.5 rounded border border-[#3F6B2E]/50">{timeLeft.days}j</span>
            <span>:</span>
            <span className="bg-[#0E1C13] px-1.5 py-0.5 rounded border border-[#3F6B2E]/50">
              {String(timeLeft.hours).padStart(2, '0')}h
            </span>
            <span>:</span>
            <span className="bg-[#0E1C13] px-1.5 py-0.5 rounded border border-[#3F6B2E]/50">
              {String(timeLeft.minutes).padStart(2, '0')}m
            </span>
            <span>:</span>
            <span className="bg-[#0E1C13] px-1.5 py-0.5 rounded border border-[#3F6B2E]/50 text-[#C9A227]">
              {String(timeLeft.seconds).padStart(2, '0')}s
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
