import { Product, Category, Order, OrderStatus, BlogPost, PushNotification, AnalyticsSummary, EmailNotification, Review, RecommendationReason } from '../types/index.ts';
import { jsPDF } from 'jspdf';
import { resolveImageUrl } from '../lib/imageHelper.ts';

// Categories tailored for Rachid Le Potagiste
const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 1,
    slug: 'graines-semences',
    nameFr: 'Semences Paysannes',
    nameEn: 'Heirloom Seeds',
    nameAr: 'بذور بلدية أصيلة',
    description: 'Variétés traditionnelles 100% reproductibles non-hybrides, sans traitement chimique.'
  },
  {
    id: 2,
    slug: 'amendements-engrais',
    nameFr: 'Compost & Engrais Naturels',
    nameEn: 'Living Vermicompost & Fertilizers',
    nameAr: 'فيرميكومبوست وأسمدة طبيعية',
    description: 'Lombricompost artisanal, purin d\'ortie frais et terreau vivant pour potager.'
  },
  {
    id: 3,
    slug: 'plants-arbustes',
    nameFr: 'Plants Bio Prêts à Planter',
    nameEn: 'Organic Seedlings & Herbs',
    nameAr: 'شتلات خضر وأعشاب عطرية',
    description: 'Élevés sous serre et acclimatés au climat marocain dans des godets biodégradables.'
  },
  {
    id: 4,
    slug: 'fruits-legumes',
    nameFr: 'Paniers Récolte du Jour',
    nameEn: 'Fresh Harvest Baskets',
    nameAr: 'سلال خضر من المزرعة',
    description: 'Légumes et herbes fraîchement cueillis le matin dans le potager en permaculture de Rachid.'
  },
  {
    id: 5,
    slug: 'epicerie-terroir',
    nameFr: 'Produits de la Ferme',
    nameEn: 'Farm Terroir Goods',
    nameAr: 'منتوجات طبيعية من المزرعة',
    description: 'Huile d\'olive vierge extra pressée à froid et miel brut de la ferme agro-écologique.'
  }
];

