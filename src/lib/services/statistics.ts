import { getSnapshot } from "@/lib/data/snapshot";
import { toISODate } from "@/lib/utils/date";
import type { ResultEntry, Statistics } from "@/types";
import type { StatisticsQuery } from "./query";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { localized } from "@/lib/i18n/localize";

/**
 * Descriptive statistics over the demo archive.
 *
 * These are summaries of data that has already been published — counts,
 * shares and timings. Nothing here is forward-looking and nothing here is
 * presented as an indicator of future values.
 */

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
/** Axis labels: full weekday names overlap on a phone-width chart. */
const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function lastNDates(days: number): string[] {
  const out: string[] = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(cursor);
    d.setDate(d.getDate() - i);
    out.push(toISODate(d));
  }
  return out;
}

export async function getStatistics(
  q: StatisticsQuery,
  locale: Locale = DEFAULT_LOCALE,
): Promise<Statistics> {
  const snapshot = await getSnapshot();
  const all = snapshot.results;
  const categories = snapshot.categories;
  const rows = q.category ? all.filter((r) => r.categorySlug === q.category) : all;
  const today = toISODate(new Date());
  const window = new Set(lastNDates(q.days));
  const inWindow = rows.filter((r) => window.has(r.date));

  // Results over time -------------------------------------------------------
  const byDate = new Map<string, { published: number; pending: number }>();
  for (const date of lastNDates(q.days)) byDate.set(date, { published: 0, pending: 0 });
  for (const row of inWindow) {
    const bucket = byDate.get(row.date);
    if (!bucket) continue;
    if (row.status === "published") bucket.published += 1;
    else bucket.pending += 1;
  }
  const resultsOverTime = [...byDate.entries()].map(([date, counts]) => ({ date, ...counts }));

  // Category activity -------------------------------------------------------
  const activityCounts = new Map<string, number>();
  for (const row of rows) {
    if (row.status !== "published") continue;
    activityCounts.set(row.categorySlug, (activityCounts.get(row.categorySlug) ?? 0) + 1);
  }
  const categoryActivity = categories.filter((c) => !q.category || c.slug === q.category)
    .map((c) => ({
      slug: c.slug,
      name: localized(c.name, locale),
      published: activityCounts.get(c.slug) ?? 0,
      accent: c.accent,
    }))
    .sort((a, b) => b.published - a.published);

  // Distribution across the 00-99 range ------------------------------------
  const published = rows.filter((r): r is ResultEntry & { value: string } => r.value !== null);
  const buckets = Array.from({ length: 10 }, (_, i) => ({
    bucket: `${i}0–${i}9`,
    count: 0,
    share: 0,
  }));
  for (const row of published) {
    const index = Math.min(9, Math.floor(Number(row.value) / 10));
    buckets[index].count += 1;
  }
  for (const bucket of buckets) {
    bucket.share = published.length ? Math.round((bucket.count / published.length) * 1000) / 10 : 0;
  }

  // Publication timing ------------------------------------------------------
  const hourCounts = new Map<number, number>();
  for (const row of published) {
    if (!row.publishedAt) continue;
    const hour = new Date(row.publishedAt).getHours();
    hourCounts.set(hour, (hourCounts.get(hour) ?? 0) + 1);
  }
  const activeHours = [...hourCounts.keys()].sort((a, b) => a - b);
  const from = activeHours.length ? activeHours[0] : 0;
  const to = activeHours.length ? activeHours[activeHours.length - 1] : 23;
  const updateFrequency = [];
  for (let hour = from; hour <= to; hour++) {
    updateFrequency.push({
      hour: `${String(hour).padStart(2, "0")}:00`,
      count: hourCounts.get(hour) ?? 0,
    });
  }

  // Weekday volume ----------------------------------------------------------
  const weekdayCounts = new Array(7).fill(0);
  for (const row of published) {
    const [y, m, d] = row.date.split("-").map(Number);
    weekdayCounts[new Date(y, m - 1, d).getDay()] += 1;
  }
  const weekdayActivity = WEEKDAYS.map((day, i) => ({
    day,
    short: WEEKDAYS_SHORT[i],
    count: weekdayCounts[i],
  }));

  const range = snapshot.range;

  return {
    summary: {
      totalResults: rows.length,
      publishedResults: published.length,
      publishedToday: rows.filter((r) => r.date === today && r.status === "published").length,
      activeCategories: categories.filter((c) => c.status === "active").length,
      totalCategories: categories.length,
      lastUpdated: snapshot.lastUpdated,
      coverageStart: range.start,
      coverageEnd: range.end,
    },
    resultsOverTime,
    categoryActivity,
    distribution: buckets,
    updateFrequency,
    weekdayActivity,
  };
}
