import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../src/lib/admin/password";
import {
  SEED_ARCHIVE_DAYS,
  SEED_CATEGORIES,
  SEED_PAUSED_SINCE_DAYS_AGO,
} from "./seed-data";

/**
 * Development seed.
 *
 * Values come from a seeded PRNG keyed on (category, date), so re-seeding the
 * same day reproduces the same archive. Statuses are resolved against the clock
 * at seed time: slots still in the future today are `scheduled`, which is
 * exactly what an administrator then publishes from /admin/results.
 *
 * Idempotent: categories are upserted by slug and results are inserted with
 * `skipDuplicates` against the (categoryId, publishedDate) unique constraint,
 * so running it twice never destroys work done in the admin panel.
 */

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 — small, fast, good enough for demo data. */
function rng(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

function atTime(dayISO: string, hhmm: string): Date {
  const [y, m, d] = dayISO.split("-").map(Number);
  const [h, min] = hhmm.split(":").map(Number);
  return new Date(y, m - 1, d, h, min, 0, 0);
}

/** A `@db.Date` column holds a calendar day, so it is written at UTC midnight
 *  and read back the same way — never through a local-time conversion. */
function toDateColumn(dayISO: string): Date {
  return new Date(`${dayISO}T00:00:00.000Z`);
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn(
      "[seed] ADMIN_EMAIL / ADMIN_PASSWORD are unset — no administrator created.\n" +
        "        Set them in .env and re-run `npm run db:seed` to sign in to /admin.",
    );
    return;
  }
  const passwordHash = await hashPassword(password);
  await prisma.admin.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, name: process.env.ADMIN_NAME?.trim() || "Administrator", passwordHash },
  });
  console.log(`[seed] administrator ready: ${email}`);
}

async function seedCategories() {
  const ids = new Map<string, string>();
  for (const [index, category] of SEED_CATEGORIES.entries()) {
    const data = {
      name: category.name,
      description: category.description,
      scheduleTime: category.scheduleTime,
      group: category.group,
      isActive: category.isActive,
      displayOrder: index + 1,
      updateFrequency: category.updateFrequency,
      accent: category.accent,
    };
    const row = await prisma.category.upsert({
      where: { slug: category.slug },
      update: data,
      create: { slug: category.slug, ...data },
    });
    ids.set(category.slug, row.id);
  }
  console.log(`[seed] ${ids.size} categories`);
  return ids;
}

async function seedResults(ids: Map<string, string>) {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const pausedFrom = toISODate(addDays(today, -SEED_PAUSED_SINCE_DAYS_AGO));

  const rows: {
    categoryId: string;
    value: string | null;
    publishedDate: Date;
    publishedTime: string;
    status: "published" | "pending" | "scheduled";
  }[] = [];

  for (let offset = SEED_ARCHIVE_DAYS - 1; offset >= 0; offset--) {
    const day = addDays(today, -offset);
    const dayISO = toISODate(day);
    const weekday = day.getDay();

    for (const category of SEED_CATEGORIES) {
      // Paused categories stop producing entries at their pause date.
      if (!category.isActive && dayISO > pausedFrom) continue;
      // Weekday-only series have no weekend entries.
      if (category.updateFrequency === "Weekdays" && (weekday === 0 || weekday === 6)) continue;

      const rand = rng(hashSeed(`${category.slug}:${dayISO}`));
      // A small share of days simply have no entry — realistic gaps.
      if (rand() < 0.03) continue;

      const value = pad(Math.floor(rand() * 100));
      const slot = atTime(dayISO, category.scheduleTime);
      const delayMinutes = 1 + Math.floor(rand() * 24);
      const missed = rand() < 0.05;
      const published = new Date(slot.getTime() + delayMinutes * 60_000);

      let status: "published" | "pending" | "scheduled";
      if (slot > now) status = "scheduled";
      // Only today's board can sit in "pending" — the archive is settled.
      else if (missed && offset === 0) status = "pending";
      else status = published > now ? "pending" : "published";

      rows.push({
        categoryId: ids.get(category.slug)!,
        value: status === "published" ? value : null,
        publishedDate: toDateColumn(dayISO),
        publishedTime:
          status === "published"
            ? `${pad(published.getHours())}:${pad(published.getMinutes())}`
            : category.scheduleTime,
        status,
      });
    }
  }

  const { count } = await prisma.result.createMany({ data: rows, skipDuplicates: true });
  console.log(`[seed] ${count} results inserted (${rows.length} generated)`);
}

async function main() {
  await seedAdmin();
  const ids = await seedCategories();
  await seedResults(ids);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
