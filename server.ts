import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import { db } from './src/db/index.ts';
import { products, orders, orderTimeline, categories, blogPosts, pushNotifications, reviews, userBrowsingHistory } from './src/db/schema.ts';
import { eq, desc } from 'drizzle-orm';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API: Products
app.get('/api/products', async (_req: Request, res: Response) => {
  try {
    const allProducts = await db.select().from(products).orderBy(desc(products.id));
    res.json(allProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// API: Categories
app.get('/api/categories', async (_req: Request, res: Response) => {
  try {
    const allCategories = await db.select().from(categories);
    res.json(allCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// API: Orders
app.get('/api/orders', async (_req: Request, res: Response) => {
  try {
    const allOrders = await db.select().from(orders).orderBy(desc(orders.id));
    res.json(allOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// API: Create Order
app.post('/api/orders', async (req: Request, res: Response) => {
  try {
    const { orderNumber, userId, customerEmail, customerName, customerPhone, shippingAddress, shippingCity, totalAmount, paymentMethod, items } = req.body;
    
    const [newOrder] = await db.insert(orders).values({
      orderNumber,
      userId: userId || 'guest',
      customerEmail,
      customerName,
      customerPhone,
      shippingAddress,
      shippingCity,
      totalAmount,
      status: 'confirmed',
      paymentMethod: paymentMethod || 'stripe_card',
      paymentStatus: 'paid',
      trackingNumber: `FR-COLIS-${Math.floor(100000 + Math.random() * 900000)}`,
      itemsJson: JSON.stringify(items || []),
    }).returning();

    // Timeline event
    await db.insert(orderTimeline).values({
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      status: 'confirmed',
      title: 'Paiement Stripe validé & Commande confirmée',
      description: `Paiement sécurisé de ${(totalAmount / 100).toFixed(2)} € validé.`,
      emailNotificationSent: 1,
    });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// API: Blog
app.get('/api/blog', async (_req: Request, res: Response) => {
  try {
    const posts = await db.select().from(blogPosts).orderBy(desc(blogPosts.id));
    res.json(posts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

// API: Customer Reviews
app.get('/api/reviews', async (req: Request, res: Response) => {
  try {
    const productId = req.query.productId ? parseInt(req.query.productId as string, 10) : undefined;
    if (productId) {
      const prodReviews = await db.select().from(reviews).where(eq(reviews.productId, productId)).orderBy(desc(reviews.id));
      res.json(prodReviews);
    } else {
      const allReviews = await db.select().from(reviews).orderBy(desc(reviews.id));
      res.json(allReviews);
    }
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// API: Add Review
app.post('/api/reviews', async (req: Request, res: Response) => {
  try {
    const { productId, userId, authorName, authorLocation, rating, comment, verifiedPurchase, source } = req.body;
    const [newReview] = await db.insert(reviews).values({
      productId,
      userId: userId || 'user_active',
      authorName,
      authorLocation: authorLocation || 'Maroc',
      rating,
      comment,
      status: 'approved',
      verifiedPurchase: verifiedPurchase ?? 1,
      source: source || 'verified_customer',
    }).returning();

    res.status(201).json(newReview);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// API: Moderate Review
app.patch('/api/reviews/:id', async (req: Request, res: Response) => {
  try {
    const reviewId = parseInt(req.params.id, 10);
    const { status } = req.body;
    const [updatedReview] = await db.update(reviews).set({ status }).where(eq(reviews.id, reviewId)).returning();
    res.json(updatedReview);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// API: Track Browsing History
app.post('/api/browsing-history', async (req: Request, res: Response) => {
  try {
    const { userId, productId } = req.body;
    await db.insert(userBrowsingHistory).values({
      userId: userId || 'anonymous',
      productId,
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to track history' });
  }
});

// Serve frontend in production
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server when run directly
if (process.env.NODE_ENV === 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
