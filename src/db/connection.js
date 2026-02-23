import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";
import { configDotenv } from "dotenv";
configDotenv(); // Load environment variables from .env

// Manually verify the variable is being read
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing from .env file");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  //   ssl: {
  //   rejectUnauthorized: false // Required for Neon/AWS/Heroku
  // }
});

/**
 * Drizzle database instance
 * Includes schema for typed queries
 */
export const db = drizzle(pool, { schema });

export { pool };