// Rachid Le Potagiste Signature Products (Prices in cents of DH: 4500 = 45 DH)
const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 1,
    slug: 'graines-tomates-anciennes-maroc',
    name: 'Graines de Tomates Anciennes Marocaines Reproductibles',
    categorySlug: 'graines-semences',
    price: 4500, // 45 DH
    originalPrice: 5500,
    stock: 65,
    unit: 'Sachet kraft de 50 graines',
    description: 'Graines récoltées et acclimatées par Rachid Le Potagiste. 100% variété paysanne non-hybride (fixée) que vous pourrez reproduire indéfiniment. Saveur douce et sucrée, excellente résistance à la chaleur estivale du Maroc.',
    origin: 'La Ferme de Rachid - Région Rabat/Salé',
    certification: 'Semences Paysannes 100% Reproductibles',
    ingredients: '50 graines fertiles de tomates anciennes sélectionnées à la main.',
    benefits: 'Germination express en 3 à 5 jours, vigueur racinaire exceptionnelle.',
    rating: '5.0',
    reviewCount: 142,
    imageUrl: '/images/rachid_graines_paysannes_1791482677509.jpg',
    isFeatured: 1
  },
  {
    id: 2,
    slug: 'vermicompost-pur-lombricompost-10kg',
    name: 'Vermicompost Vivant & Lombricompost Artisanal (10 kg)',
    categorySlug: 'amendements-engrais',
    price: 8500, // 85 DH
    originalPrice: 10000,
    stock: 45,
    unit: 'Sac en jute respirant 10 kg',
    description: 'Le secret de la fertilité du potager de Rachid ! Produit par nos vers Eisenia Fetida nourris exclusivement aux matières organiques végétales. Concentré en micro-organismes vivants et en acides humiques.',
    origin: 'Lombricompostière de Rachid - Maroc',
    certification: '100% Naturel & Amendement Biologique',
    ingredients: 'Lombricompost pur mûr, sans résidu ni terre de remblai.',
    benefits: 'Multiplie le rendement par 3, retient l\'humidité et supprime le besoin d\'engrais chimique.',
    rating: '4.9',
    reviewCount: 98,
    imageUrl: '/images/rachid_compost_vermicompost_1791482687599.jpg',
    isFeatured: 1
  },
  {
    id: 3,
    slug: 'pack-plants-potager-bio-12',
    name: 'Pack 12 Plants Bio Racines Vivantes Prêts à Planter',
    categorySlug: 'plants-arbustes',
    price: 6000, // 60 DH
    originalPrice: 7500,
    stock: 38,
    unit: 'Plateau de 12 godets biodégradables',
    description: 'Sélection des indispensables pour débuter ou enrichir votre potager ou balcon : 4 tomates anciennes, 2 poivrons doux, 2 piments de terroir, 2 courgettes et 2 herbes aromatiques (menthe marocaine et basilic).',
    origin: 'Pépinière de Rachid Le Potagiste',
    certification: 'Plants Bio Élevés en Plein Air',
    ingredients: 'Substrat terreau composté maison, graines paysannes certifiées.',
    benefits: 'Godets à planter directement en terre sans casser les racines, 100% de reprise.',
    rating: '5.0',
    reviewCount: 86,
    imageUrl: '/images/rachid_plants_bio_1791482699152.jpg',
    isFeatured: 1
  },
  {
    id: 4,
    slug: 'panier-legumes-potager-rachid-7kg',
    name: 'Panier Récolte du Jour Frais de Rachid (7 kg)',
    categorySlug: 'fruits-legumes',
    price: 12000, // 120 DH
    originalPrice: null,
    stock: 24,
    unit: 'Cagette en bois 7 kg',
    description: 'Cueillis le matin même de l\'expédition : tomates anciennes gorgées de soleil, carottes douces avec fanes, poivrons savoureux, menthe fraîche, courgettes fleuries et herbes aromatiques de pleine terre.',
    origin: 'Potager en Permaculture de Rachid',
    certification: 'Zéro Pesticide Zéro Fongicide',
    ingredients: 'Légumes et herbes paysannes cueillis à la rosée.',
    benefits: 'Fraîcheur absolue, vitamines vivantes, goût authentique d\'autrefois.',
    rating: '4.9',
    reviewCount: 118,
    imageUrl: '/images/rachid_real_yt_4B9iAxcOejQ.jpg',
    isFeatured: 1
  },
  {
    id: 5,
    slug: 'purin-ortie-prele-bio-1l',
    name: 'Extrait Fermenté d\'Ortie & de Prêle Bio (1 Litre)',
    categorySlug: 'amendements-engrais',
    price: 5000, // 50 DH
    originalPrice: 6000,
    stock: 55,
    unit: 'Flacon opaque 1L',
    description: 'Formule protectrice bio préparée par macération contrôlée avec eau de pluie. Répulsif naturel puissant contre les pucerons tout en apportant de l\'azote organique immédiatement assimilable.',
    origin: 'Atelier de Macération de Rachid',
    certification: 'Soin des Plantes 100% Végétal',
    ingredients: '90% extrait fermenté d\'ortie, 10% décoction de prêle sauvage.',
    benefits: 'Renforce les défenses naturelles des plants et stimule la photosynthèse.',
    rating: '4.8',
    reviewCount: 54,
    imageUrl: '/images/rachid_real_yt_L3VkVEteARM.jpg',
    isFeatured: 0
  },
  {
    id: 6,
    slug: 'huile-olive-extra-vierge-rachid-500ml',
    name: 'Huile d\'Olive Vierge Extra Bio du Verger de Rachid (500ml)',
    categorySlug: 'epicerie-terroir',
    price: 8000, // 80 DH
    originalPrice: 9500,
    stock: 50,
    unit: 'Bouteille verre anti-UV 500ml',
    description: 'Pressée à froid le jour même de la cueillette des oliviers du verger en agroforesterie de Rachid. Fruité vert intense, acidité oléique <0.2%.',
    origin: 'Verger agroforestier de Rachid',
    certification: 'Agriculture Biologique & Permaculture',
    ingredients: '100% olives Picholine marocaine récoltées manuellement.',
    benefits: 'Concentrée en antioxydants rares et polyphénols protecteurs.',
    rating: '4.9',
    reviewCount: 76,
    imageUrl: '/images/product_moroccan_olive_oil_1791481468563.jpg',
    isFeatured: 0
  },
  {
    id: 7,
    slug: 'semences-poivrons-harissa-terroir',
    name: 'Semences Paysannes Poivrons Doux & Piment Harissa',
    categorySlug: 'graines-semences',
    price: 3500, // 35 DH
    originalPrice: 4500,
    stock: 80,
    unit: 'Sachet kraft de 40 graines',
    description: 'Variété traditionnelle marocaine à chair épaisse et parfum intense. Plante rustique qui adore le soleil et produit abondamment jusqu\'à la fin de l\'automne.',
    origin: 'La Ferme de Rachid',
    certification: 'Semences Paysannes Reproductibles',
    ingredients: '40 graines reproductibles sélectionnées.',
    benefits: 'Taux de germination vérifié supérieur à 92%.',
    rating: '4.9',
    reviewCount: 42,
    imageUrl: '/images/rachid_real_yt_APLUyD9ZJ3o.jpg',
    isFeatured: 0
  },
  {
    id: 8,
    slug: 'pack-aromatiques-potager-marocain',
    name: 'Pack 4 Aromatiques Terroir (Menthe Nanah, Thym, Romarin, Basilic)',
    categorySlug: 'plants-arbustes',
    price: 4500, // 45 DH
    originalPrice: null,
    stock: 60,
    unit: '4 godets racinés vigoureux',
    description: 'Les 4 trésors aromatiques pour parfumer votre thé marocain et vos plats. Plants vigoureux, prêts à installer dans un bac ou en pleine terre.',
    origin: 'Pépinière de Rachid',
    certification: 'Plants Vivants Acclimatés',
    ingredients: 'Substrat terreau composté maison avec lombricompost.',
    benefits: 'Feuillage très odorant et répulsif naturel contre les insectes nuisibles.',
    rating: '5.0',
    reviewCount: 68,
    imageUrl: '/images/rachid_real_yt_JYFEEAU3XFc.jpg',
    isFeatured: 0
  },
  {
    id: 9,
    slug: 'semences-pommes-de-terre-terroir',
    name: 'Semences Paysannes Pommes de Terre du Terroir & Guide du Calibrage',
    categorySlug: 'graines-semences',
    price: 4000, // 40 DH
    originalPrice: 5000,
    stock: 50,
    unit: 'Filet de 1.5 kg (plants germés)',
    description: 'Variété paysanne marocaine rustique à chair ferme. Rachid vous explique dans sa vidéo dédiée le secret du gros calibre et du buttage progressif pour tripler votre récolte sans engrais chimique.',
    origin: 'Ferme de Rachid',
    certification: 'Semences Paysannes Traditionnelles',
    ingredients: 'Tubercules calibrés non traités après récolte.',
    benefits: 'Résistance naturelle aux maladies du sol, saveur beurrée exceptionnelle.',
    rating: '5.0',
    reviewCount: 37,
    imageUrl: '/images/rachid_real_yt_7fEJXuTmaPM.jpg',
    isFeatured: 0
  }
];

