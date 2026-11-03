/**
 * Server configuration, read once from environment variables.
 * In production the server refuses to start with an unsafe or incomplete configuration.
 */

export interface Config {
  env: 'production' | 'development' | 'test';
  port: number;
  /** PostgreSQL connection string. Required in production. */
  databaseUrl?: string;
  /** Directory of the embedded dev database ("memory://" for tests). Never used in production. */
  pgliteDir: string;
  /** Browser origins allowed to send state-changing requests, e.g. https://rachidpotagiste.netlify.app */
  allowedOrigins: Set<string>;
  cookieName: string;
  secureCookies: boolean;
  /** Number of reverse proxies in front of the server (for the real client IP). */
  trustProxy: number;
}

export class ConfigError extends Error {}

function parseOrigins(raw: string | undefined): string[] {
  return (raw ?? '')
    .split(',')
    .map((s) => s.trim().replace(/\/+$/, ''))
    .filter(Boolean);
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const mode = env.NODE_ENV === 'production' ? 'production' : env.NODE_ENV === 'test' ? 'test' : 'development';
  const origins = parseOrigins(env.ALLOWED_ORIGINS);

  for (const o of origins) {
    let ok = false;
    try {
      const u = new URL(o);
      ok = (u.protocol === 'https:' || (mode !== 'production' && u.protocol === 'http:')) && u.origin === o;
    } catch {
      ok = false;
    }
    if (!ok) throw new ConfigError(`ALLOWED_ORIGINS contains an invalid origin: "${o}" (use https://host, no path)`);
  }

  if (mode === 'production') {
    if (!env.DATABASE_URL) throw new ConfigError('DATABASE_URL is required in production');
    if (origins.length === 0) throw new ConfigError('ALLOWED_ORIGINS is required in production');
  } else {
    origins.push('http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001');
  }

  const port = Number(env.PORT) || 3000;
  const trust = env.TRUST_PROXY === undefined ? 1 : Number(env.TRUST_PROXY);

  return {
    env: mode,
    port,
    databaseUrl: env.DATABASE_URL || undefined,
    pgliteDir: env.PGLITE_DIR || (mode === 'test' ? 'memory://' : '.data/pglite'),
    allowedOrigins: new Set(origins),
    cookieName: env.COOKIE_NAME || 'rp_session',
    secureCookies: env.COOKIE_SECURE ? env.COOKIE_SECURE !== 'false' : mode === 'production',
    trustProxy: Number.isInteger(trust) && trust >= 0 ? trust : 1,
  };
}
