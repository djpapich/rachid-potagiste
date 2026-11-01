process.env.NODE_ENV = 'test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { eq } from 'drizzle-orm';
import { products, promoCodes } from '../src/db/schema.ts';
import { seed } from '../scripts/seed.ts';
import { createApp } from '../src/server/app.ts';
import { loadConfig } from '../src/server/config.ts';
import { openDb } from '../src/server/db.ts';

const config = loadConfig({ NODE_ENV: 'test' } as NodeJS.ProcessEnv);
const handle = await openDb(config);
const { db } = handle;
await seed(db, { adminEmail: 'admin@example.com', adminPassword: 'Un-Mot-De-Passe-Solide-42' });
const server = createApp(db, config, { orderMax: 10_000, loginIpMax: 10_000 }).listen(0, '127.0.0.1');
await new Promise((r) => server.once('listening', r));
const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
const ORIGIN = 'http://localhost:3000';

class Client {
  cookie = '';
  async req(method: string, path: string, body?: unknown, headers: Record<string, string> = {}) {
    const res = await fetch(base + path, {
      method,
      headers: { ...(body !== undefined && { 'content-type': 'application/json' }), Origin: ORIGIN, ...(this.cookie && { cookie: this.cookie }), ...headers },
      body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
    });
    const set = res.headers.getSetCookie?.() ?? [];
    if (set.length) this.cookie = set[0].split(';')[0].endsWith('=') ? '' : set[0].split(';')[0];
    const text = await res.text();
    let json: any = null; try { json = JSON.parse(text); } catch { /* not json */ }
    return { status: res.status, json, headers: res.headers, setCookie: set };
  }
}

let n = 0, failed = 0;
async function test(name: string, fn: () => Promise<void>) {
  try { await fn(); n++; console.log('  ok  ', name); } catch (e) { failed++; console.log('  FAIL', name, '\n      ', (e as Error).message); }
}

let phoneCounter = 0;
const customer = () => ({ nom: 'Karim Alaoui', ville: 'Bouznika', adresse: '12 rue des Orangers', telephone: `06 12 34 56 ${String(10 + phoneCounter++).padStart(2, '0')}` });
const stockOf = async (id: string) => (await db.select().from(products).where(eq(products.id, id)))[0].stock;
const ID = 'huile-ortie';
const price = async (id: string) => (await db.select().from(products).where(eq(products.id, id)))[0].price;

await test('catalogue is served from the database', async () => {
  const r = await new Client().req('GET', '/api/products');
  assert.equal(r.status, 200);
  assert.ok(r.json.products.length >= 20);
});

await test('client-sent prices and totals are ignored', async () => {
  const c = new Client();
  const r = await c.req('POST', '/api/orders', { items: [{ id: ID, quantity: 2, prix: 1, price: 1 }], customer: customer(), total: 1, subtotal: 1 });
  assert.equal(r.status, 201, JSON.stringify(r.json));
  const p = await price(ID);
  assert.equal(r.json.subtotal, p * 2);
  assert.equal(r.json.total, p * 2);
  assert.match(r.json.number, /^RP-\d{6}-[A-Z0-9]{5}$/);
});

await test('unknown product, bad quantity and empty cart are refused', async () => {
  const c = new Client();
  assert.equal((await c.req('POST', '/api/orders', { items: [{ id: 'nope', quantity: 1 }], customer: customer() })).json.error, 'unknown_product');
  assert.equal((await c.req('POST', '/api/orders', { items: [{ id: ID, quantity: 0 }], customer: customer() })).status, 400);
  assert.equal((await c.req('POST', '/api/orders', { items: [{ id: ID, quantity: -3 }], customer: customer() })).status, 400);
  assert.equal((await c.req('POST', '/api/orders', { items: [], customer: customer() })).status, 400);
  assert.equal((await c.req('POST', '/api/orders', { items: [{ id: ID, quantity: 1 }], customer: { ...customer(), telephone: 'abc' } })).json.error, 'invalid_customer');
});

await test('stock cannot be oversold, even with concurrent orders', async () => {
  const id = 'savon-luffa-lavande' in {} ? '' : (await db.select().from(products).limit(3))[2].id;
  await db.update(products).set({ stock: 3 }).where(eq(products.id, id));
  const results = await Promise.all(Array.from({ length: 6 }, (_, i) => new Client().req('POST', '/api/orders', { items: [{ id, quantity: 1 }], customer: customer() }, { 'x-test': String(i) })));
  const ok = results.filter((r) => r.status === 201).length;
  assert.equal(ok, 3, results.map((r) => r.status).join(','));
  assert.equal(await stockOf(id), 0);
  assert.ok(results.filter((r) => r.status !== 201).every((r) => r.json.error === 'out_of_stock' || r.status === 429));
});

