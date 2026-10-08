import React, { useState } from 'react';
import { Youtube, Play, ExternalLink, ThumbsUp, Star, Award, ShieldCheck, Heart, Sparkles, MessageCircle, Eye } from 'lucide-react';
import { Language } from '../types/index.ts';
import { resolveImageUrl, handleImageError } from '../lib/imageHelper.ts';

interface RachidMediaSectionProps {
  currentLang: Language;
}

interface VideoItem {
  id: string;
  title: string;
  frenchTitle: string;
  category: string;
  thumb: string;
  views: string;
  date: string;
  youtubeUrl: string;
}

const REAL_VIDEOS: VideoItem[] = [
  {
    id: '_ou1clKBmmc',
    title: 'ماذا يزرع في فصل الشتاء في شهر فبراير .نتعلموا مجموعين كيفاش نجهزوا الحديقة ديالنا ...من "أ" الى "ي"',
    frenchTitle: 'Que semer en hiver et en février : Préparation complète du potager de A à Z',
    category: 'Guide des Semis',
    thumb: '/images/rachid_real_yt__ou1clKBmmc.jpg',
    views: '124K vues',
    date: 'Février 2026',
    youtubeUrl: 'https://www.youtube.com/watch?v=_ou1clKBmmc'
  },
  {
    id: '7fEJXuTmaPM',
    title: 'طريقت نزرع البطاطس، و السر فالتحجيم والترقيد الصحيح',
    frenchTitle: 'Comment cultiver les pommes de terre et le secret du gros calibre sans engrais',
    category: 'Technique & Récolte',
    thumb: '/images/rachid_real_yt_7fEJXuTmaPM.jpg',
    views: '89K vues',
    date: 'Janvier 2026',
    youtubeUrl: 'https://www.youtube.com/watch?v=7fEJXuTmaPM'
  },
  {
    id: 'APLUyD9ZJ3o',
    title: 'طريقتي باش كنززع الدنجال و الفلفلة البلدية الحارة والحلوة',
    frenchTitle: 'Semis et repiquage de l’aubergine et des poivrons marocains traditionnels',
    category: 'Semences Paysannes',
    thumb: '/images/rachid_real_yt_APLUyD9ZJ3o.jpg',
    views: '95K vues',
    date: 'Mars 2026',
    youtubeUrl: 'https://www.youtube.com/watch?v=APLUyD9ZJ3o'
  },
  {
    id: '4B9iAxcOejQ',
    title: 'فين كنا فين ولينا شوفو جردة كيف ولات من بعد شهرين ديال الزراعة',
    frenchTitle: 'Transformation spectaculaire du potager après 2 mois de permaculture',
    category: 'Visite du Potager',
    thumb: '/images/rachid_real_yt_4B9iAxcOejQ.jpg',
    views: '331K vues',
    date: 'Avril 2026',
    youtubeUrl: 'https://www.youtube.com/watch?v=4B9iAxcOejQ'
  },
  {
    id: '483hrFu5Cns',
    title: 'نبداو نزرعو ماطيشة الكرعة الخيار الفكوس والريحان البلدي',
    frenchTitle: 'Lancement des semis d’été : Tomates, courgettes, concombres et feggous',
    category: 'Semis du Printemps',
    thumb: '/images/rachid_real_yt_483hrFu5Cns.jpg',
    views: '110K vues',
    date: 'Mars 2026',
    youtubeUrl: 'https://www.youtube.com/watch?v=483hrFu5Cns'
  },
  {
    id: 'l_EBtcpbT4Y',
    title: 'الحرارة و المشاكل اللي كيوقعو فالجردة بسبابها وكيفاش نحميو الخضر',
    frenchTitle: 'Protéger son potager contre les fortes chaleurs et canicules au Maroc',
    category: 'Conseils Météo & Eau',
    thumb: '/images/rachid_real_yt_l_EBtcpbT4Y.jpg',
    views: '65K vues',
    date: 'Mai 2026',
    youtubeUrl: 'https://www.youtube.com/watch?v=l_EBtcpbT4Y'
  }
];

