import { createHash, randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { and, eq, gt, lt, sql } from 'drizzle-orm';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { sessions, users } from '../db/schema.ts';
import type { Config } from './config.ts';
import type { Db } from './db.ts';
import { HttpError } from './security.ts';

export interface SessionUser {
  id: number;
  email: string;
  name: string;
  role: 'customer' | 'admin';
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: SessionUser;
    }
  }
}

// ---------------------------------------------------------------------------
// Passwords: scrypt with a random salt, parameters stored with the hash so they can be raised later
// ---------------------------------------------------------------------------

const SCRYPT = { N: 32768, r: 8, p: 1, keylen: 64, maxmem: 96 * 1024 * 1024 };

function scryptAsync(password: string, salt: Buffer, p: { N: number; r: number; p: number; keylen: number }) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, p.keylen, { N: p.N, r: p.r, p: p.p, maxmem: SCRYPT.maxmem }, (err, key) =>
      err ? reject(err) : resolve(key)
    );
  });
}

const normalizePassword = (pw: string) => pw.normalize('NFKC');

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scryptAsync(normalizePassword(password), salt, SCRYPT);
  return ['scrypt', SCRYPT.N, SCRYPT.r, SCRYPT.p, salt.toString('base64'), key.toString('base64')].join('$');
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const [N, r, p] = [Number(parts[1]), Number(parts[2]), Number(parts[3])];
  if (!Number.isInteger(N) || !Number.isInteger(r) || !Number.isInteger(p)) return false;
  const salt = Buffer.from(parts[4], 'base64');
  const expected = Buffer.from(parts[5], 'base64');
  try {
    const actual = await scryptAsync(normalizePassword(password), salt, { N, r, p, keylen: expected.length });
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

// A hash to verify against when the email does not exist, so both cases take the same time.
let dummyHash: Promise<string> | null = null;
export async function burnPasswordCheck(password: string): Promise<void> {
  dummyHash ??= hashPassword(randomBytes(16).toString('hex'));
  await verifyPassword(password, await dummyHash);
}

const COMMON_PASSWORDS = new Set([
  'password',
  'password1',
  '1234567890',
  '0123456789',
  'azertyuiop',
  'qwertyuiop',
  'motdepasse',
  'iloveyou12',
  'rachidpotagiste',
]);

/** Returns a message when the password is too weak, otherwise null. */
export function passwordProblem(password: string, email: string): string | null {
  if (password.length < 10) return 'Le mot de passe doit contenir au moins 10 caractères.';
  if (password.length > 128) return 'Le mot de passe est trop long (128 caractères maximum).';
  const lower = password.toLowerCase();
  if (COMMON_PASSWORDS.has(lower) || lower === email.toLowerCase()) return 'Ce mot de passe est trop courant.';
  if (/^(.)\1+$/.test(password)) return 'Ce mot de passe est trop simple.';
  return null;
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

const CUSTOMER_TTL_MS = 14 * 24 * 3600 * 1000;
const ADMIN_TTL_MS = 12 * 3600 * 1000;

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of (header ?? '').split(';')) {
    const i = part.indexOf('=');
    if (i < 1) continue;
    const key = part.slice(0, i).trim();
    try {
      out[key] = decodeURIComponent(part.slice(i + 1).trim());
    } catch {
      /* ignore malformed cookie */
    }
  }
  return out;
}

export function setSessionCookie(res: Response, config: Config, token: string, maxAgeMs: number): void {
  const attrs = [
    `${config.cookieName}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${Math.floor(maxAgeMs / 1000)}`,
  ];
  if (config.secureCookies) attrs.push('Secure');
  res.append('Set-Cookie', attrs.join('; '));
}

export function clearSessionCookie(res: Response, config: Config): void {
  const attrs = [`${config.cookieName}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
  if (config.secureCookies) attrs.push('Secure');
  res.append('Set-Cookie', attrs.join('; '));
}

export async function startSession(db: Db, config: Config, res: Response, user: SessionUser): Promise<void> {
  const token = randomBytes(32).toString('base64url');
  const ttl = user.role === 'admin' ? ADMIN_TTL_MS : CUSTOMER_TTL_MS;
  await db.insert(sessions).values({ id: hashToken(token), userId: user.id, expiresAt: new Date(Date.now() + ttl) });
  // opportunistic cleanup of expired sessions
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
  setSessionCookie(res, config, token, ttl);
}

export async function endSession(db: Db, config: Config, req: Request, res: Response): Promise<void> {
  const token = parseCookies(req.headers.cookie)[config.cookieName];
  if (token) await db.delete(sessions).where(eq(sessions.id, hashToken(token)));
  clearSessionCookie(res, config);
}

/** Attaches req.user when the request carries a valid, unexpired session cookie. */
export function loadUser(db: Db, config: Config): RequestHandler {
  return async (req, _res, next) => {
    try {
      const token = parseCookies(req.headers.cookie)[config.cookieName];
      if (token && token.length >= 32 && token.length <= 128) {
        const rows = await db
          .select({ id: users.id, email: users.email, name: users.name, role: users.role })
          .from(sessions)
          .innerJoin(users, eq(users.id, sessions.userId))
          .where(and(eq(sessions.id, hashToken(token)), gt(sessions.expiresAt, sql`now()`)))
          .limit(1);
        if (rows[0]) req.user = rows[0] as SessionUser;
      }
      next();
    } catch (e) {
      next(e);
    }
  };
}

export const requireUser: RequestHandler = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) return next(new HttpError(401, 'not_authenticated', 'Connexion requise'));
  next();
};

export const requireAdmin: RequestHandler = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) return next(new HttpError(401, 'not_authenticated', 'Connexion requise'));
  if (req.user.role !== 'admin') return next(new HttpError(403, 'forbidden', 'Accès réservé à l\'administrateur'));
  next();
};
