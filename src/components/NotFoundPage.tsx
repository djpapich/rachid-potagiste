import React from 'react';
import { Compass } from 'lucide-react';
import { Language, PageView } from '../types/index.ts';
import { translations } from '../lib/translations.ts';
import { NavLink } from './NavLink.tsx';

interface NotFoundPageProps {
  lang: Language;
  onNavigate: (page: PageView) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ lang, onNavigate }) => {
  const t = translations[lang] || translations.fr;
  return (
    <div className="py-16 sm:py-24">
      <div className="max-w-xl mx-auto px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-[#EFECE3] dark:bg-[#1C2D21] flex items-center justify-center text-[#8C6D23] dark:text-[#E5B834] mx-auto mb-5">
          <Compass className="w-8 h-8" aria-hidden="true" />
        </div>
        <h1 className="font-title text-2xl sm:text-3xl font-black text-[#1F3D2B] dark:text-[#F4F1EA] mb-2">{t.notFoundTitle}</h1>
        <p className="text-sm text-[#1F3D2B]/75 dark:text-[#F4F1EA]/75 mb-6">{t.notFoundDesc}</p>
        <NavLink
          page={{ type: 'home' }}
          onNavigate={onNavigate}
          className="inline-flex items-center gap-2 bg-[#1F3D2B] dark:bg-[#E5B834] text-white dark:text-[#0D140F] px-6 py-3 rounded-xl font-bold text-sm shadow-md"
        >
          {t.backHome}
        </NavLink>
      </div>
    </div>
  );
};
