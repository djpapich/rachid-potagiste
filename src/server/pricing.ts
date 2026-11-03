import { MAX_PROMO_PERCENT, MAX_QTY } from '../lib/validation.ts';

/**
 * Pure order pricing. The server never trusts a price, name or total sent by the browser:
 * everything is recomputed here from the catalogue and the promotion rules.
 */

export type OrderErrorCode =
  | 'empty_order'
  | 'unknown_product'
  | 'invalid_quantity'
  | 'out_of_stock'
  | 'promo_invalid'
  | 'promo_expired'
  | 'promo_exhausted'
  | 'promo_min_subtotal';

export class OrderError extends Error {
  constructor(
    public code: OrderErrorCode,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
  }
}

export interface CatalogEntry {
  id: string;
  name: string;
  price: number;
  stock: number;
  active: boolean;
}

export interface PromoRule {
  code: string;
  percent: number;
  active: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  maxUses: number | null;
  usedCount: number;
  minSubtotal: number;
}

export interface PricedLine {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface PricedOrder {
  lines: PricedLine[];
  subtotal: number;
  promoCode: string | null;
  discountPercent: number;
  discount: number;
  total: number;
}

/** Returns the discount percentage granted by a promo at this moment, or throws an OrderError. */
export function promoPercentFor(promo: PromoRule | null, subtotal: number, now: Date): number {
  if (!promo || !promo.active) throw new OrderError('promo_invalid', 'Code promo invalide');
  if (promo.startsAt && promo.startsAt.getTime() > now.getTime()) throw new OrderError('promo_invalid', 'Code promo invalide');
  if (promo.endsAt && promo.endsAt.getTime() <= now.getTime()) throw new OrderError('promo_expired', 'Ce code promo a expiré');
  if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
    throw new OrderError('promo_exhausted', "Ce code promo n'est plus disponible");
  }
  if (subtotal < promo.minSubtotal) {
    throw new OrderError('promo_min_subtotal', `Commande minimum de ${promo.minSubtotal} DH pour ce code`, {
      minSubtotal: promo.minSubtotal,
    });
  }
  return Math.min(MAX_PROMO_PERCENT, Math.max(0, Math.round(promo.percent)));
}

export function priceOrder(
  items: { id: string; quantity: number }[],
  catalog: Map<string, CatalogEntry>,
  promo: PromoRule | null,
  now: Date
): PricedOrder {
  if (items.length === 0) throw new OrderError('empty_order', 'Le panier est vide');

  // merge duplicate lines of the same product
  const wanted = new Map<string, number>();
  for (const item of items) wanted.set(item.id, (wanted.get(item.id) ?? 0) + item.quantity);

  const lines: PricedLine[] = [];
  for (const [id, quantity] of [...wanted].sort(([a], [b]) => a.localeCompare(b))) {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) {
      throw new OrderError('invalid_quantity', `Quantité invalide (1 à ${MAX_QTY})`, { productId: id });
    }
    const product = catalog.get(id);
    if (!product || !product.active) throw new OrderError('unknown_product', 'Produit introuvable', { productId: id });
    if (product.stock < quantity) {
      throw new OrderError('out_of_stock', `Stock insuffisant pour ${product.name}`, {
        productId: id,
        available: product.stock,
      });
    }
    lines.push({ productId: id, name: product.name, unitPrice: product.price, quantity, lineTotal: product.price * quantity });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  let discountPercent = 0;
  let promoCode: string | null = null;
  if (promo) {
    discountPercent = promoPercentFor(promo, subtotal, now);
    promoCode = promo.code;
  }
  const discount = Math.round(subtotal * (discountPercent / 100));
  return { lines, subtotal, promoCode, discountPercent, discount, total: subtotal - discount };
}
