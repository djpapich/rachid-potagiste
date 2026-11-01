import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { Config } from './config.ts';

/** An error that is safe to show to the client. Anything else becomes a generic 500. */
export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message?: string,
    public details?: unknown
  ) {
    super(message ?? code);
  }
}

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };

// ---------------------------------------------------------------------------
// Headers
// ---------------------------------------------------------------------------

const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' https://fonts.googleapis.com",
  "style-src-attr 'unsafe-inline'",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

export const securityHeaders: RequestHandler = (_req, res, next) => {
  res.setHeader('Content-Security-Policy', CSP);
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()'
  );
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  next();
};

/** Private API responses (accounts, orders, admin) must never be cached by browsers or proxies. */
export const noStore: RequestHandler = (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
};

// ---------------------------------------------------------------------------
// CSRF: origin check for every state-changing request
// ---------------------------------------------------------------------------

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Cookies are SameSite=Lax; this adds a second, independent layer. A state-changing request
 * must come from an allowed origin. Browsers always send Origin (or Sec-Fetch-Site) on cross-site
 * POSTs, so a forged form on another site is refused. Requests with no browser headers and no
 * cookie (scripts, curl) cannot ride on anyone's session and are let through.
 */
export function originGuard(config: Config): RequestHandler {
  return (req, _res, next) => {
    if (SAFE_METHODS.has(req.method)) return next();
    const origin = req.get('origin');
    let ok: boolean;
    if (origin) {
      ok = config.allowedOrigins.has(origin);
    } else {
      const site = req.get('sec-fetch-site');
      ok = site ? site === 'same-origin' || site === 'none' : !req.headers.cookie;
    }
    if (!ok) return next(new HttpError(403, 'forbidden_origin', 'Request origin not allowed'));
    next();
  };
}

/** Bodies are JSON only: a form post or text/plain request is refused before parsing. */
export const requireJson: RequestHandler = (req, _res, next) => {
  if (SAFE_METHODS.has(req.method) || req.method === 'DELETE') return next();
  const length = Number(req.get('content-length') ?? 0);
  if (length === 0 && !req.get('transfer-encoding')) return next(); // no body
  if (!req.is('application/json')) return next(new HttpError(415, 'unsupported_media_type', 'Use application/json'));
  next();
};

// ---------------------------------------------------------------------------
// Rate limiting (in memory, fixed window)
// ---------------------------------------------------------------------------

export interface Limiter {
  middleware: RequestHandler;
  /** Counts one hit for an arbitrary key; returns seconds to wait when over the limit, else 0. */
  hit(key: string): number;
  reset(key: string): void;
}

export function createLimiter(opts: { windowMs: number; max: number; keyFn?: (req: Request) => string }): Limiter {
  const hits = new Map<string, { count: number; resetAt: number }>();
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
  }, opts.windowMs);
  timer.unref();

  const hit = (key: string): number => {
    const now = Date.now();
    const entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + opts.windowMs });
      return 0;
    }
    entry.count += 1;
    return entry.count > opts.max ? Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) : 0;
  };

  const middleware: RequestHandler = (req, res, next) => {
    const wait = hit(opts.keyFn ? opts.keyFn(req) : req.ip || 'unknown');
    if (wait > 0) {
      res.setHeader('Retry-After', String(wait));
      return next(new HttpError(429, 'rate_limited', 'Too many requests, please slow down'));
    }
    next();
  };

  return { middleware, hit, reset: (key) => void hits.delete(key) };
}
