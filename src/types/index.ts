export type Language = 'fr' | 'en' | 'ar';

export interface Product {
  id: number;
  slug: string;
  name: string;
  categorySlug: string;
  price: number; // in cents
  originalPrice?: number | null;
  stock: number;
  unit: string;
  description: string;
  origin: string;
  certification: string;
  ingredients?: string | null;
  benefits?: string | null;
  rating: string;
  reviewCount: number;
  imageUrl: string;
  isFeatured: number;
}

export interface Category {
  id: number;
  slug: string;
  nameFr: string;
  nameEn: string;
  nameAr: string;
  description: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItemSummary {
  id: number;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  imageUrl: string;
}

export interface OrderTimelineEvent {
  id: number;
  orderId: number;
  orderNumber: string;
  status: OrderStatus;
  title: string;
  description: string;
  emailNotificationSent: number;
  createdAt: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode?: string;
  totalAmount: number; // in cents
  status: OrderStatus;
  paymentMethod: 'stripe_card' | 'cod';
  paymentStatus: 'paid' | 'pending';
  trackingNumber?: string;
  items: OrderItemSummary[];
  createdAt: string;
  updatedAt: string;
  timeline?: OrderTimelineEvent[];
}

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: string;
  author: string;
  imageUrl: string;
  publishedAt: string;
}

export interface PushNotification {
  id: number;
  userId: string;
  title: string;
  body: string;
  type: 'order' | 'stock' | 'tips';
  isRead: number;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  lowStockItemsCount: number;
  salesByCategory: { category: string; count: number; revenue: number }[];
  recentSales: { date: string; amount: number; count: number }[];
}

export interface EmailNotification {
  id: string;
  to: string;
  subject: string;
  orderNumber: string;
  status: OrderStatus;
  content: string;
  sentAt: string;
}

export interface Review {
  id: number;
  productId: number;
  userId: string;
  authorName: string;
  authorLocation?: string;
  rating: number; // 1 to 5
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  verifiedPurchase: number;
  source: 'youtube_community' | 'verified_customer';
  createdAt: string;
}

export interface RecommendationReason {
  product: Product;
  score: number;
  reason: string;
}