// Initial Real Community & YouTube Reviews for Rachid Le Potagiste
const DEFAULT_REVIEWS: Review[] = [
  {
    id: 1,
    productId: 1, // Graines de tomates
    userId: 'user_yt_1',
    authorName: 'Aicha Lemrini',
    authorLocation: 'Casablanca',
    rating: 5,
    comment: 'Rachid je t\'admire.... Tu regardes ton basilic comme si c\'est tes bébés. C\'est magnifique d\'être passionné par qlq chose et de lui procurer le meilleur de toi. Graines de tomates reçues très vite, germination au top en 4 jours ! Encore & toujours BRAVO 👍',
    status: 'approved',
    verifiedPurchase: 1,
    source: 'youtube_community',
    createdAt: '2026-10-06T11:20:00Z'
  },
  {
    id: 2,
    productId: 2, // Vermicompost
    userId: 'user_yt_2',
    authorName: 'Karima Bennani',
    authorLocation: 'Rabat Agdal',
    rating: 5,
    comment: 'Le meilleur vermicompost que j\'ai testé au Maroc ! Mes tomates et mes courgettes sur le balcon à Rabat ont explosé de vigueur. Merci pour tes vidéos YouTube si généreuses Si Rachid.',
    status: 'approved',
    verifiedPurchase: 1,
    source: 'youtube_community',
    createdAt: '2026-10-05T16:45:00Z'
  },
  {
    id: 3,
    productId: 1, // Graines de tomates
    userId: 'user_yt_3',
    authorName: 'Hassan El Idrissi',
    authorLocation: 'Rabat',
    rating: 5,
    comment: 'ماشأ الله.. اللهم بارك وزد وبارك وأنعم.. يوم بعد يوم يزداد إعجابي وتقديري للصفحة وللمجهودات التي يقوم بها الأخ Rachid potagiste. vermicompost ممتاز جداً وبذور أصيلة.',
    status: 'approved',
    verifiedPurchase: 1,
    source: 'youtube_community',
    createdAt: '2026-10-04T09:12:00Z'
  },
  {
    id: 4,
    productId: 2, // Vermicompost
    userId: 'user_yt_4',
    authorName: 'Michel & Nadia',
    authorLocation: 'Marrakech',
    rating: 5,
    comment: 'Belle récolte ! Bravo super Rachid. Les plants de tomates anciennes ont résisté à la chaleur de Marrakech tout l\'été grâce à vos précieux conseils de paillage et votre compost vivant. Amicalement vôtre.',
    status: 'approved',
    verifiedPurchase: 1,
    source: 'verified_customer',
    createdAt: '2026-10-03T18:30:00Z'
  },
  {
    id: 5,
    productId: 1, // Graines de tomates
    userId: 'user_yt_5',
    authorName: 'Youssef El Amrani',
    authorLocation: 'Salé',
    rating: 5,
    comment: 'تبارك الله عليك يا أخي رشيد، زرعت بذور الطماطم والكرعة وخرجت في 3 أيام فقط! شتلات قوية وخالية من أي كيماوي. الله يعطيك الصحة على النصائح في اليوتيوب والخدمة النقية.',
    status: 'approved',
    verifiedPurchase: 1,
    source: 'youtube_community',
    createdAt: '2026-10-02T14:10:00Z'
  },
  {
    id: 6,
    productId: 7, // Poivrons
    userId: 'user_yt_6',
    authorName: 'Amine Belkadi',
    authorLocation: 'Tanger',
    rating: 5,
    comment: 'تبارك الله هاد مطيشة زوينة ملي كتجيبها وهادشي كيبين على الجودة والخدمة النقية.. تحياتي سي رشيد الفلاح. بذور الفلفل والدنجال خرجات كلها تبارك الله.',
    status: 'approved',
    verifiedPurchase: 1,
    source: 'verified_customer',
    createdAt: '2026-10-01T10:00:00Z'
  }
];

