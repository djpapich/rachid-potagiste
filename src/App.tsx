import React, { useState, useEffect, useRef } from 'react';
import { Product, PromoConfig, CartItem, ProductFamily, Language, AppTheme, PageView } from './types/index.ts';
import { PromoBanner } from './components/PromoBanner.tsx';
import { Navbar } from './components/Navbar.tsx';
import { HomePage } from './components/HomePage.tsx';
import { CategoryPage } from './components/CategoryPage.tsx';
import { ProductDetailPage } from './components/ProductDetailPage.tsx';
import { CartPage } from './components/CartPage.tsx';
import { AboutPage } from './components/AboutPage.tsx';
import { ContactPage } from './components/ContactPage.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { Footer } from './components/Footer.tsx';
import { FloatingWhatsApp } from './components/FloatingWhatsApp.tsx';
import {
  MAX_QTY,
  clampQuantity,
  hydrateCart,
  parseStoredCart,
  sanitizeProducts,
  sanitizePromo,
} from './lib/validation.ts';

// The cart is stored as [{ id, quantity }] only: prices and names always come from the catalogue.
const CART_STORAGE_KEY = 'rachid_potagiste_cart_v4';
const LEGACY_CART_STORAGE_KEY = 'rachid_potagiste_selection_v3';
const THEME_STORAGE_KEY = 'rachid_potagiste_theme';
const LANG_STORAGE_KEY = 'rachid_potagiste_lang';
const WA_LINE_STORAGE_KEY = 'rachid_potagiste_wa_line';

export function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [promo, setPromo] = useState<PromoConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // Language state (default 'fr')
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY) as Language;
      return saved === 'ar' || saved === 'en' ? saved : 'fr';
    } catch {
      return 'fr';
    }
  });

  // Theme state (default 'light')
  const [theme, setTheme] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as AppTheme;
      return saved === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  // Active WhatsApp Line (Line 1: 07 86 73 16 66 or Line 2: 07 21 04 58 01)
  const [whatsappLine, setWhatsappLine] = useState<'line1' | 'line2'>(() => {
    try {
      const saved = localStorage.getItem(WA_LINE_STORAGE_KEY) as 'line1' | 'line2';
      return saved === 'line2' ? 'line2' : 'line1';
    } catch {
      return 'line1';
    }
  });

  // Page Routing State
  const [currentPage, setCurrentPage] = useState<PageView>({ type: 'home' });
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Cart selection state. Saved lines wait here until the trusted catalogue has loaded.
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

  // Apply RTL direction when Arabic is selected
  useEffect(() => {
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }, [lang]);

  // Apply dark theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  // Save WhatsApp line
  useEffect(() => {
    try {
      localStorage.setItem(WA_LINE_STORAGE_KEY, whatsappLine);
    } catch {
      // ignore
    }
  }, [whatsappLine]);

  // Rebuild the cart from the catalogue once it is available (drops unknown / out-of-stock items)
  useEffect(() => {
    if (cartHydrated || products.length === 0) return;
    setCartItems(hydrateCart(storedCartRef.current, products));
    setCartHydrated(true);
  }, [products, cartHydrated]);

  // Save Cart (ids and quantities only, and never before the cart has been rebuilt)
  useEffect(() => {
    if (!cartHydrated) return;
    try {
      const lines = cartItems.map((item) => ({ id: item.product.id, quantity: item.quantity }));
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
      localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, [cartItems, cartHydrated]);

  // Load products and promo configuration
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, promoRes] = await Promise.all([
          fetch('/data/products.json'),
          fetch('/data/promo.json'),
        ]);

        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setProducts(sanitizeProducts(prodData));
        }

        if (promoRes.ok) {
          const promoData = await promoRes.json();
          setPromo(sanitizePromo(promoData));
        }
      } catch (err) {
        console.error('Error loading catalog data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    if (!product.enStock) return;
    const amount = clampQuantity(quantity);
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(MAX_QTY, item.quantity + amount) }
            : item
        );
      }
      return [...prev, { product, quantity: amount }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    const safeQuantity = clampQuantity(quantity);
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: safeQuantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleNavigate = (page: PageView) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product: Product) => {
    handleNavigate({ type: 'product', productId: product.id });
  };

  const cartProductIds = new Set(cartItems.map((item) => item.product.id));
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Find product for product detail page
  const activeProduct =
    currentPage.type === 'product'
      ? products.find((p) => p.id === currentPage.productId) || products[0]
      : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F1EA] dark:bg-[#0D140F] text-[#1F3D2B] dark:text-[#F4F1EA] transition-colors duration-200">
      
      {/* 1. Promo top strip */}
      <PromoBanner
        promo={promo}
        lang={lang}
        theme={theme}
      />

      {/* 2. Main Navigation Bar */}
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

      {/* 3. Main Multi-Page Content */}
      <main className="flex-1">
        {currentPage.type === 'home' && (
          <HomePage
            products={products}
            promo={promo}
            onSelectProduct={handleSelectProduct}
            onAddToCart={(p) => handleAddToCart(p, 1)}
            cartProductIds={cartProductIds}
            onNavigate={handleNavigate}
            lang={lang}
            theme={theme}
            whatsappLine={whatsappLine}
          />
        )}

        {currentPage.type === 'category' && (
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
        )}

        {currentPage.type === 'product' && activeProduct && (
          <ProductDetailPage
            product={activeProduct}
            allProducts={products}
            onSelectProduct={handleSelectProduct}
            onAddToCart={handleAddToCart}
            cartProductIds={cartProductIds}
            onNavigate={handleNavigate}
            lang={lang}
            theme={theme}
          />
        )}

        {currentPage.type === 'cart' && (
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
        )}

        {currentPage.type === 'about' && (
          <AboutPage
            onNavigate={handleNavigate}
            lang={lang}
            theme={theme}
            whatsappLine={whatsappLine}
          />
        )}

        {currentPage.type === 'contact' && (
          <ContactPage
            onNavigate={handleNavigate}
            lang={lang}
            theme={theme}
          />
        )}
      </main>

      {/* 4. Footer */}
      <Footer
        onNavigate={handleNavigate}
        lang={lang}
        theme={theme}
      />

      {/* 5. Floating WhatsApp Selector */}
      <FloatingWhatsApp lang={lang} />

      {/* 6. Quick Cart Drawer */}
      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        promo={promo}
      />

    </div>
  );
}

export default App;
