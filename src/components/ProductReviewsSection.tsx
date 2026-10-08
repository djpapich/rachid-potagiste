import React, { useState } from 'react';
import { Star, CheckCircle, Youtube, MessageSquare, Send, Sparkles } from 'lucide-react';
import { Product, Language, Review } from '../types/index.ts';
import { translations } from '../lib/translations.ts';
import { storeService } from '../services/storeService.ts';

interface ProductReviewsSectionProps {
  product: Product;
  currentLang: Language;
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  product,
  currentLang,
}) => {
  const t = translations[currentLang];
  const reviews = storeService.getReviewsForProduct(product.id);

  const [rating, setRating] = useState(5);
  const [authorName, setAuthorName] = useState('');
  const [authorLocation, setAuthorLocation] = useState('Casablanca');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) return;

    storeService.addReview({
      productId: product.id,
      userId: 'user_active',
      authorName: authorName.trim(),
      authorLocation: authorLocation.trim(),
      rating,
      comment: comment.trim(),
      verifiedPurchase: 1,
      source: 'verified_customer',
    });

    setSubmitted(true);
    setAuthorName('');
    setComment('');
    setTimeout(() => {
      setSubmitted(false);
      setShowForm(false);
    }, 2500);
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : product.rating;

  return (
    <div className="pt-6 border-t border-stone-200 space-y-6">
      
      {/* Reviews Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-800" />
            <span>{t.customerReviews} ({reviews.length})</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Retours de la communauté YouTube et des jardiniers au Maroc
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200/80">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="font-bold text-stone-900 text-sm tabular-nums">{averageRating} / 5</span>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="px-3 py-1.5 bg-[#1F3A2B] text-white text-xs font-semibold rounded-lg hover:bg-[#162a1f] transition-colors cursor-pointer"
          >
            {showForm ? 'Annuler' : t.leaveReview}
          </button>
        </div>
      </div>

      {/* Review Submission Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-stone-50 p-4 sm:p-5 rounded-xl border border-stone-200 space-y-3 animate-in fade-in">
          <div className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Votre témoignage pour Rachid Le Potagiste</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-stone-600 font-medium">Votre nom ou pseudo</label>
              <input
                type="text"
                placeholder="ex: Driss M., Amine K..."
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white"
                required
              />
            </div>

            <div>
              <label className="text-stone-600 font-medium">Votre ville au Maroc</label>
              <input
                type="text"
                placeholder="Rabat, Marrakech, Tanger..."
                value={authorLocation}
                onChange={(e) => setAuthorLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white"
              />
            </div>
          </div>

          {/* Star selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-600 font-medium">Votre note :</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 text-stone-300 hover:text-amber-500 transition-colors cursor-pointer"
                >
                  <Star className={`w-4 h-4 ${star <= rating ? 'text-amber-500 fill-amber-500' : ''}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <textarea
              placeholder="Racontez votre expérience avec ces semences / ce compost (germination, récolte, vigueur de vos légumes)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 bg-white"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            {submitted ? (
              <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                <span>{t.reviewSuccess}</span>
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-4 py-2 bg-[#1F3A2B] text-white text-xs font-semibold rounded-lg hover:bg-[#162a1f] flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t.submitReview}</span>
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-3">
        {reviews.length === 0 ? (
          <p className="text-xs text-stone-400 italic">
            Soyez le premier jardinier à donner son avis sur ce produit !
          </p>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-3.5 rounded-xl border border-stone-200/80 bg-white shadow-2xs space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center font-bold text-xs">
                    {rev.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-stone-900">{rev.authorName}</span>
                    {rev.authorLocation && (
                      <span className="text-[11px] text-stone-400 ml-1.5">({rev.authorLocation})</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                    ))}
                  </div>

                  {rev.source === 'youtube_community' ? (
                    <span className="flex items-center gap-1 text-[10px] text-red-700 bg-red-50 border border-red-200/80 px-2 py-0.5 rounded font-medium">
                      <Youtube className="w-3 h-3 text-red-600" />
                      <span>YouTube</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded font-medium">
                      <CheckCircle className="w-3 h-3 text-emerald-700" />
                      <span>{t.verifiedPurchaser}</span>
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-stone-700 leading-relaxed font-sans">
                {rev.comment}
              </p>

              <div className="text-[10px] text-stone-400 text-right">
                {new Date(rev.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
