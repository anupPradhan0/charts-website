/** Domain types shared by the data layer, services, API routes and UI. */

export type CategoryStatus = "active" | "paused";

/** A result is `scheduled` before its slot, `pending` once the slot has passed
 *  but nothing has been published, and `published` once a value exists. */
export type ResultStatus = "published" | "pending" | "scheduled";

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  /** 24h "HH:MM" — the daily slot at which this category publishes. */
  scheduleTime: string;
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
  /** Days of the week by publication volume. */
  weekdayActivity: { day: string; count: number }[];
}
