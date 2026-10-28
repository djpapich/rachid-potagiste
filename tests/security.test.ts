import assert from 'node:assert/strict';
import {
  checkPromoCode,
  cleanText,
  clampQuantity,
  hydrateCart,
  isValidPhone,
  parseStoredCart,
  promoPercent,
  sanitizeProducts,
  sanitizePromo,
  validateOrderInfo,
} from '../src/lib/validation.ts';
import { getCartWhatsAppUrl } from '../src/lib/whatsapp.ts';
import { FAMILIES, pageToPath, pathToPage } from '../src/lib/router.ts';
import { hasPhoto, photoFirst, productSrcSet } from '../src/lib/imageHelper.ts';
import fs from 'node:fs';

const catalogRaw = JSON.parse(fs.readFileSync('public/data/products.json', 'utf8'));
const promoRaw = JSON.parse(fs.readFileSync('public/data/promo.json', 'utf8'));
let passed = 0;
const test = (name: string, fn: () => void) => {
  fn();
  passed++;
  console.log('  ok  ' + name);
};

// --- catalogue & promo files that ship with the site must pass their own validation
const catalog = sanitizeProducts(catalogRaw);
test('real catalogue: all 20 products valid', () => assert.equal(catalog.length, 20));
test('real promo file is valid', () => assert.ok(sanitizePromo(promoRaw)));

// --- text cleaning
test('bidi override + zero-width + newlines stripped', () =>
  assert.equal(cleanText('Ali‮baba​\nX', 50), 'AlibabaX'.replace('X', ' X')));
test('length is capped', () => assert.equal(cleanText('a'.repeat(500), 80).length, 80));
test('non-strings become empty', () => assert.equal(cleanText({ a: 1 }, 10), ''));

// --- quantity
test('quantity clamp: negative, NaN, huge, float', () => {
  assert.equal(clampQuantity(-5), 1);
  assert.equal(clampQuantity(NaN), 1);
  assert.equal(clampQuantity(1e9), 99);
  assert.equal(clampQuantity(2.9), 2);
  assert.equal(clampQuantity('5'), 1);
});

// --- cart tampering: attacker edits localStorage to set a 1 MAD price and an unknown product
const tampered = JSON.stringify([
  { product: { id: 'creme-ortie', prix: 1, nom: 'HACKED' }, quantity: 3 },
  { id: '../../etc/passwd', quantity: 1 },
  { id: '<script>alert(1)</script>', quantity: 1 },
  { id: 'creme-ortie', quantity: 500 },
  { id: 'does-not-exist', quantity: 2 },
]);
const hydrated = hydrateCart(parseStoredCart(tampered), catalog);
test('tampered cart: only the real product survives', () => assert.equal(hydrated.length, 1));
test('tampered cart: price comes from catalogue, not storage', () => {
  assert.equal(hydrated[0].product.prix, catalog.find((p) => p.id === 'creme-ortie')!.prix);
  assert.notEqual(hydrated[0].product.nom, 'HACKED');
});
test('tampered cart: quantity capped at 99', () => assert.equal(hydrated[0].quantity, 99));
test('garbage / oversized storage is ignored', () => {
  assert.deepEqual(parseStoredCart('not json'), []);
  assert.deepEqual(parseStoredCart('x'.repeat(200_000)), []);
  assert.deepEqual(parseStoredCart('{"a":1}'), []);
});

// --- catalogue poisoning
test('malicious product entries are rejected / neutralised', () => {
  const evil = [
    { ...catalogRaw[0], id: '"><img src=x onerror=alert(1)>' },
    { ...catalogRaw[1], prix: -10 },
    { ...catalogRaw[2], prix: 'free' },
    { ...catalogRaw[3], image: 'javascript:alert(1)' },
    { ...catalogRaw[4], famille: 'weapons' },
    { ...catalogRaw[5], couleur: 'red;background:url(//evil)' },
    'string',
    null,
  ];
  const out = sanitizeProducts(evil);
  assert.equal(out.length, 1);
  assert.equal(out[0].couleur, '#1F3D2B');
});

// --- promo
const promo = sanitizePromo(promoRaw)!;
const before = Date.parse(promo.dateFin) - 1000;
test('promo code is case/space tolerant and valid before the end date', () => {
  const realNow = Date.now;
  Date.now = () => before;
  assert.equal(checkPromoCode(promo, '  potager10 '), 'ok');
  assert.equal(promoPercent(promo, 'POTAGER10'), 10);
  Date.now = realNow;
});
test('promo code is refused after the end date', () => {
  const realNow = Date.now;
  Date.now = () => Date.parse(promo.dateFin) + 1000;
  assert.equal(checkPromoCode(promo, 'POTAGER10'), 'expired');
  assert.equal(promoPercent(promo, 'POTAGER10'), 0);
  Date.now = realNow;
});
test('wrong code / empty / other-length codes are invalid', () => {
  assert.equal(checkPromoCode(promo, 'FREE100'), 'invalid');
  assert.equal(checkPromoCode(promo, ''), 'invalid');
});
test('promo percentage can never exceed 50 even if the JSON says 100', () => {
  const p = sanitizePromo({ ...promoRaw, remisePourcentage: 100 })!;
  assert.equal(p.remisePourcentage, 50);
});
test('unreadable end date disables the promo (fail closed)', () => {
  const p = sanitizePromo({ ...promoRaw, dateFin: 'not-a-date' })!;
  assert.equal(p.active, false);
});

