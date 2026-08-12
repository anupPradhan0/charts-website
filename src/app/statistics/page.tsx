import Link from "next/link";
import type { Metadata } from "next";
import { Container, PageHeader, UpdatedStamp } from "@/components/layout/PageShell";
import { Card, CardHeader, StatTile, buttonClass } from "@/components/ui/primitives";
import { SimpleBarChart, TrendChart } from "@/components/charts/Charts";
import { listCategories } from "@/lib/services/categories";
import { getStatistics } from "@/lib/services/statistics";
import { parsePageQuery, statisticsQuerySchema } from "@/lib/services/query";
import { formatDate, formatDateTime, formatRelative } from "@/lib/utils/format";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  title: "Statistics",
  description:
    "Descriptive statistics over the published archive: publication activity over time, category volumes, value distribution, publication timing and weekday coverage.",
  alternates: { canonical: canonical("/statistics") },
  openGraph: {
    title: "Statistics · Numera",
    description: "Charts and summaries describing the published result archive.",
    url: canonical("/statistics"),
  },
};

export const dynamic = "force-dynamic";

const DAY_OPTIONS = [7, 14, 30, 60];

export default async function StatisticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const query = parsePageQuery(statisticsQuerySchema, raw);
  const stats = getStatistics(query);
  const categories = listCategories();
  const selected = categories.find((c) => c.slug === query.category);

  const publishedInWindow = stats.resultsOverTime.reduce((sum, d) => sum + d.published, 0);
  const busiestDay = stats.weekdayActivity.reduce(
    (best, d) => (d.count > best.count ? d : best),
    stats.weekdayActivity[0],
  );

  return (
    <>
      <PageHeader
        title="Statistics"
        description="Summaries of what has already been published: how much, how often, and when. These are descriptions of past data only."
        breadcrumbs={[{ href: "/", label: "Home" }, { label: "Statistics" }]}
        meta={
          stats.summary.lastUpdated ? (
            <UpdatedStamp
              timestamp={formatDateTime(stats.summary.lastUpdated)}
              relative={formatRelative(stats.summary.lastUpdated)}
            />
          ) : null
        }
      />

      <Container className="py-8">
        {/* Scope controls -------------------------------------------------- */}
        <form
          method="get"
          className="mb-6 flex flex-wrap items-end gap-3 rounded-card border border-line bg-surface p-4"
        >
          <div>
            <label htmlFor="stats-category" className="mb-1 block text-xs font-medium text-muted">
              Category
            </label>
            <select
              id="stats-category"
              name="category"
              defaultValue={query.category ?? ""}
              className="h-10 w-56 max-w-full rounded-lg border border-line bg-surface px-3 text-sm"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="stats-days" className="mb-1 block text-xs font-medium text-muted">
              Time window
            </label>
            <select
              id="stats-days"
              name="days"
              defaultValue={String(query.days)}
              className="h-10 w-40 rounded-lg border border-line bg-surface px-3 text-sm"
            >
              {DAY_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  Last {d} days
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className={buttonClass("primary")}>
            Apply
          </button>
          {query.category || query.days !== 30 ? (
            <Link href="/statistics" className={buttonClass("ghost")}>
              Reset
            </Link>
          ) : null}
        </form>

        <p className="mb-6 text-sm text-muted">
          Showing{" "}
          <span className="font-medium text-fg">
            {selected ? selected.name : "all categories"}
          </span>{" "}
          over the last {query.days} days · archive covers{" "}
          {formatDate(stats.summary.coverageStart)} – {formatDate(stats.summary.coverageEnd)}.
        </p>

        {/* Summary --------------------------------------------------------- */}
        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label="Published entries"
            value={stats.summary.publishedResults.toLocaleString("en-GB")}
            hint="In the selected scope"
          />
          <StatTile
            label={`Published (${query.days}d)`}
            value={publishedInWindow.toLocaleString("en-GB")}
            hint={`${(publishedInWindow / query.days).toFixed(1)} per day on average`}
          />
          <StatTile
            label="Published today"
            value={stats.summary.publishedToday}
            hint={`${stats.summary.activeCategories} categories active`}
          />
          <StatTile
            label="Busiest weekday"
            value={busiestDay?.day ?? "—"}
            hint={`${busiestDay?.count.toLocaleString("en-GB") ?? 0} entries`}
          />
        </div>

        {/* Charts ---------------------------------------------------------- */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="lg:col-span-2">
            <CardHeader
              title="Publication activity over time"
              description={`Entries published per day for the last ${query.days} days. The dashed line shows entries that exist but are not published.`}
              as="h2"
            />
            <div className="p-4">
              <TrendChart
                data={stats.resultsOverTime}
                caption={`Entries published per day over the last ${query.days} days`}
                height={300}
              />
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Category activity"
              description="Published entries per category across the whole archive."
              as="h2"
            />
            <div className="p-4">
              <SimpleBarChart
                data={stats.categoryActivity}
                labelKey="name"
                valueKey="published"
                vertical
                colorByAccent
                height={Math.max(200, stats.categoryActivity.length * 34)}
                caption="Published entries per category"
                columns={["Category", "Published entries"]}
              />
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Historical distribution"
              description="How published values fall across the 00–99 range. A description of past values, not an indicator of future ones."
              as="h2"
            />
            <div className="p-4">
              <SimpleBarChart
                data={stats.distribution}
                labelKey="bucket"
                valueKey="count"
                color="var(--chart-2)"
                caption="Published values grouped into ranges of ten"
                columns={["Range", "Entries"]}
              />
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Update frequency"
              description="When entries are published, grouped by hour of day."
              as="h2"
            />
            <div className="p-4">
              <SimpleBarChart
                data={stats.updateFrequency}
                labelKey="hour"
                valueKey="count"
                color="var(--chart-4)"
                caption="Entries published by hour of day"
                columns={["Hour", "Entries"]}
              />
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Weekday coverage"
              description="Published entries by day of the week."
              as="h2"
            />
            <div className="p-4">
              <SimpleBarChart
                data={stats.weekdayActivity}
                labelKey="day"
                valueKey="count"
                color="var(--chart-5)"
                caption="Published entries by day of the week"
                columns={["Day", "Entries"]}
              />
            </div>
          </Card>
        </div>

        <p className="mt-6 rounded-card border border-line bg-surface-2 p-4 text-sm text-muted">
          These charts summarise data that has already been published. They are not forecasts and
          are not intended to inform any decision about future values.
        </p>
      </Container>
    </>
  );
}
