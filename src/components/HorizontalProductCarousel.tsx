import React, { useRef } from 'react';
import { Product, Language, AppTheme } from '../types/index.ts';
import { ProductCard } from './ProductCard.tsx';
import { ChevronLeft, ChevronRight, ArrowRight, ArrowLeft } from 'lucide-react';

interface HorizontalProductCarouselProps {
  title: string;
  subtitle?: string;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  cartProductIds: Set<string>;
  onViewCategory?: () => void;
  viewAllLabel?: string;
  lang: Language;
  theme: AppTheme;
}

export const HorizontalProductCarousel: React.FC<HorizontalProductCarouselProps> = ({
  title,
  subtitle,
  products,
  onSelectProduct,
  onAddToCart,
  cartProductIds,
  onViewCategory,
  viewAllLabel = 'Voir tout',
  lang,
  theme,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isRtl = lang === 'ar';

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const distance = 340;
    const current = scrollRef.current.scrollLeft;
    
    // In RTL, native scroll directions can invert depending on browser,
    // so using scrollBy with smooth behavior handles both cleanly
    const sign = direction === 'left' ? -1 : 1;
    scrollRef.current.scrollBy({ left: sign * distance, behavior: 'smooth' });
  };

  if (products.length === 0) return null;

  return (
    <section className="py-8 sm:py-10 border-b border-[#E5DFC9] dark:border-[#273D2C] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header Row */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
          <div>
            <h2 className="font-title text-xl sm:text-2xl md:text-3xl font-black text-[#1F3D2B] dark:text-[#F4F1EA]">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs sm:text-sm text-[#8C6D23] dark:text-[#E5B834] font-medium mt-1">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onViewCategory && (
              <button
                onClick={onViewCategory}
                className="text-xs sm:text-sm font-bold text-[#3F6B2E] dark:text-[#528B3E] hover:underline flex items-center gap-1 cursor-pointer mr-2 rtl:ml-2 rtl:mr-0"
              >
                <span>{viewAllLabel}</span>
                {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            )}

            {/* Left and Right navigation buttons */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => scroll(isRtl ? 'right' : 'left')}
                className="w-9 h-9 rounded-full bg-[#FBFAF5] dark:bg-[#152219] border border-[#E5DFC9] dark:border-[#273D2C] text-[#1F3D2B] dark:text-[#F4F1EA] flex items-center justify-center hover:bg-[#1F3D2B] hover:text-white dark:hover:bg-[#E5B834] dark:hover:text-[#0D140F] transition-all shadow-xs cursor-pointer active:scale-90"
                aria-label="Faire défiler vers la gauche"
              >
                <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
              </button>
              <button
                onClick={() => scroll(isRtl ? 'left' : 'right')}
                className="w-9 h-9 rounded-full bg-[#FBFAF5] dark:bg-[#152219] border border-[#E5DFC9] dark:border-[#273D2C] text-[#1F3D2B] dark:text-[#F4F1EA] flex items-center justify-center hover:bg-[#1F3D2B] hover:text-white dark:hover:bg-[#E5B834] dark:hover:text-[#0D140F] transition-all shadow-xs cursor-pointer active:scale-90"
                aria-label="Faire défiler vers la droite"
              >
                <ChevronRight className="w-5 h-5 rtl:rotate-180" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal scroll container with snap */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-4 pt-1 px-1 -mx-4 sm:mx-0 px-4 sm:px-0"
          style={{ scrollBehavior: 'smooth' }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="w-[280px] sm:w-[310px] shrink-0 snap-start"
            >
              <ProductCard
                product={product}
                onSelect={onSelectProduct}
                onAddToCart={onAddToCart}
                isInCart={cartProductIds.has(product.id)}
                lang={lang}
                theme={theme}
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