// --- phone numbers
test('phone validation', () => {
  for (const ok of ['06 12 34 56 78', '0612345678', '+212612345678', '00212612345678', '07.21.04.58.01', '+33612345678'])
    assert.ok(isValidPhone(ok), ok);
  for (const bad of ['', '123', 'abcdefghij', '0412345678', '06123', '<script>', '+0123456789'])
    assert.ok(!isValidPhone(bad), bad);
});

// --- order form
test('valid order form passes', () =>
  assert.ok(
    validateOrderInfo({ nom: 'Mohamed Alami', ville: 'Bouznika', adresse: 'Rue 5, N 12', telephone: '0612345678' }, 'fr').ok
  ));
test('Arabic names and cities are accepted', () =>
  assert.ok(validateOrderInfo({ nom: 'محمد العلمي', ville: 'الدار البيضاء', adresse: 'حي النخيل زنقة 5', telephone: '0612345678' }, 'ar').ok));
test('empty / script / too-short fields are rejected with messages', () => {
  const v = validateOrderInfo({ nom: '<b>x</b>', ville: '', adresse: 'ab', telephone: 'xx' }, 'en');
  assert.equal(v.ok, false);
  assert.equal(Object.keys(v.errors).length, 4);
});

// --- WhatsApp message injection / spoofing
test('WhatsApp URL: control chars stripped, discount clamped, only wa.me, no raw newline injection', () => {
  const item = { product: catalog[0], quantity: 9999 };
  const url = getCartWhatsAppUrl(
    [item],
    { nom: 'Ali‮\r\n*TOTAL: 0 DH*', ville: 'Rabat', adresse: 'x'.repeat(1000), telephone: '0612345678', notes: 'n'.repeat(1000) },
    100,
    'POTAGER10'
  );
  assert.ok(url.startsWith('https://wa.me/'));
  const text = decodeURIComponent(url.split('?text=')[1]);
  assert.ok(!/‮/.test(text));
  assert.ok(!text.includes('Ali\r'));
  assert.ok(text.includes('99×'), 'quantity capped at 99');
  assert.ok(text.includes('-50%'), 'discount capped at 50%');
  assert.ok(text.length < 2500, 'message length bounded');
});

// --- image paths in the catalogue
test('image paths: only local /assets files (or empty = placeholder)', () => {
  const base = catalogRaw[0];
  const keep = (image: string) => sanitizeProducts([{ ...base, image }]).length === 1;
  assert.ok(keep(''));
  assert.ok(keep('/assets/products-web/huile-ortie-800.webp'));
  for (const bad of ['https://evil.example/x.jpg', '//evil.example/x.jpg', '/assets/../etc/passwd', 'javascript:alert(1)', 'data:image/svg+xml,<svg onload=alert(1)>', '/images/x.jpg', '/assets/x.svg'])
    assert.ok(!keep(bad), bad);
});
test('every real product photo exists on disk, and photo-less products are flagged', () => {
  for (const p of catalog) {
    if (hasPhoto(p)) {
      assert.ok(fs.existsSync('public' + p.image), p.image);
      assert.ok(fs.existsSync('public' + p.imagePng), p.imagePng);
      assert.ok(productSrcSet(p.image)!.includes('-1200.webp 1200w'));
    }
  }
  assert.deepEqual(catalog.filter((p) => !hasPhoto(p)).map((p) => p.id).sort(), ['huile-aloe-vera', 'huile-camomille']);
});
test('products with a photo are listed before products without', () => {
  const sorted = photoFirst(catalog);
  const firstEmpty = sorted.findIndex((p) => !hasPhoto(p));
  assert.ok(sorted.slice(firstEmpty).every((p) => !hasPhoto(p)));
});

// --- router
test('router: every page maps to a URL and back', () => {
  const pages = [
    { type: 'home' }, { type: 'cart' }, { type: 'about' }, { type: 'contact' },
    ...FAMILIES.map((family) => ({ type: 'category', family })),
    ...catalog.map((p) => ({ type: 'product', productId: p.id })),
  ] as Parameters<typeof pageToPath>[0][];
  for (const page of pages) assert.deepEqual(pathToPage(pageToPath(page)), page);
});
test('router: hostile or unknown paths are "notfound"', () => {
  for (const bad of ['/produit/<script>alert(1)</script>', '/categorie/../etc', '/categorie/weapons', '/produit/', '/produit/a/b', '/%E0%A4%A', '/admin', '/produit/' + 'a'.repeat(100)])
    assert.equal(pathToPage(bad).type, 'notfound', bad);
  assert.equal(pathToPage('/panier/').type, 'cart');
});


// --- regression: a filled transform animation turns <main> into the containing block of
// every position:fixed child (sticky buy bar ends up at the bottom of the page, not the screen)
test('css: entrance animations never keep a filled transform (fill-mode both/forwards)', () => {
  const css = fs.readFileSync('src/index.css', 'utf8');
  for (const m of css.matchAll(/\.(page-enter|toast-in)\s*\{([^}]*)\}/g)) {
    assert.ok(!/\b(both|forwards)\b/.test(m[2]), `.${m[1]} must not use fill-mode both/forwards`);
  }
});

console.log(`\n${passed} security tests passed`);
