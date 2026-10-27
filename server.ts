import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IS_PROD = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

const app = express();

// Hide the framework fingerprint and trust the first proxy (Netlify / Cloud Run / nginx)
app.disable('x-powered-by');
app.set('trust proxy', 1);

// ---------------------------------------------------------------------------
// Security headers (same policy as netlify.toml)
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

app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Content-Security-Policy', CSP);
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), interest-cohort=()'
  );
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  next();
});

// This is a read-only storefront: refuse every method except GET / HEAD.
// (No request body is ever parsed, which removes a whole class of attacks.)
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  next();
});

// ---------------------------------------------------------------------------
// Minimal in-memory rate limiter for the API (per IP, fixed window)
// ---------------------------------------------------------------------------
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 120;
const hits = new Map<string, { count: number; resetAt: number }>();

const rateLimit = (req: Request, res: Response, next: NextFunction) => {
  const now = Date.now();
  const key = req.ip || 'unknown';
  const entry = hits.get(key);

  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }

  entry.count += 1;
  if (entry.count > MAX_REQUESTS_PER_WINDOW) {
    res.setHeader('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
    return res.status(429).json({ error: 'Too many requests' });
  }
  next();
};

// Drop expired counters so the map cannot grow without bound
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of hits) {
    if (entry.resetAt <= now) hits.delete(key);
  }
}, WINDOW_MS).unref();

// ---------------------------------------------------------------------------
// JSON data files (read from a fixed allow-list, cached for 60 s)
// ---------------------------------------------------------------------------
const DATA_DIR = path.join(__dirname, 'public', 'data');
const DATA_FILES = {
  products: path.join(DATA_DIR, 'products.json'),
  promo: path.join(DATA_DIR, 'promo.json'),
} as const;

const CACHE_TTL_MS = 60_000;
const cache = new Map<string, { at: number; data: unknown }>();

async function readJson(file: string): Promise<unknown | null> {
  const cached = cache.get(file);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.data;

  try {
    const raw = await fs.promises.readFile(file, 'utf8');
    const data = JSON.parse(raw);
    cache.set(file, { at: Date.now(), data });
    return data;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}

const jsonRoute = (file: string, label: string) => async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await readJson(file);
    if (data === null) return res.status(404).json({ error: `${label} not found` });
    res.setHeader('Cache-Control', 'public, max-age=300, must-revalidate');
    return res.json(data);
  } catch (error) {
    next(error);
  }
};

app.get('/api/products', rateLimit, jsonRoute(DATA_FILES.products, 'Products'));
app.get('/api/promo', rateLimit, jsonRoute(DATA_FILES.promo, 'Promo'));

// Unknown API routes must answer 404 JSON, never the SPA shell
app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// ---------------------------------------------------------------------------
// Static files: the production build only. public/ is served in development.
// ---------------------------------------------------------------------------
const DIST_DIR = path.join(__dirname, 'dist');
const staticOptions = { dotfiles: 'ignore' as const, index: false, redirect: false };

app.use(express.static(DIST_DIR, staticOptions));
if (!IS_PROD) {
  app.use(express.static(path.join(__dirname, 'public'), staticOptions));
}

// SPA fallback
app.get('*', (req: Request, res: Response) => {
  // A path that looks like a file (has an extension) but was not found is a 404, not the app shell
  if (path.extname(req.path)) {
    return res.status(404).type('text/plain').send('Not found');
  }
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.setHeader('Cache-Control', 'no-cache');
    return res.sendFile(indexPath);
  }
  if (!IS_PROD) {
    return res.sendFile(path.join(__dirname, 'index.html'));
  }
  return res.status(503).type('text/plain').send('Site is not built yet.');
});

// Last resort: never leak stack traces or internal paths
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

if (IS_PROD) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
