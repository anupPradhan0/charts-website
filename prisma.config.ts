import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
    // Managed Postgres (Neon, Supabase, …) serves the app through a connection
    // pooler that cannot run DDL. When DIRECT_URL is set, migrations use the
    // unpooled endpoint instead; with a plain local database it stays unset and
    // everything goes through DATABASE_URL.
    ...(process.env.DIRECT_URL ? { directUrl: env("DIRECT_URL") } : {}),
  },
});
