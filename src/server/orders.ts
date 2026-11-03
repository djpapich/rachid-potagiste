import { randomInt } from 'crypto';
import { and, desc, eq, gte, inArray, sql } from 'drizzle-orm';
import { orderEvents, orderItems, orders, products, promoCodes, type OrderStatus } from '../db/schema.ts';
import { isUniqueViolation, type Db } from './db.ts';
import { OrderError, priceOrder, type CatalogEntry, type PricedOrder, type PromoRule } from './pricing.ts';

const NUMBER_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O/1/I/L: easy to read over the phone

export function newOrderNumber(now: Date): string {
  const yy = String(now.getUTCFullYear()).slice(2);
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(now.getUTCDate()).padStart(2, '0');
  let tail = '';
  for (let i = 0; i < 5; i++) tail += NUMBER_ALPHABET[randomInt(NUMBER_ALPHABET.length)];
  return `RP-${yy}${mm}${dd}-${tail}`;
}

/** Last 9 digits: "+212 6 12 34 56 78", "06 12 34 56 78" and "0612345678" all compare equal. */
export function phoneKey(phone: string): string {
  return phone.replace(/\D/g, '').slice(-9);
}

type Row<T> = T extends { $inferSelect: infer R } ? R : never;
type ProductRow = Row<typeof products>;
type PromoRow = Row<typeof promoCodes>;

export const productName = (row: Pick<ProductRow, 'id' | 'data'>): string => {
  const nom = (row.data as { nom?: unknown } | null)?.nom;
  return typeof nom === 'string' && nom ? nom : row.id;
};

export const toCatalogEntry = (row: ProductRow): CatalogEntry => ({
  id: row.id,
  name: productName(row),
  price: row.price,
  stock: row.stock,
  active: row.active,
});

export const toPromoRule = (row: PromoRow): PromoRule => ({
  code: row.code,
  percent: row.percent,
  active: row.active,
  startsAt: row.startsAt,
  endsAt: row.endsAt,
  maxUses: row.maxUses,
  usedCount: row.usedCount,
  minSubtotal: row.minSubtotal,
});

export interface NewOrderInput {
  items: { id: string; quantity: number }[];
  customer: { nom: string; ville: string; adresse: string; telephone: string; notes?: string; email?: string };
  promoCode?: string;
  whatsappLine: 'line1' | 'line2';
  userId?: number;
}

export interface CreatedOrder {
  id: number;
  number: string;
  status: OrderStatus;
  createdAt: Date;
  priced: PricedOrder;
}

/**
 * Creates an order in ONE transaction:
 *  1. recompute every price from the catalogue (browser prices are ignored),
 *  2. take the stock with a conditional UPDATE (`stock >= qty`), which cannot oversell even when
 *     two customers order the last jar at the same instant,
 *  3. count the promo use with the same kind of guarded UPDATE,
 *  4. store the order, its lines (with name/price snapshots) and its first timeline event.
 * Any failure rolls everything back, so stock is never lost on a half-created order.
 */
export async function createOrder(db: Db, input: NewOrderInput, now = new Date()): Promise<CreatedOrder> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await db.transaction(async (tx) => {
        const ids = [...new Set(input.items.map((i) => i.id))];
        const rows = ids.length ? await tx.select().from(products).where(inArray(products.id, ids)) : [];
        const catalog = new Map(rows.map((r) => [r.id, toCatalogEntry(r)]));

        let promo: PromoRule | null = null;
        if (input.promoCode) {
          const [p] = await tx.select().from(promoCodes).where(eq(promoCodes.code, input.promoCode.trim().toUpperCase()));
          if (!p) throw new OrderError('promo_invalid', 'Code promo invalide');
          promo = toPromoRule(p);
        }

        const priced = priceOrder(input.items, catalog, promo, now);

        // Take stock line by line, always in the same order so concurrent orders cannot deadlock.
        for (const line of priced.lines) {
          const taken = await tx
            .update(products)
            .set({ stock: sql`${products.stock} - ${line.quantity}`, updatedAt: now })
            .where(and(eq(products.id, line.productId), eq(products.active, true), gte(products.stock, line.quantity)))
            .returning({ id: products.id });
          if (taken.length === 0) {
            throw new OrderError('out_of_stock', `Stock insuffisant pour ${line.name}`, { productId: line.productId });
          }
        }

        if (priced.promoCode) {
          const used = await tx
            .update(promoCodes)
            .set({ usedCount: sql`${promoCodes.usedCount} + 1` })
            .where(
              and(
                eq(promoCodes.code, priced.promoCode),
                eq(promoCodes.active, true),
                sql`(${promoCodes.maxUses} is null or ${promoCodes.usedCount} < ${promoCodes.maxUses})`
              )
            )
            .returning({ code: promoCodes.code });
          if (used.length === 0) throw new OrderError('promo_exhausted', "Ce code promo n'est plus disponible");
        }

        const number = newOrderNumber(now);
        const [order] = await tx
          .insert(orders)
          .values({
            number,
            userId: input.userId ?? null,
            customerName: input.customer.nom,
            customerPhone: input.customer.telephone,
            customerEmail: input.customer.email ?? null,
            city: input.customer.ville,
            address: input.customer.adresse,
            notes: input.customer.notes || null,
            subtotal: priced.subtotal,
            discount: priced.discount,
            total: priced.total,
            promoCode: priced.promoCode,
            whatsappLine: input.whatsappLine,
            createdAt: now,
            updatedAt: now,
          })
          .returning({ id: orders.id, number: orders.number, status: orders.status, createdAt: orders.createdAt });

        await tx.insert(orderItems).values(
          priced.lines.map((l) => ({ orderId: order.id, productId: l.productId, name: l.name, unitPrice: l.unitPrice, quantity: l.quantity }))
        );
        await tx.insert(orderEvents).values({ orderId: order.id, status: 'pending', note: 'Commande reçue', createdAt: now });

        return { id: order.id, number: order.number, status: order.status as OrderStatus, createdAt: order.createdAt, priced };
      });
    } catch (e) {
      // 1 in ~28 million per day: two orders drew the same number. Draw again.
      if (isUniqueViolation(e) && attempt < 3) continue;
      throw e;
    }
  }
}

