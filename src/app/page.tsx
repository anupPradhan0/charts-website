import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  CalendarRange,
  Database,
  LineChart,
  Layers,
  Timer,
} from "lucide-react";
import { Container, UpdatedStamp } from "@/components/layout/PageShell";
import {
  Card,
  CardHeader,
  SectionHeader,
  StatTile,
  buttonClass,
  EmptyState,
} from "@/components/ui/primitives";
import { CategoryCard, RecentResultRow, ResultCard } from "@/components/results/cards";
import { getCategorySummaries } from "@/lib/services/categories";
import { getLastUpdated, getRecentlyPublished } from "@/lib/services/results";
import { getStatistics } from "@/lib/services/statistics";
import { createFormatter } from "@/lib/utils/format";
import { getLocale, getT } from "@/lib/i18n";
import { localized } from "@/lib/i18n/localize";
import { toISODate } from "@/lib/data/results";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: `${t("meta.brand")} — ${t("meta.tagline")}`,
    description: t("meta.description"),
    alternates: { canonical: "/" },
  };
}

/** The board changes as slots pass, so the homepage is rendered per request. */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const t = await getT();
  const locale = await getLocale();
  const fmt = createFormatter(t);
  const summaries = getCategorySummaries();
  const stats = getStatistics({ days: 30 }, locale);
  const recent = getRecentlyPublished(8);
  const lastUpdated = getLastUpdated();
  const today = toISODate(new Date());

  // Today's board: today's entry where one exists, otherwise the latest known.
  const board = summaries.flatMap((summary) => {
    const entry = summary.today ?? summary.latest;
    return entry ? [{ summary, entry }] : [];
  });

  return (
    <>
      {/* Hero ------------------------------------------------------------- */}
      <section className="border-b border-line bg-surface">
        <Container className="py-6 sm:py-12">
          <p className="text-xs font-medium tracking-wide text-accent uppercase">
            {t("meta.tagline")}
          </p>
          <h1 className="mt-1.5 max-w-3xl text-2xl font-semibold tracking-tight text-balance sm:mt-2 sm:text-3xl lg:text-4xl">
            {t("home.title")}
          </h1>
          <p className="mt-2.5 max-w-2xl text-sm text-muted text-pretty sm:mt-3 sm:text-base">
            {t("home.intro", {
              markets: fmt.number(stats.summary.totalCategories),
              archived: t.plural("common.archivedEntry", stats.summary.publishedResults, {
                count: fmt.number(stats.summary.publishedResults),
              }),
              start: fmt.date(stats.summary.coverageStart),
            })}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {lastUpdated ? (
              <UpdatedStamp
                timestamp={fmt.dateTime(lastUpdated)}
                relative={fmt.relative(lastUpdated)}
              />
            ) : null}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:flex sm:flex-wrap">
            <Link href="/results" className={buttonClass("primary", "col-span-2 sm:col-span-1")}>
              {t("home.currentResults")}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href="/history" className={buttonClass("secondary")}>
              <CalendarRange className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{t("home.archive")}</span>
            </Link>
            <Link href="/statistics" className={buttonClass("secondary")}>
              <LineChart className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{t("home.statistics")}</span>
            </Link>
          </div>
        </Container>
      </section>

      <Container className="py-6 sm:py-10">
        {/* Statistics overview -------------------------------------------- */}
        <section aria-labelledby="overview" className="mb-8 sm:mb-10">
          <SectionHeader
            id="overview"
            title={t("home.atAGlance")}
            description={t("home.coverage", {
              start: fmt.date(stats.summary.coverageStart),
              end: fmt.date(stats.summary.coverageEnd),
            })}
            action={
              <Link href="/statistics" className="text-sm font-medium text-accent hover:underline">
                {t("home.fullStatistics")}
              </Link>
            }
          />
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
            <StatTile
              label={t("home.publishedToday")}
              value={fmt.number(stats.summary.publishedToday)}
              hint={t("home.ofActiveMarkets", { count: fmt.number(stats.summary.activeCategories) })}
              icon={<Timer className="size-4" aria-hidden="true" />}
            />
            <StatTile
              label={t("home.archivedEntries")}
              value={fmt.number(stats.summary.publishedResults)}
              hint={t("home.rowsInTotal", { count: fmt.number(stats.summary.totalResults) })}
              icon={<Database className="size-4" aria-hidden="true" />}
            />
            <StatTile
              label={t("home.marketsTile")}
              value={fmt.number(stats.summary.totalCategories)}
              hint={t.plural("common.activeCount", stats.summary.activeCategories, {
                count: fmt.number(stats.summary.activeCategories),
              })}
              icon={<Layers className="size-4" aria-hidden="true" />}
            />
            <StatTile
              label={t("home.lastUpdate")}
              value={fmt.relative(stats.summary.lastUpdated)}
              hint={fmt.dateTime(stats.summary.lastUpdated)}
              icon={<LineChart className="size-4" aria-hidden="true" />}
            />
          </div>
        </section>

        {/* Today's board --------------------------------------------------- */}
        <section aria-labelledby="board" className="mb-8 sm:mb-10">
          <SectionHeader
            id="board"
            title={t("home.boardTitle")}
            description={t("home.boardDescription", { date: fmt.date(today) })}
            action={
              <Link href="/results" className="text-sm font-medium text-accent hover:underline">
                {t("home.openBoard")}
              </Link>
            }
          />
          {board.length === 0 ? (
            <Card>
              <EmptyState
                title={t("home.nothingPublished")}
                description={t("home.nothingPublishedHint")}
              />
            </Card>
          ) : (
            <ul className="grid gap-2.5 min-[380px]:grid-cols-2 sm:gap-3 lg:grid-cols-4">
              {board.map(({ summary, entry }) => (
                <li key={summary.category.id}>
                  <ResultCard entry={entry} category={summary.category} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recently published + archive access ----------------------------- */}
        <section aria-labelledby="recent" className="mb-8 grid gap-3 sm:gap-4 sm:mb-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader
                title={<span id="recent">{t("home.recentlyPublished")}</span>}
                description={t("home.recentlyPublishedHint")}
                action={
                  <Link
                    href="/history"
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    {t("home.allHistory")}
                  </Link>
                }
              />
              {recent.length === 0 ? (
                <EmptyState
                  title={t("home.noEntriesYet")}
                  description={t("home.noEntriesYetHint")}
                />
              ) : (
                <ul className="divide-y divide-line">
                  {recent.map((entry) => (
                    <RecentResultRow key={entry.id} entry={entry} />
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <div className="grid gap-3 sm:gap-4">
            <Card className="p-4 sm:p-5">
              <h3 className="text-sm font-semibold">{t("home.historicalData")}</h3>
              <p className="mt-2 text-sm text-muted text-pretty">
                {t("home.historicalDataHint", { start: fmt.date(stats.summary.coverageStart) })}
              </p>
              <Link href="/history" className={buttonClass("secondary", "mt-4")}>
                <CalendarRange className="size-4" aria-hidden="true" />
                {t("home.openArchive")}
              </Link>
            </Card>

            <Card className="p-4 sm:p-5">
              <h3 className="text-sm font-semibold">{t("home.publicationSchedule")}</h3>
              <dl className="mt-3 space-y-2 text-sm">
                {summaries.slice(0, 5).map(({ category }) => (
                  <div key={category.id} className="flex items-baseline justify-between gap-3">
                    <dt className="truncate text-muted">{localized(category.name, locale)}</dt>
                    <dd className="shrink-0 font-medium tabular">{category.scheduleTime}</dd>
                  </div>
                ))}
              </dl>
              <Link href="/categories" className={buttonClass("ghost", "mt-3 -ml-3")}>
                {t("home.allMarkets")}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Card>
          </div>
        </section>

        {/* Categories ------------------------------------------------------ */}
        <section aria-labelledby="categories">
          <SectionHeader
            id="categories"
            title={t("home.marketsTitle")}
            description={t("home.marketsDescription")}
            action={
              <Link href="/categories" className="text-sm font-medium text-accent hover:underline">
                {t("common.viewAll")}
              </Link>
            }
          />
          <ul className="grid gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4">
            {summaries.map((summary) => (
              <li key={summary.category.id}>
                <CategoryCard summary={summary} />
              </li>
            ))}
          </ul>
        </section>
      </Container>
    </>
  );
}