// Blog posts on Permaculture & Sowing tips
const DEFAULT_BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    slug: 'comment-reussir-ses-semis-de-tomates-au-maroc',
    title: 'Comment Réussir ses Semis de Tomates Anciennes au Maroc : Les Secrets de Rachid',
    excerpt: 'Température, profondeur de semis, terreau vivant et arrosage au brumisateur pour obtenir 100% de germination en 4 jours.',
    content: 'La tomate ancienne marocaine a une vigueur exceptionnelle, à condition de respecter son rythme naturel. Utilisez un terreau meuble tamisé enrichi à 20% de lombricompost. Ne tassez jamais la terre avec force : déposez la graine à 5mm de profondeur, recouvrez doucement et arrosez avec une eau non chlorée tempérée. Gardez vos terrines à l\'abri du vent direct jusqu\'à l\'apparition des deux premières vraies feuilles.',
    category: 'Tutos Semis & Graines',
    readTime: '4 min',
    author: 'Rachid Le Potagiste (@Rachid_Le_Potagiste)',
    imageUrl: '/images/rachid_real_yt_483hrFu5Cns.jpg',
    publishedAt: '05 Octobre 2026'
  },
  {
    id: 2,
    slug: 'pourquoi-le-vermicompost-est-l-or-noir-du-sol',
    title: 'Pourquoi le Vermicompost est le Meilleur Engrais Vivant pour Votre Potager',
    excerpt: 'Découvrez comment les vers Eisenia transforment la matière en enzymes protectrices et oligo-éléments assimilables.',
    content: 'Contrairement aux engrais chimiques NPK qui brûlent la micro-flore du sol et rendent les plantes dépendantes, le lombricompost apporte des millions de bactéries bénéfiques qui régénèrent la terre. Une poignée de vermicompost au fond du trou de plantation suffit pour nourrir la plante pendant 3 mois et lui conférer une résistance naturelle contre le mildiou.',
    category: 'Permaculture & Fertilité',
    readTime: '5 min',
    author: 'Rachid Le Potagiste',
    imageUrl: '/images/rachid_compost_vermicompost_1791482687599.jpg',
    publishedAt: '29 Septembre 2026'
  },
  {
    id: 3,
    slug: 'potager-sur-balcon-et-terrasse-au-maroc',
    title: 'Créer un Potager Productif sur son Balcon ou Toit-Terrasse à Casablanca ou Rabat',
    excerpt: 'Bacs en bois surélevés, choix des aromatiques et gestion de l\'arrosage goutte-à-goutte économique.',
    content: 'Pas besoin d\'avoir un grand terrain pour récolter ses propres légumes frais ! Sur une terrasse de 10m², avec 3 bacs de culture paillés et un composteur compact, vous pouvez produire votre menthe quotidienne, vos poivrons et plusieurs kilos de tomates du printemps jusqu\'à l\'hiver. Paillez toujours abondamment pour limiter l\'évaporation sous le soleil marocain.',
    category: 'Potager Urbain',
    readTime: '6 min',
    author: 'Rachid Le Potagiste',
    imageUrl: '/images/rachid_real_yt_4B9iAxcOejQ.jpg',
    publishedAt: '20 Septembre 2026'
  },
  {
    id: 4,
    slug: 'que-semer-en-hiver-et-en-fevrier-au-maroc',
    title: 'Que Semer en Hiver et en Février au Maroc : Préparation Complète de A à Z',
    excerpt: 'Le calendrier exact des semis d\'hiver et les astuces pour préparer la terre avant le printemps selon Rachid Le Potagiste.',
    content: 'Février est le mois charnière pour tout potagiste au Maroc ! C\'est le moment idéal pour lancer sous abri les semis de piments, aubergines et tomates tardives, et directement en pleine terre les fèves, pois et carottes. Dans cette vidéo suivie par plus de 120 000 personnes, Rachid détaille le travail du sol sans retournement brutal afin de préserver les vers de terre et les mycorhizes.',
    category: 'Calendrier des Semis',
    readTime: '7 min',
    author: 'Rachid Le Potagiste (@Rachid_Le_Potagiste)',
    imageUrl: '/images/rachid_real_yt__ou1clKBmmc.jpg',
    publishedAt: '12 Février 2026'
  }
];

