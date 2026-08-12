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
  buttonClass,
} from "@/components/ui/primitives";
import { StatusBadge } from "@/components/ui/StatusBadge";
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
import { createFormatter } from "@/lib/utils/format";
import { getLocale, getT } from "@/lib/i18n";
import { localized } from "@/lib/i18n/localize";
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
  const t = await getT();
  const locale = await getLocale();
  const fmt = createFormatter(t);
  const category = getCategory(slug);
  if (!category) return { title: t("market.notFound") };

  const name = localized(category.name, locale);
  const description = t("market.metaDescription", {
    market: name,
    slot: fmt.schedule(category.scheduleTime),
    frequency: category.updateFrequency,
  });
  return {
    title: name,
    description,
    alternates: { canonical: canonical(`/categories/${slug}`) },
    openGraph: {
      title: `${name} · ${t("meta.brand")}`,
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
  const t = await getT();
  const locale = await getLocale();
  const fmt = createFormatter(t);
  const name = localized(category.name, locale);
  const raw = await searchParams;
  // The category is fixed by the route; a `category` query param cannot escape it.
  const query = { ...parsePageQuery(resultQuerySchema, raw), category: slug };
  const page = listResults(query);
  const stats = getStatistics({ category: slug, days: 30 }, locale);
  const range = getArchiveRange();
  const basePath = `/categories/${slug}`;

  const current = today ?? latest;

  return (
    <>
      <PageHeader
        title={name}
        description={localized(category.description, locale)}
        breadcrumbs={[
          { href: "/", label: t("nav.home") },
          { href: "/categories", label: t("markets.title") },
          { label: name },
        ]}
        meta={
          <>
            <Badge tone={category.status === "active" ? "ok" : "neutral"}>
              {category.status === "active" ? t("common.active") : t("common.paused")}
            </Badge>
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <CalendarClock className="size-3.5" aria-hidden="true" />
              {t("common.slot")} {fmt.schedule(category.scheduleTime)}
            </p>
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <Repeat className="size-3.5" aria-hidden="true" />
              {category.updateFrequency}
            </p>
            {latest?.publishedAt ? (
              <UpdatedStamp
                timestamp={fmt.dateTime(latest.publishedAt)}
                relative={fmt.relative(latest.publishedAt)}
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
            {t("market.inFullArchive")}
          </Link>
        }
      />

      <Container className="py-6 sm:py-8">
        {/* Current value + key numbers ------------------------------------ */}
        <div className="mb-6 grid gap-3 sm:gap-4 sm:mb-8 lg:grid-cols-3">
          <Card className="flex flex-col items-center justify-center p-4 text-center sm:p-6">
            <p className="text-xs font-medium text-muted">
              {today ? t("market.todaysResult") : t("market.mostRecentResult")}
            </p>
            <div className="my-3">
              <ResultValue value={current?.value ?? null} size="lg" t={t} />
            </div>
            {current ? (
              <>
                <StatusBadge status={current.status} />
                <p className="mt-2 text-sm text-muted tabular">{fmt.date(current.date)}</p>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted">{t("market.noEntriesYet")}</p>
            )}
          </Card>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:col-span-2">
            <StatTile
              label={t("market.archivedEntries")}
              value={fmt.number(publishedCount)}
              hint={`${fmt.date(range.start)} – ${fmt.date(range.end)}`}
            />
            <StatTile
              label={t("market.publishedThirtyDays")}
              value={fmt.number(stats.resultsOverTime.reduce((sum, d) => sum + d.published, 0))}
              hint={t("market.outOfDays", { count: fmt.number(stats.resultsOverTime.length) })}
            />
            <StatTile
              label={t("market.scheduledSlot")}
              value={fmt.schedule(category.scheduleTime)}
              hint={category.updateFrequency}
            />
            <StatTile
              label={t("market.mostCommonRange")}
              value={
                stats.distribution.reduce(
                  (best, d) => (d.count > best.count ? d : best),
                  stats.distribution[0],
                ).bucket
              }
              hint={t("market.acrossArchive")}
            />
          </div>
        </div>

        {/* Charts ---------------------------------------------------------- */}
        <div className="mb-6 grid gap-3 sm:gap-4 sm:mb-8 lg:grid-cols-2">
          <Card>
            <CardHeader
              title={t("market.publicationActivity")}
              description={t("market.publicationActivityHint")}
              as="h3"
            />
            <div className="p-2 sm:p-4">
              <TrendChart
                data={stats.resultsOverTime}
                caption={t("statistics.activityCaption", { days: 30 })}
              />
            </div>
          </Card>

          <Card>
            <CardHeader
              title={t("market.historicalDistribution")}
              description={t("market.historicalDistributionHint")}
              as="h3"
            />
            <div className="p-2 sm:p-4">
              <SimpleBarChart
                data={stats.distribution}
                labelKey="bucket"
                valueKey="count"
                color="var(--chart-2)"
                caption={t("statistics.distributionCaption")}
                columns={[t("statistics.colRange"), t("statistics.colEntries")]}
              />
            </div>
          </Card>
        </div>

        {/* Archive --------------------------------------------------------- */}
        <section aria-labelledby="category-archive">
          <Card>
            <CardHeader
              title={<span id="category-archive">{t("market.archiveTitle", { market: name })}</span>}
              description={t("market.archiveDescription", {
                count: t.plural("common.entry", page.total, { count: fmt.number(page.total) }),
              })}
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
              caption={`${name} — ${t("history.caption")}`}
              emptyAction={
                <Link href={basePath} className={buttonClass("secondary")}>
                  {t("common.clearFilters")}
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
