import { defineConfig } from "drizzle-kit";

export default defineConfig({
  // Tells Drizzle we are using PostgreSQL
  dialect: "postgresql",

  // The path to your schema file (adjust if yours is not in src/db/)
  schema: "./src/db/schema.js",

  // Where to output the generated SQL migration files
  out: "./src/db/migrations",

  // Pulls the connection string securely from your .env or .env.local file
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
