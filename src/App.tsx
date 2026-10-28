import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Product, PromoConfig, CartItem, Language, AppTheme, PageView } from './types/index.ts';
import { PromoBanner } from './components/PromoBanner.tsx';
import { Navbar } from './components/Navbar.tsx';
import { HomePage } from './components/HomePage.tsx';
import { CategoryPage } from './components/CategoryPage.tsx';
import { ProductDetailPage } from './components/ProductDetailPage.tsx';
import { CartPage } from './components/CartPage.tsx';
import { AboutPage } from './components/AboutPage.tsx';
import { ContactPage } from './components/ContactPage.tsx';
import { NotFoundPage } from './components/NotFoundPage.tsx';
import { Footer } from './components/Footer.tsx';
import { FloatingWhatsApp } from './components/FloatingWhatsApp.tsx';
import { Toaster, ToastItem } from './components/Toaster.tsx';
import { ProductGridSkeleton } from './components/Skeletons.tsx';
import {
  MAX_QTY,
  clampQuantity,
  hydrateCart,
  parseStoredCart,
  sanitizeProducts,
  sanitizePromo,
} from './lib/validation.ts';
import {
  CART_STORAGE_KEY,
  LANG_STORAGE_KEY,
  LEGACY_CART_STORAGE_KEY,
  THEME_STORAGE_KEY,
  WA_LINE_STORAGE_KEY,
  applyDocumentPreferences,
  getInitialLang,
  getInitialTheme,
  getInitialWhatsappLine,
  write,
} from './lib/preferences.ts';
import { pageToPath, pathToPage } from './lib/router.ts';
import { applySeo, localized, productJsonLd } from './lib/seo.ts';
import { translations } from './lib/translations.ts';

const TOAST_MS = 3800;

