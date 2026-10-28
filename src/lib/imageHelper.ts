import { Product } from '../types/index.ts';

/**
 * Product photos are shipped as <id>-400.webp, <id>-800.webp and <id>-1200.webp
 * (plus <id>-cutout.webp for the transparent version). The catalogue stores the -800 file.
 * An empty path means the real photo has not been supplied yet.
 */

export function hasPhoto(product: Pick<Product, 'image'>): boolean {
  return Boolean(product.image);
}

export function productSrcSet(src: string): string | undefined {
  if (!/-800\.webp$/.test(src)) return undefined;
  const base = src.replace(/-800\.webp$/, '');
  return `${base}-400.webp 400w, ${base}-800.webp 800w, ${base}-1200.webp 1200w`;
}

/** Products with a real photo first, so the shop window never opens on a placeholder. */
export function photoFirst<T extends Pick<Product, 'image'>>(products: T[]): T[] {
  return [...products].sort((a, b) => Number(hasPhoto(b)) - Number(hasPhoto(a)));
}
