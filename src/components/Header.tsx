import React, { useState } from 'react';
import { ShoppingBag, Menu, X, Phone, Sparkles } from 'lucide-react';
import { WHATSAPP_DISPLAY_PHONE, getGeneralInquiryWhatsAppUrl } from '../lib/whatsapp.ts';

interface HeaderProps {
  cartItemCount: number;
  onOpenCart: () => void;
}

export const Header: React.FC<HeaderProps> = ({ cartItemCount, onOpenCart }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Accueil', href: '#accueil' },
    { label: 'Lacto-fermentés', href: '#lacto-fermentes' },
    { label: 'Huiles 50 ml', href: '#huiles' },
    { label: 'Savons luffa', href: '#savons' },
    { label: 'Crèmes 50 g', href: '#cremes' },
    { label: 'Le Fait Main', href: '#pourquoi' },
    { label: 'À propos', href: '#a-propos' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#F4F1EA]/95 backdrop-blur-md border-b border-[#E5DFC9] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        
        {/* Brand Logo & Emblem */}
        <a href="#accueil" className="flex items-center gap-3 group">
          {/* Artisanal Gold Grid Medallion with stylized green leaf */}
          <div className="w-10 h-10 rounded-full bg-[#FBFAF5] border border-[#C9A227] flex items-center justify-center shadow-xs p-1 relative overflow-hidden group-hover:border-[#1F3D2B] transition-colors">
            <svg viewBox="0 0 100 100" className="w-full h-full text-[#C9A227]">
              {/* Grid pattern */}
              <defs>
                <pattern id="goldGrid" width="12" height="12" patternUnits="userSpaceOnUse">
                  <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#C9A227" strokeWidth="0.8" opacity="0.6"/>
                </pattern>
              </defs>
              <circle cx="50" cy="50" r="46" fill="url(#goldGrid)" />
              {/* Centered Green Leaf */}
              <path
                d="M50 15 C32 30 30 65 50 82 C70 65 68 30 50 15 Z"
                fill="#1F3D2B"
              />
              <path
                d="M50 20 L50 78 M50 35 L38 45 M50 48 L36 58 M50 35 L62 45 M50 48 L64 58"
                stroke="#FBFAF5"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="flex flex-col">
            <span className="font-title text-base sm:text-lg font-black tracking-wider text-[#1F3D2B] uppercase">
              Rachid Potagiste
            </span>
            <span className="text-[10px] tracking-widest font-semibold text-[#8C6D23] uppercase">
              Fait main · Maroc
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#1F3D2B]">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[#1F3D2B]/85 hover:text-[#1F3D2B] hover:underline underline-offset-4 decoration-[#C9A227] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right actions: WhatsApp quick call & Cart Button */}
        <div className="flex items-center gap-3">
          <a
            href={getGeneralInquiryWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F3D2B] bg-[#EAE4D2] hover:bg-[#E0D8C3] px-3 py-2 rounded-lg transition-colors border border-[#DCD3BE]"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>WhatsApp : {WHATSAPP_DISPLAY_PHONE}</span>
          </a>

          {/* "Ma sélection" trigger button */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 bg-[#1F3D2B] text-[#FBFAF5] hover:bg-[#162D20] px-3.5 py-2 rounded-xl font-medium text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer"
            aria-label="Voir ma sélection"
          >
            <ShoppingBag className="w-4 h-4 text-[#C9A227]" />
            <span className="hidden sm:inline">Ma sélection</span>
            {cartItemCount > 0 ? (
              <span className="w-5 h-5 rounded-full bg-[#C9A227] text-[#1F3D2B] font-bold text-xs flex items-center justify-center animate-bounce">
                {cartItemCount}
              </span>
            ) : (
              <span className="text-xs text-[#E5DFC9]/70">(0)</span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#1F3D2B] hover:bg-[#EAE4D2] rounded-lg transition-colors"
            aria-label="Ouvrir le menu de navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FBFAF5] border-b border-[#E5DFC9] px-6 py-4 shadow-md transition-all">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-base font-medium text-[#1F3D2B] border-b border-[#E5DFC9]/60 hover:text-[#3F6B2E]"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              <a
                href={getGeneralInquiryWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[#25D366] text-white font-semibold text-sm rounded-xl shadow-xs"
              >
                <Phone className="w-4 h-4" />
                <span>Nous contacter sur WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
