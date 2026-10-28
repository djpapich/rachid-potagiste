import { CartItem, CustomerOrderInfo, Language, Product, ProductFamily, PromoConfig } from '../types/index.ts';

/**
 * Input hardening for the storefront.
 * Everything that comes from outside the code (JSON files, localStorage, form fields)
 * goes through this module before it is rendered, priced or put in a WhatsApp message.
 */

export const MAX_QTY = 99;
export const MAX_PROMO_PERCENT = 50;

export const LIMITS = {
  nom: 80,
  ville: 60,
  adresse: 200,
  telephone: 20,
  notes: 300,
} as const;

const FAMILIES: ProductFamily[] = ['lacto-fermentes', 'huiles', 'savons', 'cremes'];
const ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,63}$/i;
const HEX_COLOR = /^#[0-9a-f]{3,8}$/i;
const FALLBACK_COLOR = '#1F3D2B';

// ---------------------------------------------------------------------------
// Text cleaning
// ---------------------------------------------------------------------------

// Control characters, zero-width and bidirectional-override characters
// (the latter are used to visually spoof text).
const INVISIBLE = /[\u0000-\u001F\u007F-\u009F​-‏‪-‮⁠-⁤⁦-⁩﻿]/g;

export function cleanText(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\r\n\t]+/g, ' ')
    .replace(INVISIBLE, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

export function clampQuantity(value: unknown): number {
  const n = typeof value === 'number' ? Math.floor(value) : NaN;
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(MAX_QTY, n);
}

// ---------------------------------------------------------------------------
// Catalogue (public/data/products.json)
// ---------------------------------------------------------------------------

const REQUIRED_STRINGS = [
  'nom',
  'familleLabel',
  'accroche',
  'contenance',
  'poidsNet',
  'image',
  'imagePng',
  'description',
  'ingredients',
  'conseils',
  'conservation',
  'precautions',
] as const;

// An empty path means "no photo yet" (the site shows a placeholder).
// Otherwise only a local /assets/... image is accepted: no external hosts, no schemes, no "..".
const IMAGE_PATH = /^\/assets\/[A-Za-z0-9/_.-]+\.(webp|jpg|jpeg|png)$/;

function isSafeImagePath(value: string): boolean {
  return value === '' || (IMAGE_PATH.test(value) && !value.includes('..'));
}

function toProduct(raw: unknown): Product | null {
  if (!raw || typeof raw !== 'object') return null;
  const p = raw as Record<string, unknown>;

  if (typeof p.id !== 'string' || !ID_PATTERN.test(p.id)) return null;
  if (!FAMILIES.includes(p.famille as ProductFamily)) return null;
  if (typeof p.prix !== 'number' || !Number.isFinite(p.prix) || p.prix < 0 || p.prix > 100000) return null;
  for (const key of REQUIRED_STRINGS) {
    if (typeof p[key] !== 'string') return null;
  }
  if (!isSafeImagePath(p.image as string) || !isSafeImagePath(p.imagePng as string)) return null;
  if (!Array.isArray(p.badges) || !Array.isArray(p.pointsForts)) return null;

  return {
    ...(p as unknown as Product),
    prix: Math.round(p.prix),
    couleur: typeof p.couleur === 'string' && HEX_COLOR.test(p.couleur) ? p.couleur : FALLBACK_COLOR,
    enStock: p.enStock !== false,
  };
}

export function sanitizeProducts(raw: unknown): Product[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const result: Product[] = [];
  for (const item of raw) {
    const product = toProduct(item);
    if (product && !seen.has(product.id)) {
      seen.add(product.id);
      result.push(product);
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Promotion (public/data/promo.json)
// ---------------------------------------------------------------------------

export function sanitizePromo(raw: unknown): PromoConfig | null {
  if (!raw || typeof raw !== 'object') return null;
  const p = raw as Record<string, unknown>;
  const pack = p.packDecouverte as Record<string, unknown> | undefined;

  if (typeof p.code !== 'string' || !/^[a-z0-9_-]{3,32}$/i.test(p.code)) return null;
  if (typeof p.remisePourcentage !== 'number' || !Number.isFinite(p.remisePourcentage)) return null;
  if (!pack || typeof pack !== 'object') return null;

  // An end date that is present but unreadable disables the promotion (fail closed).
  const hasEndDate = typeof p.dateFin === 'string' && p.dateFin.length > 0;
  const endDateValid = hasEndDate && !Number.isNaN(Date.parse(p.dateFin as string));

  return {
    ...(p as unknown as PromoConfig),
    active: p.active === true && (!hasEndDate || endDateValid),
    code: p.code.toUpperCase(),
    remisePourcentage: Math.min(MAX_PROMO_PERCENT, Math.max(0, Math.round(p.remisePourcentage))),
    dateFin: hasEndDate ? (p.dateFin as string) : '',
  };
}

export function isPromoRunning(promo: PromoConfig | null, now: number = Date.now()): boolean {
  if (!promo || !promo.active) return false;
  if (!promo.dateFin) return true;
  const end = Date.parse(promo.dateFin);
  return Number.isFinite(end) && end > now;
}

export type PromoCheck = 'ok' | 'invalid' | 'expired';

export function checkPromoCode(promo: PromoConfig | null, input: string): PromoCheck {
  const code = cleanText(input, 32).toUpperCase();
  if (!promo || !promo.active || !code || code !== promo.code.toUpperCase()) return 'invalid';
  return isPromoRunning(promo) ? 'ok' : 'expired';
}

/** Discount percentage actually applicable right now (0 when no / expired promo). */
export function promoPercent(promo: PromoConfig | null, appliedCode: string | null): number {
  if (!appliedCode || !promo || !isPromoRunning(promo)) return 0;
  if (appliedCode.toUpperCase() !== promo.code.toUpperCase()) return 0;
  return Math.min(MAX_PROMO_PERCENT, Math.max(0, promo.remisePourcentage));
}

export function promoErrorMessage(result: PromoCheck, lang: Language): string {
  const messages: Record<PromoCheck, Record<Language, string>> = {
    ok: { fr: '', ar: '', en: '' },
    invalid: {
      fr: 'Code promo invalide.',
      ar: 'كود التخفيض غير صالح.',
      en: 'Invalid promo code.',
    },
    expired: {
      fr: "Ce code promo a expiré.",
      ar: 'انتهت صلاحية كود التخفيض.',
      en: 'This promo code has expired.',
    },
  };
  return messages[result][lang];
}

// ---------------------------------------------------------------------------
// Cart (localStorage)
// ---------------------------------------------------------------------------

export interface StoredCartLine {
  id: string;
  quantity: number;
}

/**
 * Reads the saved cart. Accepts the current format ([{ id, quantity }]) and the legacy one
 * ([{ product: { id }, quantity }]) but only ever keeps the product id and the quantity:
 * names and prices are always taken from the catalogue, never from the browser storage.
 */
export function parseStoredCart(raw: string | null): StoredCartLine[] {
  if (!raw || raw.length > 100_000) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    const lines: StoredCartLine[] = [];
    for (const entry of data.slice(0, 100)) {
      if (!entry || typeof entry !== 'object') continue;
      const e = entry as Record<string, unknown>;
      const nested = e.product && typeof e.product === 'object' ? (e.product as Record<string, unknown>).id : undefined;
      const id = typeof e.id === 'string' ? e.id : nested;
      if (typeof id === 'string' && ID_PATTERN.test(id)) {
        lines.push({ id, quantity: clampQuantity(e.quantity) });
      }
    }
    return lines;
  } catch {
    return [];
  }
}

/** Rebuilds cart items from stored lines using the trusted catalogue. */
export function hydrateCart(lines: StoredCartLine[], catalog: Product[]): CartItem[] {
  const byId = new Map(catalog.map((p) => [p.id, p]));
  const merged = new Map<string, number>();
  for (const line of lines) {
    const product = byId.get(line.id);
    if (!product || !product.enStock) continue;
    merged.set(line.id, Math.min(MAX_QTY, (merged.get(line.id) ?? 0) + line.quantity));
  }
  return [...merged].map(([id, quantity]) => ({ product: byId.get(id) as Product, quantity }));
}

// ---------------------------------------------------------------------------
// Delivery form
// ---------------------------------------------------------------------------

export type OrderField = 'nom' | 'ville' | 'adresse' | 'telephone';

const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}' .\-]{1,79}$/u;
const CITY_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}\p{N}' .\-]{1,59}$/u;
const MA_PHONE = /^(?:\+212|00212|0)[5-7]\d{8}$/;
const INTL_PHONE = /^\+[1-9]\d{7,14}$/;

export function isValidPhone(value: string): boolean {
  const compact = value.replace(/[\s.\-()]/g, '');
  return MA_PHONE.test(compact) || INTL_PHONE.test(compact);
}

const ORDER_MESSAGES: Record<OrderField, Record<Language, string>> = {
  nom: {
    fr: 'Entrez votre nom complet (lettres uniquement).',
    ar: 'أدخل اسمك الكامل (حروف فقط).',
    en: 'Enter your full name (letters only).',
  },
  ville: {
    fr: 'Entrez votre ville.',
    ar: 'أدخل اسم مدينتك.',
    en: 'Enter your city.',
  },
  adresse: {
    fr: 'Entrez une adresse de livraison plus précise (5 caractères minimum).',
    ar: 'أدخل عنوان توصيل أدق (5 أحرف على الأقل).',
    en: 'Enter a more precise delivery address (5 characters minimum).',
  },
  telephone: {
    fr: 'Numéro invalide (ex : 06 12 34 56 78 ou +212612345678).',
    ar: 'رقم هاتف غير صالح (مثال: 06 12 34 56 78 أو ‎+212612345678).',
    en: 'Invalid phone number (e.g. 06 12 34 56 78 or +212612345678).',
  },
};

export interface OrderValidation {
  ok: boolean;
  errors: Partial<Record<OrderField, string>>;
  clean: CustomerOrderInfo;
}

export function validateOrderInfo(info: CustomerOrderInfo, lang: Language): OrderValidation {
  const clean: CustomerOrderInfo = {
    ...info,
    nom: cleanText(info.nom, LIMITS.nom),
    ville: cleanText(info.ville, LIMITS.ville),
    adresse: cleanText(info.adresse, LIMITS.adresse),
    telephone: cleanText(info.telephone, LIMITS.telephone),
    notes: cleanText(info.notes, LIMITS.notes),
  };

  const errors: Partial<Record<OrderField, string>> = {};
  if (!NAME_PATTERN.test(clean.nom)) errors.nom = ORDER_MESSAGES.nom[lang];
  if (!CITY_PATTERN.test(clean.ville)) errors.ville = ORDER_MESSAGES.ville[lang];
  if (clean.adresse.length < 5) errors.adresse = ORDER_MESSAGES.adresse[lang];
  if (!isValidPhone(clean.telephone)) errors.telephone = ORDER_MESSAGES.telephone[lang];

  return { ok: Object.keys(errors).length === 0, errors, clean };
}
