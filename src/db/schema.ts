import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

/**
 * Database schema of the shop.
 * Money is stored as whole Moroccan dirhams (MAD) in integer columns.
 * Safety nets live in the database itself (CHECK constraints), so a bug in the
 * application code can never sell stock that does not exist or store an inconsistent total.
 */

export const ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    email: text('email').notNull(),
    name: text('name').notNull(),
    phone: text('phone'),
    passwordHash: text('password_hash').notNull(),
    role: text('role').notNull().default('customer'), // 'customer' | 'admin'
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('users_email_lower_unique').on(sql`lower(${t.email})`),
    check('users_role_valid', sql`${t.role} in ('customer', 'admin')`),
  ]
);

/** Only the SHA-256 of the session token is stored: a database leak does not leak live sessions. */
export const sessions = pgTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('sessions_user_idx').on(t.userId), index('sessions_expires_idx').on(t.expiresAt)]
);

/**
 * `data` holds the full localized product sheet (names, descriptions, images...) in the same
 * shape the storefront already uses. Price, stock and visibility are real columns because
 * they are what orders depend on.
 */
export const products = pgTable(
  'products',
  {
    id: text('id').primaryKey(), // url slug, e.g. "huile-ortie"
    family: text('family').notNull(),
    price: integer('price').notNull(),
    stock: integer('stock').notNull().default(0),
    active: boolean('active').notNull().default(true),
    sort: integer('sort').notNull().default(0),
    data: jsonb('data').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check('products_price_nonneg', sql`${t.price} >= 0`),
    check('products_stock_nonneg', sql`${t.stock} >= 0`),
    index('products_family_idx').on(t.family),
  ]
);

export const promoCodes = pgTable(
  'promo_codes',
  {
    code: text('code').primaryKey(), // always upper case
    percent: integer('percent').notNull(),
    active: boolean('active').notNull().default(true),
    startsAt: timestamp('starts_at', { withTimezone: true }),
    endsAt: timestamp('ends_at', { withTimezone: true }),
    maxUses: integer('max_uses'),
    usedCount: integer('used_count').notNull().default(0),
    minSubtotal: integer('min_subtotal').notNull().default(0),
    /** The one promotion advertised in the site banner. */
    featured: boolean('featured').notNull().default(false),
    /** Banner copy and the discovery pack, same shape as public/data/promo.json. */
    banner: jsonb('banner'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check('promo_percent_range', sql`${t.percent} between 0 and 50`),
    check('promo_used_nonneg', sql`${t.usedCount} >= 0`),
  ]
);

export const orders = pgTable(
  'orders',
  {
    id: serial('id').primaryKey(),
    number: text('number').notNull().unique(), // e.g. RP-261031-K7M2Q
    userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
    customerName: text('customer_name').notNull(),
    customerPhone: text('customer_phone').notNull(),
    customerEmail: text('customer_email'),
    city: text('city').notNull(),
    address: text('address').notNull(),
    notes: text('notes'),
    subtotal: integer('subtotal').notNull(),
    discount: integer('discount').notNull().default(0),
    total: integer('total').notNull(),
    promoCode: text('promo_code'),
    status: text('status').notNull().default('pending'),
    paymentMethod: text('payment_method').notNull().default('cod'), // cash on delivery
    paymentStatus: text('payment_status').notNull().default('unpaid'),
    whatsappLine: text('whatsapp_line').notNull().default('line1'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check('orders_total_consistent', sql`${t.total} = ${t.subtotal} - ${t.discount} and ${t.total} >= 0`),
    check(
      'orders_status_valid',
      sql`${t.status} in ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled')`
    ),
    check('orders_payment_status_valid', sql`${t.paymentStatus} in ('unpaid', 'paid', 'refunded')`),
    index('orders_status_idx').on(t.status),
    index('orders_created_idx').on(t.createdAt),
    index('orders_phone_idx').on(t.customerPhone),
    index('orders_user_idx').on(t.userId),
  ]
);

/** Name and price are copied at order time, so later catalogue edits never rewrite history. */
export const orderItems = pgTable(
  'order_items',
  {
    id: serial('id').primaryKey(),
    orderId: integer('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    productId: text('product_id').notNull(),
    name: text('name').notNull(),
    unitPrice: integer('unit_price').notNull(),
    quantity: integer('quantity').notNull(),
  },
  (t) => [check('order_items_qty_positive', sql`${t.quantity} > 0`), index('order_items_order_idx').on(t.orderId)]
);

export const orderEvents = pgTable(
  'order_events',
  {
    id: serial('id').primaryKey(),
    orderId: integer('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    status: text('status').notNull(),
    note: text('note'),
    actorId: integer('actor_id').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('order_events_order_idx').on(t.orderId)]
);
