import { AppTheme, Language } from '../types/index.ts';

export const CART_STORAGE_KEY = 'rachid_potagiste_cart_v4';
export const LEGACY_CART_STORAGE_KEY = 'rachid_potagiste_selection_v3';
export const THEME_STORAGE_KEY = 'rachid_potagiste_theme';
export const LANG_STORAGE_KEY = 'rachid_potagiste_lang';
export const WA_LINE_STORAGE_KEY = 'rachid_potagiste_wa_line';

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // private mode or storage full: preferences are a convenience, never a requirement
  }
}

/** Saved language, otherwise the browser language (Arabic / English), otherwise French. */
export function getInitialLang(): Language {
  const saved = read(LANG_STORAGE_KEY);
  if (saved === 'fr' || saved === 'ar' || saved === 'en') return saved;
  const browser = (typeof navigator !== 'undefined' ? navigator.language : 'fr').toLowerCase();
  if (browser.startsWith('ar')) return 'ar';
  if (browser.startsWith('en')) return 'en';
  return 'fr';
}

/** Saved theme, otherwise the operating-system preference. */
export function getInitialTheme(): AppTheme {
  const saved = read(THEME_STORAGE_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function getInitialWhatsappLine(): 'line1' | 'line2' {
  return read(WA_LINE_STORAGE_KEY) === 'line2' ? 'line2' : 'line1';
}

/** Applies language, direction and theme to <html> (also used before React renders, to avoid a flash). */
export function applyDocumentPreferences(lang: Language, theme: AppTheme): void {
  const root = document.documentElement;
  root.setAttribute('lang', lang);
  root.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  root.setAttribute('data-theme', theme);
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;

  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) themeColor.setAttribute('content', theme === 'dark' ? '#0D140F' : '#1F3D2B');
}
