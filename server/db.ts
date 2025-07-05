import { createRequire } from 'module';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

const require = createRequire(import.meta.url);
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export const db = drizzle(pool, { schema });