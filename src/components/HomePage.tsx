import React from 'react';
import { Product, PromoConfig, Language, AppTheme, PageView } from '../types/index.ts';
import { Hero } from './Hero.tsx';
import { PackDecouverte } from './PackDecouverte.tsx';
import { HorizontalProductCarousel } from './HorizontalProductCarousel.tsx';
import { ArtisanalPhilosophy } from './ArtisanalPhilosophy.tsx';
import { HowToOrder } from './HowToOrder.tsx';
import { FaqSection } from './FaqSection.tsx';
import { translations } from '../lib/translations.ts';

interface HomePageProps {
  products: Product[];
  promo: PromoConfig | null;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  cartProductIds: Set<string>;
  onNavigate: (page: PageView) => void;
  lang: Language;
  theme: AppTheme;
  whatsappLine: 'line1' | 'line2';
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  promo,
  onSelectProduct,
  onAddToCart,
  cartProductIds,
  onNavigate,
  lang,
  theme,
  whatsappLine,
}) => {
  const t = translations[lang] || translations.fr;

  // Filter products by family
  const lactoProducts = products.filter((p) => p.famille === 'lacto-fermentes');
  const oilProducts = products.filter((p) => p.famille === 'huiles');
  const soapProducts = products.filter((p) => p.famille === 'savons');
  const creamProducts = products.filter((p) => p.famille === 'cremes');
  const soapAndCreamProducts = [...soapProducts, ...creamProducts];

  // Best sellers: curated selection from each category
  const bestSellers = [
    products.find((p) => p.id === 'chou-vert-carotte-lacto-fermente'),
    products.find((p) => p.id === 'huile-ortie'),
    products.find((p) => p.id === 'creme-ortie'),
    products.find((p) => p.id === 'chou-rouge-lacto-fermente'),
    products.find((p) => p.id === 'savon-luffa-ortie'),
    products.find((p) => p.id === 'huile-romarin'),
    products.find((p) => p.id === 'oignon-rouge-lacto-fermente'),
    products.find((p) => p.id === 'creme-anti-grippe'),
  ].filter(Boolean) as Product[];

  return (
    <div className="space-y-6 sm:space-y-10">
      
      {/* 1. Hero Gateway */}
      <Hero
        onNavigate={onNavigate}
        lang={lang}
        theme={theme}
        whatsappLine={whatsappLine}
      />

      {/* 2. Horizontal Scroll Carousel 1: Best Sellers & Featured */}
      <HorizontalProductCarousel
        title={t.bestSellers}
        subtitle="Sélectionnées pour leur popularité et leur efficacité naturelle"
        products={bestSellers}
        onSelectProduct={onSelectProduct}
        onAddToCart={onAddToCart}
        cartProductIds={cartProductIds}
        lang={lang}
        theme={theme}
      />

      {/* 3. Horizontal Scroll Carousel 2: Légumes Lacto-fermentés */}
      <HorizontalProductCarousel
        title={t.lactoTitle}
        subtitle={t.lactoSubtitle}
        products={lactoProducts}
        onSelectProduct={onSelectProduct}
        onAddToCart={onAddToCart}
        cartProductIds={cartProductIds}
        onViewCategory={() => onNavigate({ type: 'category', family: 'lacto-fermentes' })}
        viewAllLabel={t.seeAll}
        lang={lang}
        theme={theme}
      />

      {/* 4. Pack Découverte Terroir (-10%) */}
      <PackDecouverte
        promo={promo}
        lang={lang}
        theme={theme}
        whatsappLine={whatsappLine}
      />

      {/* 5. Horizontal Scroll Carousel 3: Huiles de Macération (50 ml) */}
      <HorizontalProductCarousel
        title={t.oilsTitle}
        subtitle={t.oilsSubtitle}
        products={oilProducts}
        onSelectProduct={onSelectProduct}
        onAddToCart={onAddToCart}
        cartProductIds={cartProductIds}
        onViewCategory={() => onNavigate({ type: 'category', family: 'huiles' })}
        viewAllLabel={t.seeAll}
        lang={lang}
        theme={theme}
      />

      {/* 6. Horizontal Scroll Carousel 4: Savons Luffa & Crèmes Métal */}
      <HorizontalProductCarousel
        title="🫧 Savons à la Luffa (45 DH) & 🍯 Baumes Purs (70-80 DH)"
        subtitle="Soins corporels sans compromis, sans eau ajoutée"
        products={soapAndCreamProducts}
        onSelectProduct={onSelectProduct}
        onAddToCart={onAddToCart}
        cartProductIds={cartProductIds}
        onViewCategory={() => onNavigate({ type: 'category', family: 'cremes' })}
        viewAllLabel={t.seeAll}
        lang={lang}
        theme={theme}
      />

      {/* 7. Charte de fabrication artisanale */}
      <ArtisanalPhilosophy />

      {/* 8. Comment commander sur WhatsApp */}
      <HowToOrder />

      {/* 9. FAQ Section */}
      <FaqSection />

    </div>
  );
};
