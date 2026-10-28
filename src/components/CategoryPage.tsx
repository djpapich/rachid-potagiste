import React, { useMemo, useState } from 'react';
import { Product, ProductFamily, Language, AppTheme, PageView } from '../types/index.ts';
import { ProductCard } from './ProductCard.tsx';
import { NavLink } from './NavLink.tsx';
import { translations } from '../lib/translations.ts';
import { photoFirst } from '../lib/imageHelper.ts';
import { FAMILIES } from '../lib/router.ts';
import { ChevronRight, ChevronLeft, ArrowUpDown } from 'lucide-react';

interface CategoryPageProps {
  family: ProductFamily;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  cartProductIds: Set<string>;
  onNavigate: (page: PageView) => void;
  lang: Language;
  theme: AppTheme;
  whatsappLine: 'line1' | 'line2';
}

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'name';

const DESCRIPTIONS: Record<ProductFamily, Record<Language, string>> = {
  'lacto-fermentes': {
    fr: 'Légumes préparés à partir de cultures locales du potager, fermentés au sel marin pur. Riches en probiotiques actifs, enzymes digestives et vitamines vivantes.',
    ar: 'خضر مخمرة في عصارتها بالملح البحري الصافي بدون أي قطرة خل أو مواد كيميائية. بكتيريا لاكتيكية حية تدعم المناعة والجهاز الهضمي.',
    en: 'Vegetables from the local garden, fermented in pure sea salt. Rich in live probiotics, digestive enzymes and living vitamins.',
  },
  huiles: {
    fr: "Macérats botaniques purs obtenus par infusion solaire lente dans l'huile d'amande douce et de jojoba. Flacons pompe hygiéniques pour un dosage précis. Usage externe.",
    ar: 'نباتات عطرية وطبية مقطوفة باليد ومستخلصة ببطء في قاعدة نقية من زيت اللوز الحلو والجوجوبا، في قوارير بمضخة عملية للاستعمال الخارجي فقط.',
    en: 'Pure botanical macerates slowly infused in sweet almond and jojoba oil. Hygienic pump bottles for precise dosing. External use only.',
  },
  savons: {
    fr: "Savons surgras naturels coulés sur une tranche authentique d'éponge luffa cultivée au potager. Nettoient en douceur et gomment les impuretés sans agresser la peau.",
    ar: 'صابون يدوي الصنع مصبوب حول قطعة حقيقية من ليفة نباتية طبيعية لتقشير لطيف بدون أي بلاستيك.',
    en: 'Natural superfatted soaps poured around a real garden-grown loofah slice. Cleanses gently and exfoliates without harshness.',
  },
  cremes: {
    fr: "Formules denses et fondantes sans eau ajoutée, riches en karité, macérats et cire d'abeille naturelle. Conditionnées en boîte métal 50 g.",
    ar: 'مراهم طبيعية مركزة 100% بدون أي ماء مضاف، في علب معدنية عملية تحفظ الخصائص العلاجية للأعشاب والزيوت والشمع الطبيعي.',
    en: 'Dense, melting formulas with no added water, rich in shea butter, macerates and natural beeswax. Packed in 50 g metal tins.',
  },
};

