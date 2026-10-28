import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Language, Product } from '../types/index.ts';
import { translations } from '../lib/translations.ts';
import { ProductImage } from './ProductImage.tsx';

interface SearchBoxProps {
  products: Product[];
  lang: Language;
  onSelectProduct: (product: Product) => void;
  /** Called after a product has been chosen (e.g. to close the mobile menu). */
  onDone?: () => void;
  className?: string;
}

/** Lower-case, accent-insensitive text ("creme" finds "Crème", "ortie" finds "d'ortie"). */
function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

function nameOf(p: Product, lang: Language): string {
  return lang === 'ar' ? p.nomAr || p.nom : lang === 'en' ? p.nomEn || p.nom : p.nom;
}

/**
 * Accessible product search: keyboard navigation (arrows, Enter, Escape),
 * closes on outside click, tolerant to accents, ranked by name match first.
 */
export const SearchBox: React.FC<SearchBoxProps> = ({ products, lang, onSelectProduct, onDone, className = '' }) => {
  const t = translations[lang] || translations.fr;
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return [];
    const scored: { product: Product; score: number }[] = [];
    for (const p of products) {
      const names = normalize([p.nom, p.nomAr ?? '', p.nomEn ?? ''].join(' '));
      let score = 0;
      if (names.includes(q)) score = 3;
      else if (normalize(p.familleLabel).includes(q)) score = 2;
      else if (normalize(`${p.description} ${p.ingredients}`).includes(q)) score = 1;
      if (score > 0) scored.push({ product: p, score });
    }
    return scored.sort((a, b) => b.score - a.score).slice(0, 6).map((r) => r.product);
  }, [query, products]);

  // Close when clicking or tabbing outside
  useEffect(() => {
    const close = (e: Event) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('focusin', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('focusin', close);
    };
  }, []);

  const choose = (product: Product) => {
    onSelectProduct(product);
    setQuery('');
    setOpen(false);
    onDone?.();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault();
      choose(results[Math.min(active, results.length - 1)]);
    }
  };

  const showList = open && query.trim().length > 0;

  return (
    <div ref={rootRef} className={`relative ${className}`} role="search">
      <Search
        className="w-4 h-4 text-[#8C6D23] dark:text-[#E5B834] absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
        aria-hidden="true"
      />
      <input
        type="search"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && results.length ? `${listId}-${active}` : undefined}
        aria-label={t.searchLabel}
        placeholder={t.searchPlaceholder}
        value={query}
        maxLength={60}
        autoComplete="off"
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className="w-full pl-10 pr-9 rtl:pr-10 rtl:pl-9 py-2.5 rounded-xl text-sm bg-[#F4F1EA] dark:bg-[#1C2D21] text-[#1F3D2B] dark:text-[#F4F1EA] border border-[#D7CEBA] dark:border-[#273D2C] focus:outline-hidden focus:border-[#1F3D2B] dark:focus:border-[#E5B834] transition-colors"
      />
      {query && (
        <button
          type="button"
          onClick={() => {
            setQuery('');
            setOpen(false);
          }}
          aria-label={t.clearSearch}
          className="absolute right-2.5 rtl:right-auto rtl:left-2.5 top-1/2 -translate-y-1/2 p-1 text-[#1F3D2B]/60 dark:text-[#F4F1EA]/60 hover:text-[#1F3D2B] dark:hover:text-[#F4F1EA] cursor-pointer"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1 bg-[#FBFAF5] dark:bg-[#152219] border border-[#E5DFC9] dark:border-[#273D2C] rounded-xl shadow-xl overflow-hidden z-50"
        >
          {results.length === 0 && (
            <li className="p-3 text-xs text-[#1F3D2B]/70 dark:text-[#F4F1EA]/70" role="presentation">
              {t.noResults}
            </li>
          )}
          {results.map((prod, i) => (
            <li
              key={prod.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(prod)}
              className={`p-2.5 flex items-center gap-3 border-b last:border-b-0 border-[#E5DFC9]/50 dark:border-[#273D2C] cursor-pointer transition-colors ${
                i === active ? 'bg-[#F4F1EA] dark:bg-[#1C2D21]' : ''
              }`}
            >
              <span className="w-10 h-10 shrink-0 rounded-md bg-white dark:bg-[#101A13] border border-[#E5DFC9] dark:border-[#273D2C] overflow-hidden">
                <ProductImage src={prod.image} alt="" className="w-full h-full object-contain compact" lang={lang} sizes="40px" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-xs font-bold text-[#1F3D2B] dark:text-[#F4F1EA] truncate">{nameOf(prod, lang)}</span>
                <span className="block text-[11px] text-[#8C6D23] dark:text-[#E5B834]">
                  {prod.contenance} · <span className="font-bold">{prod.prix} {t.currency}</span>
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
