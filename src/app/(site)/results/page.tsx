import Link from "next/link";
import type { Metadata } from "next";
import { CalendarRange } from "lucide-react";
import { Container, PageHeader, UpdatedStamp } from "@/components/layout/PageShell";
import {
  Card,
  CardHeader,
  EmptyState,
  ResultValue,
  buttonClass,
} from "@/components/ui/primitives";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ResultCard } from "@/components/results/cards";
import { AutoRefresh } from "@/components/results/AutoRefresh";
import { getCategorySummaries, getSummariesByGroup } from "@/lib/services/categories";
import { getLastUpdated } from "@/lib/services/results";
import { cn, createFormatter } from "@/lib/utils/format";
import { getLocale, getT } from "@/lib/i18n";
import { localized } from "@/lib/i18n/localize";
import { toISODate } from "@/lib/utils/date";
import { canonical } from "@/lib/site";
import { MARKET_GROUPS } from "@/types";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("results.title"),
    description: t("results.metaDescription"),
    alternates: { canonical: canonical("/results") },
    openGraph: {
      title: `${t("results.title")} · ${t("meta.brand")}`,
      description: t("results.metaDescription"),
      url: canonical("/results"),
    },
  };
}

export const dynamic = "force-dynamic";

const chip =
  "inline-flex min-h-10 items-center rounded-full border px-3.5 text-sm font-medium whitespace-nowrap";
