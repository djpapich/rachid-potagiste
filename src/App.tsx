/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { ProductCard } from './components/ProductCard.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { OrderTrackingView } from './components/OrderTrackingView.tsx';
import { EmailSimulatorModal } from './components/EmailSimulatorModal.tsx';
import { BlogSection } from './components/BlogSection.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { NotificationPanel } from './components/NotificationToast.tsx';
import { Footer } from './components/Footer.tsx';
import { RachidMediaSection } from './components/RachidMediaSection.tsx';
import { storeService } from './services/storeService.ts';
import { Product, CartItem, Language, Order, AppTheme } from './types/index.ts';
import { translations } from './lib/translations.ts';
import { resolveImageUrl, handleImageError } from './lib/imageHelper.ts';
import { Filter, Sparkles, ShieldCheck, Truck, Leaf, Youtube } from 'lucide-react';

export default function App() {
  const [currentLang, setCurrentLang] = useState<Language>('fr');
  const [theme, setTheme] = useState<AppTheme>(() => (localStorage.getItem('rp_theme') as AppTheme) || 'white');
  const [activeView, setActiveView] = useState<'shop' | 'blog' | 'tracking' | 'admin'>('shop');
  
  // Store synced state
  const [products, setProducts] = useState<Product[]>(storeService.getProducts());
  const [categories, setCategories] = useState(storeService.getCategories());
  const [notifications, setNotifications] = useState(storeService.getNotifications());

  // Cart & Modals
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isEmailSimOpen, setIsEmailSimOpen] = useState(false);
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating'>('featured');
  const [recentlyAddedId, setRecentlyAddedId] = useState<number | null>(null);

  useEffect(() => {
    const unsubscribe = storeService.subscribe(() => {
      setProducts(storeService.getProducts());
      setNotifications(storeService.getNotifications());
    });
    return unsubscribe;
  }, []);

  const t = translations[currentLang];
  const isRtl = currentLang === 'ar';

  // Recommendations calculated via collaborative & content-based filtering
  const homeRecommendations = storeService.getRecommendations();

  // Cart handlers
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: Math.min(product.stock, i.quantity + quantity) }
            : i
        );
      }
      return [...prev, { product, quantity }];
    });
    setRecentlyAddedId(product.id);
    setTimeout(() => setRecentlyAddedId(null), 1500);
  };

  const handleUpdateCartQuantity = (productId: number, qty: number) => {
    if (qty <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity: qty } : item
      )
    );
  };

  const handleRemoveCartItem = (productId: number) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleOrderCompleted = (order: Order) => {
    setCartItems([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setActiveView('tracking');
  };

  // Filtered products calculation
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.categorySlug === selectedCategory;
    const matchesSearch = searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.origin.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'rating') return parseFloat(b.rating) - parseFloat(a.rating);
    return (b.isFeatured || 0) - (a.isFeatured || 0);
  });

  const cartTotalCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const unreadNotifsCount = notifications.filter(n => n.isRead === 0).length;

  return (
    <div className={`min-h-screen bg-[#FBFBF9] flex flex-col transition-colors duration-200 ${theme === 'black' ? 'theme-black dark' : ''} ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Top Bar Navigation */}
      <Navbar
        currentLang={currentLang}
        onSelectLang={setCurrentLang}
        activeView={activeView}
        onChangeView={setActiveView}
        cartCount={cartTotalCount}
        onOpenCart={() => setIsCartOpen(true)}
        unreadNotifsCount={unreadNotifsCount}
        onOpenNotifs={() => setIsNotifsOpen(true)}
        onOpenEmailSim={() => setIsEmailSimOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        theme={theme}
        onToggleTheme={() => {
          setTheme(prev => {
            const next = prev === 'white' ? 'black' : 'white';
            localStorage.setItem('rp_theme', next);
            return next;
          });
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeView === 'shop' && (
          <div className="space-y-12">
            {/* Hero Section */}
            <Hero
              currentLang={currentLang}
              theme={theme}
              onExplore={() => {
                const el = document.getElementById('catalog-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onViewBlog={() => setActiveView('blog')}
            />

            {/* Catalog Grid Section */}
            <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-4">
              
              {/* Category Filter Tabs & Sort Controls */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-200">
                {/* Interactive Category Segmented Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                      selectedCategory === 'all'
                        ? 'bg-[#1F3A2B] text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {t.allCategories}
                  </button>

                  {categories.map((c) => {
                    const label = currentLang === 'ar' ? c.nameAr : currentLang === 'en' ? c.nameEn : c.nameFr;
                    return (
                      <button
                        key={c.slug}
                        onClick={() => setSelectedCategory(c.slug)}
                        className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                          selectedCategory === c.slug
                            ? 'bg-[#1F3A2B] text-white shadow-xs'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                {/* Sort By Dropdown */}
                <div className="flex items-center gap-2 text-xs text-stone-600 shrink-0">
                  <Filter className="w-3.5 h-3.5 text-stone-400" />
                  <span>{t.sortBy} :</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-xs font-medium text-stone-800 focus:outline-none focus:border-emerald-700 cursor-pointer"
                  >
                    <option value="featured">{t.sortFeatured}</option>
                    <option value="price_asc">{t.sortPriceAsc}</option>
                    <option value="price_desc">{t.sortPriceDesc}</option>
                    <option value="rating">{t.sortRating}</option>
                  </select>
                </div>
              </div>

              {/* Product Cards Grid */}
              {filteredProducts.length === 0 ? (
                <div className="py-16 text-center text-stone-400 space-y-2">
                  <Leaf className="w-10 h-10 mx-auto stroke-1" />
                  <p className="text-sm">Aucune semence ou variété ne correspond à votre recherche.</p>
                  <button
                    onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                    className="text-xs text-emerald-800 underline font-medium cursor-pointer"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredProducts.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      currentLang={currentLang}
                      onAddToCart={(prod) => handleAddToCart(prod, 1)}
                      onOpenDetail={(prod) => setSelectedProduct(prod)}
                      isAddedJustNow={recentlyAddedId === p.id}
                    />
                  ))}
                </div>
              )}

              {/* Personalized Product Recommendation System on Homepage */}
              {homeRecommendations.length > 0 && (
                <div className="mt-14 bg-emerald-50/70 rounded-2xl p-6 sm:p-8 border border-emerald-100 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-900">
                        <Sparkles className="w-4 h-4 text-emerald-700" />
                        <span>{t.recommendations}</span>
                      </div>
                      <h3 className="text-xl font-serif font-bold text-stone-900">
                        Idéal pour débuter ou enrichir votre potager au Maroc
                      </h3>
                      <p className="text-xs text-stone-500">
                        {t.recommendationSubtitle}
                      </p>
                    </div>

                    <span className="text-xs text-emerald-800 font-semibold bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200">
                      Algorithme de synergie végétale & compost
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {homeRecommendations.map((rec) => (
                      <div
                        key={`home-rec-${rec.product.id}`}
                        className="bg-white p-4 rounded-xl border border-emerald-200/80 flex flex-col justify-between space-y-3 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={resolveImageUrl(rec.product.imageUrl)}
                            alt={rec.product.name}
                            className="w-16 h-16 object-cover rounded-lg bg-stone-100 shrink-0 cursor-pointer"
                            onClick={() => setSelectedProduct(rec.product)}
                            referrerPolicy="no-referrer"
                            onError={handleImageError}
                          />
                          <div className="min-w-0 flex-1">
                            <h4 
                              onClick={() => setSelectedProduct(rec.product)}
                              className="text-xs font-semibold text-stone-900 truncate hover:text-emerald-800 cursor-pointer"
                            >
                              {rec.product.name}
                            </h4>
                            <div className="text-[11px] text-stone-500 mt-0.5">
                              {rec.product.unit}
                            </div>
                            <div className="text-xs font-bold text-stone-900 mt-1 tabular-nums">
                              {(rec.product.price / 100).toFixed(2)} {t.currency}
                            </div>
                          </div>
                        </div>

                        <p className="text-[11px] text-emerald-800 bg-emerald-50/60 p-2 rounded border border-emerald-100/60 italic leading-snug">
                          "{rec.reason}"
                        </p>

                        <button
                          onClick={() => handleAddToCart(rec.product, 1)}
                          className="w-full py-2 bg-[#1F3A2B] text-white text-xs font-semibold rounded-lg hover:bg-[#162a1f] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>Ajouter au panier ({((rec.product.price) / 100).toFixed(2)} {t.currency})</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Real Extracted Rachid Media, YouTube Videos & Verified Community Reviews */}
              <RachidMediaSection currentLang={currentLang} />

              {/* YouTube Community Callout Banner */}
              <div className="bg-[#1F3A2B] rounded-2xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
                <div className="space-y-2 text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 text-xs text-red-300 bg-red-950/80 px-3 py-1 rounded-full border border-red-800/80">
                    <Youtube className="w-3.5 h-3.5 text-red-400" />
                    <span>Communauté YouTube @Rachid_Le_Potagiste</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold">
                    Rejoignez plus de 200 000 passionnés de permaculture au Maroc
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-300 max-w-xl">
                    Chaque semaine, Rachid partage ses secrets de semis, de greffe, de compostage et de lutte naturelle contre les ravageurs.
                  </p>
                </div>

                <a
                  href="https://www.youtube.com/@Rachid_Le_Potagiste"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors shadow-xs flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <Youtube className="w-4 h-4" />
                  <span>S'abonner à la chaîne YouTube</span>
                </a>
              </div>

              {/* Trust Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 pb-4">
                <div className="bg-white p-6 rounded-xl border border-stone-200/80 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                    <Leaf className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-stone-900 font-serif">Semences Reproductibles</h4>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      Variétés paysannes non-hybrides : vous pourrez récolter vos propres graines chaque saison.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-stone-200/80 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-stone-900 font-serif">Paiement Sécurisé en Dirhams</h4>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      Paiement en ligne par carte bancaire Stripe ou paiement en espèces directement à la livraison.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-stone-200/80 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-stone-900 font-serif">Livraison Partout au Maroc</h4>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      Expédition soignée par Amana Express sous 24-48h avec notification par email de chaque étape.
                    </p>
                  </div>
                </div>
              </div>

            </section>
          </div>
        )}

        {/* View: Blog & Tips */}
        {activeView === 'blog' && (
          <BlogSection
            currentLang={currentLang}
            onAddToCart={(prod) => handleAddToCart(prod, 1)}
          />
        )}

        {/* View: Customer Tracking */}
        {activeView === 'tracking' && (
          <OrderTrackingView
            currentLang={currentLang}
            onOpenEmailSim={() => setIsEmailSimOpen(true)}
          />
        )}

        {/* View: Admin & Moderation Dashboard */}
        {activeView === 'admin' && (
          <AdminDashboard
            currentLang={currentLang}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        currentLang={currentLang}
        onNavigate={setActiveView}
      />

      {/* Modals & Drawers */}
      <ProductDetailModal
        product={selectedProduct}
        currentLang={currentLang}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(prod, qty) => handleAddToCart(prod, qty)}
        onSelectRecommendedProduct={(prod) => setSelectedProduct(prod)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        currentLang={currentLang}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        currentLang={currentLang}
        onOrderCompleted={handleOrderCompleted}
      />

      <EmailSimulatorModal
        isOpen={isEmailSimOpen}
        onClose={() => setIsEmailSimOpen(false)}
      />

      <NotificationPanel
        isOpen={isNotifsOpen}
        onClose={() => setIsNotifsOpen(false)}
        notifications={notifications}
      />
    </div>
  );
}
