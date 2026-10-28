import React, { useCallback, useState } from 'react';
import { Leaf } from 'lucide-react';
import { Language } from '../types/index.ts';
import { productSrcSet } from '../lib/imageHelper.ts';
import { translations } from '../lib/translations.ts';

interface ProductImageProps {
  src: string;
  alt: string;
  /** Responsive hint, e.g. "(min-width:1024px) 25vw, 50vw". */
  sizes?: string;
  /** Above-the-fold image: loaded immediately with high priority. */
  priority?: boolean;
  className?: string;
  lang?: Language;
}

/** Neutral stand-in shown when the real photo of a product has not been supplied yet. */
export const PhotoPlaceholder: React.FC<{ label: string; compact?: boolean }> = ({ label, compact }) => (
  <div
    role="img"
    aria-label={label}
    className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#8C6D23] dark:text-[#E5B834] bg-[#EFECE3] dark:bg-[#1C2D21] rounded-xl"
  >
    <Leaf className={compact ? 'w-5 h-5' : 'w-10 h-10 opacity-70'} aria-hidden="true" />
    {!compact && <span className="text-[11px] font-semibold text-center px-3 leading-tight">{label}</span>}
  </div>
);

/**
 * A product photo that never shows a broken-image icon: skeleton while loading,
 * responsive WebP sources, fixed dimensions (no layout shift) and a placeholder on failure.
 */
export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  sizes = '(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 80vw',
  priority = false,
  className = 'w-full h-full object-contain',
  lang = 'fr',
}) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const t = translations[lang] || translations.fr;

  // Cached images can be complete before React attaches onLoad
  const attach = useCallback((img: HTMLImageElement | null) => {
    if (img && img.complete && img.naturalWidth > 0) setLoaded(true);
  }, []);

  if (!src || failed) {
    return <PhotoPlaceholder label={t.photoSoon} compact={className.includes('compact')} />;
  }

  return (
    <div className="relative w-full h-full">
      {!loaded && <div className="skeleton absolute inset-0 rounded-xl" aria-hidden="true" />}
      <img
        ref={attach}
        src={src}
        srcSet={productSrcSet(src)}
        sizes={productSrcSet(src) ? sizes : undefined}
        alt={alt}
        width={800}
        height={800}
        decoding="async"
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
};
