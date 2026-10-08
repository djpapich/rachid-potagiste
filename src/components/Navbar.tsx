import React, { useState } from 'react';
import { ShoppingBag, Bell, ShieldCheck, Search, Globe, ChevronDown, Check, Youtube, Moon, Sun } from 'lucide-react';
import { Language, AppTheme } from '../types/index.ts';
import { translations } from '../lib/translations.ts';

interface NavbarProps {
  currentLang: Language;
  onSelectLang: (lang: Language) => void;
  activeView: 'shop' | 'blog' | 'tracking' | 'admin';
  onChangeView: (view: 'shop' | 'blog' | 'tracking' | 'admin') => void;
  cartCount: number;
  onOpenCart: () => void;
  unreadNotifsCount: number;
  onOpenNotifs: () => void;
  onOpenEmailSim: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  theme: AppTheme;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  onSelectLang,
  activeView,
  onChangeView,
  cartCount,
  onOpenCart,
  unreadNotifsCount,
  onOpenNotifs,
  onOpenEmailSim,
  searchQuery,
  onSearchChange,
  theme,
  onToggleTheme,
}) => {
  const t = translations[currentLang];
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FBFBF9]/95 backdrop-blur-md border-b border-stone-200/80 transition-colors">
      {/* Top Notification Announcement Bar */}
      <div className="bg-[#1F3A2B] text-stone-100 text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-3">
        <span>🌱 {t.freeShippingNotice}</span>
        <span className="text-emerald-300 hidden md:inline">·</span>
        <a
          href="https://www.youtube.com/@Rachid_Le_Potagiste"
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-200 hover:text-white flex items-center gap-1 cursor-pointer transition-colors hidden sm:flex"
        >
          <Youtube className="w-3.5 h-3.5 text-red-400" />
          <span>YouTube : @Rachid_Le_Potagiste</span>
        </a>
        <span className="text-emerald-300 hidden md:inline">·</span>
        <span className="text-stone-300 text-[11px] hidden lg:inline">
          {t.developedBy}
        </span>
      </div>

      {/* Main Top Bar (Strict 3-zone contract) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => onChangeView('shop')}
            className="group flex items-center gap-2.5 text-left cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-[#1F3A2B] text-white flex items-center justify-center font-serif text-lg font-bold shadow-xs">
              RP
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-[#1F3A2B] group-hover:text-emerald-800 transition-colors block leading-tight">
                RACHID POTAGISTE
              </span>
              <span className="text-[10px] text-stone-500 font-sans tracking-wide block">
                {t.developedBy}
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation text links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
          <button
            onClick={() => onChangeView('shop')}
            className={`cursor-pointer transition-colors py-1 ${
              activeView === 'shop' ? 'text-[#1F3A2B] font-semibold border-b-2 border-[#1F3A2B]' : 'hover:text-stone-900'
            }`}
          >
            Semences & Plants
          </button>
          <button
            onClick={() => onChangeView('blog')}
            className={`cursor-pointer transition-colors py-1 ${
              activeView === 'blog' ? 'text-[#1F3A2B] font-semibold border-b-2 border-[#1F3A2B]' : 'hover:text-stone-900'
            }`}
          >
            {t.viewBlog}
          </button>
          <button
            onClick={() => onChangeView('tracking')}
            className={`cursor-pointer transition-colors py-1 ${
              activeView === 'tracking' ? 'text-[#1F3A2B] font-semibold border-b-2 border-[#1F3A2B]' : 'hover:text-stone-900'
            }`}
          >
            {t.clientSpace}
          </button>
          <button
            onClick={() => onChangeView('admin')}
            className={`cursor-pointer transition-colors py-1 flex items-center gap-1.5 ${
              activeView === 'admin' ? 'text-[#1F3A2B] font-semibold border-b-2 border-[#1F3A2B]' : 'hover:text-stone-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>{t.adminDashboard}</span>
          </button>
        </nav>

        {/* Zone 3: Actions (Search, Lang, Push Notifs, Cart) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Toggle */}
          <div className="relative">
            {searchOpen ? (
              <div className="flex items-center bg-stone-100 rounded-full px-3 py-1.5 border border-stone-300 w-44 sm:w-64">
                <Search className="w-4 h-4 text-stone-500 shrink-0 mr-2" />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  autoFocus
                  className="w-full bg-transparent text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none"
                />
                <button
                  onClick={() => { setSearchOpen(false); onSearchChange(''); }}
                  className="text-stone-400 hover:text-stone-700 text-xs px-1"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                title={t.searchPlaceholder}
                className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Multilingual Selector */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-stone-700 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-stone-500" />
              <span>{currentLang}</span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-stone-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                {[
                  { code: 'fr', label: 'Français' },
                  { code: 'en', label: 'English' },
                  { code: 'ar', label: 'العربية' }
                ].map((item) => (
                  <button
                    key={item.code}
                    onClick={() => {
                      onSelectLang(item.code as Language);
                      setLangMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 flex items-center justify-between cursor-pointer"
                  >
                    <span>{item.label}</span>
                    {currentLang === item.code && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Black and White Theme Switcher */}
          <button
            onClick={onToggleTheme}
            title={theme === 'black' ? 'Passer en Mode Blanc' : 'Passer en Mode Noir'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 transition-colors cursor-pointer text-xs font-semibold"
          >
            {theme === 'black' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Blanc</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-stone-700" />
                <span className="hidden sm:inline">Noir</span>
              </>
            )}
          </button>

          {/* Real-time Push Notifications Bell */}
          <button
            onClick={onOpenNotifs}
            className="relative p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
            title={t.notifications}
          >
            <Bell className="w-5 h-5" />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-600 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Shopping Bag Button */}
          <button
            onClick={onOpenCart}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#1F3A2B] text-white rounded-lg hover:bg-[#162a1f] transition-colors cursor-pointer shadow-xs active:scale-98"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="text-xs font-semibold tabular-nums">{cartCount}</span>
          </button>
        </div>
      </div>

      {/* Mobile nav row */}
      <div className="md:hidden border-t border-stone-200/80 px-4 py-2 flex items-center justify-around text-xs font-medium text-stone-600 bg-stone-50/50">
        <button
          onClick={() => onChangeView('shop')}
          className={`py-1 cursor-pointer ${activeView === 'shop' ? 'text-[#1F3A2B] font-bold' : ''}`}
        >
          Semences & Plants
        </button>
        <button
          onClick={() => onChangeView('blog')}
          className={`py-1 cursor-pointer ${activeView === 'blog' ? 'text-[#1F3A2B] font-bold' : ''}`}
        >
          {t.viewBlog}
        </button>
        <button
          onClick={() => onChangeView('tracking')}
          className={`py-1 cursor-pointer ${activeView === 'tracking' ? 'text-[#1F3A2B] font-bold' : ''}`}
        >
          {t.clientSpace}
        </button>
        <button
          onClick={() => onChangeView('admin')}
          className={`py-1 cursor-pointer flex items-center gap-1 ${activeView === 'admin' ? 'text-[#1F3A2B] font-bold' : ''}`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>{t.adminDashboard}</span>
        </button>
      </div>
    </header>
  );
};
