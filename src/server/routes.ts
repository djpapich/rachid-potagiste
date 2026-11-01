import { and, count, desc, eq, gte, inArray, sql } from 'drizzle-orm';
import { Router } from 'express';
import { z } from 'zod';
import { orderItems, orders, products, promoCodes, users, ORDER_STATUSES } from '../db/schema.ts';
import { cleanText, MAX_PROMO_PERCENT, MAX_QTY, validateOrderInfo } from '../lib/validation.ts';
import {
  burnPasswordCheck, endSession, hashPassword, passwordProblem, requireAdmin, requireUser, startSession, verifyPassword,
} from './auth.ts';
import type { Config } from './config.ts';
import { isUniqueViolation, type Db } from './db.ts';
import {
  changeOrderStatus, countRecentOrdersByPhone, createOrder, StatusError, toPromoRule, trackOrder, NEXT_STATUSES,
} from './orders.ts';
import { OrderError, promoPercentFor } from './pricing.ts';
import { asyncHandler, createLimiter, HttpError, noStore } from './security.ts';

const MIN = 60_000;

function parse<T extends z.ZodTypeAny>(schema: T, body: unknown): z.infer<T> {
  const r = schema.safeParse(body);
  if (!r.success) throw new HttpError(400, 'invalid_request', 'Requête invalide', r.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })));
  return r.data;
}

const orderStatus = z.enum(ORDER_STATUSES);
const emailSchema = z.string().trim().toLowerCase().email().max(160);
const idSchema = z.string().regex(/^[a-z0-9][a-z0-9-]{0,63}$/);

const orderBody = z.object({
  items: z.array(z.object({ id: idSchema, quantity: z.number().int().min(1).max(MAX_QTY) })).min(1).max(40),
  customer: z.object({
    nom: z.string().max(200), ville: z.string().max(200), adresse: z.string().max(500),
    telephone: z.string().max(40), notes: z.string().max(1000).optional().default(''),
  }),
  email: emailSchema.optional(),
  promoCode: z.string().trim().max(32).optional(),
  line: z.enum(['line1', 'line2']).default('line1'),
  lang: z.enum(['fr', 'ar', 'en']).default('fr'),
  website: z.string().max(200).optional(), // honeypot: real users never fill it
});

const publicProduct = (r: typeof products.$inferSelect) => ({
  ...(r.data as object), id: r.id, prix: r.price, stock: r.stock, enStock: r.active && r.stock > 0,
});

const toPublicUser = (u: { id: number; email: string; name: string; role: string }) => ({ id: u.id, email: u.email, name: u.name, role: u.role });

export interface RouterOptions { orderMax?: number; loginIpMax?: number }

