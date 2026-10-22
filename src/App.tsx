import React, { useState, useEffect } from 'react';
import { Product, PromoConfig, CartItem, ProductFamily } from './types/index.ts';
import { PromoBanner } from './components/PromoBanner.tsx';
import { Header } from './components/Header.tsx';
import { Hero } from './components/Hero.tsx';
import { PackDecouverte } from './components/PackDecouverte.tsx';
import { ProductFamilySection } from './components/ProductFamilySection.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { ArtisanalPhilosophy } from './components/ArtisanalPhilosophy.tsx';
import { AboutRachid } from './components/AboutRachid.tsx';
import { HowToOrder } from './components/HowToOrder.tsx';
import { FaqSection } from './components/FaqSection.tsx';
import { Footer } from './components/Footer.tsx';
import { FloatingWhatsApp } from './components/FloatingWhatsApp.tsx';

const CART_STORAGE_KEY = 'rachid_potagiste_selection_v2';

export function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [promo, setPromo] = useState<PromoConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // Cart / Selection state
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Save selection to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

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
          setProducts(prodData);
        }

        if (promoRes.ok) {
          const promoData = await promoRes.json();
          setPromo(promoData);
        }
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Cart actions
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Filter products by families
  const lactoFermentes = products.filter((p) => p.famille === 'lacto-fermentes');
  const huiles = products.filter((p) => p.famille === 'huiles');
  const savons = products.filter((p) => p.famille === 'savons');
  const cremes = products.filter((p) => p.famille === 'cremes');

  const cartProductIds = new Set(cartItems.map((item) => item.product.id));
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#1F3D2B] flex flex-col font-sans">
      
      {/* 1. Promo banner */}
      <PromoBanner promo={promo} />

      {/* 2. Header */}
      <Header
        cartItemCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1">
        
        {/* 3. Hero Section */}
        <Hero />

        {/* 4. Pack Découverte */}
        <PackDecouverte promo={promo} />

        {/* 5. Family 1: Légumes Lacto-fermentés (6 produits) */}
        <ProductFamilySection
          id="lacto-fermentes"
          family="lacto-fermentes"
          title="Légumes Lacto-fermentés en Bocal"
          subtitle="Alimentation Vivante & Probiotiques Naturels"
          handwrittenQuote="Le croquant naturel du potager, bonifié par le temps et le sel marin"
          description="Chou vert, chou rouge, carotte, betterave et oignon rouge : fermentés spontanément dans leur jus avec du sel pur non raffiné, sans vinaigre ni conservateur de synthèse. Une source inestimable de probiotiques actifs pour chérir votre microbiote."
          products={lactoFermentes}
          onSelectProduct={(p) => setSelectedProduct(p)}
          onAddToCart={(p) => handleAddToCart(p, 1)}
          cartProductIds={cartProductIds}
        />

        {/* 6. Family 2: Huiles de Macération (7 produits) */}
        <ProductFamilySection
          id="huiles"
          family="huiles"
          title="Huiles de Macération Botanique"
          subtitle="Flacon Pompe 50 ml · Soin Végétal Pur"
          handwrittenQuote="Des semaines de patience solaire pour recueillir la quintessence de la plante"
          description="Thym, romarin, ortie, marrube blanc, lavande, calendula et eucalyptus : lentement macérés dans une base précieuse d'amande douce et de jojoba. Flacon pompe en verre pour une utilisation propre et un dosage goutte à goutte. Usage externe uniquement."
          products={huiles}
          onSelectProduct={(p) => setSelectedProduct(p)}
          onAddToCart={(p) => handleAddToCart(p, 1)}
          cartProductIds={cartProductIds}
        />

        {/* 7. Family 3: Savons à la Luffa (2 produits) */}
        <ProductFamilySection
          id="savons"
          family="savons"
          title="Savons Artisanaux à la Luffa"
          subtitle="Éponge Végétale Intégrée · Exfoliation Douce"
          handwrittenQuote="Une vraie courge luffa du jardin coulée dans un savon surgras"
          description="Nos savons sont enrichis aux macérats d'ortie et de marrube blanc du potager, coulés directement autour d'une tranche de luffa végétale séchée. Une mousse onctueuse et un gommage naturel vivifiant sans aucun microplastique."
          products={savons}
          onSelectProduct={(p) => setSelectedProduct(p)}
          onAddToCart={(p) => handleAddToCart(p, 1)}
          cartProductIds={cartProductIds}
        />

        {/* 8. Family 4: Crèmes de Soin (3 produits) */}
        <ProductFamilySection
          id="cremes"
          family="cremes"
          title="Crèmes & Baumes de Soin"
          subtitle="Boîte Métallique 50 g · Sans Eau Ajoutée"
          handwrittenQuote="La texture fondante d'un baume protecteur aux herbes de terroir"
          description="Crème de marrube blanc, crème d'ortie et crème respiratoire de friction aux plantes aromatiques. Formulées sans eau, avec du beurre végétal et de la cire protectrice dans une boîte en métal nomade. Usage externe uniquement."
          products={cremes}
          onSelectProduct={(p) => setSelectedProduct(p)}
          onAddToCart={(p) => handleAddToCart(p, 1)}
          cartProductIds={cartProductIds}
        />

        {/* 9. Charte / Pourquoi le Fait Main */}
        <ArtisanalPhilosophy />

        {/* 10. À propos de Rachid Potagiste */}
        <AboutRachid />

        {/* 11. Comment commander en 3 étapes */}
        <HowToOrder />

        {/* 12. Questions Fréquentes */}
        <FaqSection />

      </main>

      {/* 13. Footer */}
      <Footer />

      {/* 14. Floating WhatsApp button */}
      <FloatingWhatsApp />

      {/* 15. Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        isInCart={selectedProduct ? cartProductIds.has(selectedProduct.id) : false}
      />

      {/* 16. Cart Drawer (Ma sélection) */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
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
