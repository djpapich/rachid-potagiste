import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express, { type ErrorRequestHandler } from 'express';
import { loadUser } from './auth.ts';
import type { Config } from './config.ts';
import type { Db } from './db.ts';
import { createRouter, type RouterOptions } from './routes.ts';
import { HttpError, originGuard, requireJson, securityHeaders } from './security.ts';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export function createApp(db: Db, config: Config, opts: RouterOptions = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);
  app.use(securityHeaders);

  const api = express.Router();
  api.use(originGuard(config), requireJson, express.json({ limit: '16kb', strict: true }), loadUser(db, config));
  api.get('/health', (_req, res) => { res.setHeader('Cache-Control', 'no-store'); res.json({ ok: true }); });
  api.use(createRouter(db, config, opts));
  api.use((_req, _res, next) => next(new HttpError(404, 'not_found', 'Not found')));
  app.use('/api', api);

  // Static front (used when the API host also serves the site, e.g. local production preview)
  const staticOptions = { dotfiles: 'ignore' as const, index: false, redirect: false };
  const dist = path.join(rootDir, 'dist');
  app.use((req, _res, next) => (req.method === 'GET' || req.method === 'HEAD' ? next() : next(new HttpError(405, 'method_not_allowed', 'Method not allowed'))));
  app.use(express.static(dist, staticOptions));
  app.get('*', (req, res, next) => {
    if (path.extname(req.path)) return next(new HttpError(404, 'not_found', 'Not found'));
    const index = path.join(dist, 'index.html');
    if (!fs.existsSync(index)) return next(new HttpError(404, 'not_found', 'Not found'));
    res.sendFile(index);
  });

  const onError: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof HttpError) {
      return void res.status(err.status).json({ error: err.code, message: err.message, ...(err.details !== undefined && { details: err.details }) });
    }
    const e = err as { type?: string; status?: number };
    if (e.type === 'entity.too.large') return void res.status(413).json({ error: 'payload_too_large', message: 'Corps trop volumineux' });
    if (e.type === 'entity.parse.failed' || e.type === 'encoding.unsupported') return void res.status(400).json({ error: 'invalid_json', message: 'JSON invalide' });
    console.error('Unhandled error:', err instanceof Error ? err.message : err);
    res.status(500).json({ error: 'internal_error', message: 'Erreur interne' });
  };
  app.use(onError);
  return app;
}