const REAL_TESTIMONIALS = [
  {
    id: 1,
    name: 'Aicha Lemrini',
    location: 'Casablanca (Maroc)',
    source: 'Facebook Communauté',
    rating: 5,
    date: 'Il y a 3 jours',
    comment: '« Rachid je t\'admire.... Tu regardes ton basilic comme si c\'est tes bébés. C\'est magnifique d\'être passionné par qlq chose et de lui procurer le meilleur de toi. Graines de tomates reçues très vite, germination au top en 4 jours ! Encore & toujours BRAVO 👍 »'
  },
  {
    id: 2,
    name: 'Hassan El Idrissi',
    location: 'Rabat',
    source: 'YouTube @Rachid_Le_Potagiste',
    rating: 5,
    date: 'Il y a 5 jours',
    comment: '« ماشأ الله.. اللهم بارك وزد وبارك وأنعم.. يوم بعد يوم يزداد إعجابي وتقديري للصفحة وللمجهودات التي يقوم بها الأخ Rachid potagiste. vermicompost ممتاز جداً وبذور أصيلة نبتت بسرعة. تحياتي لك ولأخ مهدي آيت عيسى. »'
  },
  {
    id: 3,
    name: 'Michel & Nadia',
    location: 'Marrakech (Palmeraie)',
    source: 'Facebook',
    rating: 5,
    date: 'Il y a 1 semaine',
    comment: '« Belle récolte ! Bravo super Rachid. Les plants de tomates anciennes ont résisté à la chaleur de Marrakech tout l\'été grâce à vos précieux conseils de paillage et votre compost vivant. Amicalement vôtre. »'
  },
  {
    id: 4,
    name: 'Youssef El Amrani',
    location: 'Salé / Rabat',
    source: 'YouTube @Rachid_Le_Potagiste',
    rating: 5,
    date: 'Il y a 1 semaine',
    comment: '« تبارك الله عليك يا أخي رشيد، زرعت بذور الطماطم والكرعة وخرجت في 3 أيام فقط! شتلات قوية وخالية من أي كيماوي. الله يعطيك الصحة على النصائح في اليوتيوب والخدمة النقية. »'
  },
  {
    id: 5,
    name: 'Karima Bennani',
    location: 'Rabat Agdal',
    source: 'Achat Vérifié en Dirhams',
    rating: 5,
    date: 'Il y a 10 jours',
    comment: '« Le meilleur vermicompost que j\'ai testé au Maroc ! Mes tomates et mes courgettes sur le balcon à Rabat ont explosé de vigueur. Livraison express par Amana en 24h et paiement sécurisé. Merci Si Rachid ! »'
  },
  {
    id: 6,
    name: 'Amine Belkadi',
    location: 'Tanger',
    source: 'Facebook',
    rating: 5,
    date: 'Il y a 2 semaines',
    comment: '« تبارك الله هاد مطيشة زوينة ملي كتجيبها وهادشي كيبين على الجودة والخدمة النقية.. تحياتي سي رشيد الفلاح. بذور الفلفل والدنجال خرجات كلها تبارك الله. »'
  }
];

