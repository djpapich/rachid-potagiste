import React from 'react';

export const ProductCardSkeleton: React.FC = () => (
  <div
    className="bg-[#FBFAF5] dark:bg-[#152219] rounded-2xl border border-[#E5DFC9] dark:border-[#273D2C] overflow-hidden"
    aria-hidden="true"
  >
    <div className="skeleton aspect-square w-full" />
    <div className="p-4 sm:p-5 space-y-3">
      <div className="skeleton h-3 w-1/3 rounded" />
      <div className="skeleton h-5 w-3/4 rounded" />
      <div className="skeleton h-3 w-full rounded" />
      <div className="skeleton h-3 w-2/3 rounded" />
      <div className="skeleton h-9 w-full rounded-xl mt-2" />
    </div>
  </div>
);

export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6" role="status" aria-label="Chargement">
    {Array.from({ length: count }, (_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);
