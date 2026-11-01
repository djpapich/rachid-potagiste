import path from 'path';
import { fileURLToPath } from 'url';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { migrate as migratePg } from 'drizzle-orm/node-postgres/migrator';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import { Pool } from 'pg';
import * as schema from '../db/schema.ts';
import type { Config } from './config.ts';

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

export interface DbHandle {
  db: Db;
  kind: 'postgres' | 'pglite';
  close(): Promise<void>;
}

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const migrationsFolder = path.join(rootDir, 'drizzle');

/**
 * Opens the database and applies pending migrations.
 * - DATABASE_URL set  -> PostgreSQL (production, Neon, Supabase, Render...)
 * - otherwise (never in production) -> embedded PGlite, a real Postgres engine, for local dev and tests.
 */
export async function openDb(config: Config): Promise<DbHandle> {
  if (config.databaseUrl) {
    const pool = new Pool({
      connectionString: config.databaseUrl,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
      statement_timeout: 15_000,
    });
    pool.on('error', (err) => console.error('Idle database client error:', err.message));
    const db = drizzlePg(pool, { schema });
    await migratePg(db, { migrationsFolder });
    return { db: db as unknown as Db, kind: 'postgres', close: () => pool.end() };
  }

  if (config.env === 'production') throw new Error('DATABASE_URL is required in production');

  const { PGlite } = await import('@electric-sql/pglite');
  const { drizzle } = await import('drizzle-orm/pglite');
  const { migrate } = await import('drizzle-orm/pglite/migrator');
  const client = new PGlite(config.pgliteDir);
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder });
  return { db: db as unknown as Db, kind: 'pglite', close: () => client.close() };
}

/** PostgreSQL unique-violation, whichever driver wrapped it. */
export function isUniqueViolation(error: unknown): boolean {
  let e = error as { code?: string; cause?: unknown } | undefined;
  for (let i = 0; e && i < 4; i++) {
    if (e.code === '23505') return true;
    e = e.cause as typeof e;
  }
  return false;
}
