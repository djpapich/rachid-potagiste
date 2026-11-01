import { defineConfig } from 'drizzle-kit';

// Generates SQL migrations from src/db/schema.ts:  npm run db:generate
// Migrations are applied automatically when the server starts (src/server/db.ts).
export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
});
