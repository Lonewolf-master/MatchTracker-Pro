import { configDotenv } from "dotenv";
configDotenv();
export default {
  schema: "./src/db/schema.js",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
   url: process.env.DATABASE_URL,
  },
};

// npx drizzle-kit generate
// npx drizzle-kit push