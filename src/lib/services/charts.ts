import { getAllResults } from "@/lib/data/snapshot";
import { parseISODate, toISODate } from "@/lib/utils/date";
import type { ResultEntry } from "@/types";

/**
 * Chart views over the archive.
 *
 * Both are descriptions of values that have already been published: a calendar
 * laid out by date, and a frequency count of how often each value has appeared.
 * Neither is forward-looking and neither ranks values by desirability.
 */

export interface CalendarCell {
  date: string;
  day: number;
  entry: ResultEntry | null;
  inMonth: boolean;
}

export interface MonthGrid {
  month: string;
  label: string;
  weeks: CalendarCell[][];
  published: number;
  gaps: number;
}

const MONTH_FMT = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });

/** Weekday headers, Monday-first (the archive is read as a working calendar). */
export const WEEKDAY_HEADS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** "YYYY-MM" for the month containing `date`. */
export function monthOf(date: string): string {
  return date.slice(0, 7);
}

/** Months covered by the archive, newest first. */
export async function availableMonths(): Promise<{ value: string; label: string }[]> {
  const months = new Set((await getAllResults()).map((r) => monthOf(r.date)));
  return [...months]
    .sort((a, b) => b.localeCompare(a))
    .map((value) => ({
      value,
      label: MONTH_FMT.format(parseISODate(`${value}-01`)),
    }));
}

/**
 * A month of one market's entries laid out as calendar weeks.
 * Cells outside the month are padding, so every week has seven columns.
 */
export async function getMonthGrid(slug: string, month: string): Promise<MonthGrid> {
  const [year, monthIndex] = month.split("-").map(Number);
  const first = new Date(year, monthIndex - 1, 1);
  const daysInMonth = new Date(year, monthIndex, 0).getDate();

  const entries = new Map(
    (await getAllResults())
      .filter((r) => r.categorySlug === slug && monthOf(r.date) === month)
      .map((r) => [r.date, r]),
  );

  // Monday-first offset: JS gives 0 for Sunday.
  const leading = (first.getDay() + 6) % 7;
  const cells: CalendarCell[] = [];

  for (let i = 0; i < leading; i++) {
    const d = new Date(year, monthIndex - 1, 1 - (leading - i));
    cells.push({ date: toISODate(d), day: d.getDate(), entry: null, inMonth: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const date = toISODate(new Date(year, monthIndex - 1, day));
    cells.push({ date, day, entry: entries.get(date) ?? null, inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const d = new Date(year, monthIndex - 1, daysInMonth + (cells.length % 7));
    cells.push({ date: toISODate(d), day: d.getDate(), entry: null, inMonth: false });
  }

  const weeks: CalendarCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const inMonth = cells.filter((c) => c.inMonth);
  const published = inMonth.filter((c) => c.entry?.status === "published").length;
  // A day that has not happened yet is not a gap — only count elapsed days,
  // otherwise the current month always looks mostly missing.
  const today = toISODate(new Date());

  return {
    month,
    label: MONTH_FMT.format(first),
    weeks,
    published,
    gaps: inMonth.filter((c) => c.date <= today && !c.entry).length,
  };
}

export interface FrequencyMatrix {
  /** rows[tens][units] — how often that two-digit value has been published. */
  rows: { tens: number; cells: { value: string; count: number; share: number }[] }[];
  total: number;
  max: number;
  /** Values that have never appeared in the archive. */
  unseen: number;
}

/**
 * How often each of the hundred possible values has been published, arranged
 * as a tens-by-units grid. This is a histogram with 100 bins drawn as a square
 * — a finer-grained view of the same distribution shown on the statistics
 * page, and a description of past frequency only.
 */
export async function getFrequencyMatrix(slug?: string): Promise<FrequencyMatrix> {
  const counts = new Array(100).fill(0);
  let total = 0;

  for (const row of await getAllResults()) {
    if (row.value === null) continue;
    if (slug && row.categorySlug !== slug) continue;
    counts[Number(row.value)] += 1;
    total += 1;
  }

  const max = Math.max(...counts);
  const rows = Array.from({ length: 10 }, (_, tens) => ({
    tens,
    cells: Array.from({ length: 10 }, (_, units) => {
      const count = counts[tens * 10 + units];
      return {
        value: String(tens * 10 + units).padStart(2, "0"),
        count,
        share: total ? Math.round((count / total) * 1000) / 10 : 0,
      };
    }),
  }));

  return { rows, total, max, unseen: counts.filter((c) => c === 0).length };
}