export const CategoryPage: React.FC<CategoryPageProps> = ({
  family,
  products,
  onSelectProduct,
  onAddToCart,
  cartProductIds,
  onNavigate,
  lang,
  theme,
  whatsappLine,
}) => {
  const [sortBy, setSortBy] = useState<SortKey>('featured');
  const t = translations[lang] || translations.fr;
  const Chevron = lang === 'ar' ? ChevronLeft : ChevronRight;

  const labels: Record<ProductFamily, { name: string; subtitle: string }> = {
    'lacto-fermentes': { name: t.navLacto, subtitle: t.lactoSubtitle },
    huiles: { name: t.navOils, subtitle: t.oilsSubtitle },
    savons: { name: t.navSoaps, subtitle: t.soapsSubtitle },
    cremes: { name: t.navCreams, subtitle: t.creamsSubtitle },
  };

  const list = useMemo(() => {
    const items = products.filter((p) => p.famille === family);
    switch (sortBy) {
      case 'price-asc':
        return [...items].sort((a, b) => a.prix - b.prix);
      case 'price-desc':
        return [...items].sort((a, b) => b.prix - a.prix);
      case 'name':
        return [...items].sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
      default:
        return photoFirst(items);
    }
  }, [family, products, sortBy]);

  const meta = labels[family];
  const countLabel = `${list.length} ${list.length > 1 ? t.creationMany : t.creationOne}`;

  return (
    <div className="py-6 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-xs text-[#8C6D23] dark:text-[#E5B834] mb-5">
          <NavLink page={{ type: 'home' }} onNavigate={onNavigate} className="hover:underline">
            {t.breadcrumbsHome}
          </NavLink>
          <Chevron className="w-3.5 h-3.5" aria-hidden="true" />
          <span aria-current="page" className="font-bold text-[#1F3D2B] dark:text-[#F4F1EA]">
            {meta.name}
          </span>
        </nav>

        <header className="bg-[#FBFAF5] dark:bg-[#152219] rounded-3xl p-6 sm:p-8 border border-[#E5DFC9] dark:border-[#273D2C] shadow-xs mb-6">
          <h1 className="font-title text-2xl sm:text-3xl md:text-4xl font-black text-[#1F3D2B] dark:text-[#F4F1EA]">{meta.name}</h1>
          <p className="font-script text-xl sm:text-2xl text-[#8C6D23] dark:text-[#E5B834] italic my-2">« {meta.subtitle} »</p>
          <p className="text-xs sm:text-sm text-[#1F3D2B]/80 dark:text-[#F4F1EA]/80 max-w-3xl leading-relaxed">{DESCRIPTIONS[family][lang]}</p>
        </header>

        {/* Family chips: switch category in one tap */}
        <nav aria-label={t.categories} className="flex gap-2 overflow-x-auto scrollbar-none pb-1 mb-4">
          {FAMILIES.map((f) => (
            <NavLink
              key={f}
              page={{ type: 'category', family: f }}
              onNavigate={onNavigate}
              aria-current={f === family ? 'page' : undefined}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${
                f === family
                  ? 'bg-[#1F3D2B] text-white border-[#1F3D2B] dark:bg-[#E5B834] dark:text-[#0D140F] dark:border-[#E5B834]'
                  : 'bg-[#FBFAF5] dark:bg-[#152219] text-[#1F3D2B] dark:text-[#F4F1EA] border-[#D7CEBA] dark:border-[#273D2C] hover:border-[#1F3D2B] dark:hover:border-[#E5B834]'
              }`}
            >
              {labels[f].name}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center justify-between gap-4 mb-6">
          <p className="text-xs font-semibold text-[#1F3D2B] dark:text-[#F4F1EA]" aria-live="polite">
            {countLabel}
          </p>
          <label className="flex items-center gap-2 text-xs">
            <ArrowUpDown className="w-4 h-4 text-[#8C6D23] dark:text-[#E5B834]" aria-hidden="true" />
            <span className="text-[#8C6D23] dark:text-[#E5B834] font-medium hidden sm:inline">{t.sortBy}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="bg-[#FBFAF5] dark:bg-[#152219] text-[#1F3D2B] dark:text-[#F4F1EA] border border-[#D7CEBA] dark:border-[#273D2C] rounded-xl px-3 py-2 text-xs font-medium cursor-pointer"
            >
              <option value="featured">{t.sortFeatured}</option>
              <option value="price-asc">{t.sortPriceAsc}</option>
              <option value="price-desc">{t.sortPriceDesc}</option>
              <option value="name">{t.sortName}</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {list.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onAddToCart={onAddToCart}
              isInCart={cartProductIds.has(product.id)}
              lang={lang}
              theme={theme}
              whatsappLine={whatsappLine}
              priority={index < 4}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
