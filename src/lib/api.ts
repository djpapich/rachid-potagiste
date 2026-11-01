/**
 * Browser side of the shop API. Everything is same-origin (`/api/*`, proxied by Netlify in
 * production and by Vite in development), so session cookies stay first-party.
 */

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: unknown) {
    super(message);
  }
}

/** True when the API could not be reached or answered something that is not JSON (cold start, no proxy). */
export const isApiDown = (e: unknown) => !(e instanceof ApiError) || e.status >= 500 || e.code === 'bad_response';

export async function api<T = any>(method: string, path: string, body?: unknown, timeoutMs = 12000): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!(res.headers.get('content-type') ?? '').includes('application/json')) {
      throw new ApiError(res.status || 502, 'bad_response', 'API indisponible');
    }
    const data = await res.json();
    if (!res.ok) throw new ApiError(res.status, data?.error ?? 'error', data?.message ?? 'Erreur', data?.details);
    return data as T;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(0, 'network', 'Connexion impossible');
  } finally {
    clearTimeout(timer);
  }
}

export interface PlacedOrder {
  number: string;
  total: number;
  subtotal: number;
  discount: number;
}

export const placeOrder = (payload: unknown) => api<PlacedOrder>('POST', '/orders', payload, 15000);
