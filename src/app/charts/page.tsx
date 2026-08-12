import Link from "next/link";
import type { Metadata } from "next";
import { CalendarRange, Grid3x3 } from "lucide-react";
import { Container, PageHeader } from "@/components/layout/PageShell";
import { Card, CardHeader, StatTile, buttonClass } from "@/components/ui/primitives";
import { listCategories } from "@/lib/services/categories";
import {
  availableMonths,
  getFrequencyMatrix,
  getMonthGrid,
  monthOf,
  WEEKDAY_HEADS,
} from "@/lib/services/charts";
import { getArchiveRange } from "@/lib/data/results";
import { cn, createFormatter } from "@/lib/utils/format";
import { getLocale, getT } from "@/lib/i18n";
import { localized } from "@/lib/i18n/localize";
import { MARKET_GROUPS } from "@/types";
import { LOCALE_META } from "@/lib/i18n/config";
import { canonical } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("charts.title"),
    description: t("charts.metaDescription"),
    alternates: { canonical: canonical("/charts") },
    openGraph: {
      title: `${t("charts.title")} · ${t("meta.brand")}`,
      description: t("charts.metaDescription"),
      url: canonical("/charts"),
    },
  };
}

export const dynamic = "force-dynamic";

export default async function ChartsPage({
  searchParams,
}: {
  searchParams: Promise<{ market?: string; month?: string }>;
}) {
  const t = await getT();
  const locale = await getLocale();
  const fmt = createFormatter(t);
  const params = await searchParams;
  const categories = listCategories();
  const months = availableMonths();
  const range = getArchiveRange();

  // Fall back to the first market and the newest month for any bad input.
  const market =
    categories.find((c) => c.slug === params.market) ?? categories[0];
  const month =
    months.find((m) => m.value === params.month)?.value ??
    months[0]?.value ??
    monthOf(range.end);

  const marketName = localized(market.name, locale);
  const grid = getMonthGrid(market.slug, month);
  const matrix = getFrequencyMatrix(market.slug);
  // Monday-first weekday headers in the active language, straight from Intl.
  const weekdayLabels = WEEKDAY_HEADS.map((_, i) => {
    const reference = new Date(2024, 0, 1 + i); // 2024-01-01 was a Monday
    return new Intl.DateTimeFormat(LOCALE_META[locale].intl, { weekday: "short" }).format(reference);
  });

  return (
    <>
      <PageHeader
        title={t("charts.title")}
        description={t("charts.description")}
        breadcrumbs={[{ href: "/", label: t("nav.home") }, { label: t("charts.title") }]}
      />

      <Container className="py-6 sm:py-8">
        {/* Market + month selection ---------------------------------------- */}
        <form
          method="get"
          className="mb-5 grid gap-3 rounded-card border border-line bg-surface p-3 sm:mb-6 sm:flex sm:flex-wrap sm:items-end sm:p-4"
        >
          <div className="sm:flex-1">
            <label htmlFor="chart-market" className="mb-1 block text-xs font-medium text-muted">
              {t("charts.market")}
            </label>
            <select
              id="chart-market"
              name="market"
              defaultValue={market.slug}
              className="h-11 w-full rounded-lg border border-line bg-surface px-3 text-base sm:h-10 sm:max-w-xs sm:text-sm"
            >
              {MARKET_GROUPS.map((group) => (
                <optgroup key={group.value} label={t(`groups.${group.value}Label`)}>
                  {categories
                    .filter((c) => c.group === group.value)
                    .map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {localized(c.name, locale)}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="sm:flex-1">
            <label htmlFor="chart-month" className="mb-1 block text-xs font-medium text-muted">
              {t("charts.month")}
            </label>
            <select
              id="chart-month"
              name="month"
              defaultValue={month}
              className="h-11 w-full rounded-lg border border-line bg-surface px-3 text-base sm:h-10 sm:max-w-xs sm:text-sm"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {fmt.month(m.value)}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className={buttonClass("primary", "w-full sm:w-auto")}>
            {t("charts.showButton")}
          </button>
        </form>

        <div className="mb-5 grid grid-cols-2 gap-2.5 sm:mb-6 sm:gap-3 lg:grid-cols-4">
          <StatTile
            label={t("charts.market")}
            value={marketName}
            hint={`${t("common.slot")} ${fmt.schedule(market.scheduleTime)}`}
          />
          <StatTile
            label={fmt.month(grid.month)}
            value={fmt.number(grid.published)}
            hint={t("charts.daysPublished")}
          />
          <StatTile
            label={t("charts.gapsThisMonth")}
            value={fmt.number(grid.gaps)}
            hint={t("charts.daysWithNoEntry")}
          />
          <StatTile
            label={t("charts.valuesSeen")}
            value={`${100 - matrix.unseen}/100`}
            hint={t("charts.fromEntries", {
              count: t.plural("common.entry", matrix.total, { count: fmt.number(matrix.total) }),
            })}
          />
        </div>

        {/* Calendar view ---------------------------------------------------- */}
        <Card className="mb-4">
          <CardHeader
            title={
              <span className="flex items-center gap-2">
                <CalendarRange className="size-4 shrink-0" aria-hidden="true" />
                {t("charts.calendarTitle", { month: fmt.month(grid.month) })}
              </span>
            }
            description={t("charts.calendarDescription", { market: marketName })}
          />
          <div className="p-2 sm:p-4">
            <table className="w-full table-fixed border-collapse">
              <caption className="sr-only">
                {t("charts.calendarCaption", { market: marketName, month: fmt.month(grid.month) })}
              </caption>
              <thead>
                <tr>
                  {WEEKDAY_HEADS.map((day, index) => (
                    <th
                      key={day}
                      scope="col"
                      className="pb-1.5 text-center text-[0.6875rem] font-medium text-muted sm:text-xs"
                    >
                      <span className="sm:hidden">{weekdayLabels[index].slice(0, 1)}</span>
                      <span className="hidden sm:inline">{weekdayLabels[index]}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grid.weeks.map((week) => (
                  <tr key={week[0].date}>
                    {week.map((cell) => (
                      <td key={cell.date} className="p-0.5 align-top sm:p-1">
                        <div
                          className={cn(
                            "flex aspect-square flex-col items-center justify-center rounded-lg border",
                            !cell.inMonth
                              ? "border-transparent"
                              : cell.entry?.status === "published"
                                ? "border-line bg-surface-2"
                                : "border-dashed border-line",
                          )}
                        >
                          {cell.inMonth ? (
                            <>
                              <span className="text-[0.625rem] text-subtle tabular sm:text-xs">
                                {cell.day}
                              </span>
                              <span className="font-mono text-sm font-semibold tabular sm:text-lg">
                                {cell.entry?.value ?? (
                                  <span className="text-subtle" aria-label={t("charts.noEntry")}>
                                    ·
                                  </span>
                                )}
                              </span>
                            </>
                          ) : null}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Frequency grid ---------------------------------------------------- */}
        <Card>
          <CardHeader
            title={
              <span className="flex items-center gap-2">
                <Grid3x3 className="size-4 shrink-0" aria-hidden="true" />
                {t("charts.frequencyTitle")}
              </span>
            }
            description={t("charts.frequencyDescription", { market: marketName })}
          />
          <div className="scroll-x p-2 sm:p-4">
            <table className="w-full min-w-[19rem] border-collapse text-center">
              <caption className="sr-only">
                {t("charts.frequencyCaption", { market: marketName })}
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="w-7 text-[0.625rem] text-subtle">
                    <span className="sr-only">{t("charts.tensDigit")}</span>
                  </th>
                  {Array.from({ length: 10 }, (_, i) => (
                    <th
                      key={i}
                      scope="col"
                      className="pb-1 text-[0.625rem] font-medium text-muted tabular sm:text-xs"
                    >
                      {i}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.rows.map((row) => (
                  <tr key={row.tens}>
                    <th
                      scope="row"
                      className="pr-1 text-right text-[0.625rem] font-medium text-muted tabular sm:text-xs"
                    >
                      {row.tens}0
                    </th>
                    {row.cells.map((cell) => (
                      <td key={cell.value} className="p-0.5">
                        <div
                          title={t("charts.frequencyCell", {
                            value: cell.value,
                            count: cell.count,
                            share: cell.share,
                          })}
                          style={{
                            // Opacity carries the count; the border keeps empty
                            // cells visible in both themes.
                            backgroundColor: matrix.max
                              ? `color-mix(in srgb, var(--accent) ${Math.round(
                                  (cell.count / matrix.max) * 100,
                                )}%, transparent)`
                              : "transparent",
                          }}
                          className="flex aspect-square items-center justify-center rounded border border-line text-[0.625rem] tabular sm:text-xs"
                        >
                          <span className={cell.count === 0 ? "text-subtle" : "font-medium"}>
                            {cell.count}
                          </span>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="border-t border-line px-4 py-3 text-xs text-muted text-pretty">
            {t("charts.frequencyFooter", {
              entries: t.plural("common.publishedEntry", matrix.total, {
                count: fmt.number(matrix.total),
              }),
              start: fmt.date(range.start),
              end: fmt.date(range.end),
            })}
          </p>
        </Card>

        <p className="mt-4 text-sm text-muted">
          {t("charts.rawRows")}{" "}
          <Link href={`/history?category=${market.slug}`} className="text-accent hover:underline">
            {t("charts.openInArchive", { market: marketName })}
          </Link>
          .
        </p>
      </Container>
    </>
  );
}
