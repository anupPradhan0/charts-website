import { getSnapshot, type Snapshot } from "@/lib/data/snapshot";
import type { Paginated, ResultEntry } from "@/types";
import type { ResultQuery } from "./query";

/**
 * Result queries. Everything the UI and the public API can ask about results
 * goes through here — no component or route reads the database directly.
 */

function matchesSearch(row: ResultEntry, term: string, lookups: Snapshot["lookups"]): boolean {
  const needle = term.toLowerCase();
  return (
    row.categoryName.toLowerCase().includes(needle) ||
    (lookups.namesBySlug.get(row.categorySlug) ?? []).some((n) => n.includes(needle)) ||
    row.categorySlug.includes(needle) ||
    row.date.includes(needle) ||
    (row.value ?? "").includes(needle)
  );
}

function applyFilters(
  rows: ResultEntry[],
  q: Partial<ResultQuery>,
  lookups: Snapshot["lookups"],
): ResultEntry[] {
  return rows.filter((row) => {
    if (q.category && row.categorySlug !== q.category) return false;
    if (q.group && lookups.groupBySlug.get(row.categorySlug) !== q.group) return false;
    if (q.status && row.status !== q.status) return false;
    if (q.date && row.date !== q.date) return false;
    if (q.startDate && row.date < q.startDate) return false;
    if (q.endDate && row.date > q.endDate) return false;
    if (q.search && !matchesSearch(row, q.search, lookups)) return false;
    return true;
  });
}

function applySort(
  rows: ResultEntry[],
  sort: ResultQuery["sort"],
  lookups: Snapshot["lookups"],
): ResultEntry[] {
  const sorted = [...rows];
  const bySlot = (a: ResultEntry, b: ResultEntry) =>
    (lookups.slotById.get(a.categoryId) ?? "").localeCompare(
      lookups.slotById.get(b.categoryId) ?? "",
    );
  // Unpublished entries have no value; they always sort last on value sorts.
  const numeric = (r: ResultEntry) => (r.value === null ? null : Number(r.value));

  switch (sort) {
    case "date_asc":
      return sorted.sort((a, b) => a.date.localeCompare(b.date) || bySlot(a, b));
    case "value_asc":
    case "value_desc": {
      const dir = sort === "value_asc" ? 1 : -1;
      return sorted.sort((a, b) => {
        const va = numeric(a);
        const vb = numeric(b);
        if (va === null && vb === null) return b.date.localeCompare(a.date);
        if (va === null) return 1;
        if (vb === null) return -1;
        return (va - vb) * dir || b.date.localeCompare(a.date);
      });
    }
    case "category_asc":
      return sorted.sort(
        (a, b) => a.categoryName.localeCompare(b.categoryName) || b.date.localeCompare(a.date),
      );
    case "date_desc":
    default:
      return sorted.sort((a, b) => b.date.localeCompare(a.date) || -bySlot(a, b));
  }
}

export async function listResults(q: ResultQuery): Promise<Paginated<ResultEntry>> {
  const snapshot = await getSnapshot();
  const filtered = applySort(
    applyFilters(snapshot.results, q, snapshot.lookups),
    q.sort,
    snapshot.lookups,
  );
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / q.limit));
  // A page number beyond the end returns the last page rather than nothing.
  const page = Math.min(q.page, totalPages);
  const start = (page - 1) * q.limit;
  return {
    items: filtered.slice(start, start + q.limit),
    total,
    page,
    limit: q.limit,
    totalPages,
  };
}

export async function getResultById(id: string): Promise<ResultEntry | null> {
  const { results } = await getSnapshot();
  return results.find((r) => r.id === id) ?? null;
}

/** Most recently published entries across all categories. */
export async function getRecentlyPublished(limit = 8): Promise<ResultEntry[]> {
  const { results } = await getSnapshot();
  return results
    .filter((r) => r.publishedAt)
    .sort((a, b) => b.publishedAt!.localeCompare(a.publishedAt!))
    .slice(0, limit);
}

export async function getResultsForCategory(slug: string, limit: number): Promise<ResultEntry[]> {
  const { results } = await getSnapshot();
  return results
    .filter((r) => r.categorySlug === slug)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

export interface SearchHit {
  type: "category" | "result";
  /** Present for both kinds — the UI resolves the display name per locale. */
  slug: string;
  href: string;
  date?: string;
  value?: string | null;
  /** Only for `type: "category"` — the UI builds the subtitle from this via
   *  `t("searchPage.hitCategory", { slot })` rather than parsing prose. */
  scheduleTime?: string;
  /** Only for `type: "result"` — same reasoning, via `t("searchPage.hitStatus")`. */
  status?: ResultEntry["status"];
}

/** Global search across category names and result rows. Titles and subtitles
 *  are resolved by the UI from these structured fields, never shipped as
 *  pre-formatted English prose — that would defeat localisation. */
export async function search(term: string, limit = 8): Promise<SearchHit[]> {
  const needle = term.trim().toLowerCase();
  if (!needle) return [];
  const snapshot = await getSnapshot();

  const categories = snapshot.categories
    .filter(
      (c) =>
        Object.values(c.name).some((n) => n.toLowerCase().includes(needle)) ||
        c.slug.includes(needle),
    )
    .map<SearchHit>((c) => ({
      type: "category",
      slug: c.slug,
      href: `/categories/${c.slug}`,
      scheduleTime: c.scheduleTime,
    }));

  const results = snapshot.results
    .filter((r) => matchesSearch(r, needle, snapshot.lookups))
    .slice(0, limit)
    .map<SearchHit>((r) => ({
      type: "result",
      slug: r.categorySlug,
      date: r.date,
      href: `/history?category=${r.categorySlug}&date=${r.date}`,
      value: r.value,
      status: r.status,
    }));

  return [...categories, ...results].slice(0, limit + categories.length);
}

export async function getLastUpdated(): Promise<string | null> {
  return (await getSnapshot()).lastUpdated;
}

export async function categoryExists(slug: string): Promise<boolean> {
  return (await getSnapshot()).bySlug.has(slug);
}