// ---------------------------------------------------------------------------
// Status changes
// ---------------------------------------------------------------------------

export const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

export class StatusError extends Error {
  constructor(
    public code: 'order_not_found' | 'invalid_transition',
    message: string
  ) {
    super(message);
  }
}

/**
 * Moves an order along its lifecycle. Cancelling puts the stock back and gives the promo use back.
 * Delivering marks cash on delivery as collected.
 */
export async function changeOrderStatus(
  db: Db,
  orderId: number,
  next: OrderStatus,
  actorId: number | null,
  note?: string,
  now = new Date()
) {
  return db.transaction(async (tx) => {
    const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).for('update');
    if (!order) throw new StatusError('order_not_found', 'Commande introuvable');
    const current = order.status as OrderStatus;
    if (!NEXT_STATUSES[current]?.includes(next)) {
      throw new StatusError('invalid_transition', `Impossible de passer de « ${current} » à « ${next} »`);
    }

    if (next === 'cancelled') {
      const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));
      for (const item of [...items].sort((a, b) => a.productId.localeCompare(b.productId))) {
        await tx
          .update(products)
          .set({ stock: sql`${products.stock} + ${item.quantity}`, updatedAt: now })
          .where(eq(products.id, item.productId));
      }
      if (order.promoCode) {
        await tx
          .update(promoCodes)
          .set({ usedCount: sql`greatest(${promoCodes.usedCount} - 1, 0)` })
          .where(eq(promoCodes.code, order.promoCode));
      }
    }

    const paymentStatus = next === 'delivered' ? 'paid' : next === 'cancelled' && order.paymentStatus === 'paid' ? 'refunded' : order.paymentStatus;
    const [updated] = await tx
      .update(orders)
      .set({ status: next, paymentStatus, updatedAt: now })
      .where(eq(orders.id, orderId))
      .returning();
    await tx.insert(orderEvents).values({ orderId, status: next, note: note?.trim() || null, actorId, createdAt: now });
    return updated;
  });
}

// ---------------------------------------------------------------------------
// Reading orders
// ---------------------------------------------------------------------------

/** Public tracking: the order number AND the phone it was placed with must both match. */
export async function trackOrder(db: Db, number: string, phone: string) {
  const [order] = await db.select().from(orders).where(eq(orders.number, number.trim().toUpperCase()));
  if (!order || phoneKey(order.customerPhone) !== phoneKey(phone) || phoneKey(phone).length < 9) return null;
  const events = await db.select().from(orderEvents).where(eq(orderEvents.orderId, order.id)).orderBy(orderEvents.createdAt, orderEvents.id);
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  return {
    number: order.number,
    status: order.status,
    paymentStatus: order.paymentStatus,
    subtotal: order.subtotal,
    discount: order.discount,
    total: order.total,
    createdAt: order.createdAt,
    items: items.map((i) => ({ productId: i.productId, name: i.name, unitPrice: i.unitPrice, quantity: i.quantity })),
    timeline: events.map((e) => ({ status: e.status, note: e.note, at: e.createdAt })),
  };
}

export async function countRecentOrdersByPhone(db: Db, phone: string, since: Date): Promise<number> {
  const rows = await db
    .select({ phone: orders.customerPhone })
    .from(orders)
    .where(gte(orders.createdAt, since))
    .orderBy(desc(orders.createdAt))
    .limit(500);
  const key = phoneKey(phone);
  return rows.filter((r) => phoneKey(r.phone) === key).length;
}
