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
import { formatDate, formatDateTime, formatRelative, pluralize } from "@/lib/utils/format";
import { toISODate } from "@/lib/data/results";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
  alternates: { canonical: "/" },
};

/** The board changes as slots pass, so the homepage is rendered per request. */
export const dynamic = "force-dynamic";

export default function HomePage() {
  const summaries = getCategorySummaries();
  const stats = getStatistics({ days: 30 });
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
        <Container className="py-8 sm:py-12">
          <p className="text-xs font-medium tracking-wide text-accent uppercase">
            {SITE.tagline}
          </p>
          <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Every published result, and the statistics behind them
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted sm:text-base">
            {stats.summary.totalCategories} categories publish on a fixed daily schedule. This
            board shows what has been published today, what is still to come, and how to reach{" "}
            {pluralize(stats.summary.publishedResults, "archived entry", "archived entries")}
            {" "}going back to {formatDate(stats.summary.coverageStart)}.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {lastUpdated ? (
              <UpdatedStamp
                timestamp={formatDateTime(lastUpdated)}
                relative={formatRelative(lastUpdated)}
              />
            ) : null}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/results" className={buttonClass("primary")}>
              Current results
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href="/history" className={buttonClass("secondary")}>
              <CalendarRange className="size-4" aria-hidden="true" />
              Browse the archive
            </Link>
            <Link href="/statistics" className={buttonClass("secondary")}>
              <LineChart className="size-4" aria-hidden="true" />
              Statistics
            </Link>
          </div>
        </Container>
      </section>

      <Container className="py-8 sm:py-10">
        {/* Statistics overview -------------------------------------------- */}
        <section aria-labelledby="overview" className="mb-10">
          <SectionHeader
            id="overview"
            title="At a glance"
            description={`Coverage from ${formatDate(stats.summary.coverageStart)} to ${formatDate(stats.summary.coverageEnd)}.`}
            action={
              <Link href="/statistics" className="text-sm font-medium text-accent hover:underline">
                Full statistics
              </Link>
            }
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              label="Published today"
              value={stats.summary.publishedToday}
              hint={`of ${stats.summary.activeCategories} active categories`}
              icon={<Timer className="size-4" aria-hidden="true" />}
            />
            <StatTile
              label="Archived entries"
              value={stats.summary.publishedResults.toLocaleString("en-GB")}
              hint={`${stats.summary.totalResults.toLocaleString("en-GB")} rows in total`}
              icon={<Database className="size-4" aria-hidden="true" />}
            />
            <StatTile
              label="Categories"
              value={stats.summary.totalCategories}
              hint={`${stats.summary.activeCategories} active`}
              icon={<Layers className="size-4" aria-hidden="true" />}
            />
            <StatTile
              label="Last update"
              value={formatRelative(stats.summary.lastUpdated)}
              hint={formatDateTime(stats.summary.lastUpdated)}
              icon={<LineChart className="size-4" aria-hidden="true" />}
            />
          </div>
        </section>

        {/* Today's board --------------------------------------------------- */}
        <section aria-labelledby="board" className="mb-10">
          <SectionHeader
            id="board"
            title="Current results"
            description={`Today, ${formatDate(today)}. Where a category has not published yet, its most recent value is shown — check the result date on each card.`}
            action={
              <Link href="/results" className="text-sm font-medium text-accent hover:underline">
                Open the board
              </Link>
            }
          />
          {board.length === 0 ? (
            <Card>
              <EmptyState
                title="Nothing published yet"
                description="No category has published a value. The board fills in as each scheduled slot passes."
              />
            </Card>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {board.map(({ summary, entry }) => (
                <li key={summary.category.id}>
                  <ResultCard entry={entry} category={summary.category} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recently published + archive access ----------------------------- */}
        <section aria-labelledby="recent" className="mb-10 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader
                title={<span id="recent">Recently published</span>}
                description="The newest entries across every category, most recent first."
                action={
                  <Link
                    href="/history"
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    All history
                  </Link>
                }
              />
              {recent.length === 0 ? (
                <EmptyState
                  title="No entries published yet"
                  description="Published values will appear here as soon as the first slot completes."
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

          <div className="grid gap-4">
            <Card className="p-5">
              <h3 className="text-sm font-semibold">Historical data</h3>
              <p className="mt-2 text-sm text-muted">
                The archive holds every entry back to {formatDate(stats.summary.coverageStart)}.
                Filter by category, date range and status, then sort and page through the
                results.
              </p>
              <Link href="/history" className={buttonClass("secondary", "mt-4")}>
                <CalendarRange className="size-4" aria-hidden="true" />
                Open the archive
              </Link>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-semibold">Publication schedule</h3>
              <dl className="mt-3 space-y-2 text-sm">
                {summaries.slice(0, 5).map(({ category }) => (
                  <div key={category.id} className="flex items-baseline justify-between gap-3">
                    <dt className="truncate text-muted">{category.name}</dt>
                    <dd className="shrink-0 font-medium tabular">{category.scheduleTime}</dd>
                  </div>
                ))}
              </dl>
              <Link href="/categories" className={buttonClass("ghost", "mt-3 -ml-3")}>
                All categories
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Card>
          </div>
        </section>

        {/* Categories ------------------------------------------------------ */}
        <section aria-labelledby="categories">
          <SectionHeader
            id="categories"
            title="Categories"
            description="Each category publishes one value per scheduled day. Open a category for its own archive and statistics."
            action={
              <Link href="/categories" className="text-sm font-medium text-accent hover:underline">
                View all
              </Link>
            }
          />
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
