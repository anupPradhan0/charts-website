import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarClock, CalendarRange, Repeat } from "lucide-react";
import { Container, PageHeader, UpdatedStamp } from "@/components/layout/PageShell";
import {
  Badge,
  Card,
  CardHeader,
  ResultValue,
  StatTile,
  StatusBadge,
  buttonClass,
} from "@/components/ui/primitives";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { ResultsTable } from "@/components/tables/ResultsTable";
import { Pagination } from "@/components/ui/Pagination";
import { SimpleBarChart, TrendChart } from "@/components/charts/Charts";
import { CATEGORIES } from "@/lib/data/categories";
import { getCategory, getCategorySummary } from "@/lib/services/categories";
import { listResults } from "@/lib/services/results";
import { getStatistics } from "@/lib/services/statistics";
import { parsePageQuery, resultQuerySchema } from "@/lib/services/query";
import { getArchiveRange } from "@/lib/data/results";
import {
  formatDate,
  formatDateTime,
  formatRelative,
  formatSchedule,
  pluralize,
} from "@/lib/utils/format";
import { canonical } from "@/lib/site";

/**
 * The category set is a fixed, known list, so the router is told exactly which
 * slugs exist. `dynamicParams = false` makes an unknown slug a real 404 from
 * the routing layer — `notFound()` during render can only produce a soft 404
 * here, because the page streams its response and the status is already sent.
 *
 * No `force-dynamic` is needed: reading `searchParams` opts the page into
 * per-request rendering on its own.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return { title: "Category not found" };

  const description = `${category.name} publishes at ${formatSchedule(category.scheduleTime)} (${category.updateFrequency}). Current value, full archive and statistics.`;
  return {
    title: category.name,
    description,
    alternates: { canonical: canonical(`/categories/${slug}`) },
    openGraph: {
      title: `${category.name} · Numera`,
      description,
      url: canonical(`/categories/${slug}`),
      type: "article",
    },
  };
}

export default async function CategoryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const summary = getCategorySummary(slug);
  if (!summary) notFound();

  const { category, latest, today, publishedCount } = summary;
  const raw = await searchParams;
  // The category is fixed by the route; a `category` query param cannot escape it.
  const query = { ...parsePageQuery(resultQuerySchema, raw), category: slug };
  const page = listResults(query);
  const stats = getStatistics({ category: slug, days: 30 });
  const range = getArchiveRange();
  const basePath = `/categories/${slug}`;

  const current = today ?? latest;

  return (
    <>
      <PageHeader
        title={category.name}
        description={category.description}
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: "/categories", label: "Categories" },
          { label: category.name },
        ]}
        meta={
          <>
            <Badge tone={category.status === "active" ? "ok" : "neutral"}>
              {category.status === "active" ? "Active" : "Paused"}
            </Badge>
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <CalendarClock className="size-3.5" aria-hidden="true" />
              Slot {formatSchedule(category.scheduleTime)}
            </p>
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <Repeat className="size-3.5" aria-hidden="true" />
              {category.updateFrequency}
            </p>
            {latest?.publishedAt ? (
              <UpdatedStamp
                timestamp={formatDateTime(latest.publishedAt)}
                relative={formatRelative(latest.publishedAt)}
              />
            ) : null}
          </>
        }
        actions={
          <Link
            href={`/history?category=${slug}`}
            className={buttonClass("secondary")}
          >
            <CalendarRange className="size-4" aria-hidden="true" />
            In full archive
          </Link>
        }
      />

      <Container className="py-6 sm:py-8">
        {/* Current value + key numbers ------------------------------------ */}
        <div className="mb-6 grid gap-3 sm:gap-4 sm:mb-8 lg:grid-cols-3">
          <Card className="flex flex-col items-center justify-center p-4 text-center sm:p-6">
            <p className="text-xs font-medium text-muted">
              {today ? "Today's result" : "Most recent result"}
            </p>
            <div className="my-3">
              <ResultValue value={current?.value ?? null} size="lg" />
            </div>
            {current ? (
              <>
                <StatusBadge status={current.status} />
                <p className="mt-2 text-sm text-muted tabular">{formatDate(current.date)}</p>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted">No entries yet</p>
            )}
          </Card>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:col-span-2">
            <StatTile
              label="Archived entries"
              value={publishedCount.toLocaleString("en-GB")}
              hint={`${formatDate(range.start)} – ${formatDate(range.end)}`}
            />
            <StatTile
              label="Published (30 days)"
              value={stats.resultsOverTime.reduce((sum, d) => sum + d.published, 0)}
              hint={`out of ${stats.resultsOverTime.length} days`}
            />
            <StatTile
              label="Scheduled slot"
              value={formatSchedule(category.scheduleTime)}
              hint={category.updateFrequency}
            />
            <StatTile
              label="Most common range"
              value={
                stats.distribution.reduce(
                  (best, d) => (d.count > best.count ? d : best),
                  stats.distribution[0],
                ).bucket
              }
              hint="Across all archived values"
            />
          </div>
        </div>

        {/* Charts ---------------------------------------------------------- */}
        <div className="mb-6 grid gap-3 sm:gap-4 sm:mb-8 lg:grid-cols-2">
          <Card>
            <CardHeader
              title="Publication activity"
              description="Entries published per day over the last 30 days."
              as="h3"
            />
            <div className="p-2 sm:p-4">
              <TrendChart
                data={stats.resultsOverTime}
                caption={`${category.name}: entries published per day over the last 30 days`}
              />
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Historical distribution"
              description="How archived values fall across the 00–99 range."
              as="h3"
            />
            <div className="p-2 sm:p-4">
              <SimpleBarChart
                data={stats.distribution}
                labelKey="bucket"
                valueKey="count"
                color="var(--chart-2)"
                caption={`${category.name}: archived values grouped into ranges of ten`}
                columns={["Range", "Entries"]}
              />
            </div>
          </Card>
        </div>

        {/* Archive --------------------------------------------------------- */}
        <section aria-labelledby="category-archive">
          <Card>
            <CardHeader
              title={<span id="category-archive">{category.name} archive</span>}
              description={`${pluralize(page.total, "entry", "entries")} matching the current filters.`}
            />
            <FilterPanel
              basePath={basePath}
              lockCategory
              categories={[]}
              min={range.start}
              max={range.end}
              defaults={{
                search: query.search ?? "",
                category: slug,
                status: query.status ?? "",
                startDate: query.startDate ?? "",
                endDate: query.endDate ?? "",
                sort: query.sort,
              }}
            />
            <ResultsTable
              rows={page.items}
              basePath={basePath}
              query={{ ...query, category: undefined }}
              sort={query.sort}
              showCategory={false}
              caption={`${category.name} historical results`}
              emptyAction={
                <Link href={basePath} className={buttonClass("secondary")}>
                  Clear filters
                </Link>
              }
            />
            <Pagination
              page={page.page}
              totalPages={page.totalPages}
              total={page.total}
              limit={page.limit}
              basePath={basePath}
              query={{ ...query, category: undefined }}
            />
          </Card>
        </section>
      </Container>
    </>
  );
}
