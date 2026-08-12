import { getAllResults, getDatasetTimestamp } from "@/lib/data/results";
import { CATEGORIES, CATEGORY_BY_SLUG } from "@/lib/data/categories";
import type { Paginated, ResultEntry } from "@/types";
import type { ResultQuery } from "./query";

/**
 * Result queries. Everything the UI and the API can ask about results goes
 * through here — no component or route reads the dataset directly.
 */

function matchesSearch(row: ResultEntry, term: string): boolean {
  const needle = term.toLowerCase();
  return (
    row.categoryName.toLowerCase().includes(needle) ||
    row.categorySlug.includes(needle) ||
    row.date.includes(needle) ||
    (row.value ?? "").includes(needle)
  );
}

const GROUP_BY_SLUG = new Map(CATEGORIES.map((c) => [c.slug, c.group]));

function applyFilters(rows: ResultEntry[], q: Partial<ResultQuery>): ResultEntry[] {
  return rows.filter((row) => {
    if (q.category && row.categorySlug !== q.category) return false;
    if (q.group && GROUP_BY_SLUG.get(row.categorySlug) !== q.group) return false;
    if (q.status && row.status !== q.status) return false;
    if (q.date && row.date !== q.date) return false;
    if (q.startDate && row.date < q.startDate) return false;
    if (q.endDate && row.date > q.endDate) return false;
    if (q.search && !matchesSearch(row, q.search)) return false;
    return true;
  });
}

const SLOT_BY_ID = new Map(CATEGORIES.map((c) => [c.id, c.scheduleTime]));

function applySort(rows: ResultEntry[], sort: ResultQuery["sort"]): ResultEntry[] {
  const sorted = [...rows];
  const bySlot = (a: ResultEntry, b: ResultEntry) =>
    (SLOT_BY_ID.get(a.categoryId) ?? "").localeCompare(SLOT_BY_ID.get(b.categoryId) ?? "");
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

export function listResults(q: ResultQuery): Paginated<ResultEntry> {
  const filtered = applySort(applyFilters(getAllResults(), q), q.sort);
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

export function getResultById(id: string): ResultEntry | null {
  return getAllResults().find((r) => r.id === id) ?? null;
}

/** Most recently published entries across all categories. */
export function getRecentlyPublished(limit = 8): ResultEntry[] {
  return getAllResults()
    .filter((r) => r.publishedAt)
    .sort((a, b) => b.publishedAt!.localeCompare(a.publishedAt!))
    .slice(0, limit);
}

export function getResultsForCategory(slug: string, limit: number): ResultEntry[] {
  return getAllResults()
    .filter((r) => r.categorySlug === slug)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

export interface SearchHit {
  type: "category" | "result";
  title: string;
  subtitle: string;
  href: string;
  value?: string | null;
}

/** Global search across category names and result rows. */
export function search(term: string, limit = 8): SearchHit[] {
  const needle = term.trim().toLowerCase();
  if (!needle) return [];

  const categories = CATEGORIES.filter(
    (c) => c.name.toLowerCase().includes(needle) || c.slug.includes(needle),
  ).map<SearchHit>((c) => ({
    type: "category",
    title: c.name,
    subtitle: `Category · publishes ${c.scheduleTime}`,
    href: `/categories/${c.slug}`,
  }));

  const results = getAllResults()
    .filter((r) => matchesSearch(r, needle))
    .slice(0, limit)
    .map<SearchHit>((r) => ({
      type: "result",
      title: `${r.categoryName} — ${r.date}`,
      subtitle: r.status === "published" ? "Published result" : `Status: ${r.status}`,
      href: `/history?category=${r.categorySlug}&date=${r.date}`,
      value: r.value,
    }));

  return [...categories, ...results].slice(0, limit + categories.length);
}

export function getLastUpdated(): string | null {
  return getDatasetTimestamp();
}

export function categoryExists(slug: string): boolean {
  return CATEGORY_BY_SLUG.has(slug);
}
