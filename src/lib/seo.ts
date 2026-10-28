import { Language, Product } from '../types/index.ts';
import { absoluteUrl } from './router.ts';

/**
 * Keeps the document title, description, canonical URL, social cards and structured data
 * in sync with the page being shown (the app is a single-page app, so the static
 * index.html alone would describe every page the same way).
 */

export interface SeoInput {
  title: string;
  description: string;
  path: string;
  image?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | null;
}

const DEFAULT_IMAGE = '/assets/og-cover.jpg';

function setMeta(selector: string, attribute: 'name' | 'property', key: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attribute, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function applySeo(input: SeoInput): void {
  const url = absoluteUrl(input.path);
  const image = absoluteUrl(input.image || DEFAULT_IMAGE);

  document.title = input.title;
  setMeta('meta[name="description"]', 'name', 'description', input.description);
  setMeta('meta[name="robots"]', 'name', 'robots', input.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1');

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', url);

  setMeta('meta[property="og:title"]', 'property', 'og:title', input.title);
  setMeta('meta[property="og:description"]', 'property', 'og:description', input.description);
  setMeta('meta[property="og:url"]', 'property', 'og:url', url);
  setMeta('meta[property="og:image"]', 'property', 'og:image', image);
  setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', input.title);
  setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', input.description);
  setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', image);

  // Page-specific structured data (a JSON block is data, so the strict CSP does not touch it)
  let script = document.getElementById('page-jsonld');
  if (!input.jsonLd) {
    script?.remove();
    return;
  }
  if (!script) {
    script = document.createElement('script');
    script.id = 'page-jsonld';
    script.setAttribute('type', 'application/ld+json');
    document.head.appendChild(script);
  }
  // "<" is escaped so that no catalogue text can ever close the script element
  script.textContent = JSON.stringify(input.jsonLd).replace(/</g, '\\u003c');
}

export function localized(lang: Language, fr: string, ar?: string, en?: string): string {
  if (lang === 'ar' && ar) return ar;
  if (lang === 'en' && en) return en;
  return fr;
}

export function productJsonLd(product: Product, lang: Language): Record<string, unknown> {
  const path = `/produit/${product.id}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: localized(lang, product.nom, product.nomAr, product.nomEn),
    description: localized(lang, product.description, product.descriptionAr, product.descriptionEn),
    sku: product.id,
    category: product.familleLabel,
    ...(product.image ? { image: [absoluteUrl(product.image)] } : {}),
    brand: { '@type': 'Brand', name: 'Rachid Potagiste' },
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(path),
      priceCurrency: 'MAD',
      price: product.prix,
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.enStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'Rachid Potagiste' },
    },
  };
}
