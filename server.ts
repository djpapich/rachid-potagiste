import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API: Products endpoint serving the official 18 artisanal products
app.get('/api/products', (_req: Request, res: Response) => {
  try {
    const productsPath = path.join(__dirname, 'public', 'data', 'products.json');
    if (fs.existsSync(productsPath)) {
      const data = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
      return res.json(data);
    }
    return res.status(404).json({ error: 'Products not found' });
  } catch (error) {
    console.error('Error reading products:', error);
    return res.status(500).json({ error: 'Failed to read products' });
  }
});

// API: Promo configuration
app.get('/api/promo', (_req: Request, res: Response) => {
  try {
    const promoPath = path.join(__dirname, 'public', 'data', 'promo.json');
    if (fs.existsSync(promoPath)) {
      const data = JSON.parse(fs.readFileSync(promoPath, 'utf8'));
      return res.json(data);
    }
    return res.status(404).json({ error: 'Promo not found' });
  } catch (error) {
    console.error('Error reading promo:', error);
    return res.status(500).json({ error: 'Failed to read promo' });
  }
});

// Serve static assets from dist in production
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (_req: Request, res: Response) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  return res.sendFile(path.join(__dirname, 'index.html'));
});

if (process.env.NODE_ENV === 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