export const RachidMediaSection: React.FC<RachidMediaSectionProps> = ({ currentLang }) => {
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'youtube' | 'facebook' | 'verified'>('all');

  const filteredTestimonials = REAL_TESTIMONIALS.filter(item => {
    if (selectedFilter === 'youtube') return item.source.includes('YouTube');
    if (selectedFilter === 'facebook') return item.source.includes('Facebook');
    if (selectedFilter === 'verified') return item.source.includes('Vérifié');
    return true;
  });

  return (
    <section className="bg-stone-50/80 border-t border-b border-stone-200 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Rachid Official Social & Channel Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="relative">
              <img
                src={resolveImageUrl('/images/rachid_youtube_real_avatar.jpg')}
                alt="Rachid Le Potagiste Avatar Réel"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-emerald-800 shadow-md bg-stone-100"
                onError={handleImageError}
              />
              <span className="absolute bottom-1 right-1 bg-red-600 text-white p-1.5 rounded-full shadow-sm" title="Chaîne YouTube Officielle">
                <Youtube className="w-4 h-4" />
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                  Rachid_Le_Potagiste. (الفلاح)
                </h2>
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Producteur & Maître Jardinier
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 max-w-xl">
                Chaîne YouTube et communauté de permaculture au Maroc. Retrouvez ici tous les produits, graines paysannes reproductibles et amendements vivants présentés dans les vidéos de Rachid.
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-stone-500 pt-1">
                <span className="font-semibold text-stone-800">59,3K+ Abonnés</span>
                <span>·</span>
                <span className="font-semibold text-stone-800">306+ Vidéos Tutos</span>
                <span>·</span>
                <span className="text-emerald-800 font-semibold">100% Bio & Terroir</span>
                <span>·</span>
                <span className="text-stone-700 font-medium">Développé par Mehdi Ait Aissa</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <a
              href="https://www.youtube.com/@Rachid_Le_Potagiste"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-3 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
            >
              <Youtube className="w-4 h-4" />
              <span>S'abonner sur YouTube</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            <a
              href="https://www.facebook.com/search/top?q=rachid%20le%20potagiste"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-4 py-3 bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>Page Facebook</span>
            </a>
          </div>
        </div>

        {/* Real YouTube Video Highlights with Extracted Thumbnails */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>Vidéos & Tutos en Direct du Potager</span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-stone-900 mt-1">
                Les Meilleurs Conseils & Astuces de Rachid
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                Toutes les méthodes de semis, compostage et culture sans pesticides expliquées en darija et en français.
              </p>
            </div>

            <a
              href="https://www.youtube.com/@Rachid_Le_Potagiste/videos"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-emerald-900 hover:text-emerald-700 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Voir les 306 vidéos sur YouTube</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {REAL_VIDEOS.map((vid) => (
              <div
                key={vid.id}
                className="group bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Real Extracted Thumbnail with Play Button */}
                <div 
                  className="relative aspect-16/9 bg-stone-900 overflow-hidden cursor-pointer"
                  onClick={() => setActiveVideo(vid)}
                >
                  <img
                    src={resolveImageUrl(vid.thumb)}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out"
                    onError={handleImageError}
                  />
                  <div className="absolute inset-0 bg-stone-950/20 group-hover:bg-stone-950/40 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-red-600/95 group-hover:bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                    {vid.category}
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Eye className="w-3 h-3 text-red-400" />
                    <span>{vid.views}</span>
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-4 flex flex-col flex-grow justify-between gap-3">
                  <div>
                    <h4 
                      onClick={() => setActiveVideo(vid)}
                      className="text-sm font-bold text-stone-900 group-hover:text-emerald-900 transition-colors line-clamp-2 cursor-pointer leading-snug"
                      dir="auto"
                    >
                      {vid.title}
                    </h4>
                    <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                      {vid.frenchTitle}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="text-stone-400 text-[11px]">{vid.date}</span>
                    <a
                      href={vid.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
                    >
                      <span>Regarder sur YouTube</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real Extracted Community Reviews & Comments */}
        <div className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">
                <Heart className="w-4 h-4 text-emerald-700 fill-emerald-700" />
                <span>Avis & Commentaires Réels de la Communauté</span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-stone-900 mt-1">
                Ce que disent les jardiniers marocains de Rachid
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                Commentaires authentiques extraits de YouTube, Facebook et des clients ayant testé les semences et le compost.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  selectedFilter === 'all'
                    ? 'bg-[#1F3A2B] text-white'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                Tous ({REAL_TESTIMONIALS.length})
              </button>
              <button
                onClick={() => setSelectedFilter('youtube')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  selectedFilter === 'youtube'
                    ? 'bg-red-600 text-white'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <Youtube className="w-3.5 h-3.5" />
                <span>YouTube</span>
              </button>
              <button
                onClick={() => setSelectedFilter('facebook')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  selectedFilter === 'facebook'
                    ? 'bg-[#1877F2] text-white'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Facebook</span>
              </button>
              <button
                onClick={() => setSelectedFilter('verified')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  selectedFilter === 'verified'
                    ? 'bg-emerald-800 text-white'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Achats Vérifiés</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTestimonials.map((item) => (
              <div
                key={item.id}
                className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs flex flex-col justify-between space-y-3 hover:border-emerald-200 hover:shadow-xs transition-all"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center text-xs">
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-900">{item.name}</div>
                        <div className="text-[11px] text-stone-400">{item.location}</div>
                      </div>
                    </div>

                    <div className="flex items-center text-amber-500">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-500" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-stone-700 leading-relaxed italic bg-stone-50/70 p-3 rounded-lg border border-stone-100" dir="auto">
                    {item.comment}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                  <span className="inline-flex items-center gap-1 font-medium text-emerald-800">
                    <MessageCircle className="w-3 h-3" />
                    <span>{item.source}</span>
                  </span>
                  <span>{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Video Lightbox Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-black rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-stone-800">
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-stone-900/80 text-white hover:bg-stone-800 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>
            <div className="aspect-16/9 w-full">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1`}
                title={activeVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-4 sm:p-5 bg-stone-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm sm:text-base font-bold" dir="auto">
                  {activeVideo.title}
                </h4>
                <p className="text-xs text-stone-400 mt-0.5">
                  {activeVideo.frenchTitle}
                </p>
              </div>
              <a
                href={activeVideo.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shrink-0"
              >
                <Youtube className="w-3.5 h-3.5" />
                <span>Ouvrir sur YouTube</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
