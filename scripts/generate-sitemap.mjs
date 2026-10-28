// Generates public/sitemap.xml from the real catalogue (run automatically before `npm run build`).
// Every page has its own URL: home, 4 categories, every product, about and contact.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://rachidpotagiste.netlify.app';
const products = JSON.parse(readFileSync(path.join(root, 'public/data/products.json'), 'utf8'));
const today = new Date().toISOString().slice(0, 10);

const pages = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  ...['lacto-fermentes', 'huiles', 'savons', 'cremes'].map((f) => ({ loc: `/categorie/${f}`, changefreq: 'weekly', priority: '0.9' })),
  ...products.map((p) => ({ loc: `/produit/${p.id}`, changefreq: 'monthly', priority: '0.8' })),
  { loc: '/a-propos', changefreq: 'monthly', priority: '0.5' },
  { loc: '/contact', changefreq: 'monthly', priority: '0.5' },
];

const xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  pages
    .map(
      (p) =>
        `  <url>\n    <loc>${SITE}${p.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`
    )
    .join('\n') +
  '\n</urlset>\n';

writeFileSync(path.join(root, 'public/sitemap.xml'), xml);
console.log(`sitemap.xml: ${pages.length} URLs`);
