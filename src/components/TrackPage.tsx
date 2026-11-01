import React, { useState } from 'react';
import { ApiError, api } from '../lib/api.ts';
import type { Language, PageView } from '../types/index.ts';

const L = {
  fr: { title: 'Suivre ma commande', num: 'Numéro de commande', phone: 'Téléphone de la commande', go: 'Rechercher', total: 'Total', cod: 'Paiement à la livraison', st: { pending: 'Reçue', confirmed: 'Confirmée', preparing: 'En préparation', shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée' }, back: 'Retour à la boutique' },
  ar: { title: 'تتبع طلبيتي', num: 'رقم الطلبية', phone: 'هاتف الطلبية', go: 'بحث', total: 'المجموع', cod: 'الدفع عند الاستلام', st: { pending: 'تم الاستلام', confirmed: 'مؤكدة', preparing: 'قيد التحضير', shipped: 'تم الشحن', delivered: 'تم التسليم', cancelled: 'ملغاة' }, back: 'العودة للمتجر' },
  en: { title: 'Track my order', num: 'Order number', phone: 'Order phone number', go: 'Search', total: 'Total', cod: 'Cash on delivery', st: { pending: 'Received', confirmed: 'Confirmed', preparing: 'Being prepared', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' }, back: 'Back to shop' },
} as const;

interface Tracked { number: string; status: keyof typeof L.fr.st; total: number; items: { name: string; quantity: number }[]; timeline: { status: keyof typeof L.fr.st; at: string }[] }

export const TrackPage: React.FC<{ lang: Language; onNavigate: (p: PageView) => void }> = ({ lang, onNavigate }) => {
  const t = L[lang] ?? L.fr;
  const [number, setNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<Tracked | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(''); setOrder(null);
    try {
      setOrder(await api<Tracked>('POST', '/orders/track', { number, phone }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur');
    } finally {
      setBusy(false);
    }
  };
  const field = 'w-full rounded-lg border border-[#C9BFA0] dark:border-[#3B5A40] bg-white dark:bg-[#14241A] px-3 py-2.5 text-sm text-[#1F3D2B] dark:text-[#F4F1EA]';
  return (
    <div className="py-10 px-4 max-w-xl mx-auto" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <h1 className="font-title text-2xl font-black text-[#1F3D2B] dark:text-[#F4F1EA] mb-6">{t.title}</h1>
      <form onSubmit={submit} className="space-y-3">
        <label className="block text-sm font-semibold text-[#1F3D2B] dark:text-[#F4F1EA]">{t.num}
          <input className={field + ' mt-1 font-mono'} dir="ltr" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="RP-261031-K7M2Q" required maxLength={24} autoComplete="off" />
        </label>
        <label className="block text-sm font-semibold text-[#1F3D2B] dark:text-[#F4F1EA]">{t.phone}
          <input className={field + ' mt-1'} dir="ltr" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required maxLength={40} autoComplete="tel" />
        </label>
        <button disabled={busy} className="w-full bg-[#1F3D2B] text-white dark:bg-[#E5B834] dark:text-[#10200F] py-3 rounded-xl font-bold text-sm disabled:opacity-60 cursor-pointer">{busy ? '…' : t.go}</button>
      </form>
      {error && <p role="alert" className="mt-4 text-sm font-semibold text-red-700 dark:text-red-300">{error}</p>}
      {order && (
        <section className="mt-6 rounded-xl border border-[#C9BFA0] dark:border-[#3B5A40] p-4 space-y-3 text-sm text-[#1F3D2B] dark:text-[#F4F1EA]" aria-live="polite">
          <p className="font-mono font-black" dir="ltr">{order.number}</p>
          <p className="font-bold text-lg">{t.st[order.status]}</p>
          <ul className="list-disc ps-5">{order.items.map((i, k) => <li key={k}>{i.quantity}× {i.name}</li>)}</ul>
          <p className="font-bold">{t.total} : {order.total} DH · {t.cod}</p>
          <ol className="border-s-2 border-[#C9BFA0] dark:border-[#3B5A40] ps-3 space-y-1">
            {order.timeline.map((ev, k) => <li key={k}>{t.st[ev.status]} <span className="opacity-70">· {new Date(ev.at).toLocaleString(lang)}</span></li>)}
          </ol>
        </section>
      )}
      <button onClick={() => onNavigate({ type: 'home' })} className="mt-8 underline text-sm font-semibold text-[#1F3D2B] dark:text-[#E5B834] cursor-pointer">{t.back}</button>
    </div>
  );
};
