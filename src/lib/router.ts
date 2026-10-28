import { PageView, ProductFamily } from '../types/index.ts';

/**
 * Tiny History-API router: every page has a real URL that can be bookmarked,
 * shared on WhatsApp, indexed by search engines and reached with the back button.
 *
 *   /                      home
 *   /categorie/<famille>   category
 *   /produit/<id>          product
 *   /panier                cart
 *   /a-propos              about
 *   /contact               contact
 */

export const SITE_URL = 'https://rachidpotagiste.netlify.app';

export const FAMILIES: ProductFamily[] = ['lacto-fermentes', 'huiles', 'savons', 'cremes'];
const ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,63}$/i;

export function pageToPath(page: PageView): string {
  switch (page.type) {
    case 'home':
      return '/';
    case 'category':
      return `/categorie/${page.family}`;
    case 'product':
      return `/produit/${encodeURIComponent(page.productId)}`;
    case 'cart':
      return '/panier';
    case 'about':
      return '/a-propos';
    case 'contact':
      return '/contact';
    default:
      return '/introuvable';
  }
}

export function pathToPage(pathname: string): PageView {
  let path = pathname || '/';
  try {
    path = decodeURIComponent(path);
  } catch {
    return { type: 'notfound' };
  }
  path = path.replace(/\/+$/, '') || '/';

  if (path === '/' || path === '/index.html') return { type: 'home' };
  if (path === '/panier') return { type: 'cart' };
  if (path === '/a-propos') return { type: 'about' };
  if (path === '/contact') return { type: 'contact' };

  const category = /^\/categorie\/([a-z-]+)$/.exec(path);
  if (category && FAMILIES.includes(category[1] as ProductFamily)) {
    return { type: 'category', family: category[1] as ProductFamily };
  }

  const product = /^\/produit\/([^/]+)$/.exec(path);
  if (product && ID_PATTERN.test(product[1])) {
    return { type: 'product', productId: product[1] };
  }

  return { type: 'notfound' };
}

export function absoluteUrl(path: string): string {
  return SITE_URL + (path.startsWith('/') ? path : `/${path}`);
}
