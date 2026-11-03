import React, { useCallback, useEffect, useState } from 'react';
import { ApiError, api } from '../lib/api.ts';

const STATUS_FR: Record<string, string> = { pending: 'Reçue', confirmed: 'Confirmée', preparing: 'En préparation', shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée' };
interface Order { id: number; number: string; status: string; customerName: string; customerPhone: string; city: string; address: string; notes: string | null; total: number; discount: number; promoCode: string | null; createdAt: string; next: string[]; items: { name: string; quantity: number }[] }
interface Prod { id: string; name: string; price: number; stock: number; active: boolean }
interface Promo { code: string; percent: number; active: boolean; usedCount: number; maxUses: number | null; endsAt: string | null }
interface Stats { last30Days: { orders: number; revenue: number }; byStatus: { status: string; n: number }[]; lowStock: { id: string; stock: number }[] }

const input = 'rounded-lg border border-[#C9BFA0] dark:border-[#3B5A40] bg-white dark:bg-[#14241A] px-2 py-1.5 text-sm text-[#1F3D2B] dark:text-[#F4F1EA]';
const btn = 'rounded-lg bg-[#1F3D2B] text-white dark:bg-[#E5B834] dark:text-[#10200F] px-3 py-1.5 text-xs font-bold cursor-pointer disabled:opacity-60';

export const AdminPage: React.FC = () => {
  const [user, setUser] = useState<{ name: string; role: string } | null | undefined>(undefined);
  const [tab, setTab] = useState<'orders' | 'products' | 'promos'>('orders');
  const [msg, setMsg] = useState('');
  const fail = (e: unknown) => setMsg(e instanceof ApiError ? e.message : 'Erreur');

  useEffect(() => { api('GET', '/auth/me').then((r) => setUser(r.user)).catch(() => setUser(null)); }, []);

  if (user === undefined) return <p className="p-8 text-center text-[#1F3D2B] dark:text-[#F4F1EA]">…</p>;
  if (!user || user.role !== 'admin') return <Login onDone={setUser} />;

  const tabBtn = (id: typeof tab, label: string) => (
    <button key={id} onClick={() => setTab(id)} aria-pressed={tab === id} className={`px-4 py-2 rounded-lg text-sm font-bold cursor-pointer ${tab === id ? 'bg-[#1F3D2B] text-white dark:bg-[#E5B834] dark:text-[#10200F]' : 'text-[#1F3D2B] dark:text-[#F4F1EA] border border-[#C9BFA0] dark:border-[#3B5A40]'}`}>{label}</button>
  );
  return (
    <div className="py-8 px-4 max-w-6xl mx-auto text-[#1F3D2B] dark:text-[#F4F1EA]">
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <h1 className="font-title text-2xl font-black me-auto">Administration</h1>
        {tabBtn('orders', 'Commandes')}{tabBtn('products', 'Produits')}{tabBtn('promos', 'Promotions')}
        <button className={btn} onClick={async () => { await api('POST', '/auth/logout', {}).catch(() => {}); setUser(null); }}>Déconnexion</button>
      </div>
      {msg && <p role="alert" className="mb-3 text-sm font-semibold text-red-700 dark:text-red-300">{msg}</p>}
      {tab === 'orders' && <Orders fail={fail} clear={() => setMsg('')} />}
      {tab === 'products' && <Products fail={fail} clear={() => setMsg('')} />}
      {tab === 'promos' && <Promos fail={fail} clear={() => setMsg('')} />}
    </div>
  );
};

const Login: React.FC<{ onDone: (u: any) => void }> = ({ onDone }) => {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  return (
    <form className="max-w-sm mx-auto py-12 px-4 space-y-3" onSubmit={async (e) => {
      e.preventDefault(); setBusy(true); setErr('');
      try { const r = await api('POST', '/auth/login', { email, password }); if (r.user.role !== 'admin') { await api('POST', '/auth/logout', {}); setErr('Accès réservé à l\'administrateur'); } else onDone(r.user); }
      catch (x) { setErr(x instanceof ApiError ? x.message : 'Erreur'); } finally { setBusy(false); }
    }}>
      <h1 className="font-title text-2xl font-black text-[#1F3D2B] dark:text-[#F4F1EA]">Connexion admin</h1>
      <input className={input + ' w-full'} type="email" autoComplete="username" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input className={input + ' w-full'} type="password" autoComplete="current-password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />
      {err && <p role="alert" className="text-sm font-semibold text-red-700 dark:text-red-300">{err}</p>}
      <button className={btn + ' w-full py-2.5'} disabled={busy}>{busy ? '…' : 'Se connecter'}</button>
    </form>
  );
};

type P = { fail: (e: unknown) => void; clear: () => void };

const Orders: React.FC<P> = ({ fail, clear }) => {
  const [orders, setOrders] = useState<Order[]>([]); const [stats, setStats] = useState<Stats | null>(null); const [filter, setFilter] = useState('');
  const load = useCallback(() => {
    api('GET', `/admin/orders${filter ? `?status=${filter}` : ''}`).then((r) => { setOrders(r.orders); clear(); }).catch(fail);
    api('GET', '/admin/stats').then(setStats).catch(fail);
  }, [filter, fail, clear]);
  useEffect(load, [load]);
  const move = async (id: number, status: string) => {
    if (status === 'cancelled' && !window.confirm('Annuler cette commande ? Le stock sera remis.')) return;
    try { await api('PATCH', `/admin/orders/${id}`, { status }); load(); } catch (e) { fail(e); }
  };
  return (
    <div className="space-y-4">
      {stats && <p className="text-sm font-semibold">30 derniers jours : {stats.last30Days.orders} commandes · {stats.last30Days.revenue} DH{stats.lowStock.length > 0 && <> · Stock bas : {stats.lowStock.map((l) => `${l.id} (${l.stock})`).join(', ')}</>}</p>}
      <select className={input} value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filtrer par statut">
        <option value="">Tous les statuts</option>{Object.entries(STATUS_FR).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
      {orders.length === 0 && <p className="text-sm">Aucune commande.</p>}
      {orders.map((o) => (
        <article key={o.id} className="rounded-xl border border-[#C9BFA0] dark:border-[#3B5A40] p-4 text-sm space-y-2">
          <div className="flex flex-wrap gap-x-4 gap-y-1 items-baseline"><b className="font-mono">{o.number}</b><span className="font-bold">{STATUS_FR[o.status]}</span><span>{new Date(o.createdAt).toLocaleString('fr')}</span><b className="ms-auto">{o.total} DH{o.promoCode ? ` (${o.promoCode})` : ''}</b></div>
          <p>{o.customerName} · <a className="underline" href={`tel:${o.customerPhone.replace(/[^\d+]/g, '')}`}>{o.customerPhone}</a> · {o.city}, {o.address}{o.notes ? ` · Note : ${o.notes}` : ''}</p>
          <p>{o.items.map((i) => `${i.quantity}× ${i.name}`).join(' · ')}</p>
          <div className="flex flex-wrap gap-2">{o.next.map((n) => <button key={n} className={btn} onClick={() => move(o.id, n)}>{n === 'cancelled' ? 'Annuler' : `→ ${STATUS_FR[n]}`}</button>)}</div>
        </article>
      ))}
    </div>
  );
};

const Products: React.FC<P> = ({ fail, clear }) => {
  const [rows, setRows] = useState<Prod[]>([]);
  const load = useCallback(() => { api('GET', '/admin/products').then((r) => { setRows(r.products); clear(); }).catch(fail); }, [fail, clear]);
  useEffect(load, [load]);
  const save = async (p: Prod) => { try { await api('PATCH', `/admin/products/${p.id}`, { price: p.price, stock: p.stock, active: p.active }); load(); } catch (e) { fail(e); } };
  const edit = (id: string, patch: Partial<Prod>) => setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const num = (v: string) => Math.max(0, Math.min(100000, Math.round(Number(v) || 0)));
  return (
    <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-start"><th className="text-start p-2">Produit</th><th className="p-2">Prix DH</th><th className="p-2">Stock</th><th className="p-2">Visible</th><th /></tr></thead>
      <tbody>{rows.map((p) => (
        <tr key={p.id} className="border-t border-[#C9BFA0] dark:border-[#3B5A40]">
          <td className="p-2">{p.name}</td>
          <td className="p-2"><input aria-label={`Prix ${p.name}`} className={input + ' w-24'} type="number" min={0} value={p.price} onChange={(e) => edit(p.id, { price: num(e.target.value) })} /></td>
          <td className="p-2"><input aria-label={`Stock ${p.name}`} className={input + ' w-20'} type="number" min={0} value={p.stock} onChange={(e) => edit(p.id, { stock: num(e.target.value) })} /></td>
          <td className="p-2 text-center"><input aria-label={`Visible ${p.name}`} type="checkbox" checked={p.active} onChange={(e) => edit(p.id, { active: e.target.checked })} /></td>
          <td className="p-2"><button className={btn} onClick={() => save(p)}>Enregistrer</button></td>
        </tr>))}</tbody></table></div>
  );
};

const Promos: React.FC<P> = ({ fail, clear }) => {
  const [rows, setRows] = useState<Promo[]>([]); const [code, setCode] = useState(''); const [percent, setPercent] = useState(10);
  const load = useCallback(() => { api('GET', '/admin/promos').then((r) => { setRows(r.promos); clear(); }).catch(fail); }, [fail, clear]);
  useEffect(load, [load]);
  return (
    <div className="space-y-4">
      <form className="flex flex-wrap gap-2 items-end" onSubmit={async (e) => { e.preventDefault(); try { await api('POST', '/admin/promos', { code, percent }); setCode(''); load(); } catch (x) { fail(x); } }}>
        <input className={input} placeholder="CODE" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} pattern="[A-Z0-9_\-]{3,32}" required aria-label="Code" />
        <input className={input + ' w-20'} type="number" min={0} max={50} value={percent} onChange={(e) => setPercent(Math.min(50, Math.max(0, Number(e.target.value) || 0)))} aria-label="Pourcentage" />
        <button className={btn}>Créer (max 50 %)</button>
      </form>
      {rows.map((p) => (
        <div key={p.code} className="flex flex-wrap items-center gap-3 rounded-xl border border-[#C9BFA0] dark:border-[#3B5A40] p-3 text-sm">
          <b className="font-mono">{p.code}</b><span>-{p.percent}%</span><span>{p.usedCount}{p.maxUses ? `/${p.maxUses}` : ''} utilisations</span>{p.endsAt && <span>jusqu'au {new Date(p.endsAt).toLocaleDateString('fr')}</span>}
          <button className={btn + ' ms-auto'} onClick={async () => { try { await api('PATCH', `/admin/promos/${p.code}`, { active: !p.active }); load(); } catch (e) { fail(e); } }}>{p.active ? 'Désactiver' : 'Activer'}</button>
        </div>))}
    </div>
  );
};
