import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * The Prisma client.
 *
 * Server-only: `DATABASE_URL` is read here and nowhere else, and nothing in
 * `src/components` imports this module. Cached on `globalThis` so the dev
 * server's module reloads do not open a new connection pool each time.
 */

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
