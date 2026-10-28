import React, { useEffect, useState } from 'react';
import { Product, Language, AppTheme, PageView, ProductFamily } from '../types/index.ts';
import { ShoppingBag, Sun, Moon, MessageCircle } from 'lucide-react';
import {
  WHATSAPP_LINE_1_DISPLAY,
  WHATSAPP_LINE_2_DISPLAY,
  getGeneralInquiryWhatsAppUrl
} from '../lib/whatsapp.ts';
import { translations } from '../lib/translations.ts';
import { NavLink } from './NavLink.tsx';
import { SearchBox } from './SearchBox.tsx';

interface NavbarProps {
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
  cartItemCount: number;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  theme: AppTheme;
  onThemeToggle: () => void;
  whatsappLine: 'line1' | 'line2';
  onWhatsappLineChange: (line: 'line1' | 'line2') => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

const LANGS: { code: Language; label: string }[] = [
  { code: 'fr', label: 'FR' },
  { code: 'ar', label: 'عربي' },
  { code: 'en', label: 'EN' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  cartItemCount,
  lang,
  onLanguageChange,
  theme,
  onThemeToggle,
  whatsappLine,
  onWhatsappLineChange,
  products,
  onSelectProduct,
}) => {
  const [compact, setCompact] = useState(false);
  const t = translations[lang] || translations.fr;
  const currentDisplayPhone = whatsappLine === 'line2' ? WHATSAPP_LINE_2_DISPLAY : WHATSAPP_LINE_1_DISPLAY;

  // Fold the utility bar and the mobile search away once the visitor scrolls (hysteresis avoids flicker)
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setCompact((prev) => (prev ? y > 20 : y > 90));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navCategories: { label: string; family: ProductFamily }[] = [
    { label: t.navLacto, family: 'lacto-fermentes' },
    { label: t.navOils, family: 'huiles' },
    { label: t.navSoaps, family: 'savons' },
    { label: t.navCreams, family: 'cremes' },
  ];

  const stripLink = (active: boolean) =>
    `px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
      active
        ? 'bg-[#1F3D2B] text-white dark:bg-[#E5B834] dark:text-[#0D140F]'
        : 'text-[#1F3D2B] dark:text-[#F4F1EA] hover:bg-[#E2DDD0] dark:hover:bg-[#1C2D21]'
    }`;

  const collapse = (hidden: boolean) =>
    `grid transition-[grid-template-rows] duration-200 ${hidden ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'}`;

  return (
    <header className="sticky top-0 z-40 bg-[#FBFAF5] dark:bg-[#152219] border-b border-[#E5DFC9] dark:border-[#273D2C] shadow-xs transition-colors">
      {/* 1. Utility bar: WhatsApp line, language, theme (folds away on scroll) */}
      <div className={collapse(compact)}>
        <div className="overflow-hidden">
          <div className="bg-[#1F3D2B] dark:bg-[#0D140F] text-[#FBFAF5] text-xs py-1.5 px-3 sm:px-6 border-b border-[#C9A227]/30">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[#E5DFC9] text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true"></span>
                  <span>WhatsApp :</span>
                </span>
                <div className="flex items-center gap-1" role="group" aria-label={t.switchLine}>
                  {(['line1', 'line2'] as const).map((line) => {
                    const display = line === 'line1' ? WHATSAPP_LINE_1_DISPLAY : WHATSAPP_LINE_2_DISPLAY;
                    return (
                      <button
                        key={line}
                        type="button"
                        onClick={() => onWhatsappLineChange(line)}
                        aria-pressed={whatsappLine === line}
                        className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                          whatsappLine === line
                            ? 'bg-[#C9A227] text-[#1F3D2B] font-bold shadow-xs'
                            : 'bg-[#14281C] text-[#E5DFC9] hover:text-white'
                        }`}
                      >
                        {display}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px]">
                <span className="hidden md:inline text-[#E5DFC9]/80 font-medium">🇲🇦 {t.cashOnDelivery}</span>

                <div className="flex items-center bg-[#14281C] rounded-lg p-0.5 border border-[#3F6B2E]/50" role="group" aria-label="Langue / اللغة">
                  {LANGS.map(({ code, label }) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => onLanguageChange(code)}
                      aria-pressed={lang === code}
                      lang={code}
                      className={`px-2 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                        lang === code ? 'bg-[#C9A227] text-[#1F3D2B]' : 'text-[#E5DFC9] hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={onThemeToggle}
                  className="p-1.5 rounded-lg bg-[#14281C] hover:bg-[#203627] text-[#C9A227] transition-colors cursor-pointer"
                  title={theme === 'dark' ? t.themeLight : t.themeDark}
                  aria-label={theme === 'dark' ? t.themeLight : t.themeDark}
                >
                  {theme === 'dark' ? (
                    <Sun className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
                  ) : (
                    <Moon className="w-3.5 h-3.5 text-amber-200" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main bar: logo, search (desktop), WhatsApp, cart */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        <NavLink
          page={{ type: 'home' }}
          onNavigate={onNavigate}
          className="flex items-center gap-2.5 shrink-0"
          aria-label={`${t.siteTitle} - ${t.navHome}`}
        >
          <span className="w-10 h-10 rounded-full bg-[#FBFAF5] dark:bg-[#152219] border border-[#C9A227] flex items-center justify-center shadow-xs p-1">
            <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
              <circle cx="50" cy="50" r="46" fill="#1F3D2B" />
              <path d="M50 15 C32 30 30 65 50 82 C70 65 68 30 50 15 Z" fill="#C9A227" />
              <path d="M50 20 L50 78 M50 35 L38 45 M50 48 L36 58 M50 35 L62 45 M50 48 L64 58" stroke="#1F3D2B" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </span>
          <span className="flex flex-col">
            <span className="font-title text-base sm:text-lg font-black tracking-wide text-[#1F3D2B] dark:text-[#F4F1EA] uppercase leading-tight">
              {t.siteTitle}
            </span>
            <span className="hidden sm:block text-[10px] tracking-widest font-semibold text-[#8C6D23] dark:text-[#E5B834] uppercase">
              {t.tagline}
            </span>
          </span>
        </NavLink>

        <SearchBox
          products={products}
          lang={lang}
          onSelectProduct={onSelectProduct}
          className="hidden md:block flex-1 max-w-xl mx-2"
        />

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href={getGeneralInquiryWhatsAppUrl(whatsappLine, lang)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F3D2B] dark:text-[#F4F1EA] bg-[#EAE4D2] dark:bg-[#1C2D21] hover:bg-[#DFD6BF] dark:hover:bg-[#203627] p-2.5 sm:px-3 sm:py-2 rounded-xl transition-colors border border-[#D7CEBA] dark:border-[#273D2C]"
            aria-label={`WhatsApp ${currentDisplayPhone}`}
          >
            <MessageCircle className="w-4 h-4 text-emerald-600 fill-current" aria-hidden="true" />
            <span className="hidden lg:inline">{currentDisplayPhone}</span>
          </a>

          <NavLink
            page={{ type: 'cart' }}
            onNavigate={onNavigate}
            className="flex items-center gap-2 bg-[#1F3D2B] dark:bg-[#E5B834] text-[#FBFAF5] dark:text-[#0D140F] hover:bg-[#162D20] dark:hover:bg-[#D4A92B] px-3.5 py-2.5 sm:py-2 rounded-xl font-semibold text-xs sm:text-sm shadow-xs transition-all active:scale-95"
            aria-label={`${t.cart} (${cartItemCount})`}
          >
            <ShoppingBag className="w-4 h-4 text-[#C9A227] dark:text-[#0D140F]" aria-hidden="true" />
            <span className="hidden sm:inline">{t.cart}</span>
            <span
              key={cartItemCount}
              className={`min-w-5 h-5 px-1 rounded-full font-bold text-xs flex items-center justify-center toast-in ${
                cartItemCount > 0
                  ? 'bg-[#C9A227] dark:bg-[#0D140F] text-[#1F3D2B] dark:text-[#E5B834]'
                  : 'bg-transparent opacity-70'
              }`}
            >
              {cartItemCount}
            </span>
          </NavLink>
        </div>
      </div>

      {/* 2b. Mobile search (folds away on scroll) */}
      <div className={`md:hidden ${collapse(compact)}`}>
        <div className="overflow-hidden">
          <div className="px-4 pb-2.5">
            <SearchBox products={products} lang={lang} onSelectProduct={onSelectProduct} />
          </div>
        </div>
      </div>

      {/* 3. Category strip (scrolls sideways on small screens) */}
      <nav
        aria-label="Catégories"
        className="bg-[#EFECE3] dark:bg-[#111A13] border-t border-[#E5DFC9] dark:border-[#273D2C] px-4 sm:px-6 py-2 overflow-x-auto scrollbar-none"
      >
        <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 text-xs font-semibold">
          <NavLink
            page={{ type: 'home' }}
            onNavigate={onNavigate}
            className={stripLink(currentPage.type === 'home')}
            aria-current={currentPage.type === 'home' ? 'page' : undefined}
          >
            {t.navHome}
          </NavLink>

          {navCategories.map((cat) => {
            const active = currentPage.type === 'category' && currentPage.family === cat.family;
            return (
              <NavLink
                key={cat.family}
                page={{ type: 'category', family: cat.family }}
                onNavigate={onNavigate}
                className={stripLink(active)}
                aria-current={active ? 'page' : undefined}
              >
                {cat.label}
              </NavLink>
            );
          })}

          <NavLink
            page={{ type: 'about' }}
            onNavigate={onNavigate}
            className={stripLink(currentPage.type === 'about')}
            aria-current={currentPage.type === 'about' ? 'page' : undefined}
          >
            {t.navAbout}
          </NavLink>

          <NavLink
            page={{ type: 'contact' }}
            onNavigate={onNavigate}
            className={stripLink(currentPage.type === 'contact')}
            aria-current={currentPage.type === 'contact' ? 'page' : undefined}
          >
            {t.navContact}
          </NavLink>
        </div>
      </nav>
    </header>
  );
};