export function createRouter(db: Db, config: Config, opts: RouterOptions = {}) {
  const router = Router();

  const orderIpLimit = createLimiter({ windowMs: 10 * MIN, max: opts.orderMax ?? 6 });
  const loginIpLimit = createLimiter({ windowMs: 15 * MIN, max: opts.loginIpMax ?? 40 });
  const loginAccountLimit = createLimiter({ windowMs: 15 * MIN, max: 8 });
  const registerLimit = createLimiter({ windowMs: 60 * MIN, max: 10 });
  const trackLimit = createLimiter({ windowMs: 15 * MIN, max: 20 });
  const promoLimit = createLimiter({ windowMs: 5 * MIN, max: 30 });

  // ---- Shop (public) -------------------------------------------------------
  router.get('/products', asyncHandler(async (_req, res) => {
    const rows = await db.select().from(products).where(eq(products.active, true)).orderBy(products.sort, products.id);
    res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
    res.json({ products: rows.map(publicProduct) });
  }));

  router.get('/promo', asyncHandler(async (_req, res) => {
    const [p] = await db.select().from(promoCodes).where(and(eq(promoCodes.featured, true), eq(promoCodes.active, true))).limit(1);
    const now = Date.now();
    if (!p || !p.banner || (p.endsAt && p.endsAt.getTime() <= now) || (p.startsAt && p.startsAt.getTime() > now)) {
      throw new HttpError(404, 'no_promo', 'Aucune promotion');
    }
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.json({ ...(p.banner as object), active: true, code: p.code, remisePourcentage: p.percent, dateFin: p.endsAt?.toISOString() ?? '' });
  }));

  router.post('/promo/check', promoLimit.middleware, noStore, asyncHandler(async (req, res) => {
    const { code, subtotal } = parse(z.object({ code: z.string().trim().min(1).max(32), subtotal: z.number().int().min(0).max(1_000_000).default(0) }), req.body);
    const [p] = await db.select().from(promoCodes).where(eq(promoCodes.code, code.toUpperCase()));
    try {
      const percent = promoPercentFor(p ? toPromoRule(p) : null, subtotal, new Date());
      res.json({ valid: true, code: p!.code, percent });
    } catch (e) {
      if (e instanceof OrderError) return void res.status(422).json({ valid: false, error: e.code, message: e.message });
      throw e;
    }
  }));

  router.post('/orders', noStore, orderIpLimit.middleware, asyncHandler(async (req, res) => {
    const body = parse(orderBody, req.body);
    if (body.website) return void res.status(201).json({ ok: true }); // bot: pretend success, store nothing
    const v = validateOrderInfo({ ...body.customer, notes: body.customer.notes } as never, body.lang);
    if (!v.ok) throw new HttpError(422, 'invalid_customer', 'Informations de livraison invalides', v.errors);

    const since = new Date(Date.now() - 60 * MIN);
    if ((await countRecentOrdersByPhone(db, v.clean.telephone, since)) >= 5) {
      throw new HttpError(429, 'rate_limited', 'Trop de commandes avec ce numéro, réessayez plus tard');
    }
    try {
      const o = await createOrder(db, {
        items: body.items, customer: { ...v.clean, email: body.email }, promoCode: body.promoCode, whatsappLine: body.line, userId: req.user?.id,
      });
      res.status(201).json({
        number: o.number, status: o.status, createdAt: o.createdAt, paymentMethod: 'cod',
        subtotal: o.priced.subtotal, discount: o.priced.discount, total: o.priced.total, promoCode: o.priced.promoCode,
        items: o.priced.lines.map((l) => ({ id: l.productId, name: l.name, unitPrice: l.unitPrice, quantity: l.quantity })),
      });
    } catch (e) {
      if (e instanceof OrderError) throw new HttpError(e.code === 'out_of_stock' ? 409 : 422, e.code, e.message, e.details);
      throw e;
    }
  }));

  router.post('/orders/track', noStore, trackLimit.middleware, asyncHandler(async (req, res) => {
    const { number, phone } = parse(z.object({ number: z.string().trim().min(6).max(24), phone: z.string().trim().min(6).max(40) }), req.body);
    const found = await trackOrder(db, number, phone);
    if (!found) throw new HttpError(404, 'not_found', 'Aucune commande ne correspond à ces informations');
    res.json(found);
  }));

  // ---- Accounts ---------------------------------------------------------------
  router.post('/auth/register', noStore, registerLimit.middleware, asyncHandler(async (req, res) => {
    const b = parse(z.object({ email: emailSchema, password: z.string().min(1).max(200), name: z.string().trim().min(2).max(80), phone: z.string().trim().max(40).optional() }), req.body);
    const problem = passwordProblem(b.password, b.email);
    if (problem) throw new HttpError(422, 'weak_password', problem);
    const name = cleanText(b.name, 80);
    const passwordHash = await hashPassword(b.password);
    try {
      const [u] = await db.insert(users).values({ email: b.email, name, phone: b.phone ? cleanText(b.phone, 40) : null, passwordHash, role: 'customer' }).returning();
      await startSession(db, config, res, { id: u.id, email: u.email, name: u.name, role: 'customer' });
      res.status(201).json({ user: toPublicUser(u) });
    } catch (e) {
      if (isUniqueViolation(e)) throw new HttpError(409, 'email_taken', 'Cette adresse e-mail est déjà utilisée');
      throw e;
    }
  }));

  router.post('/auth/login', noStore, loginIpLimit.middleware, asyncHandler(async (req, res) => {
    const b = parse(z.object({ email: emailSchema, password: z.string().min(1).max(200) }), req.body);
    const key = `${req.ip}|${b.email}`;
    const wait = loginAccountLimit.hit(key);
    if (wait > 0) { res.setHeader('Retry-After', String(wait)); throw new HttpError(429, 'rate_limited', 'Trop de tentatives, réessayez plus tard'); }
    const [u] = await db.select().from(users).where(sql`lower(${users.email}) = ${b.email}`).limit(1);
    const ok = u ? await verifyPassword(b.password, u.passwordHash) : (await burnPasswordCheck(b.password), false);
    if (!u || !ok) throw new HttpError(401, 'bad_credentials', 'E-mail ou mot de passe incorrect');
    loginAccountLimit.reset(key);
    await startSession(db, config, res, { id: u.id, email: u.email, name: u.name, role: u.role as 'customer' | 'admin' });
    res.json({ user: toPublicUser(u) });
  }));

  router.post('/auth/logout', noStore, asyncHandler(async (req, res) => { await endSession(db, config, req, res); res.json({ ok: true }); }));

  router.get('/auth/me', noStore, (req, res) => { res.json({ user: req.user ? toPublicUser(req.user) : null }); });

  router.get('/me/orders', noStore, requireUser, asyncHandler(async (req, res) => {
    const rows = await db.select().from(orders).where(eq(orders.userId, req.user!.id)).orderBy(desc(orders.createdAt)).limit(50);
    res.json({ orders: rows.map((o) => ({ number: o.number, status: o.status, total: o.total, createdAt: o.createdAt })) });
  }));

  // ---- Admin ------------------------------------------------------------------
  const admin = Router();
  admin.use(noStore, requireAdmin);

  admin.get('/stats', asyncHandler(async (_req, res) => {
    const since = new Date(Date.now() - 30 * 24 * 3600_000);
    const [recent] = await db.select({ n: count(), revenue: sql<number>`coalesce(sum(${orders.total}) filter (where ${orders.status} <> 'cancelled'), 0)::int` }).from(orders).where(gte(orders.createdAt, since));
    const byStatus = await db.select({ status: orders.status, n: count() }).from(orders).groupBy(orders.status);
    const low = await db.select({ id: products.id, stock: products.stock }).from(products).where(and(eq(products.active, true), sql`${products.stock} <= 5`)).orderBy(products.stock).limit(20);
    res.json({ last30Days: { orders: recent.n, revenue: Number(recent.revenue) }, byStatus, lowStock: low });
  }));

  admin.get('/orders', asyncHandler(async (req, res) => {
    const { status, limit } = parse(z.object({ status: orderStatus.optional(), limit: z.coerce.number().int().min(1).max(200).default(50) }), req.query);
    const rows = await db.select().from(orders).where(status ? eq(orders.status, status) : undefined).orderBy(desc(orders.createdAt)).limit(limit);
    const items = rows.length ? await db.select().from(orderItems).where(inArray(orderItems.orderId, rows.map((o) => o.id))) : [];
    res.json({ orders: rows.map((o) => ({ ...o, next: NEXT_STATUSES[o.status as keyof typeof NEXT_STATUSES], items: items.filter((i) => i.orderId === o.id) })) });
  }));

  admin.patch('/orders/:id', asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) throw new HttpError(400, 'invalid_request', 'Identifiant invalide');
    const { status, note } = parse(z.object({ status: orderStatus, note: z.string().max(300).optional() }), req.body);
    try {
      res.json({ order: await changeOrderStatus(db, id, status, req.user!.id, note) });
    } catch (e) {
      if (e instanceof StatusError) throw new HttpError(e.code === 'order_not_found' ? 404 : 409, e.code, e.message);
      throw e;
    }
  }));

  admin.get('/products', asyncHandler(async (_req, res) => {
    const rows = await db.select().from(products).orderBy(products.sort, products.id);
    res.json({ products: rows.map((r) => ({ id: r.id, name: (r.data as { nom?: string }).nom ?? r.id, family: r.family, price: r.price, stock: r.stock, active: r.active })) });
  }));

  admin.patch('/products/:id', asyncHandler(async (req, res) => {
    const id = parse(idSchema, req.params.id);
    const b = parse(z.object({ price: z.number().int().min(0).max(100000).optional(), stock: z.number().int().min(0).max(100000).optional(), active: z.boolean().optional() }).strict(), req.body);
    if (Object.keys(b).length === 0) throw new HttpError(400, 'invalid_request', 'Rien à modifier');
    const [row] = await db.update(products).set({ ...b, updatedAt: new Date() }).where(eq(products.id, id)).returning({ id: products.id, price: products.price, stock: products.stock, active: products.active });
    if (!row) throw new HttpError(404, 'not_found', 'Produit introuvable');
    res.json({ product: row });
  }));

  admin.get('/promos', asyncHandler(async (_req, res) => { res.json({ promos: await db.select().from(promoCodes).orderBy(promoCodes.code) }); }));

  const promoFields = {
    percent: z.number().int().min(0).max(MAX_PROMO_PERCENT), active: z.boolean(),
    startsAt: z.string().datetime().nullable(), endsAt: z.string().datetime().nullable(),
    maxUses: z.number().int().min(1).nullable(), minSubtotal: z.number().int().min(0).max(1_000_000),
  };
  const toDates = (b: { startsAt?: string | null; endsAt?: string | null }) => ({
    ...(b.startsAt !== undefined && { startsAt: b.startsAt ? new Date(b.startsAt) : null }),
    ...(b.endsAt !== undefined && { endsAt: b.endsAt ? new Date(b.endsAt) : null }),
  });

  admin.post('/promos', asyncHandler(async (req, res) => {
    const b = parse(z.object({ code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,32}$/), ...promoFields, active: promoFields.active.default(true), startsAt: promoFields.startsAt.default(null), endsAt: promoFields.endsAt.default(null), maxUses: promoFields.maxUses.default(null), minSubtotal: promoFields.minSubtotal.default(0) }), req.body);
    try {
      const [p] = await db.insert(promoCodes).values({ code: b.code, percent: b.percent, active: b.active, maxUses: b.maxUses, minSubtotal: b.minSubtotal, ...toDates(b) }).returning();
      res.status(201).json({ promo: p });
    } catch (e) {
      if (isUniqueViolation(e)) throw new HttpError(409, 'exists', 'Ce code existe déjà');
      throw e;
    }
  }));

  admin.patch('/promos/:code', asyncHandler(async (req, res) => {
    const code = parse(z.string().toUpperCase().regex(/^[A-Z0-9_-]{3,32}$/), req.params.code);
    const b = parse(z.object({ ...promoFields }).partial().strict(), req.body);
    if (Object.keys(b).length === 0) throw new HttpError(400, 'invalid_request', 'Rien à modifier');
    const { startsAt: _s, endsAt: _e, ...rest } = b;
    const [p] = await db.update(promoCodes).set({ ...rest, ...toDates(b) }).where(eq(promoCodes.code, code)).returning();
    if (!p) throw new HttpError(404, 'not_found', 'Code introuvable');
    res.json({ promo: p });
  }));

  router.use('/admin', admin);
  return router;
}
