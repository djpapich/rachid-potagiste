import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table (Firebase Auth UID as key)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  role: text('role').notNull().default('customer'), // 'customer' | 'admin'
  phone: text('phone'),
  address: text('address'),
  city: text('city'),
  postalCode: text('postal_code'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Categories
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  nameFr: text('name_fr').notNull(),
  nameEn: text('name_en').notNull(),
  nameAr: text('name_ar').notNull(),
  description: text('description'),
});

// Products with real-time stock
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  categorySlug: text('category_slug').notNull(),
  price: integer('price').notNull(), // in cents (e.g. 1850 for 18.50 €)
  originalPrice: integer('original_price'), // for discounts
  stock: integer('stock').notNull().default(30),
  unit: text('unit').notNull().default('unité'),
  description: text('description').notNull(),
  origin: text('origin').notNull(),
  certification: text('certification').notNull().default('Certifié Bio Ecocert'),
  ingredients: text('ingredients'),
  benefits: text('benefits'),
  rating: text('rating').default('4.9'),
  reviewCount: integer('review_count').default(42),
  imageUrl: text('image_url').notNull(),
  isFeatured: integer('is_featured').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Orders
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  userId: text('user_id').notNull(), // Firebase UID or guest ID
  customerEmail: text('customer_email').notNull(),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  shippingAddress: text('shipping_address').notNull(),
  shippingCity: text('shipping_city').notNull(),
  shippingPostalCode: text('shipping_postal_code'),
  totalAmount: integer('total_amount').notNull(), // in cents
  status: text('status').notNull().default('confirmed'), // 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'
  paymentMethod: text('payment_method').notNull().default('stripe_card'), // 'stripe_card' | 'cod'
  paymentStatus: text('payment_status').notNull().default('paid'),
  trackingNumber: text('tracking_number'),
  itemsJson: text('items_json').notNull(), // JSON stringified array of ordered items
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Order timeline & tracking events
export const orderTimeline = pgTable('order_timeline', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull(),
  orderNumber: text('order_number').notNull(),
  status: text('status').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  emailNotificationSent: integer('email_notification_sent').default(1),
  createdAt: timestamp('created_at').defaultNow(),
});

// Blog Posts / Astuces Bio
export const blogPosts = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
  category: text('category').notNull(),
  readTime: text('read_time').notNull(),
  author: text('author').notNull(),
  imageUrl: text('image_url').notNull(),
  publishedAt: text('published_at').notNull(),
});

// Push notifications simulation
export const pushNotifications = pgTable('push_notifications', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  type: text('type').notNull(), // 'order' | 'stock' | 'tips'
  isRead: integer('is_read').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Customer Reviews & Community Feedback
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').notNull(),
  userId: text('user_id').notNull(),
  authorName: text('author_name').notNull(),
  authorLocation: text('author_location'),
  rating: integer('rating').notNull(), // 1 to 5
  comment: text('comment').notNull(),
  status: text('status').notNull().default('approved'), // 'pending' | 'approved' | 'rejected'
  verifiedPurchase: integer('verified_purchase').default(1),
  source: text('source').default('community'), // 'youtube_community' | 'verified_customer'
  createdAt: timestamp('created_at').defaultNow(),
});

// User Browsing History for recommendations
export const userBrowsingHistory = pgTable('user_browsing_history', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  productId: integer('product_id').notNull(),
  viewedAt: timestamp('viewed_at').defaultNow(),
});

// Relations
export const productsRelations = relations(products, ({ many }) => ({
  reviews: many(reviews),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  timeline: many(orderTimeline),
}));

export const orderTimelineRelations = relations(orderTimeline, ({ one }) => ({
  order: one(orders, {
    fields: [orderTimeline.orderId],
    references: [orders.id],
  }),
}));
