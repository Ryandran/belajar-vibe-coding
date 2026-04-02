import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/model/*.ts',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
