import { cache } from "react";
import { prisma } from "@/lib/db";
import { daysBetween, fromDateColumn, timestampOf, toISODate } from "@/lib/utils/date";
import type { Category, LocalizedText, MarketGroup, ResultEntry } from "@/types";

/**
 * The read model.
 *
 * PostgreSQL is the source of truth. This module is the one place that reads it
 * for the public site: it loads every category and result once, maps the rows
 * onto the domain types the services and UI already speak, and hands the whole
 * set back. Filtering, sorting, statistics and search then run over that array
 * exactly as they did before the database existed.
 *
 * ponytail: the archive is a few thousand rows, so one full-table read per
 * request is cheaper and far smaller than pushing every filter, the
 * localized-name search and the distribution maths into SQL. `cache()` dedupes
 * it within a request — a page that asks four services for data still issues
 * one pair of queries. Push filters down into Prisma (as `src/lib/admin/*`
 * already does) once the archive stops fitting comfortably in memory.
 *
 * Deliberately not cached *between* requests: a module-level cache is per
 * bundle graph, so a write through a route handler would not invalidate the
 * copy a page render holds, and the admin panel and the public site would
 * disagree about what exists.
 */

export interface Snapshot {
  categories: Category[];
  bySlug: Map<string, Category>;
  byId: Map<string, Category>;
  /** Newest first: by day, then by the category's slot within the day. */
  results: ResultEntry[];
  /** Newest publication timestamp across the archive, or null. */
  lastUpdated: string | null;
  range: { start: string; end: string };
  /** Derived lookups the services would otherwise rebuild on every request. */
  lookups: {
    /** Every locale's name, lowercased, so a Hindi or Odia term matches. */
    namesBySlug: Map<string, string[]>;
    groupBySlug: Map<string, MarketGroup>;
    slotById: Map<string, string>;
  };
}

function localizedText(value: unknown): LocalizedText {
  const text = (value ?? {}) as Partial<LocalizedText>;
  const en = text.en ?? "";
  return { en, hi: text.hi ?? en, or: text.or ?? en };
}

async function build(): Promise<Snapshot> {
  const [categoryRows, resultRows] = await Promise.all([
    prisma.category.findMany({ orderBy: [{ displayOrder: "asc" }, { scheduleTime: "asc" }] }),
    prisma.result.findMany({
      orderBy: [{ publishedDate: "desc" }, { publishedTime: "desc" }],
      include: { category: { select: { slug: true, name: true } } },
    }),
  ]);

  const categories: Category[] = categoryRows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: localizedText(row.name),
    description: localizedText(row.description),
    scheduleTime: row.scheduleTime,
    group: row.group as MarketGroup,
    status: row.isActive ? "active" : "paused",
    updateFrequency: row.updateFrequency,
    accent: row.accent,
  }));

  const results: ResultEntry[] = resultRows.map((row) => {
    const date = fromDateColumn(row.publishedDate);
    const publishedAt =
      row.status === "published" ? timestampOf(date, row.publishedTime) : null;
    return {
      id: row.id,
      categoryId: row.categoryId,
      categorySlug: row.category.slug,
      // Canonical English name: the API contract and the search index use it.
      categoryName: localizedText(row.category.name).en,
      date,
      value: row.value,
      status: row.status,
      publishedAt,
      updatedAt: row.updatedAt.toISOString(),
    };
  });

  const lastUpdated = results.reduce<string | null>(
    (latest, r) => (r.publishedAt && (!latest || r.publishedAt > latest) ? r.publishedAt : latest),
    null,
  );
  const today = toISODate(new Date());

  return {
    categories,
    bySlug: new Map(categories.map((c) => [c.slug, c])),
    byId: new Map(categories.map((c) => [c.id, c])),
    results,
    lastUpdated,
    range: {
      start: results.length ? results[results.length - 1].date : today,
      end: results.length ? results[0].date : today,
    },
    lookups: {
      namesBySlug: new Map(
        categories.map((c) => [c.slug, Object.values(c.name).map((n) => n.toLowerCase())]),
      ),
      groupBySlug: new Map(categories.map((c) => [c.slug, c.group])),
      slotById: new Map(categories.map((c) => [c.id, c.scheduleTime])),
    },
  };
}

/** Memoized for the lifetime of one request, never beyond it. */
export const getSnapshot = cache(build);

export async function getAllResults(): Promise<ResultEntry[]> {
  return (await getSnapshot()).results;
}

export async function getArchiveRange(): Promise<{ start: string; end: string }> {
  return (await getSnapshot()).range;
}

export async function getDatasetTimestamp(): Promise<string | null> {
  return (await getSnapshot()).lastUpdated;
}

/** Calendar days the archive covers — the "{days} days" the about page and the
 *  FAQs quote, read off the data rather than hardcoded beside it. */
export async function getCoverageDays(): Promise<number> {
  const { range } = await getSnapshot();
  return daysBetween(range.start, range.end);
}
