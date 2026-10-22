import React, { useState, useMemo } from 'react';
import { Product, ProductFamily, Language, AppTheme, PageView } from '../types/index.ts';
import { ProductCard } from './ProductCard.tsx';
import { translations } from '../lib/translations.ts';
import { ChevronRight, ChevronLeft, SlidersHorizontal, ArrowUpDown, Sparkles, Leaf, Droplet, Flower2, Sun } from 'lucide-react';

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
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const t = translations[lang] || translations.fr;
  const isRtl = lang === 'ar';

  const categoryProducts = useMemo(() => {
    const list = products.filter((p) => p.famille === family);
    if (sortBy === 'price-asc') {
      return [...list].sort((a, b) => a.prix - b.prix);
    }
    if (sortBy === 'price-desc') {
      return [...list].sort((a, b) => b.prix - a.prix);
    }
    return list;
  }, [family, products, sortBy]);

  const categoryMeta: Record<ProductFamily, { title: string; subtitle: string; desc: string; icon: React.ReactNode }> = {
    'lacto-fermentes': {
      title: t.lactoTitle,
      subtitle: t.lactoSubtitle,
      desc: lang === 'ar'
        ? 'خضر مخمرة في عصارتها بالملح البحري الصافي بدون أي قطرة خل أو مواد كيميائية. بكتيريا لاكتيكية حية تدعم المناعة والجهاز الهضمي وتزيد من امتصاص المعادن والفيتامينات.'
        : 'Légumes préparés à partir de cultures locales du potager, fermentés au sel marin pur. Riches en probiotiques actifs, enzymes digestives et vitamines vivantes.',
      icon: <Leaf className="w-6 h-6 text-[#3F6B2E] dark:text-[#528B3E]" />,
    },
    'huiles': {
      title: t.oilsTitle,
      subtitle: t.oilsSubtitle,
      desc: lang === 'ar'
        ? 'نباتات عطرية وطبية مقطوفة باليد ومستخلصة ببطء في قاعدة نقية من زيت اللوز الحلو والجوجوبا، في قوارير زجاجية بمضخة عملية للاستعمال الخارجي فقط.'
        : 'Macérats botaniques purs obtenus par infusion solaire lente dans l\'huile d\'amande douce et de jojoba. Flacons pompe hygiéniques en verre pour un dosage précis. Usage externe.',
      icon: <Droplet className="w-6 h-6 text-[#C9A227] dark:text-[#E5B834]" />,
    },
    'savons': {
      title: t.soapsTitle,
      subtitle: t.soapsSubtitle,
      desc: lang === 'ar'
        ? 'صابون يدوي الصنع غني بزيوت طبيعية ومستخلصات البستان، مصبوب بعناية حول قطعة حقيقية من ليفة نباتية طبيعية لتقشير لطيف بدون أي بلاستيك.'
        : 'Savons surgras naturels coulés sur une tranche authentique d\'éponge luffa cultivée au potager. Nettoient en douceur et gomment les impuretés sans agresser la peau.',
      icon: <Flower2 className="w-6 h-6 text-[#3F6B2E] dark:text-[#528B3E]" />,
    },
    'cremes': {
      title: t.creamsTitle,
      subtitle: t.creamsSubtitle,
      desc: lang === 'ar'
        ? 'مراهم طبيعية مركزة 100% بدون أي ماء مضاف، في علب معدنية عملية تحفظ الخصائص العلاجية للأعشاب والزيوت والشمع الطبيعي.'
        : 'Formules denses et fondantes sans eau ajoutée, riches en karité, macérats et cire d\'abeille naturelle. Conditionnées en boîte métal 50 g.',
      icon: <Sun className="w-6 h-6 text-[#C9A227] dark:text-[#E5B834]" />,
    },
  };

  const meta = categoryMeta[family];

  return (
    <div className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-[#8C6D23] dark:text-[#E5B834] mb-6">
          <button
            onClick={() => onNavigate({ type: 'home' })}
            className="hover:underline cursor-pointer"
          >
            {t.breadcrumbsHome}
          </button>
          {isRtl ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          <span className="font-bold text-[#1F3D2B] dark:text-[#F4F1EA]">
            {meta.title}
          </span>
        </div>

        {/* Category Hero Banner */}
        <div className="bg-[#FBFAF5] dark:bg-[#152219] rounded-3xl p-6 sm:p-8 border border-[#E5DFC9] dark:border-[#273D2C] shadow-xs mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-[#F4F1EA] dark:bg-[#1C2D21] border border-[#E5DFC9] dark:border-[#273D2C]">
              {meta.icon}
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C6D23] dark:text-[#E5B834]">
                {categoryProducts.length} {t.allCategories}
              </span>
              <h1 className="font-title text-2xl sm:text-3xl md:text-4xl font-black text-[#1F3D2B] dark:text-[#F4F1EA]">
                {meta.title}
              </h1>
            </div>
          </div>

          <p className="font-script text-xl sm:text-2xl text-[#8C6D23] dark:text-[#E5B834] italic mb-3">
            « {meta.subtitle} »
          </p>

          <p className="text-xs sm:text-sm text-[#1F3D2B]/80 dark:text-[#F4F1EA]/80 max-w-3xl leading-relaxed">
            {meta.desc}
          </p>
        </div>

        {/* Sorting and Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#EFECE3] dark:bg-[#111A13] p-3.5 rounded-2xl border border-[#E5DFC9] dark:border-[#273D2C] mb-8">
          <div className="text-xs font-semibold text-[#1F3D2B] dark:text-[#F4F1EA] flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#8C6D23] dark:text-[#E5B834]" />
            <span>
              {categoryProducts.length} {categoryProducts.length > 1 ? 'créations disponibles' : 'création'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#8C6D23] dark:text-[#E5B834] font-medium hidden sm:inline">
              {t.sortBy}
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#FBFAF5] dark:bg-[#152219] text-[#1F3D2B] dark:text-[#F4F1EA] border border-[#D7CEBA] dark:border-[#273D2C] rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-hidden focus:border-[#1F3D2B] cursor-pointer"
            >
              <option value="featured">{t.sortFeatured}</option>
              <option value="price-asc">{t.sortPriceAsc}</option>
              <option value="price-desc">{t.sortPriceDesc}</option>
            </select>
          </div>
        </div>

        {/* Products Grid (Amazon / Jumia 4-column layout) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {categoryProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onAddToCart={onAddToCart}
              isInCart={cartProductIds.has(product.id)}
              lang={lang}
              theme={theme}
              whatsappLine={whatsappLine}
            />
          ))}
        </div>

      </div>
    </div>
  );
};