await test('promo: applied server-side, capped, expiring and limited in uses', async () => {
  const id = (await db.select().from(products).limit(1))[0].id;
  const unit = await price(id);
  const c = new Client();
  const ok = await c.req('POST', '/api/orders', { items: [{ id, quantity: 1 }], customer: customer(), promoCode: 'potager10' });
  assert.equal(ok.status, 201, JSON.stringify(ok.json));
  assert.equal(ok.json.discount, Math.round(unit * 0.1));
  assert.equal((await c.req('POST', '/api/orders', { items: [{ id, quantity: 1 }], customer: customer(), promoCode: 'FAKE' })).json.error, 'promo_invalid');
  await db.update(promoCodes).set({ endsAt: new Date(Date.now() - 1000) }).where(eq(promoCodes.code, 'POTAGER10'));
  assert.equal((await c.req('POST', '/api/orders', { items: [{ id, quantity: 1 }], customer: customer(), promoCode: 'POTAGER10' })).json.error, 'promo_expired');
  await db.update(promoCodes).set({ endsAt: null, maxUses: 1 }).where(eq(promoCodes.code, 'POTAGER10'));
  assert.equal((await c.req('POST', '/api/orders', { items: [{ id, quantity: 1 }], customer: customer(), promoCode: 'POTAGER10' })).json.error, 'promo_exhausted');
  await db.update(promoCodes).set({ maxUses: null }).where(eq(promoCodes.code, 'POTAGER10'));
  assert.equal((await c.req('POST', '/api/promo/check', { code: 'POTAGER10', subtotal: 100 })).json.percent, 10);
});

await test('DB constraints reject negative stock and a promo above 50%', async () => {
  await assert.rejects(db.update(products).set({ stock: -1 }).where(eq(products.id, ID)));
  await assert.rejects(db.insert(promoCodes).values({ code: 'TOOMUCH', percent: 90 }));
});

await test('registration, login, cookie flags and no account enumeration', async () => {
  const c = new Client();
  const weak = await c.req('POST', '/api/auth/register', { email: 'a@b.ma', password: 'short', name: 'Ali Test' });
  assert.equal(weak.status, 422);
  const reg = await c.req('POST', '/api/auth/register', { email: 'Sara@Example.com', password: 'Mot-de-passe-long-9', name: 'Sara Test' });
  assert.equal(reg.status, 201);
  const flags = reg.setCookie[0];
  assert.match(flags, /HttpOnly/); assert.match(flags, /SameSite=Lax/);
  assert.ok(!JSON.stringify(reg.json).includes('password'));
  assert.equal((await c.req('GET', '/api/auth/me')).json.user.email, 'sara@example.com');
  assert.equal((await new Client().req('POST', '/api/auth/register', { email: 'sara@example.com', password: 'Mot-de-passe-long-9', name: 'Sara Bis' })).status, 409);
  const o = await c.req('POST', '/api/orders', { items: [{ id: ID, quantity: 1 }], customer: customer() });
  assert.equal((await c.req('GET', '/api/me/orders')).json.orders[0].number, o.json.number);
  await c.req('POST', '/api/auth/logout', {});
  assert.equal((await c.req('GET', '/api/auth/me')).json.user, null);
  const a = await new Client().req('POST', '/api/auth/login', { email: 'sara@example.com', password: 'wrong-password-1' });
  const b = await new Client().req('POST', '/api/auth/login', { email: 'ghost@example.com', password: 'wrong-password-1' });
  assert.equal(a.status, 401); assert.deepEqual(a.json, b.json);
});

await test('login is throttled per account', async () => {
  const c = new Client(); let last = 0;
  for (let i = 0; i < 12; i++) last = (await c.req('POST', '/api/auth/login', { email: 'victim@example.com', password: 'guess-number-' + i })).status;
  assert.equal(last, 429);
});

await test('admin API: 401 anonymous, 403 customer, works for admin', async () => {
  assert.equal((await new Client().req('GET', '/api/admin/orders')).status, 401);
  const cust = new Client();
  await cust.req('POST', '/api/auth/register', { email: 'client@example.com', password: 'Mot-de-passe-long-9', name: 'Client Test' });
  assert.equal((await cust.req('GET', '/api/admin/orders')).status, 403);
  assert.equal((await cust.req('PATCH', '/api/admin/products/' + ID, { price: 1 })).status, 403);
  const admin = new Client();
  assert.equal((await admin.req('POST', '/api/auth/login', { email: 'admin@example.com', password: 'Un-Mot-De-Passe-Solide-42' })).status, 200);
  assert.equal((await admin.req('GET', '/api/admin/orders')).status, 200);
  assert.equal((await admin.req('GET', '/api/admin/stats')).status, 200);
  assert.equal((await admin.req('PATCH', '/api/admin/products/' + ID, { price: 50, role: 'x' })).status, 400); // strict
  assert.equal((await admin.req('PATCH', '/api/admin/products/' + ID, { stock: 40 })).status, 200);
  assert.equal((await admin.req('POST', '/api/admin/promos', { code: 'ETE20', percent: 20 })).status, 201);
  assert.equal((await admin.req('POST', '/api/admin/promos', { code: 'BAD', percent: 80 })).status, 400);
});