const chipOn = "border-transparent bg-accent text-accent-fg";
const chipOff = "border-line text-muted hover:text-fg";

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string }>;
}) {
  const { group } = await searchParams;
  const t = await getT();
  const locale = await getLocale();
  const fmt = createFormatter(t);
  const activeGroup = MARKET_GROUPS.find((g) => g.value === group)?.value;
  const [allGrouped, allSummaries, lastUpdated] = await Promise.all([
    getSummariesByGroup(),
    getCategorySummaries(),
    getLastUpdated(),
  ]);
  const grouped = allGrouped.filter((g) => !activeGroup || g.group === activeGroup);
  const summaries = allSummaries.filter((s) => !activeGroup || s.category.group === activeGroup);
  const today = toISODate(new Date());

  const upcoming = summaries.filter((s) => s.today && s.today.status !== "published");

  return (
    <>
      <PageHeader
        title={t("results.title")}
        description={t("results.description", { date: fmt.date(today) })}
        breadcrumbs={[{ href: "/", label: t("nav.home") }, { label: t("results.title") }]}
        meta={
          <>
            {lastUpdated ? (
              <UpdatedStamp
                timestamp={fmt.dateTime(lastUpdated)}
                relative={fmt.relative(lastUpdated)}
              />
            ) : null}
            <AutoRefresh />
          </>
        }
        actions={
          <Link href="/history" className={buttonClass("secondary")}>
            <CalendarRange className="size-4" aria-hidden="true" />
            {t("results.historicalResults")}
          </Link>
        }
      />

      <Container className="py-6 sm:py-8">
        {/* Group filter --------------------------------------------------- */}
        <nav aria-label={t("results.groupNav")} className="mb-5 sm:mb-6">
          <ul className="scroll-x flex gap-2 pb-1">
            <li>
              <Link
                href="/results"
                aria-current={!activeGroup ? "true" : undefined}
                className={cn(chip, !activeGroup ? chipOn : chipOff)}
              >
                {t("common.allMarkets")}
              </Link>
            </li>
            {MARKET_GROUPS.map((g) => (
              <li key={g.value}>
                <Link
                  href={`/results?group=${g.value}`}
                  aria-current={activeGroup === g.value ? "true" : undefined}
                  className={cn(chip, activeGroup === g.value ? chipOn : chipOff)}
                >
                  {t(`groups.${g.value}Label`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {grouped.map(({ group: groupName, summaries: groupSummaries }) => {
          const published = groupSummaries.filter((s) => s.today?.status === "published");
          return (
            <section
              key={groupName}
              aria-labelledby={`group-${groupName}`}
              className="mb-6 sm:mb-8"
            >
              <div className="mb-3 sm:mb-4">
                <h2
                  id={`group-${groupName}`}
                  className="text-base font-semibold tracking-tight sm:text-lg"
                >
                  {t(`groups.${groupName}Label`)}
                  <span className="ml-2 text-sm font-normal text-muted tabular">
                    {t("results.publishedOfTotal", {
                      published: fmt.number(published.length),
                      total: fmt.number(groupSummaries.length),
                    })}
                  </span>
                </h2>
                <p className="mt-1 text-sm text-muted text-pretty">{t(`groups.${groupName}Blurb`)}</p>
              </div>

              {groupSummaries.length === 0 ? (
                <Card>
                  <EmptyState title={t("results.noMarketsInGroup")} />
                </Card>
              ) : (
                <ul className="grid gap-2.5 min-[380px]:grid-cols-2 sm:gap-3 lg:grid-cols-4">
                  {groupSummaries.map((summary) => {
                    const entry = summary.today ?? summary.latest;
                    return entry ? (
                      <li key={summary.category.id}>
                        <ResultCard entry={entry} category={summary.category} />
                      </li>
                    ) : null;
                  })}
                </ul>
              )}
            </section>
          );
        })}

        <section aria-labelledby="schedule-today">
          <Card>
            <CardHeader
              title={<span id="schedule-today">{t("results.scheduleTitle")}</span>}
              description={t("results.scheduleDescription")}
            />

            {summaries.length === 0 ? (
              <EmptyState title={t("results.noMarketsConfigured")} />
            ) : (
              <>
                {/* Five columns need real width; below md the same rows are
                    rendered as list items instead. */}
                <div className="scroll-x hidden md:block">
                <table className="w-full min-w-[34rem] border-collapse text-sm">
                  <caption className="sr-only">
                    {t("results.scheduleCaption", { date: fmt.date(today) })}
                  </caption>
                  <thead className="border-b border-line bg-surface-2 text-xs text-muted uppercase">
                    <tr>
                      <th scope="col" className="px-4 py-2.5 text-left font-medium">
                        {t("table.market")}
                      </th>
                      <th scope="col" className="px-4 py-2.5 text-left font-medium">
                        {t("table.slot")}
                      </th>
                      <th scope="col" className="px-4 py-2.5 text-center font-medium">
                        {t("table.result")}
                      </th>
                      <th scope="col" className="px-4 py-2.5 text-left font-medium">
                        {t("table.status")}
                      </th>
                      <th scope="col" className="px-4 py-2.5 text-right font-medium">
                        {t("table.published")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaries.map(({ category, today: entry }) => (
                      <tr key={category.id} className="border-b border-line last:border-0">
                        <th scope="row" className="px-4 py-3 text-left font-medium">
                          <Link
                            href={`/categories/${category.slug}`}
                            className="text-accent hover:underline"
                          >
                            {localized(category.name, locale)}
                          </Link>
                          {category.status === "paused" ? (
                            <span className="ml-2 text-xs font-normal text-muted">{t("common.paused")}</span>
                          ) : null}
                        </th>
                        <td className="px-4 py-3 tabular text-muted">
                          {fmt.schedule(category.scheduleTime)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <ResultValue value={entry?.value ?? null} size="sm" t={t} />
                        </td>
                        <td className="px-4 py-3">
                          {entry ? (
                            <StatusBadge status={entry.status} />
                          ) : (
                            <span className="text-xs text-muted">{t("common.noEntryToday")}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right tabular text-muted">
                          {fmt.time(entry?.publishedAt ?? null)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>

                <ul className="divide-y divide-line md:hidden">
                  {summaries.map(({ category, today: entry }) => (
                    <li key={category.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          <Link
                            href={`/categories/${category.slug}`}
                            className="text-accent hover:underline"
                          >
                            {localized(category.name, locale)}
                          </Link>
                        </p>
                        <p className="text-xs text-muted tabular">
                          {t("common.slot")} {fmt.schedule(category.scheduleTime)}
                          {entry?.publishedAt
                            ? ` · ${t("common.publishedAt", { time: fmt.time(entry.publishedAt) })}`
                            : ""}
                        </p>
                        <p className="mt-1.5">
                          {entry ? (
                            <StatusBadge status={entry.status} />
                          ) : (
                            <span className="text-xs text-muted">{t("common.noEntryToday")}</span>
                          )}
                        </p>
                      </div>
                      <ResultValue value={entry?.value ?? null} t={t} />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Card>

          {upcoming.length > 0 ? (
            <p className="mt-3 text-sm text-muted">
{t.plural("results.stillToPublish", upcoming.length, { count: fmt.number(upcoming.length) })}
            </p>
          ) : null}
        </section>
      </Container>
    </>
  );
}
