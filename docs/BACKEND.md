# Boutique : API, base de données, admin

API Express (`server.ts`) + PostgreSQL (Drizzle). Paiement à la livraison (COD) ; paiement en ligne à brancher plus tard.

## Lancer en local
```
npm install
npm run seed            # catalogue + promo (stock 20 par défaut, à ajuster)
ADMIN_EMAIL=toi@mail.com ADMIN_PASSWORD='mot de passe long' npm run seed   # crée l'admin
npm start               # API sur :3000, base embarquée PGlite (.data/)
npm run test:api        # 15 tests d'intégration
```

## Mise en ligne (gratuit)
1. **Neon** : créer une base Postgres, copier la `DATABASE_URL`.
2. **Render** (Web Service, Node) : build `npm install`, start `npm start`. Variables :
   `NODE_ENV=production`, `DATABASE_URL`, `ALLOWED_ORIGINS=https://rachidpotagiste.netlify.app`.
   Les migrations s'appliquent au démarrage. Lancer une fois `npm run seed` (Shell Render) avec `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
3. **Netlify** : ajouter dans `netlify.toml` (avec l'URL Render réelle) :
```
[[redirects]]
  from = "/api/*"
  to = "https://<ton-app>.onrender.com/api/:splat"
  status = 200
  force = true
```
Ne jamais mettre les secrets dans le dépôt ni dans un chat : uniquement dans les variables Render/Neon.

## Sécurité
Prix, stock et promo recalculés côté serveur ; décrément de stock atomique (pas de survente) ; contraintes CHECK en base ;
sessions en cookie HttpOnly/SameSite (seul le hash SHA-256 est stocké) ; mots de passe scrypt ; garde Origin anti-CSRF ;
limites de débit (commandes, connexion, suivi) ; admin créé uniquement par le script de seed.