class StoreService {
  private products: Product[] = [];
  private categories: Category[] = DEFAULT_CATEGORIES;
  private orders: Order[] = [];
  private reviews: Review[] = [];
  private browsingHistory: { userId: string; productId: number; viewedAt: string }[] = [];
  private blogPosts: BlogPost[] = DEFAULT_BLOG_POSTS;
  private notifications: PushNotification[] = [];
  private emails: EmailNotification[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const savedProducts = localStorage.getItem('rp_products');
      this.products = (savedProducts ? JSON.parse(savedProducts) : DEFAULT_PRODUCTS).map((p: Product) => ({
        ...p,
        imageUrl: resolveImageUrl(p.imageUrl)
      }));

      const savedOrders = localStorage.getItem('rp_orders');
      this.orders = (savedOrders ? JSON.parse(savedOrders) : [
        {
          id: 1,
          orderNumber: 'RP-2026-7840',
          userId: 'user_active',
          customerEmail: 'majdaitaissa@gmail.com',
          customerName: 'Mehdi Ait Aissa',
          customerPhone: '+212 6 61 23 45 67',
          shippingAddress: '15 Boulevard d\'Anfa',
          shippingCity: 'Casablanca',
          shippingPostalCode: '20000',
          totalAmount: 19000, // 190 DH
          status: 'shipped',
          paymentMethod: 'cod',
          paymentStatus: 'pending',
          trackingNumber: 'AMANA-MA-784091X',
          createdAt: '2026-10-07T10:00:00Z',
          updatedAt: '2026-10-08T08:30:00Z',
          items: [
            {
              id: 1,
              name: 'Graines de Tomates Anciennes Marocaines Reproductibles',
              price: 4500,
              quantity: 2,
              unit: 'Sachet kraft de 50 graines',
              imageUrl: '/images/rachid_graines_paysannes_1791482677509.jpg'
            },
            {
              id: 2,
              name: 'Vermicompost Vivant & Lombricompost Artisanal (10 kg)',
              price: 8500,
              quantity: 1,
              unit: 'Sac en jute respirant 10 kg',
              imageUrl: '/images/rachid_compost_vermicompost_1791482687599.jpg'
            }
          ],
          timeline: [
            {
              id: 1,
              orderId: 1,
              orderNumber: 'RP-2026-7840',
              status: 'confirmed',
              title: 'Commande Potagère Validée',
              description: 'Commande enregistrée pour livraison express à Casablanca. Paiement 190 DH à la réception.',
              emailNotificationSent: 1,
              createdAt: '2026-10-07T10:00:00Z'
            },
            {
              id: 2,
              orderId: 1,
              orderNumber: 'RP-2026-7840',
              status: 'preparing',
              title: 'Préparation à la pépinière de Rachid',
              description: 'Conditionnement soigné des graines et du vermicompost vivant avec calage aéré.',
              emailNotificationSent: 1,
              createdAt: '2026-10-07T14:30:00Z'
            },
            {
              id: 3,
              orderId: 1,
              orderNumber: 'RP-2026-7840',
              status: 'shipped',
              title: 'Colis confié à Amana Express Maroc',
              description: 'Numéro de suivi AMANA-MA-784091X actif. Arrivée prévue sous 24h.',
              emailNotificationSent: 1,
              createdAt: '2026-10-08T08:30:00Z'
            }
          ]
        }
      ]).map((o: Order) => ({
        ...o,
        items: o.items.map(it => ({
          ...it,
          imageUrl: resolveImageUrl(it.imageUrl)
        }))
      }));

      const savedBlog = localStorage.getItem('rp_blog');
      this.blogPosts = (savedBlog ? JSON.parse(savedBlog) : DEFAULT_BLOG_POSTS).map((bp: BlogPost) => ({
        ...bp,
        imageUrl: resolveImageUrl(bp.imageUrl)
      }));

      const savedReviews = localStorage.getItem('rp_reviews');
      this.reviews = savedReviews ? JSON.parse(savedReviews) : DEFAULT_REVIEWS;

      const savedHistory = localStorage.getItem('rp_history');
      this.browsingHistory = savedHistory ? JSON.parse(savedHistory) : [];

      const savedNotifs = localStorage.getItem('rp_notifs');
      this.notifications = savedNotifs ? JSON.parse(savedNotifs) : [
        {
          id: 1,
          userId: 'all',
          title: 'Bienvenue chez Rachid Le Potagiste ! 🌱',
          body: 'Semences paysannes reproductibles et vermicompost vivant expédiés partout au Maroc.',
          type: 'promo',
          isRead: 0,
          createdAt: new Date().toISOString()
        }
      ];

      const savedEmails = localStorage.getItem('rp_emails');
      this.emails = savedEmails ? JSON.parse(savedEmails) : [
        {
          id: 'email-1',
          to: 'majdaitaissa@gmail.com',
          subject: 'Confirmation de commande RP-2026-7840 - Rachid Le Potagiste',
          orderNumber: 'RP-2026-7840',
          status: 'confirmed',
          content: 'Merci pour votre commande ! Rachid et son équipe préparent vos semences et votre compost avec soin.',
          sentAt: '2026-10-07T10:00:00Z'
        }
      ];
    } catch {
      this.products = DEFAULT_PRODUCTS;
      this.reviews = DEFAULT_REVIEWS;
    }
  }

  private persist() {
    try {
      localStorage.setItem('rp_products', JSON.stringify(this.products));
      localStorage.setItem('rp_orders', JSON.stringify(this.orders));
      localStorage.setItem('rp_reviews', JSON.stringify(this.reviews));
      localStorage.setItem('rp_history', JSON.stringify(this.browsingHistory));
      localStorage.setItem('rp_notifs', JSON.stringify(this.notifications));
      localStorage.setItem('rp_emails', JSON.stringify(this.emails));
    } catch (e) {
      console.warn('Storage persistence warning:', e);
    }
    this.notify();
  }

  public subscribe(fn: () => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  // --- Products & Inventory ---
  public getProducts(): Product[] {
    return [...this.products];
  }

  public getProductBySlug(slug: string): Product | undefined {
    return this.products.find(p => p.slug === slug);
  }

  public getCategories(): Category[] {
    return [...this.categories];
  }

  public updateProductStock(id: number, newStock: number): void {
    const prod = this.products.find(p => p.id === id);
    if (prod) {
      prod.stock = Math.max(0, newStock);
      this.persist();
    }
  }

  public updateProductPrice(id: number, newPriceCents: number): void {
    const prod = this.products.find(p => p.id === id);
    if (prod) {
      prod.price = Math.max(100, newPriceCents);
      this.persist();
    }
  }

  public addProduct(productData: Omit<Product, 'id'>): Product {
    const newId = this.products.length > 0 ? Math.max(...this.products.map(p => p.id)) + 1 : 1;
    const newProduct: Product = {
      ...productData,
      id: newId
    };
    this.products.unshift(newProduct);
    this.addNotification({
      userId: 'all',
      title: `Nouvelle semence/produit ajouté : ${newProduct.name}`,
      body: `Disponible en stock immédiat sur la boutique de Rachid.`,
      type: 'stock',
      isRead: 0,
      createdAt: new Date().toISOString()
    });
    this.persist();
    return newProduct;
  }

  // --- Browsing History & Recommendation Engine ---
  public trackProductView(userId: string, productId: number): void {
    this.browsingHistory.unshift({
      userId,
      productId,
      viewedAt: new Date().toISOString()
    });
    // Keep max 50 recent events
    if (this.browsingHistory.length > 50) {
      this.browsingHistory.pop();
    }
    this.persist();
  }

  /**
   * Recommendation Algorithm:
   * Combines content-based filtering (category affinity & complementary plant/soil pairings)
   * and collaborative filtering (frequently bought together with existing cart/past purchases).
   */
  public getRecommendations(currentProductId?: number): RecommendationReason[] {
    const currentProduct = currentProductId ? this.products.find(p => p.id === currentProductId) : undefined;
    const recentViewIds = new Set(this.browsingHistory.slice(0, 5).map(h => h.productId));

    // Complementary affinity map
    const complementaryPairings: Record<string, { targetCategory: string; reason: string }> = {
      'graines-semences': {
        targetCategory: 'amendements-engrais',
        reason: 'Indispensable pour réussir la levée de vos semis avec un sol vivant riche en lombricompost.'
      },
      'plants-arbustes': {
        targetCategory: 'amendements-engrais',
        reason: 'Fortifiant naturel recommandé pour stimuler la reprise racinaire de vos plants.'
      },
      'amendements-engrais': {
        targetCategory: 'graines-semences',
        reason: 'Associez cet amendement aux semences paysannes reproductibles de Rachid.'
      },
      'fruits-legumes': {
        targetCategory: 'epicerie-terroir',
        reason: 'Complétez votre panier maraîcher avec l\'huile d\'olive vierge extra pressée à froid.'
      },
      'epicerie-terroir': {
        targetCategory: 'fruits-legumes',
        reason: 'Fraîcheur garantie récoltée le matin même dans le potager de Rachid.'
      }
    };

    const results: RecommendationReason[] = [];

    this.products.forEach(p => {
      if (currentProductId && p.id === currentProductId) return;

      let score = 0;
      let reason = 'Recommandé par Rachid Le Potagiste';

      // 1. Content-based affinity
      if (currentProduct) {
        const pairing = complementaryPairings[currentProduct.categorySlug];
        if (pairing && p.categorySlug === pairing.targetCategory) {
          score += 50;
          reason = pairing.reason;
        } else if (p.categorySlug === currentProduct.categorySlug) {
          score += 30;
          reason = `Autre variété recommandée dans la catégorie ${p.categorySlug}`;
        }
      }

      // 2. Browsing history boost
      if (recentViewIds.has(p.id)) {
        score += 25;
        reason = 'Basé sur vos consultations récentes sur la boutique';
      }

      // 3. Community rating boost
      const ratingNum = parseFloat(p.rating || '4.5');
      score += Math.round(ratingNum * 10);

      if (p.isFeatured) {
        score += 15;
      }

      results.push({
        product: p,
        score,
        reason
      });
    });

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, 3);
  }

  // --- Customer Reviews & Moderation Queue ---
  public getReviewsForProduct(productId: number): Review[] {
    return this.reviews.filter(r => r.productId === productId && r.status === 'approved');
  }

  public getAllReviews(): Review[] {
    return [...this.reviews];
  }

  public addReview(reviewData: {
    productId: number;
    userId: string;
    authorName: string;
    authorLocation?: string;
    rating: number;
    comment: string;
    verifiedPurchase?: number;
    source?: 'youtube_community' | 'verified_customer';
  }): Review {
    const newId = this.reviews.length > 0 ? Math.max(...this.reviews.map(r => r.id)) + 1 : 1;
    const newReview: Review = {
      id: newId,
      productId: reviewData.productId,
      userId: reviewData.userId,
      authorName: reviewData.authorName,
      authorLocation: reviewData.authorLocation || 'Maroc',
      rating: Math.max(1, Math.min(5, reviewData.rating)),
      comment: reviewData.comment,
      status: 'approved', // instant approval with admin moderation control
      verifiedPurchase: reviewData.verifiedPurchase ?? 1,
      source: reviewData.source ?? 'verified_customer',
      createdAt: new Date().toISOString()
    };

    this.reviews.unshift(newReview);
    this.recalculateProductRating(reviewData.productId);

    this.addNotification({
      userId: 'admin',
      title: `Nouvel avis client reçu (${reviewData.rating}★)`,
      body: `"${reviewData.comment.substring(0, 60)}..." par ${reviewData.authorName}`,
      type: 'tips',
      isRead: 0,
      createdAt: new Date().toISOString()
    });

    this.persist();
    return newReview;
  }

  public moderateReview(reviewId: number, newStatus: 'approved' | 'rejected'): void {
    const review = this.reviews.find(r => r.id === reviewId);
    if (review) {
      review.status = newStatus;
      this.recalculateProductRating(review.productId);
      this.persist();
    }
  }

  private recalculateProductRating(productId: number): void {
    const approvedReviews = this.reviews.filter(r => r.productId === productId && r.status === 'approved');
    const prod = this.products.find(p => p.id === productId);
    if (prod && approvedReviews.length > 0) {
      const avg = approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length;
      prod.rating = avg.toFixed(1);
      prod.reviewCount = approvedReviews.length;
    }
  }

  // --- Orders & Stripe Payment in Dirhams (DH) ---
  public createOrder(orderPayload: {
    userId: string;
    customerEmail: string;
    customerName: string;
    customerPhone: string;
    shippingAddress: string;
    shippingCity: string;
    shippingPostalCode?: string;
    paymentMethod: 'stripe_card' | 'cod';
    items: { product: Product; quantity: number }[];
  }): Order {
    const orderNumber = `RP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const subtotal = orderPayload.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    // Free shipping above 250 DH (25000 cents), otherwise 35 DH (3500 cents)
    const shipping = subtotal >= 25000 ? 0 : 3500;
    const totalAmount = subtotal + shipping;

    // Real-time stock decrement
    orderPayload.items.forEach(item => {
      this.updateProductStock(item.product.id, item.product.stock - item.quantity);
    });

    const now = new Date().toISOString();
    const trackingNumber = `AMANA-MA-${Math.floor(100000 + Math.random() * 900000)}X`;

    const initialTimeline: Order['timeline'] = [
      {
        id: 1,
        orderId: this.orders.length + 1,
        orderNumber,
        status: 'confirmed',
        title: orderPayload.paymentMethod === 'stripe_card'
          ? 'Paiement Sécurisé Validé & Commande Confirmée'
          : 'Commande Potagère Validée (Paiement Cash à la Livraison)',
        description: orderPayload.paymentMethod === 'stripe_card'
          ? `Paiement sécurisé de ${(totalAmount / 100).toFixed(2)} DH validé par Stripe.`
          : `Commande enregistrée. Montant de ${(totalAmount / 100).toFixed(2)} DH à régler au livreur en espèces.`,
        emailNotificationSent: 1,
        createdAt: now
      }
    ];

    const newOrder: Order = {
      id: this.orders.length + 1,
      orderNumber,
      userId: orderPayload.userId,
      customerEmail: orderPayload.customerEmail,
      customerName: orderPayload.customerName,
      customerPhone: orderPayload.customerPhone,
      shippingAddress: orderPayload.shippingAddress,
      shippingCity: orderPayload.shippingCity,
      shippingPostalCode: orderPayload.shippingPostalCode,
      totalAmount,
      status: 'confirmed',
      paymentMethod: orderPayload.paymentMethod,
      paymentStatus: orderPayload.paymentMethod === 'stripe_card' ? 'paid' : 'pending',
      trackingNumber,
      items: orderPayload.items.map(i => ({
        id: i.product.id,
        name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
        unit: i.product.unit,
        imageUrl: resolveImageUrl(i.product.imageUrl)
      })),
      createdAt: now,
      updatedAt: now,
      timeline: initialTimeline
    };

    this.orders.unshift(newOrder);

    // Push notification
    this.addNotification({
      userId: orderPayload.userId,
      title: `Commande confirmée (${orderNumber})`,
      body: `Merci ${orderPayload.customerName} ! Vos semences et produits bio de ${(totalAmount / 100).toFixed(2)} DH sont en préparation à la pépinière de Rachid.`,
      type: 'order',
      isRead: 0,
      createdAt: now
    });

    // Email notification
    this.sendEmailNotification({
      to: orderPayload.customerEmail,
      orderNumber,
      status: 'confirmed',
      subject: `Confirmation de votre commande ${orderNumber} - Rachid Le Potagiste`,
      content: `Salam ${orderPayload.customerName},\n\nNous avons bien reçu votre commande ${orderNumber} pour un montant total de ${(totalAmount / 100).toFixed(2)} DH.\n\nAdresse de livraison au Maroc : ${orderPayload.shippingAddress}, ${orderPayload.shippingCity}.\n\nRachid et son équipe préparent avec passion vos semences paysannes et votre compost vivant.`
    });

    this.persist();
    return newOrder;
  }

  public updateOrderStatus(orderNumber: string, newStatus: OrderStatus): void {
    const order = this.orders.find(o => o.orderNumber === orderNumber);
    if (!order) return;

    order.status = newStatus;
    order.updatedAt = new Date().toISOString();

    const statusTitles: Record<OrderStatus, { title: string; desc: string }> = {
      confirmed: {
        title: 'Commande confirmée & Enregistrée',
        desc: 'Votre commande est inscrite au planning de préparation de la pépinière.'
      },
      preparing: {
        title: 'Préparation soignée à la pépinière de Rachid',
        desc: 'Vos semences, plants ou compost sont emballés dans des matériaux respirants et écologiques.'
      },
      shipped: {
        title: 'Colis confié au transporteur express (Amana)',
        desc: `Votre colis est en cours d'acheminement avec le numéro de suivi ${order.trackingNumber || 'AMANA-MA-EXPRESS'}.`
      },
      delivered: {
        title: 'Colis remis en mains propres 🌿',
        desc: 'Votre colis potager a été livré. Bonnes plantations avec Rachid Le Potagiste !'
      },
      cancelled: {
        title: 'Commande annulée',
        desc: 'La commande a été annulée.'
      }
    };

    const info = statusTitles[newStatus];
    if (!order.timeline) order.timeline = [];
    order.timeline.push({
      id: order.timeline.length + 1,
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: newStatus,
      title: info.title,
      description: info.desc,
      emailNotificationSent: 1,
      createdAt: new Date().toISOString()
    });

    // Push notification
    this.addNotification({
      userId: order.userId,
      title: `Étape de livraison : ${info.title}`,
      body: `Commande ${order.orderNumber} : ${info.desc}`,
      type: 'order',
      isRead: 0,
      createdAt: new Date().toISOString()
    });

    // Email notification
    this.sendEmailNotification({
      to: order.customerEmail,
      orderNumber: order.orderNumber,
      status: newStatus,
      subject: `Mise à jour livraison : ${order.orderNumber} (${info.title})`,
      content: `Salam ${order.customerName},\n\nUne nouvelle étape a été franchie pour votre commande ${order.orderNumber} :\n\n${info.title}\n${info.desc}\n\nNuméro de suivi : ${order.trackingNumber || 'En cours'}\n\nMerci de votre confiance et de votre amour pour la terre,\nRachid Le Potagiste & Mehdi Ait Aissa.`
    });

    this.persist();
  }

  public getOrders(): Order[] {
    return [...this.orders];
  }

  public getOrderByNumber(orderNumber: string): Order | undefined {
    return this.orders.find(o => o.orderNumber.toUpperCase() === orderNumber.toUpperCase().trim());
  }

  // --- Email & Push Notifications ---
  public sendEmailNotification(payload: {
    to: string;
    orderNumber: string;
    status: OrderStatus;
    subject: string;
    content: string;
  }) {
    const newEmail: EmailNotification = {
      id: `email-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      to: payload.to,
      subject: payload.subject,
      orderNumber: payload.orderNumber,
      status: payload.status,
      content: payload.content,
      sentAt: new Date().toISOString()
    };
    this.emails.unshift(newEmail);
  }

  public getEmails(): EmailNotification[] {
    return [...this.emails];
  }

  public addNotification(notification: Omit<PushNotification, 'id'>) {
    const newNotif: PushNotification = {
      ...notification,
      id: this.notifications.length + 1
    };
    this.notifications.unshift(newNotif);
    this.persist();
  }

  public getNotifications(): PushNotification[] {
    return [...this.notifications];
  }

  public markNotificationsAsRead(): void {
    this.notifications.forEach(n => { n.isRead = 1; });
    this.persist();
  }

  // --- Blog & Tutos ---
  public getBlogPosts(): BlogPost[] {
    return [...this.blogPosts];
  }

  // --- Analytics & PDF Export (In Dirhams) ---
  public getAnalytics(): AnalyticsSummary {
    const totalRevenue = this.orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const totalOrders = this.orders.length;
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const uniqueCustomers = new Set(this.orders.map(o => o.customerEmail.toLowerCase())).size;
    const lowStockItemsCount = this.products.filter(p => p.stock <= 10).length;

    const categoryMap: Record<string, { count: number; revenue: number }> = {};
    this.orders.forEach(order => {
      order.items.forEach(item => {
        const product = this.products.find(p => p.id === item.id);
        const cat = product?.categorySlug || 'graines-semences';
        if (!categoryMap[cat]) {
          categoryMap[cat] = { count: 0, revenue: 0 };
        }
        categoryMap[cat].count += item.quantity;
        categoryMap[cat].revenue += item.price * item.quantity;
      });
    });

    const salesByCategory = Object.entries(categoryMap).map(([category, data]) => ({
      category,
      count: data.count,
      revenue: data.revenue
    }));

    const recentSales = [
      { date: '04 Oct', amount: 320000, count: 18 },
      { date: '05 Oct', amount: 480000, count: 26 },
      { date: '06 Oct', amount: 410000, count: 22 },
      { date: '07 Oct', amount: 560000, count: 31 },
      { date: '08 Oct', amount: totalRevenue, count: totalOrders }
    ];

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      totalCustomers: uniqueCustomers || 1,
      lowStockItemsCount,
      salesByCategory,
      recentSales
    };
  }

  public exportAnalyticsPdf(): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const analytics = this.getAnalytics();
    const nowStr = new Date().toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Dark forest green header
    doc.setFillColor(31, 58, 43);
    doc.rect(0, 0, 210, 44, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('RACHID POTAGISTE', 15, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Boutique Officielle de Semences Paysannes & Permaculture Maroc', 15, 26);
    doc.text('Développé par Mehdi Ait Aissa · Chaîne YouTube @Rachid_Le_Potagiste', 15, 33);
    doc.text(`Rapport Analytique en Dirhams (DH) · Généré le : ${nowStr}`, 15, 40);

    // KPI Cards
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Indicateurs Clés de Performance (Dirhams MAD)', 15, 56);

    const kpiBoxes = [
      { title: 'Chiffre d\'Affaires Total', value: `${(analytics.totalRevenue / 100).toFixed(2)} DH`, x: 15 },
      { title: 'Commandes Expédiées', value: `${analytics.totalOrders}`, x: 80 },
      { title: 'Panier Moyen', value: `${(analytics.averageOrderValue / 100).toFixed(2)} DH`, x: 145 },
    ];

    kpiBoxes.forEach(kpi => {
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(kpi.x, 62, 50, 26, 2, 2, 'FD');

      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.text(kpi.title, kpi.x + 4, 70);

      doc.setFontSize(13);
      doc.setTextColor(22, 101, 52);
      doc.setFont('helvetica', 'bold');
      doc.text(kpi.value, kpi.x + 4, 80);
    });

    // Stock state
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text('État des Stocks en Pépinière', 15, 102);

    let yPos = 112;
    doc.setFillColor(241, 245, 249);
    doc.rect(15, yPos - 5, 180, 8, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('PRODUIT / SEMENCE', 18, yPos);
    doc.text('PRIX (DH)', 120, yPos);
    doc.text('STOCK DISPONIBLE', 155, yPos);

    yPos += 8;
    doc.setFont('helvetica', 'normal');
    this.products.forEach(p => {
      if (yPos > 265) {
        doc.addPage();
        yPos = 25;
      }
      doc.setTextColor(30, 41, 59);
      doc.text(p.name.length > 45 ? p.name.substring(0, 42) + '...' : p.name, 18, yPos);
      doc.text(`${(p.price / 100).toFixed(2)} DH`, 120, yPos);

      if (p.stock <= 10) {
        doc.setTextColor(194, 65, 12);
        doc.text(`${p.stock} unités (Alerte)`, 155, yPos);
      } else {
        doc.setTextColor(22, 101, 52);
        doc.text(`${p.stock} unités`, 155, yPos);
      }

      yPos += 7;
    });

    // Recent orders
    yPos += 10;
    if (yPos > 250) {
      doc.addPage();
      yPos = 25;
    }

    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text('Dernières Commandes Expédiées', 15, yPos);

    yPos += 8;
    doc.setFillColor(241, 245, 249);
    doc.rect(15, yPos - 5, 180, 8, 'F');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text('RÉFÉRENCE', 18, yPos);
    doc.text('CLIENT', 60, yPos);
    doc.text('STATUT', 120, yPos);
    doc.text('TOTAL', 165, yPos);

    yPos += 8;
    doc.setFont('helvetica', 'normal');
    this.orders.slice(0, 8).forEach(o => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 25;
      }
      doc.setTextColor(30, 41, 59);
      doc.text(o.orderNumber, 18, yPos);
      doc.text(o.customerName.substring(0, 25), 60, yPos);
      doc.text(o.status.toUpperCase(), 120, yPos);
      doc.text(`${(o.totalAmount / 100).toFixed(2)} DH`, 165, yPos);
      yPos += 7;
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('RACHID POTAGISTE · Plateforme propulsée par Mehdi Ait Aissa · www.thegreensouk.com', 15, 287);

    doc.save(`Bilan_RachidPotagiste_${new Date().toISOString().slice(0, 10)}.pdf`);
  }
}

export const storeService = new StoreService();
