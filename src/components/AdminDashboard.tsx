import React, { useState } from 'react';
import { 
  BarChart3, 
  Package, 
  ShoppingBag, 
  Users, 
  AlertTriangle, 
  Download, 
  Plus, 
  Check, 
  X,
  RefreshCw, 
  ArrowUpRight,
  ShieldCheck,
  Truck,
  MessageSquare,
  Star,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { storeService } from '../services/storeService.ts';
import { Product, Order, OrderStatus, Language, Review } from '../types/index.ts';
import { translations } from '../lib/translations.ts';
import { resolveImageUrl, handleImageError } from '../lib/imageHelper.ts';

interface AdminDashboardProps {
  currentLang: Language;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentLang }) => {
  const t = translations[currentLang];
  const products = storeService.getProducts();
  const orders = storeService.getOrders();
  const analytics = storeService.getAnalytics();
  const reviews = storeService.getAllReviews();

  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'reviews' | 'analytics'>('inventory');
  const [showAddModal, setShowAddModal] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  // New product form
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('graines-semences');
  const [newPrice, setNewPrice] = useState('45.00');
  const [newStock, setNewStock] = useState('50');
  const [newUnit, setNewUnit] = useState('Sachet kraft de 50 graines');
  const [newOrigin, setNewOrigin] = useState('Ferme de Rachid - Rabat');
  const [newDesc, setNewDesc] = useState('Semences paysannes reproductibles non-hybrides cultivées sans aucun pesticide.');

  const handleExportPdf = () => {
    setExportingPdf(true);
    storeService.exportAnalyticsPdf();
    setTimeout(() => setExportingPdf(false), 1200);
  };

  const handleStockAdjust = (productId: number, delta: number) => {
    const prod = products.find(p => p.id === productId);
    if (prod) {
      storeService.updateProductStock(productId, prod.stock + delta);
    }
  };

  const handleOrderStatusChange = (orderNumber: string, status: OrderStatus) => {
    storeService.updateOrderStatus(orderNumber, status);
  };

  const handleReviewModeration = (reviewId: number, status: 'approved' | 'rejected') => {
    storeService.moderateReview(reviewId, status);
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    storeService.addProduct({
      slug: `semence-${Date.now()}`,
      name: newName,
      categorySlug: newCategory,
      price: Math.round(parseFloat(newPrice) * 100),
      originalPrice: null,
      stock: parseInt(newStock, 10) || 30,
      unit: newUnit,
      description: newDesc,
      origin: newOrigin,
      certification: 'Semences Paysannes Reproductibles',
      rating: '5.0',
      reviewCount: 1,
      imageUrl: '/images/rachid_graines_paysannes_1791482677509.jpg',
      isFeatured: 0,
    });
    setShowAddModal(false);
    setNewName('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>RACHID POTAGISTE · {t.developedBy}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
            Tableau de Bord & Modération des Avis
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Synchronisation PostgreSQL Cloud SQL · Chiffres et prix en Dirhams (DH / MAD)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-[#1F3A2B] text-white text-xs font-semibold rounded-lg hover:bg-[#162a1f] flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une semence / produit</span>
          </button>

          <button
            onClick={handleExportPdf}
            disabled={exportingPdf}
            className="px-4 py-2.5 bg-white text-stone-800 border border-stone-300 text-xs font-semibold rounded-lg hover:bg-stone-50 flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-800" />
            <span>{exportingPdf ? 'Génération...' : t.exportPdf}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Chiffre d'Affaires</span>
            <ShoppingBag className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900 tabular-nums">
            {(analytics.totalRevenue / 100).toFixed(2)} {t.currency}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+24.6% au Maroc</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Commandes traitées</span>
            <Truck className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900 tabular-nums">
            {analytics.totalOrders}
          </div>
          <div className="text-[11px] text-stone-500">
            Panier moyen : <strong className="text-stone-800">{(analytics.averageOrderValue / 100).toFixed(2)} {t.currency}</strong>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Avis Clients & YouTube</span>
            <MessageSquare className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900 tabular-nums">
            {reviews.length}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium">
            Note moyenne : 4.95 / 5 ★
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Alertes Stock Pépinière</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-amber-700 tabular-nums">
            {analytics.lowStockItemsCount}
          </div>
          <div className="text-[11px] text-stone-500">
            Seuil critique : &le; 10 unités
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-stone-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 px-3 transition-colors cursor-pointer border-b-2 ${
            activeTab === 'inventory' ? 'border-[#1F3A2B] text-[#1F3A2B]' : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          Stocks & Semences en Direct ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-3 transition-colors cursor-pointer border-b-2 ${
            activeTab === 'orders' ? 'border-[#1F3A2B] text-[#1F3A2B]' : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          Gestion des Commandes ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`pb-3 px-3 transition-colors cursor-pointer border-b-2 ${
            activeTab === 'reviews' ? 'border-[#1F3A2B] text-[#1F3A2B]' : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          Modération des Avis Clients ({reviews.length})
        </button>
      </div>

      {/* Tab: Inventory & Stock */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs text-stone-600">
            <span className="font-semibold text-stone-800">
              Inventaire de la Pépinière Rachid Le Potagiste (Cloud SQL PostgreSQL)
            </span>
            <span className="text-[11px] text-stone-500">
              Prix en Dirhams (DH)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FBFBF9] text-stone-500 border-b border-stone-200 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5 pl-5">Semence / Produit</th>
                  <th className="p-3.5">Catégorie</th>
                  <th className="p-3.5">Prix (DH)</th>
                  <th className="p-3.5">Stock Disponible</th>
                  <th className="p-3.5">Ajustement Rapide</th>
                  <th className="p-3.5 pr-5 text-right">État</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map((p) => {
                  const isLow = p.stock <= 10 && p.stock > 0;
                  const isOut = p.stock === 0;

                  return (
                    <tr key={p.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="p-3.5 pl-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={resolveImageUrl(p.imageUrl)}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover bg-stone-100 shrink-0"
                            referrerPolicy="no-referrer"
                            onError={handleImageError}
                          />
                          <div>
                            <div className="font-semibold text-stone-900 line-clamp-1">{p.name}</div>
                            <div className="text-[11px] text-stone-400">{p.origin}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 text-stone-600 font-medium">
                        {p.categorySlug}
                      </td>

                      <td className="p-3.5 font-bold text-stone-900 tabular-nums">
                        {(p.price / 100).toFixed(2)} {t.currency}
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold text-sm ${
                            isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-emerald-800'
                          }`}>
                            {p.stock}
                          </span>
                          <span className="text-[11px] text-stone-400">paquets/pots</span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleStockAdjust(p.id, -1)}
                            disabled={p.stock <= 0}
                            className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-xs font-semibold cursor-pointer disabled:opacity-40"
                          >
                            -1
                          </button>
                          <button
                            onClick={() => handleStockAdjust(p.id, 1)}
                            className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-xs font-semibold cursor-pointer"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => handleStockAdjust(p.id, 10)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded text-xs font-semibold cursor-pointer"
                          >
                            +10
                          </button>
                        </div>
                      </td>

                      <td className="p-3.5 pr-5 text-right">
                        {isOut ? (
                          <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700">
                            Rupture
                          </span>
                        ) : isLow ? (
                          <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700">
                            Faible ({p.stock})
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800">
                            Disponible
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Orders Management */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-stone-50 border-b border-stone-200 text-xs text-stone-600">
            <span className="font-semibold text-stone-800">
              Expéditions au Maroc (Amana & Messagerie)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FBFBF9] text-stone-500 border-b border-stone-200 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5 pl-5">N° Commande</th>
                  <th className="p-3.5">Client & Ville</th>
                  <th className="p-3.5">Articles</th>
                  <th className="p-3.5">Montant (DH)</th>
                  <th className="p-3.5">Statut Actuel</th>
                  <th className="p-3.5 pr-5">Mettre à jour le statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((o) => (
                  <tr key={o.orderNumber} className="hover:bg-stone-50/80 transition-colors">
                    <td className="p-3.5 pl-5 font-mono font-bold text-stone-900">
                      {o.orderNumber}
                    </td>

                    <td className="p-3.5">
                      <div className="font-medium text-stone-900">{o.customerName}</div>
                      <div className="text-[11px] text-stone-500">{o.shippingCity} · {o.customerPhone}</div>
                    </td>

                    <td className="p-3.5 text-stone-600">
                      {o.items.length} produit(s)
                    </td>

                    <td className="p-3.5 font-bold text-stone-900 tabular-nums">
                      {(o.totalAmount / 100).toFixed(2)} {t.currency}
                    </td>

                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {t.orderStatus[o.status]}
                      </span>
                    </td>

                    <td className="p-3.5 pr-5">
                      <select
                        value={o.status}
                        onChange={(e) => handleOrderStatusChange(o.orderNumber, e.target.value as OrderStatus)}
                        className="px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs bg-white text-stone-800 focus:outline-none focus:border-emerald-700 cursor-pointer"
                      >
                        <option value="confirmed">1. Validée</option>
                        <option value="preparing">2. En Préparation à la Pépinière</option>
                        <option value="shipped">3. Expédié (Amana Express)</option>
                        <option value="delivered">4. Remis au client</option>
                        <option value="cancelled">Annulée</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Customer Reviews Moderation Queue */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs space-y-0">
          <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs text-stone-600">
            <span className="font-semibold text-stone-800">
              File de Modération des Avis & Retours YouTube ({reviews.length})
            </span>
            <span className="text-[11px] text-stone-500">
              Approuvez ou rejetez les avis en direct
            </span>
          </div>

          <div className="divide-y divide-stone-100">
            {reviews.map((rev) => {
              const product = products.find(p => p.id === rev.productId);

              return (
                <div key={rev.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-stone-50/50 transition-colors">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-900 text-xs">{rev.authorName}</span>
                      {rev.authorLocation && (
                        <span className="text-[11px] text-stone-400">({rev.authorLocation})</span>
                      )}
                      <span aria-hidden="true" className="text-stone-300">·</span>
                      <span className="text-[11px] text-emerald-800 font-medium">
                        Pour : {product?.name || `Produit #${rev.productId}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-amber-500">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                        ))}
                      </div>
                      <span className="text-[11px] text-stone-400 font-mono">
                        {new Date(rev.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                      {rev.source === 'youtube_community' && (
                        <span className="text-[10px] text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded font-medium">
                          YouTube @Rachid_Le_Potagiste
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-stone-700 leading-relaxed font-sans bg-[#FBFBF9] p-3 rounded-lg border border-stone-100">
                      "{rev.comment}"
                    </p>
                  </div>

                  {/* Moderation Controls */}
                  <div className="flex items-center sm:flex-col items-end gap-2 shrink-0">
                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                      rev.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : rev.status === 'rejected'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {rev.status.toUpperCase()}
                    </span>

                    <div className="flex items-center gap-1.5 pt-1">
                      {rev.status !== 'approved' && (
                        <button
                          onClick={() => handleReviewModeration(rev.id, 'approved')}
                          className="px-2.5 py-1 bg-emerald-700 text-white rounded text-xs font-semibold hover:bg-emerald-800 flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{t.approve}</span>
                        </button>
                      )}
                      {rev.status !== 'rejected' && (
                        <button
                          onClick={() => handleReviewModeration(rev.id, 'rejected')}
                          className="px-2.5 py-1 bg-stone-100 text-rose-700 rounded text-xs font-semibold hover:bg-rose-50 border border-stone-200 flex items-center gap-1 cursor-pointer"
                        >
                          <XCircle className="w-3 h-3" />
                          <span>{t.reject}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Add Product / Seed */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <h3 className="text-base font-serif font-bold text-stone-900">
              Ajouter une semence ou produit potager bio
            </h3>

            <form onSubmit={handleAddProductSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-stone-600 font-medium">Nom de la variété / produit</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="ex: Semences de Menthe Marocaine Bio"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-stone-50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-600 font-medium">Catégorie</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-stone-50"
                  >
                    <option value="graines-semences">Semences Paysannes</option>
                    <option value="amendements-engrais">Compost & Engrais Naturels</option>
                    <option value="plants-arbustes">Plants Bio & Aromatiques</option>
                    <option value="fruits-legumes">Paniers Récolte du Jour</option>
                    <option value="epicerie-terroir">Produits de la Ferme</option>
                  </select>
                </div>

                <div>
                  <label className="text-stone-600 font-medium">Prix en Dirhams (DH)</label>
                  <input
                    type="number"
                    step="1"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-stone-50"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-600 font-medium">Stock initial (paquets/unités)</label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-stone-50"
                    required
                  />
                </div>

                <div>
                  <label className="text-stone-600 font-medium">Unité / Conditionnement</label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="Sachet 50 graines, Sac 10 kg..."
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-stone-50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-600 font-medium">Origine / Pépinière</label>
                <input
                  type="text"
                  value={newOrigin}
                  onChange={(e) => setNewOrigin(e.target.value)}
                  placeholder="Ferme de Rachid - Région Rabat"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-stone-50"
                  required
                />
              </div>

              <div>
                <label className="text-stone-600 font-medium">Conseils de culture & Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-stone-50"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1F3A2B] text-white rounded-lg hover:bg-[#162a1f] font-semibold cursor-pointer"
                >
                  Enregistrer dans PostgreSQL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
