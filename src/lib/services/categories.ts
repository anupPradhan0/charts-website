import { CATEGORIES, CATEGORY_BY_SLUG } from "@/lib/data/categories";
import { getAllResults, toISODate } from "@/lib/data/results";
import type { Category, CategorySummary, ResultEntry } from "@/types";

/** Category queries. The only entry point to category data. */

export function listCategories(opts: { search?: string; status?: Category["status"] } = {}): Category[] {
  const needle = opts.search?.trim().toLowerCase();
  return CATEGORIES.filter((c) => {
    if (opts.status && c.status !== opts.status) return false;
    if (needle && !c.name.toLowerCase().includes(needle) && !c.slug.includes(needle))
      return false;
    return true;
  });
}

export function getCategory(slug: string): Category | null {
  return CATEGORY_BY_SLUG.get(slug) ?? null;
}

/** Categories decorated with their latest value, today's entry and volume —
 *  computed in one pass so the homepage board is a single traversal. */
export function getCategorySummaries(): CategorySummary[] {
  const today = toISODate(new Date());
  const latest = new Map<string, ResultEntry>();
  const todays = new Map<string, ResultEntry>();
  const counts = new Map<string, number>();

  for (const row of getAllResults()) {
    if (row.date === today) todays.set(row.categoryId, row);
    if (row.status !== "published") continue;
    counts.set(row.categoryId, (counts.get(row.categoryId) ?? 0) + 1);
    const current = latest.get(row.categoryId);
    if (!current || row.date > current.date) latest.set(row.categoryId, row);
  }

  return CATEGORIES.map((category) => ({
    category,
    latest: latest.get(category.id) ?? null,
    today: todays.get(category.id) ?? null,
    publishedCount: counts.get(category.id) ?? 0,
  }));
}

export function getCategorySummary(slug: string): CategorySummary | null {
  return getCategorySummaries().find((s) => s.category.slug === slug) ?? null;
}
