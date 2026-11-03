/**
 * Seeds the database: catalogue, launch promotion and (optionally) the admin account.
 *   npm run seed                 -> add missing products, never touches price/stock of existing ones
 *   npm run seed -- --force      -> also reset price/stock from public/data/products.json
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run seed   -> create/update the admin (password never logged)
 */
import fs from 'fs';
import { sql } from 'drizzle-orm';
import { products, promoCodes, users } from '../src/db/schema.ts';
import { sanitizeProducts, sanitizePromo } from '../src/lib/validation.ts';
import { hashPassword, passwordProblem } from '../src/server/auth.ts';
import { loadConfig } from '../src/server/config.ts';
import { openDb, type Db } from '../src/server/db.ts';

const DEFAULT_STOCK = 20;

export async function seed(db: Db, opts: { force?: boolean; adminEmail?: string; adminPassword?: string } = {}) {
  const list = sanitizeProducts(JSON.parse(fs.readFileSync('public/data/products.json', 'utf8')));
  if (list.length === 0) throw new Error('products.json has no valid product');
  for (const [i, p] of list.entries()) {
    const base = { family: p.famille, data: p, sort: i, updatedAt: new Date() };
    await db.insert(products).values({ id: p.id, price: p.prix, stock: DEFAULT_STOCK, active: true, ...base }).onConflictDoUpdate({
      target: products.id,
      set: opts.force ? { ...base, price: p.prix, stock: DEFAULT_STOCK } : base, // catalogue text refreshes; price/stock stay as the admin set them
    });
  }

  const promo = sanitizePromo(JSON.parse(fs.readFileSync('public/data/promo.json', 'utf8')));
  if (promo) {
    await db.insert(promoCodes).values({
      code: promo.code, percent: promo.remisePourcentage, active: promo.active, endsAt: promo.dateFin ? new Date(promo.dateFin) : null,
      featured: true, banner: { message: promo.message, sousTitre: promo.sousTitre, packDecouverte: promo.packDecouverte },
    }).onConflictDoNothing();
  }

  if (opts.adminEmail && opts.adminPassword) {
    const email = opts.adminEmail.trim().toLowerCase();
    const problem = passwordProblem(opts.adminPassword, email);
    if (problem) throw new Error(`ADMIN_PASSWORD refused: ${problem}`);
    const passwordHash = await hashPassword(opts.adminPassword);
    const [existing] = await db.select({ id: users.id }).from(users).where(sql`lower(${users.email}) = ${email}`);
    if (existing) await db.update(users).set({ passwordHash, role: 'admin' }).where(sql`${users.id} = ${existing.id}`);
    else await db.insert(users).values({ email, name: 'Administrateur', passwordHash, role: 'admin' });
  }
  return list.length;
}

if (process.argv[1]?.endsWith('seed.ts')) {
  const config = loadConfig();
  const handle = await openDb(config);
  try {
    const n = await seed(handle.db, { force: process.argv.includes('--force'), adminEmail: process.env.ADMIN_EMAIL, adminPassword: process.env.ADMIN_PASSWORD });
    console.log(`Seed done: ${n} products${process.env.ADMIN_EMAIL ? ', admin account ready' : ''}. Default stock ${DEFAULT_STOCK}: adjust it in /admin.`);
  } finally {
    await handle.close();
  }
}
