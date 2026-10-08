import React, { useState } from 'react';
import { BookOpen, Clock, ArrowRight, X, Sparkles, ShoppingBag, Youtube } from 'lucide-react';
import { BlogPost, Language, Product } from '../types/index.ts';
import { translations } from '../lib/translations.ts';
import { storeService } from '../services/storeService.ts';
import { resolveImageUrl, handleImageError } from '../lib/imageHelper.ts';

interface BlogSectionProps {
  currentLang: Language;
  onAddToCart: (product: Product) => void;
}

export const BlogSection: React.FC<BlogSectionProps> = ({ currentLang, onAddToCart }) => {
  const t = translations[currentLang];
  const posts = storeService.getBlogPosts();
  const products = storeService.getProducts();
  const [activePost, setActivePost] = useState<BlogPost | null>(null);

  return (
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Blog Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">
          <BookOpen className="w-4 h-4 text-emerald-700" />
          <span>Le Carnet du Potagiste · Guides & Tutos</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
          {t.blogTitle}
        </h2>
        <p className="text-xs sm:text-sm text-stone-600">
          {t.blogSubtitle}
        </p>
        <div className="pt-1">
          <a
            href="https://www.youtube.com/@Rachid_Le_Potagiste"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full border border-red-200 transition-colors font-medium cursor-pointer"
          >
            <Youtube className="w-4 h-4 text-red-600" />
            <span>Retrouvez toutes les démonstrations vidéo sur YouTube @Rachid_Le_Potagiste</span>
          </a>
        </div>
      </div>

      {/* Grid of Articles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {posts.map((post) => (
          <article
            key={post.id}
            className="group bg-white rounded-xl border border-stone-200/90 overflow-hidden flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
            onClick={() => setActivePost(post)}
          >
            <div className="relative aspect-16/10 overflow-hidden bg-stone-100">
              <img
                src={resolveImageUrl(post.imageUrl)}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out"
                referrerPolicy="no-referrer"
                onError={handleImageError}
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded-sm text-[11px] font-medium text-stone-800">
                {post.category}
              </div>
            </div>

            <div className="p-5 flex flex-col flex-1 justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-xs text-stone-400 mb-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{post.readTime}</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{post.publishedAt}</span>
                </div>

                <h3 className="text-base font-serif font-bold text-stone-900 group-hover:text-emerald-800 transition-colors line-clamp-2 leading-snug">
                  {post.title}
                </h3>

                <p className="text-xs text-stone-600 line-clamp-3 mt-2 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-emerald-800 group-hover:text-emerald-950">
                <span className="text-[11px] text-stone-500 font-normal truncate max-w-[170px]">
                  Par {post.author}
                </span>
                <span className="flex items-center gap-1 shrink-0">
                  <span>{t.readMore}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Article Reader Modal */}
      {activePost && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
          <div className="relative bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200">
            {/* Close Button */}
            <button
              onClick={() => setActivePost(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 text-stone-700 hover:bg-stone-100 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Visual Cover */}
            <div className="relative aspect-16/9 bg-stone-100 overflow-hidden">
              <img
                src={resolveImageUrl(activePost.imageUrl)}
                alt={activePost.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={handleImageError}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                  {activePost.category} · {activePost.readTime}
                </div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
                  {activePost.title}
                </h2>
              </div>
            </div>

            {/* Article Content */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between text-xs text-stone-500 pb-3 border-b border-stone-200">
                <span>Rédigé par <strong className="text-stone-800">{activePost.author}</strong></span>
                <span>Publié le {activePost.publishedAt}</span>
              </div>

              <div className="prose text-xs sm:text-sm text-stone-700 leading-relaxed space-y-4">
                <p className="font-serif italic text-sm text-stone-800 border-l-2 border-emerald-700 pl-4 py-1">
                  "{activePost.excerpt}"
                </p>
                <p>
                  {activePost.content}
                </p>
              </div>

              {/* Related catalog products callout */}
              <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-100 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-950">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>Semence / Amendement recommandé dans ce guide :</span>
                </div>
                
                {products[0] && (
                  <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-lg border border-emerald-200/80">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={resolveImageUrl(products[0].imageUrl)}
                        alt={products[0].name}
                        className="w-12 h-12 rounded object-cover shrink-0"
                        referrerPolicy="no-referrer"
                        onError={handleImageError}
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-stone-900 truncate">
                          {products[0].name}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {(products[0].price / 100).toFixed(2)} {t.currency} · En stock ({products[0].stock})
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onAddToCart(products[0])}
                      className="px-3 py-1.5 bg-[#1F3A2B] text-white text-xs font-semibold rounded-md hover:bg-[#162a1f] flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Commander</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setActivePost(null)}
                  className="px-4 py-2 bg-stone-100 text-stone-800 text-xs font-medium rounded-lg hover:bg-stone-200 cursor-pointer"
                >
                  Fermer le guide
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
