import type { Locale } from "@/lib/i18n/config";

/** Domain types shared by the data layer, services, API routes and UI. */

/** A string that exists in every locale. Stored once on the record, resolved
 *  at the boundary — the data is never duplicated per language. */
export type LocalizedText = Record<Locale, string>;

export type CategoryStatus = "active" | "paused";

/** Markets are grouped by when they publish. `special` covers supplementary
 *  series that sit outside the ordinary day/night schedule. */
export type MarketGroup = "day" | "night" | "special";

export const MARKET_GROUPS: { value: MarketGroup; label: string; blurb: string }[] = [
  { value: "day", label: "Day Markets", blurb: "Publishing between morning and late afternoon." },
  { value: "night", label: "Night Markets", blurb: "Publishing from early evening onwards." },
  {
    value: "special",
    label: "Special Markets",
    blurb: "Supplementary series that sit outside the ordinary day and night schedule.",
  },
];

/** A result is `scheduled` before its slot, `pending` once the slot has passed
 *  but nothing has been published, and `published` once a value exists. */
export type ResultStatus = "published" | "pending" | "scheduled";

export interface Category {
  id: string;
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  /** 24h "HH:MM" — the daily slot at which this category publishes. */
  scheduleTime: string;
  group: MarketGroup;
  status: CategoryStatus;
  updateFrequency: string;
  /** 1-6, maps onto the --color-chart-N design tokens. */
  accent: number;
}

export interface ResultEntry {
  id: string;
  categoryId: string;
  /** Denormalised so every consumer can render a row without a join.
   *  A relational backend would join Category instead. */
  categorySlug: string;
  categoryName: string;
  /** Calendar day of the result, "YYYY-MM-DD". */
  date: string;
  /** Two-character demo value, "00".."99". Null until published. */
  value: string | null;
  status: ResultStatus;
  /** ISO timestamp, null unless published. */
  publishedAt: string | null;
  updatedAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CategorySummary {
  category: Category;
  latest: ResultEntry | null;
  /** Today's entry, whatever its status. */
  today: ResultEntry | null;
  publishedCount: number;
}

export interface StatisticsSummary {
  totalResults: number;
  publishedResults: number;
  publishedToday: number;
  activeCategories: number;
  totalCategories: number;
  lastUpdated: string | null;
  coverageStart: string;
  coverageEnd: string;
}

export interface Statistics {
  summary: StatisticsSummary;
  /** Published results per day, oldest first. */
  resultsOverTime: { date: string; published: number; pending: number }[];
  categoryActivity: {
    slug: string;
    name: string;
    published: number;
    accent: number;
  }[];
  /** Counts bucketed into ten decades of the 00-99 range. */
  distribution: { bucket: string; count: number; share: number }[];
  /** Publications grouped by hour of day. */
  updateFrequency: { hour: string; count: number }[];
  /** Days of the week by publication volume. `short` is the axis label. */
  weekdayActivity: { day: string; short: string; count: number }[];
}
