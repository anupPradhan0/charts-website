import type { ResultEntry } from "@/types";
import { CATEGORIES } from "./categories";

/**
 * Demo dataset.
 *
 * Every value is generated from a seeded PRNG keyed by (category, date), so the
 * archive is identical on every process and on every render — but statuses for
 * *today* still advance as the clock passes each category's scheduled slot,
 * which is what makes the board feel live.
 *
 * This module is the only place that invents data. Swapping it for a real
 * database means reimplementing `getAllResults()` against SQL; nothing above
 * it (services, API routes, UI) knows where rows come from.
 */

/** Days of history to generate, including today. */
export const ARCHIVE_DAYS = 60;

/** Express Results was "paused" this many days ago; no entries after that. */
const PAUSED_SINCE_DAYS_AGO = 11;

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

/** Local-time "YYYY-MM-DD" (never UTC — the board is read in local time). */
export function toISODate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function atTime(dayISO: string, hhmm: string): Date {
  const d = parseISODate(dayISO);
  const [h, m] = hhmm.split(":").map(Number);
  d.setHours(h, m, 0, 0);
  return d;
}

function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

function buildResults(now: Date): ResultEntry[] {
  const rows: ResultEntry[] = [];
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const pausedFrom = toISODate(addDays(today, -PAUSED_SINCE_DAYS_AGO));

  for (let offset = ARCHIVE_DAYS - 1; offset >= 0; offset--) {
    const day = addDays(today, -offset);
    const dayISO = toISODate(day);
    const weekday = day.getDay();

    for (const category of CATEGORIES) {
      // Paused categories stop producing entries at their pause date.
      if (category.status === "paused" && dayISO > pausedFrom) continue;
      // Weekday-only series have no weekend entries.
      if (category.updateFrequency === "Weekdays" && (weekday === 0 || weekday === 6))
        continue;

      const rand = rng(hashSeed(`${category.id}:${dayISO}`));
      // A small share of days simply have no entry — realistic gaps.
      if (rand() < 0.03) continue;

      const value = String(Math.floor(rand() * 100)).padStart(2, "0");
      const slot = atTime(dayISO, category.scheduleTime);
      const delayMinutes = 1 + Math.floor(rand() * 24);
      const missed = rand() < 0.05;

      let status: ResultEntry["status"];
      let publishedAt: string | null = null;
      let entryValue: string | null = null;

      if (slot > now) {
        status = "scheduled";
      } else if (missed && offset === 0) {
        // Only today's board can sit in "pending" — the archive is settled.
        status = "pending";
      } else {
        const published = new Date(slot.getTime() + delayMinutes * 60_000);
        if (published > now) {
          status = "pending";
        } else {
          status = "published";
          publishedAt = published.toISOString();
          entryValue = value;
        }
      }

      rows.push({
        id: `${category.slug}_${dayISO}`,
        categoryId: category.id,
        categorySlug: category.slug,
        categoryName: category.name,
        date: dayISO,
        value: entryValue,
        status,
        publishedAt,
        updatedAt: publishedAt ?? slot.toISOString(),
      });
    }
  }

  // Newest first: by day, then by the category's slot within the day.
  const slotOf = new Map(CATEGORIES.map((c) => [c.id, c.scheduleTime]));
  rows.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    const sa = slotOf.get(a.categoryId) ?? "";
    const sb = slotOf.get(b.categoryId) ?? "";
    return sa < sb ? 1 : sa > sb ? -1 : 0;
  });
  return rows;
}

// ponytail: rebuilt at most once a minute (and whenever the day rolls over)
// instead of per request. Swap for a real query when a database lands.
const CACHE_TTL_MS = 60_000;
let cache: { day: string; builtAt: number; rows: ResultEntry[] } | null = null;

export function getAllResults(): ResultEntry[] {
  const now = new Date();
  const day = toISODate(now);
  if (!cache || cache.day !== day || Date.now() - cache.builtAt > CACHE_TTL_MS) {
    cache = { day, builtAt: Date.now(), rows: buildResults(now) };
  }
  return cache.rows;
}

/** Newest `publishedAt` across the whole dataset — drives "last updated". */
export function getDatasetTimestamp(): string | null {
  return getAllResults().reduce<string | null>(
    (latest, r) => (r.publishedAt && (!latest || r.publishedAt > latest) ? r.publishedAt : latest),
    null,
  );
}

export function getArchiveRange(): { start: string; end: string } {
  const rows = getAllResults();
  return {
    start: rows.length ? rows[rows.length - 1].date : toISODate(new Date()),
    end: rows.length ? rows[0].date : toISODate(new Date()),
  };
}