export function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [promo, setPromo] = useState<PromoConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const [lang, setLang] = useState<Language>(getInitialLang);
  const [theme, setTheme] = useState<AppTheme>(getInitialTheme);
  const [whatsappLine, setWhatsappLine] = useState<'line1' | 'line2'>(getInitialWhatsappLine);

  // The URL is the source of truth for the current page
  const [currentPage, setCurrentPage] = useState<PageView>(() => pathToPage(window.location.pathname));

  // Cart: saved lines wait here until the trusted catalogue has loaded
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartHydrated, setCartHydrated] = useState(false);
  const storedCartRef = useRef(
    (() => {
      try {
        return parseStoredCart(
          localStorage.getItem(CART_STORAGE_KEY) ?? localStorage.getItem(LEGACY_CART_STORAGE_KEY)
        );
      } catch {
        return [];
      }
    })()
  );

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastId = useRef(0);
  const mainRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  const t = translations[lang] || translations.fr;

  // ---------------------------------------------------------------- preferences
  useEffect(() => {
    applyDocumentPreferences(lang, theme);
    write(LANG_STORAGE_KEY, lang);
    write(THEME_STORAGE_KEY, theme);
  }, [lang, theme]);

  useEffect(() => {
    write(WA_LINE_STORAGE_KEY, whatsappLine);
  }, [whatsappLine]);

  // ---------------------------------------------------------------- navigation
  useEffect(() => {
    window.history.scrollRestoration = 'manual';
    const onPop = (event: PopStateEvent) => {
      setCurrentPage(pathToPage(window.location.pathname));
      const y = typeof event.state?.scrollY === 'number' ? event.state.scrollY : 0;
      // wait for the page to render before restoring the position
      requestAnimationFrame(() => window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior }));
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const handleNavigate = useCallback((page: PageView) => {
    const target = pageToPath(page);
    if (target === window.location.pathname) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    // remember where the visitor was, so "back" returns to the same spot
    window.history.replaceState({ ...window.history.state, scrollY: window.scrollY }, '');
    window.history.pushState({ scrollY: 0 }, '', target);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  // Move keyboard / screen-reader focus to the new page (not on first load)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    mainRef.current?.focus({ preventScroll: true });
  }, [currentPage]);

  // ---------------------------------------------------------------- data
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const [prodRes, promoRes] = await Promise.all([fetch('/data/products.json'), fetch('/data/promo.json')]);
        if (cancelled) return;
        if (prodRes.ok) setProducts(sanitizeProducts(await prodRes.json()));
        if (promoRes.ok) setPromo(sanitizePromo(await promoRes.json()));
      } catch (err) {
        console.error('Error loading catalog data:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  // Rebuild the cart from the catalogue once it is available (drops unknown / out-of-stock items)
  useEffect(() => {
    if (cartHydrated || products.length === 0) return;
    setCartItems(hydrateCart(storedCartRef.current, products));
    setCartHydrated(true);
  }, [products, cartHydrated]);

  // Save the cart (ids and quantities only, never before it has been rebuilt)
  useEffect(() => {
    if (!cartHydrated) return;
    write(CART_STORAGE_KEY, JSON.stringify(cartItems.map((i) => ({ id: i.product.id, quantity: i.quantity }))));
    try {
      localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, [cartItems, cartHydrated]);

  // ---------------------------------------------------------------- SEO
  const activeProduct =
    currentPage.type === 'product' ? products.find((p) => p.id === currentPage.productId) ?? null : null;

  useEffect(() => {
    const path = pageToPath(currentPage);
    const brand = 'Rachid Potagiste';
    const categoryKeys = {
      'lacto-fermentes': ['navLacto', 'lactoSubtitle'],
      huiles: ['navOils', 'oilsSubtitle'],
      savons: ['navSoaps', 'soapsSubtitle'],
      cremes: ['navCreams', 'creamsSubtitle'],
    } as const;

    switch (currentPage.type) {
      case 'home':
        applySeo({
          title: `${brand} · ${t.heroTitle}`,
          description: `${t.heroSubtitle} ${t.cashOnDelivery}.`,
          path,
        });
        break;
      case 'category': {
        const [nameKey, subKey] = categoryKeys[currentPage.family];
        applySeo({
          title: `${t[nameKey]} · ${brand}`,
          description: `${t[subKey]}. ${t.cashOnDelivery}.`,
          path,
        });
        break;
      }
      case 'product':
        if (activeProduct) {
          const name = localized(lang, activeProduct.nom, activeProduct.nomAr, activeProduct.nomEn);
          const desc = localized(lang, activeProduct.description, activeProduct.descriptionAr, activeProduct.descriptionEn);
          applySeo({
            title: `${name} · ${brand}`,
            description: desc.length > 155 ? `${desc.slice(0, 152)}...` : desc,
            path,
            image: activeProduct.image || undefined,
            jsonLd: productJsonLd(activeProduct, lang),
          });
        } else if (!loading) {
          // Catalogue loaded but this id does not exist: tell search engines it is a 404
          applySeo({ title: `${t.notFoundTitle} · ${brand}`, description: t.notFoundDesc, path, noindex: true });
        }
        break;
      case 'cart':
        applySeo({ title: `${t.cartTitle} · ${brand}`, description: t.cartEmptyDesc, path, noindex: true });
        break;
      case 'about':
        applySeo({ title: `${t.navAbout} · ${brand}`, description: t.heroSubtitle, path });
        break;
      case 'contact':
        applySeo({ title: `${t.contactTitle}`, description: t.contactSubtitle, path });
        break;
      default:
        applySeo({ title: `${t.notFoundTitle} · ${brand}`, description: t.notFoundDesc, path, noindex: true });
    }
  }, [currentPage, activeProduct, loading, lang, t]);

  // ---------------------------------------------------------------- toasts
  const dismissToast = useCallback((id: number) => setToasts((prev) => prev.filter((x) => x.id !== id)), []);

  const pushToast = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = ++toastId.current;
      setToasts((prev) => [...prev.slice(-1), { ...toast, id }]);
      window.setTimeout(() => dismissToast(id), TOAST_MS);
    },
    [dismissToast]
  );

  // ---------------------------------------------------------------- cart operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    if (!product.enStock) return;
    const amount = clampQuantity(quantity);
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: Math.min(MAX_QTY, item.quantity + amount) } : item
        );
      }
      return [...prev, { product, quantity: amount }];
    });
    const name = localized(lang, product.nom, product.nomAr, product.nomEn);
    pushToast({
      message: `${name} · ${t.addedToCart}`,
      actionLabel: t.viewCart,
      onAction: () => handleNavigate({ type: 'cart' }),
    });
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    const safeQuantity = clampQuantity(quantity);
    setCartItems((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity: safeQuantity } : item))
    );
  };

  const handleClearCart = () => setCartItems([]);

  const handleSelectProduct = (product: Product) => handleNavigate({ type: 'product', productId: product.id });

  const cartProductIds = new Set(cartItems.map((item) => item.product.id));
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // ---------------------------------------------------------------- page content
  const renderPage = () => {
    switch (currentPage.type) {
      case 'home':
        return (
          <HomePage
            products={products}
            loading={loading}
            promo={promo}
            onSelectProduct={handleSelectProduct}
            onAddToCart={(p) => handleAddToCart(p, 1)}
            cartProductIds={cartProductIds}
            onNavigate={handleNavigate}
            lang={lang}
            theme={theme}
            whatsappLine={whatsappLine}
          />
        );
      case 'category':
        if (loading) {
          return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
              <ProductGridSkeleton />
            </div>
          );
        }
        return (
          <CategoryPage
            family={currentPage.family}
            products={products}
            onSelectProduct={handleSelectProduct}
            onAddToCart={(p) => handleAddToCart(p, 1)}
            cartProductIds={cartProductIds}
            onNavigate={handleNavigate}
            lang={lang}
            theme={theme}
            whatsappLine={whatsappLine}
          />
        );
      case 'product':
        if (loading) {
          return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" role="status" aria-label="Chargement">
                <div className="skeleton aspect-square rounded-3xl" />
                <div className="space-y-4">
                  <div className="skeleton h-4 w-1/3 rounded" />
                  <div className="skeleton h-10 w-3/4 rounded" />
                  <div className="skeleton h-24 w-full rounded" />
                  <div className="skeleton h-12 w-full rounded-xl" />
                </div>
              </div>
            </div>
          );
        }
        if (!activeProduct) return <NotFoundPage lang={lang} onNavigate={handleNavigate} />;
        return (
          <ProductDetailPage
            product={activeProduct}
            allProducts={products}
            onSelectProduct={handleSelectProduct}
            onAddToCart={handleAddToCart}
            cartProductIds={cartProductIds}
            onNavigate={handleNavigate}
            lang={lang}
            theme={theme}
            whatsappLine={whatsappLine}
          />
        );
      case 'cart':
        return (
          <CartPage
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            promo={promo}
            onNavigate={handleNavigate}
            lang={lang}
            theme={theme}
            whatsappLine={whatsappLine}
            onWhatsappLineChange={setWhatsappLine}
          />
        );
      case 'about':
        return <AboutPage onNavigate={handleNavigate} lang={lang} theme={theme} whatsappLine={whatsappLine} />;
      case 'contact':
        return <ContactPage onNavigate={handleNavigate} lang={lang} theme={theme} />;
      default:
        return <NotFoundPage lang={lang} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F1EA] dark:bg-[#0D140F] text-[#1F3D2B] dark:text-[#F4F1EA] transition-colors duration-200">
      <a href="#main" className="skip-link">
        {t.skipToContent}
      </a>

      <PromoBanner promo={promo} lang={lang} theme={theme} />

      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        cartItemCount={totalCartCount}
        lang={lang}
        onLanguageChange={setLang}
        theme={theme}
        onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        whatsappLine={whatsappLine}
        onWhatsappLineChange={setWhatsappLine}
        products={products}
        onSelectProduct={handleSelectProduct}
      />

      <main id="main" ref={mainRef} tabIndex={-1} key={pageToPath(currentPage)} className="flex-1 page-enter outline-hidden">
        {renderPage()}
      </main>

      <Footer onNavigate={handleNavigate} lang={lang} theme={theme} />

      <FloatingWhatsApp lang={lang} hideOnMobile={currentPage.type === 'product'} />

      <Toaster toasts={toasts} onDismiss={dismissToast} closeLabel={t.close} />
    </div>
  );
}

export default App;
