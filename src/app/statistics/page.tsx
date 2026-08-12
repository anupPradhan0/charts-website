import Link from "next/link";
import type { Metadata } from "next";
import { Container, PageHeader, UpdatedStamp } from "@/components/layout/PageShell";
import { Card, CardHeader, StatTile, buttonClass } from "@/components/ui/primitives";
import { SimpleBarChart, TrendChart } from "@/components/charts/Charts";
import { listCategories } from "@/lib/services/categories";
import { getStatistics } from "@/lib/services/statistics";
import { parsePageQuery, statisticsQuerySchema } from "@/lib/services/query";
import { createFormatter } from "@/lib/utils/format";
import { getLocale, getT } from "@/lib/i18n";
import { localized } from "@/lib/i18n/localize";
import { canonical } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("statistics.title"),
    description: t("statistics.metaDescription"),
    alternates: { canonical: canonical("/statistics") },
    openGraph: {
      title: `${t("statistics.title")} · ${t("meta.brand")}`,
      description: t("statistics.metaDescription"),
      url: canonical("/statistics"),
    },
  };
}

export const dynamic = "force-dynamic";

const DAY_OPTIONS = [7, 14, 30, 60];

export default async function StatisticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const t = await getT();
  const locale = await getLocale();
  const fmt = createFormatter(t);
  const raw = await searchParams;
  const query = parsePageQuery(statisticsQuerySchema, raw);
  const stats = getStatistics(query, locale);
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
        title={t("statistics.title")}
        description={t("statistics.description")}
        breadcrumbs={[{ href: "/", label: t("nav.home") }, { label: t("statistics.title") }]}
        meta={
          stats.summary.lastUpdated ? (
            <UpdatedStamp
              timestamp={fmt.dateTime(stats.summary.lastUpdated)}
              relative={fmt.relative(stats.summary.lastUpdated)}
            />
          ) : null
        }
      />

      <Container className="py-6 sm:py-8">
        {/* Scope controls -------------------------------------------------- */}
        <form
          method="get"
          className="mb-5 grid gap-3 rounded-card border border-line bg-surface p-3 sm:mb-6 sm:flex sm:flex-wrap sm:items-end sm:p-4"
        >
          <div>
            <label htmlFor="stats-category" className="mb-1 block text-xs font-medium text-muted">
              {t("statistics.market")}
            </label>
            <select
              id="stats-category"
              name="category"
              defaultValue={query.category ?? ""}
              className="h-11 w-full rounded-lg border border-line bg-surface px-3 text-base sm:h-10 sm:w-56 sm:text-sm"
            >
              <option value="">{t("statistics.allMarkets")}</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {localized(c.name, locale)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="stats-days" className="mb-1 block text-xs font-medium text-muted">
              {t("statistics.timeWindow")}
            </label>
            <select
              id="stats-days"
              name="days"
              defaultValue={String(query.days)}
              className="h-11 w-full rounded-lg border border-line bg-surface px-3 text-base sm:h-10 sm:w-40 sm:text-sm"
            >
              {DAY_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {t("statistics.lastDays", { count: fmt.number(d) })}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button type="submit" className={buttonClass("primary", "flex-1 sm:flex-none")}>
              {t("common.apply")}
            </button>
            {query.category || query.days !== 30 ? (
              <Link href="/statistics" className={buttonClass("ghost", "flex-1 sm:flex-none")}>
                {t("common.reset")}
              </Link>
            ) : null}
          </div>
        </form>

        <p className="mb-5 text-sm text-muted text-pretty sm:mb-6">
          {t("statistics.showingScope", {
            scope: selected ? localized(selected.name, locale) : t("statistics.allMarkets"),
            days: fmt.number(query.days),
            start: fmt.date(stats.summary.coverageStart),
            end: fmt.date(stats.summary.coverageEnd),
          })}
        </p>

        {/* Summary --------------------------------------------------------- */}
        <div className="mb-6 grid grid-cols-2 gap-2.5 sm:gap-3 sm:mb-8 lg:grid-cols-4">
          <StatTile
            label={t("statistics.publishedEntries")}
            value={fmt.number(stats.summary.publishedResults)}
            hint={t("statistics.inSelectedScope")}
          />
          <StatTile
            label={t("statistics.publishedInWindow", { days: fmt.number(query.days) })}
            value={fmt.number(publishedInWindow)}
            hint={t("statistics.perDayAverage", {
              value: fmt.number(Math.round((publishedInWindow / query.days) * 10) / 10),
            })}
          />
          <StatTile
            label={t("statistics.publishedToday")}
            value={fmt.number(stats.summary.publishedToday)}
            hint={t("statistics.marketsActive", { count: fmt.number(stats.summary.activeCategories) })}
          />
          <StatTile
            label={t("statistics.busiestWeekday")}
            value={busiestDay?.day ?? "—"}
            hint={t("statistics.entriesCount", { count: fmt.number(busiestDay?.count ?? 0) })}
          />
        </div>

        {/* Charts ---------------------------------------------------------- */}
        <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
          <Card className="lg:col-span-2">
            <CardHeader
              title={t("statistics.activityOverTime")}
              description={t("statistics.activityOverTimeHint", { days: fmt.number(query.days) })}
              as="h2"
            />
            <div className="p-2 sm:p-4">
              <TrendChart
                data={stats.resultsOverTime}
                caption={t("statistics.activityCaption", { days: fmt.number(query.days) })}
                height={300}
              />
            </div>
          </Card>

          <Card>
            <CardHeader
              title={t("statistics.marketActivity")}
              description={t("statistics.marketActivityHint")}
              as="h2"
            />
            <div className="p-2 sm:p-4">
              <SimpleBarChart
                data={stats.categoryActivity}
                labelKey="name"
                valueKey="published"
                vertical
                colorByAccent
                height={Math.max(200, stats.categoryActivity.length * 34)}
                caption={t("statistics.marketActivityCaption")}
                columns={[t("statistics.colMarket"), t("statistics.colPublishedEntries")]}
              />
            </div>
          </Card>

          <Card>
            <CardHeader
              title={t("statistics.distribution")}
              description={t("statistics.distributionHint")}
              as="h2"
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

          <Card>
            <CardHeader
              title={t("statistics.updateFrequency")}
              description={t("statistics.updateFrequencyHint")}
              as="h2"
            />
            <div className="p-2 sm:p-4">
              <SimpleBarChart
                data={stats.updateFrequency}
                labelKey="hour"
                valueKey="count"
                color="var(--chart-4)"
                caption={t("statistics.updateFrequencyCaption")}
                columns={[t("statistics.colHour"), t("statistics.colEntries")]}
              />
            </div>
          </Card>

          <Card>
            <CardHeader
              title={t("statistics.weekdayCoverage")}
              description={t("statistics.weekdayCoverageHint")}
              as="h2"
            />
            <div className="p-2 sm:p-4">
              <SimpleBarChart
                data={stats.weekdayActivity}
                labelKey="short"
                tableLabelKey="day"
                valueKey="count"
                color="var(--chart-5)"
                caption={t("statistics.weekdayCoverageCaption")}
                columns={[t("statistics.colDay"), t("statistics.colEntries")]}
              />
            </div>
          </Card>
        </div>

        <p className="mt-5 rounded-card border border-line bg-surface-2 p-3 text-sm text-muted text-pretty sm:mt-6 sm:p-4">
          {t("statistics.footnote")}
        </p>
      </Container>
    </>
  );
}
