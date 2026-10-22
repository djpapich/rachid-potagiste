import React from 'react';
import { Product, ProductFamily } from '../types/index.ts';
import { ProductCard } from './ProductCard.tsx';
import { Sparkles, Leaf, Droplet, Sun, Flower2 } from 'lucide-react';

interface ProductFamilySectionProps {
  id: string;
  family: ProductFamily;
  title: string;
  subtitle: string;
  handwrittenQuote: string;
  description: string;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  cartProductIds: Set<string>;
}

export const ProductFamilySection: React.FC<ProductFamilySectionProps> = ({
  id,
  family,
  title,
  subtitle,
  handwrittenQuote,
  description,
  products,
  onSelectProduct,
  onAddToCart,
  cartProductIds,
}) => {
  const familyIcons: Record<ProductFamily, React.ReactNode> = {
    'lacto-fermentes': <Leaf className="w-5 h-5 text-[#3F6B2E]" />,
    'huiles': <Droplet className="w-5 h-5 text-[#C9A227]" />,
    'savons': <Flower2 className="w-5 h-5 text-[#3F6B2E]" />,
    'cremes': <Sun className="w-5 h-5 text-[#C9A227]" />,
  };

  return (
    <section id={id} className="py-14 sm:py-18 border-b border-[#E5DFC9] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-[#EAE4D2] border border-[#D7CEBA]">
              {familyIcons[family]}
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-[#8C6D23]">
              {subtitle}
            </span>
          </div>

          <h2 className="font-title text-2xl sm:text-3xl md:text-4xl font-black text-[#1F3D2B] mb-2">
            {title}
          </h2>

          <p className="font-script text-xl sm:text-2xl text-[#8C6D23] font-bold mb-3 italic">
            « {handwrittenQuote} »
          </p>

          <p className="text-sm sm:text-base text-[#1F3D2B]/80 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Product Grid: 2 columns mobile, 3 columns tablet, 4 columns desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onAddToCart={onAddToCart}
              isInCart={cartProductIds.has(product.id)}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