await test('order lifecycle: transitions enforced, cancel restocks', async () => {
  const admin = new Client();
  await admin.req('POST', '/api/auth/login', { email: 'admin@example.com', password: 'Un-Mot-De-Passe-Solide-42' });
  await db.update(products).set({ stock: 10 }).where(eq(products.id, ID));
  const o = await new Client().req('POST', '/api/orders', { items: [{ id: ID, quantity: 4 }], customer: customer() });
  assert.equal(await stockOf(ID), 6);
  const list = (await admin.req('GET', '/api/admin/orders?status=pending')).json.orders;
  const row = list.find((x: any) => x.number === o.json.number);
  assert.equal((await admin.req('PATCH', `/api/admin/orders/${row.id}`, { status: 'delivered' })).status, 409);
  assert.equal((await admin.req('PATCH', `/api/admin/orders/${row.id}`, { status: 'confirmed' })).status, 200);
  assert.equal((await admin.req('PATCH', `/api/admin/orders/${row.id}`, { status: 'cancelled', note: 'client injoignable' })).status, 200);
  assert.equal(await stockOf(ID), 10);
  assert.equal((await admin.req('PATCH', `/api/admin/orders/${row.id}`, { status: 'confirmed' })).status, 409);
  assert.equal((await admin.req('PATCH', `/api/admin/orders/999999`, { status: 'confirmed' })).status, 404);
});

await test('tracking needs the order number AND the matching phone', async () => {
  const c = new Client(); const cust = customer();
  const o = await c.req('POST', '/api/orders', { items: [{ id: ID, quantity: 1 }], customer: cust });
  const ok = await c.req('POST', '/api/orders/track', { number: o.json.number.toLowerCase(), phone: cust.telephone.replace(/^06/, '+2126') });
  assert.equal(ok.status, 200); assert.equal(ok.json.number, o.json.number);
  assert.ok(!('customerPhone' in ok.json) && !('address' in ok.json));
  const bad = await c.req('POST', '/api/orders/track', { number: o.json.number, phone: '0699999999' });
  const none = await c.req('POST', '/api/orders/track', { number: 'RP-000000-AAAAA', phone: '0699999999' });
  assert.equal(bad.status, 404); assert.deepEqual(bad.json, none.json);
});

await test('CSRF and request hygiene: foreign origin, body size, content type, bad JSON, method', async () => {
  const c = new Client(); const body = { items: [{ id: ID, quantity: 1 }], customer: customer() };
  assert.equal((await c.req('POST', '/api/orders', body, { Origin: 'https://evil.example' })).status, 403);
  assert.equal((await c.req('POST', '/api/orders', 'x'.repeat(40_000))).status, 413);
  assert.equal((await c.req('POST', '/api/orders', JSON.stringify(body), { 'content-type': 'text/plain' })).status, 415);
  assert.equal((await c.req('POST', '/api/orders', '{bad json')).status, 400);
  assert.equal((await c.req('PUT', '/index.html', {})).status, 405);
  const h = await c.req('GET', '/api/health');
  assert.equal(h.headers.get('x-content-type-options'), 'nosniff');
  assert.ok(h.headers.get('content-security-policy')?.includes("default-src 'self'"));
  assert.equal(h.headers.get('x-powered-by'), null);
});

await test('SQL/HTML injection attempts are stored inert and never break queries', async () => {
  const c = new Client();
  const r = await c.req('POST', '/api/orders', { items: [{ id: "x'; DROP TABLE products;--", quantity: 1 }], customer: customer() });
  assert.equal(r.status, 400);
  const r2 = await c.req('POST', '/api/orders', { items: [{ id: ID, quantity: 1 }], customer: { ...customer(), adresse: "<img src=x onerror=alert(1)> '; DROP TABLE orders;--" } });
  assert.equal(r2.status, 201);
  assert.equal((await c.req('GET', '/api/products')).status, 200);
  const l = await c.req('POST', '/api/auth/login', { email: "' OR 1=1 --", password: 'x' });
  assert.equal(l.status, 400);
});

await test('honeypot: bots get a fake success and nothing is stored', async () => {
  const before = await stockOf(ID);
  const r = await new Client().req('POST', '/api/orders', { items: [{ id: ID, quantity: 1 }], customer: customer(), website: 'http://spam' });
  assert.equal(r.status, 201); assert.equal(r.json.number, undefined);
  assert.equal(await stockOf(ID), before);
});

await test('order endpoint is rate limited per IP', async () => {
  const strict = createApp(db, config).listen(0, '127.0.0.1');
  await new Promise((r) => strict.once('listening', r));
  const url = `http://127.0.0.1:${(strict.address() as AddressInfo).port}/api/orders`;
  let last = 0;
  for (let i = 0; i < 10; i++) last = (await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', Origin: ORIGIN }, body: JSON.stringify({ items: [{ id: ID, quantity: 1 }], customer: { ...customer(), nom: 'X' } }) })).status;
  strict.close();
  assert.equal(last, 429);
});

server.close(); await handle.close();
console.log(`\n${n} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
