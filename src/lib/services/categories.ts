import { getSnapshot } from "@/lib/data/snapshot";
import { toISODate } from "@/lib/utils/date";
import { localized } from "@/lib/i18n/localize";
import type { Locale } from "@/lib/i18n/config";
import type { Category, CategorySummary, MarketGroup, ResultEntry } from "@/types";

/** Category queries. The only entry point to category data for the public site. */

export async function listCategories(
  opts: { search?: string; status?: Category["status"]; group?: MarketGroup } = {},
): Promise<Category[]> {
  const needle = opts.search?.trim().toLowerCase();
  const { categories } = await getSnapshot();
  return categories.filter((c) => {
    if (opts.status && c.status !== opts.status) return false;
    if (opts.group && c.group !== opts.group) return false;
    // Match on the name in any language, so a Hindi or Odia search term finds
    // the market a Hindi or Odia reader is looking at.
    if (
      needle &&
      !Object.values(c.name).some((n) => n.toLowerCase().includes(needle)) &&
      !c.slug.includes(needle)
    )
      return false;
    return true;
  });
}

export async function getCategory(slug: string): Promise<Category | null> {
  return (await getSnapshot()).bySlug.get(slug) ?? null;
}

/** Result rows carry the canonical English name for search and the API; the UI
 *  resolves the display name from the slug instead.
 *
 *  A lookup, not a single name: a table resolves a name per row, and awaiting
 *  the category set once per table beats awaiting it once per cell. */
export async function categoryNamer(locale: Locale): Promise<(slug: string) => string> {
  const { bySlug } = await getSnapshot();
  return (slug) => {
    const category = bySlug.get(slug);
    return category ? localized(category.name, locale) : slug;
  };
}

/** Categories decorated with their latest value, today's entry and volume —
 *  computed in one pass so the homepage board is a single traversal. */
export async function getCategorySummaries(): Promise<CategorySummary[]> {
  const { categories, results } = await getSnapshot();
  const today = toISODate(new Date());
  const latest = new Map<string, ResultEntry>();
  const todays = new Map<string, ResultEntry>();
  const counts = new Map<string, number>();

  for (const row of results) {
    if (row.date === today) todays.set(row.categoryId, row);
    if (row.status !== "published") continue;
    counts.set(row.categoryId, (counts.get(row.categoryId) ?? 0) + 1);
    const current = latest.get(row.categoryId);
    if (!current || row.date > current.date) latest.set(row.categoryId, row);
  }

  return categories.map((category) => ({
    category,
    latest: latest.get(category.id) ?? null,
    today: todays.get(category.id) ?? null,
    publishedCount: counts.get(category.id) ?? 0,
  }));
}

export async function getCategorySummary(slug: string): Promise<CategorySummary | null> {
  return (await getCategorySummaries()).find((s) => s.category.slug === slug) ?? null;
}

/** Summaries bucketed by market group, in group order. */
export async function getSummariesByGroup(): Promise<
  { group: MarketGroup; summaries: CategorySummary[] }[]
> {
  const all = await getCategorySummaries();
  return (["day", "night", "special"] as const).map((group) => ({
    group,
    summaries: all.filter((s) => s.category.group === group),
  }));
}
