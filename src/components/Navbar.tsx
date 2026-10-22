import React, { useState } from 'react';
import { Product, Language, AppTheme, PageView, ProductFamily } from '../types/index.ts';
import {
  ShoppingBag,
  Search,
  Phone,
  Sun,
  Moon,
  Globe,
  Menu,
  X,
  MessageCircle,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import {
  WHATSAPP_LINE_1,
  WHATSAPP_LINE_1_DISPLAY,
  WHATSAPP_LINE_2,
  WHATSAPP_LINE_2_DISPLAY,
  getGeneralInquiryWhatsAppUrl
} from '../lib/whatsapp.ts';
import { translations } from '../lib/translations.ts';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showLineDropdown, setShowLineDropdown] = useState(false);

  const t = translations[lang] || translations.fr;
  const isRtl = lang === 'ar';

  const currentDisplayPhone =
    whatsappLine === 'line2' ? WHATSAPP_LINE_2_DISPLAY : WHATSAPP_LINE_1_DISPLAY;

  // Search filter
  const searchResults = searchQuery.trim()
    ? products
        .filter((p) => {
          const q = searchQuery.toLowerCase();
          return (
            p.nom.toLowerCase().includes(q) ||
            (p.nomAr && p.nomAr.includes(q)) ||
            (p.nomEn && p.nomEn.toLowerCase().includes(q)) ||
            p.description.toLowerCase().includes(q) ||
            p.ingredients.toLowerCase().includes(q)
          );
        })
        .slice(0, 5)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      onSelectProduct(searchResults[0]);
      setShowSearchResults(false);
      setSearchQuery('');
    }
  };

  const navCategories: { label: string; family: ProductFamily }[] = [
    { label: t.navLacto, family: 'lacto-fermentes' },
    { label: t.navOils, family: 'huiles' },
    { label: t.navSoaps, family: 'savons' },
    { label: t.navCreams, family: 'cremes' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FBFAF5] dark:bg-[#152219] border-b border-[#E5DFC9] dark:border-[#273D2C] shadow-xs transition-colors">
      
      {/* 1. Ultra-Top Utility Bar (WhatsApp Lines, Language Switcher, Theme Switcher) */}
      <div className="bg-[#1F3D2B] dark:bg-[#0D140F] text-[#FBFAF5] text-xs py-1.5 px-3 sm:px-6 border-b border-[#C9A227]/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          
          {/* Left: Dual WhatsApp selector */}
          <div className="relative flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[#E5DFC9] text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>WhatsApp :</span>
            </span>

            {/* Quick dropdown or buttons for the two numbers */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onWhatsappLineChange('line1')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  whatsappLine === 'line1'
                    ? 'bg-[#C9A227] text-[#1F3D2B] font-bold shadow-xs'
                    : 'bg-[#14281C] text-[#E5DFC9] hover:text-white'
                }`}
                title="Ligne 1 : 07 86 73 16 66"
              >
                07 86 73 16 66
              </button>
              <button
                onClick={() => onWhatsappLineChange('line2')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  whatsappLine === 'line2'
                    ? 'bg-[#C9A227] text-[#1F3D2B] font-bold shadow-xs'
                    : 'bg-[#14281C] text-[#E5DFC9] hover:text-white'
                }`}
                title="Ligne 2 : 07 21 04 58 01"
              >
                07 21 04 58 01
              </button>
            </div>
          </div>

          {/* Right: Cash on delivery tag + Language & Theme */}
          <div className="flex items-center gap-3 text-[11px]">
            <span className="hidden md:inline text-[#E5DFC9]/80 font-medium">
              🇲🇦 {t.cashOnDelivery}
            </span>

            {/* Language Switcher (FR / AR / EN) */}
            <div className="flex items-center bg-[#14281C] rounded-lg p-0.5 border border-[#3F6B2E]/50">
              <button
                onClick={() => onLanguageChange('fr')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                  lang === 'fr' ? 'bg-[#C9A227] text-[#1F3D2B]' : 'text-[#E5DFC9] hover:text-white'
                }`}
              >
                FR
              </button>
              <button
                onClick={() => onLanguageChange('ar')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                  lang === 'ar' ? 'bg-[#C9A227] text-[#1F3D2B]' : 'text-[#E5DFC9] hover:text-white'
                }`}
              >
                عربي
              </button>
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                  lang === 'en' ? 'bg-[#C9A227] text-[#1F3D2B]' : 'text-[#E5DFC9] hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            {/* Theme Toggle (Light / Dark) */}
            <button
              onClick={onThemeToggle}
              className="p-1 rounded-lg bg-[#14281C] hover:bg-[#203627] text-[#C9A227] transition-colors cursor-pointer flex items-center gap-1"
              title={theme === 'dark' ? t.themeLight : t.themeDark}
              aria-label="Basculer le thème"
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-amber-300" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-amber-200" />
              )}
            </button>
          </div>

        </div>
      </div>

      {/* 2. Main Header Bar (Logo, Dynamic Search Bar, Quick WhatsApp, Cart) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Medallion */}
        <button
          onClick={() => onNavigate({ type: 'home' })}
          className="flex items-center gap-2.5 text-left rtl:text-right shrink-0 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-[#FBFAF5] dark:bg-[#152219] border border-[#C9A227] flex items-center justify-center shadow-xs p-1">
            <svg viewBox="0 0 100 100" className="w-full h-full text-[#C9A227]">
              <circle cx="50" cy="50" r="46" fill="#1F3D2B" />
              <path d="M50 15 C32 30 30 65 50 82 C70 65 68 30 50 15 Z" fill="#C9A227" />
              <path d="M50 20 L50 78 M50 35 L38 45 M50 48 L36 58 M50 35 L62 45 M50 48 L64 58" stroke="#1F3D2B" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-title text-base sm:text-lg font-black tracking-wide text-[#1F3D2B] dark:text-[#F4F1EA] uppercase leading-tight">
              {t.siteTitle}
            </span>
            <span className="text-[10px] tracking-widest font-semibold text-[#8C6D23] dark:text-[#E5B834] uppercase">
              {t.tagline}
            </span>
          </div>
        </button>

        {/* Dynamic Search Bar (Jumia / Amazon style) */}
        <div className="hidden md:flex flex-1 max-w-xl relative mx-2">
          <form onSubmit={handleSearchSubmit} className="w-full relative">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              className="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2 rounded-xl text-xs sm:text-sm bg-[#F4F1EA] dark:bg-[#1C2D21] text-[#1F3D2B] dark:text-[#F4F1EA] border border-[#D7CEBA] dark:border-[#273D2C] focus:outline-hidden focus:border-[#1F3D2B] dark:focus:border-[#E5B834] transition-colors"
            />
            <Search className="w-4 h-4 text-[#8C6D23] dark:text-[#E5B834] absolute left-3.5 rtl:left-auto rtl:right-3.5 top-2.5 pointer-events-none" />
          </form>

          {/* Autocomplete dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#FBFAF5] dark:bg-[#152219] border border-[#E5DFC9] dark:border-[#273D2C] rounded-xl shadow-xl overflow-hidden z-50">
              {searchResults.map((prod) => (
                <button
                  key={prod.id}
                  onClick={() => {
                    onSelectProduct(prod);
                    setShowSearchResults(false);
                    setSearchQuery('');
                  }}
                  className="w-full text-left rtl:text-right p-2.5 hover:bg-[#F4F1EA] dark:hover:bg-[#1C2D21] flex items-center gap-3 border-b border-[#E5DFC9]/50 dark:border-[#273D2C] transition-colors cursor-pointer"
                >
                  <img
                    src={prod.image}
                    alt={prod.nom}
                    className="w-9 h-9 object-contain bg-white rounded-md p-0.5 border border-[#E5DFC9]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#1F3D2B] dark:text-[#F4F1EA] truncate">
                      {lang === 'ar' ? (prod.nomAr || prod.nom) : lang === 'en' ? (prod.nomEn || prod.nom) : prod.nom}
                    </p>
                    <p className="text-[11px] text-[#8C6D23] dark:text-[#E5B834]">
                      {prod.contenance} · <span className="font-bold">{prod.prix} {t.currency}</span>
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right side actions: WhatsApp direct call + Cart button */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick WhatsApp Link to Active Line */}
          <a
            href={getGeneralInquiryWhatsAppUrl(whatsappLine, lang)}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F3D2B] dark:text-[#F4F1EA] bg-[#EAE4D2] dark:bg-[#1C2D21] hover:bg-[#DFD6BF] px-3 py-2 rounded-xl transition-colors border border-[#D7CEBA] dark:border-[#273D2C]"
            title={`Discuter directement sur WhatsApp (${currentDisplayPhone})`}
          >
            <MessageCircle className="w-4 h-4 text-emerald-600 fill-current" />
            <span className="hidden lg:inline">{currentDisplayPhone}</span>
          </a>

          {/* Cart Button with Count */}
          <button
            onClick={() => onNavigate({ type: 'cart' })}
            className="flex items-center gap-2 bg-[#1F3D2B] dark:bg-[#E5B834] text-[#FBFAF5] dark:text-[#0D140F] hover:bg-[#162D20] dark:hover:bg-[#D4A92B] px-3.5 py-2 rounded-xl font-semibold text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer"
            aria-label="Voir le panier"
          >
            <ShoppingBag className="w-4 h-4 text-[#C9A227] dark:text-[#0D140F]" />
            <span className="hidden sm:inline">{t.cart}</span>
            {cartItemCount > 0 ? (
              <span className="w-5 h-5 rounded-full bg-[#C9A227] dark:bg-[#0D140F] text-[#1F3D2B] dark:text-[#E5B834] font-bold text-xs flex items-center justify-center animate-bounce">
                {cartItemCount}
              </span>
            ) : (
              <span className="text-xs opacity-75">(0)</span>
            )}
          </button>

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#1F3D2B] dark:text-[#F4F1EA] hover:bg-[#EAE4D2] dark:hover:bg-[#1C2D21] rounded-lg transition-colors cursor-pointer"
            aria-label="Menu de navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* 3. Secondary Category Strip (Jumia / Amazon style horizontal categories) */}
      <nav className="bg-[#EFECE3] dark:bg-[#111A13] border-t border-[#E5DFC9] dark:border-[#273D2C] px-4 sm:px-6 py-2 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 text-xs font-semibold whitespace-nowrap">
          
          <button
            onClick={() => onNavigate({ type: 'home' })}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              currentPage.type === 'home'
                ? 'bg-[#1F3D2B] text-white dark:bg-[#E5B834] dark:text-[#0D140F]'
                : 'text-[#1F3D2B] dark:text-[#F4F1EA] hover:bg-[#E2DDD0] dark:hover:bg-[#1C2D21]'
            }`}
          >
            {t.navHome}
          </button>

          {navCategories.map((cat) => {
            const isActive = currentPage.type === 'category' && currentPage.family === cat.family;
            return (
              <button
                key={cat.family}
                onClick={() => onNavigate({ type: 'category', family: cat.family })}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#1F3D2B] text-white dark:bg-[#E5B834] dark:text-[#0D140F]'
                    : 'text-[#1F3D2B] dark:text-[#F4F1EA] hover:bg-[#E2DDD0] dark:hover:bg-[#1C2D21]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}

          <button
            onClick={() => onNavigate({ type: 'about' })}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              currentPage.type === 'about'
                ? 'bg-[#1F3D2B] text-white dark:bg-[#E5B834] dark:text-[#0D140F]'
                : 'text-[#1F3D2B] dark:text-[#F4F1EA] hover:bg-[#E2DDD0] dark:hover:bg-[#1C2D21]'
            }`}
          >
            {t.navAbout}
          </button>

          <button
            onClick={() => onNavigate({ type: 'contact' })}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              currentPage.type === 'contact'
                ? 'bg-[#1F3D2B] text-white dark:bg-[#E5B834] dark:text-[#0D140F]'
                : 'text-[#1F3D2B] dark:text-[#F4F1EA] hover:bg-[#E2DDD0] dark:hover:bg-[#1C2D21]'
            }`}
          >
            {t.navContact}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FBFAF5] dark:bg-[#152219] border-b border-[#E5DFC9] dark:border-[#273D2C] px-5 py-4 shadow-xl space-y-3">
          
          {/* Mobile search bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full mb-3">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-[#F4F1EA] dark:bg-[#1C2D21] border border-[#D7CEBA] dark:border-[#273D2C]"
            />
            <Search className="w-4 h-4 text-[#8C6D23] absolute left-3 top-2.5" />
          </form>

          <div className="flex flex-col gap-1 text-sm font-medium text-[#1F3D2B] dark:text-[#F4F1EA]">
            <button
              onClick={() => {
                onNavigate({ type: 'home' });
                setMobileMenuOpen(false);
              }}
              className="py-2 text-left rtl:text-right border-b border-[#E5DFC9]/50 dark:border-[#273D2C]"
            >
              {t.navHome}
            </button>
            {navCategories.map((cat) => (
              <button
                key={cat.family}
                onClick={() => {
                  onNavigate({ type: 'category', family: cat.family });
                  setMobileMenuOpen(false);
                }}
                className="py-2 text-left rtl:text-right border-b border-[#E5DFC9]/50 dark:border-[#273D2C]"
              >
                {cat.label}
              </button>
            ))}
            <button
              onClick={() => {
                onNavigate({ type: 'about' });
                setMobileMenuOpen(false);
              }}
              className="py-2 text-left rtl:text-right border-b border-[#E5DFC9]/50 dark:border-[#273D2C]"
            >
              {t.navAbout}
            </button>
            <button
              onClick={() => {
                onNavigate({ type: 'contact' });
                setMobileMenuOpen(false);
              }}
              className="py-2 text-left rtl:text-right border-b border-[#E5DFC9]/50 dark:border-[#273D2C]"
            >
              {t.navContact}
            </button>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <a
              href={getGeneralInquiryWhatsAppUrl(whatsappLine, lang)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[#25D366] text-white font-semibold text-xs rounded-xl shadow-xs"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Contacter ({currentDisplayPhone})</span>
            </a>
          </div>
        </div>
      )}

    </header>
  );
};
