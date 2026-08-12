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
import { cn, formatDate, pluralize } from "@/lib/utils/format";
import { MARKET_GROUPS } from "@/types";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  title: "Charts",
  description:
    "Two views over the archive: a month calendar of published values for any market, and a frequency grid showing how often each value has appeared.",
  alternates: { canonical: canonical("/charts") },
  openGraph: {
    title: "Charts · Numera",
    description: "Calendar and frequency views over the published archive.",
    url: canonical("/charts"),
  },
};

export const dynamic = "force-dynamic";

export default async function ChartsPage({
  searchParams,
}: {
  searchParams: Promise<{ market?: string; month?: string }>;
}) {
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

  const grid = getMonthGrid(market.slug, month);
  const matrix = getFrequencyMatrix(market.slug);

  return (
    <>
      <PageHeader
        title="Charts"
        description="Published values laid out by calendar date, and counted by how often each value has appeared. Both views describe the archive as it stands — neither is a forecast."
        breadcrumbs={[{ href: "/", label: "Home" }, { label: "Charts" }]}
      />

      <Container className="py-6 sm:py-8">
        {/* Market + month selection ---------------------------------------- */}
        <form
          method="get"
          className="mb-5 grid gap-3 rounded-card border border-line bg-surface p-3 sm:mb-6 sm:flex sm:flex-wrap sm:items-end sm:p-4"
        >
          <div className="sm:flex-1">
            <label htmlFor="chart-market" className="mb-1 block text-xs font-medium text-muted">
              Market
            </label>
            <select
              id="chart-market"
              name="market"
              defaultValue={market.slug}
              className="h-11 w-full rounded-lg border border-line bg-surface px-3 text-base sm:h-10 sm:max-w-xs sm:text-sm"
            >
              {MARKET_GROUPS.map((group) => (
                <optgroup key={group.value} label={group.label}>
                  {categories
                    .filter((c) => c.group === group.value)
                    .map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="sm:flex-1">
            <label htmlFor="chart-month" className="mb-1 block text-xs font-medium text-muted">
              Month
            </label>
            <select
              id="chart-month"
              name="month"
              defaultValue={month}
              className="h-11 w-full rounded-lg border border-line bg-surface px-3 text-base sm:h-10 sm:max-w-xs sm:text-sm"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className={buttonClass("primary", "w-full sm:w-auto")}>
            Show
          </button>
        </form>

        <div className="mb-5 grid grid-cols-2 gap-2.5 sm:mb-6 sm:gap-3 lg:grid-cols-4">
          <StatTile label="Market" value={market.name} hint={`Slot ${market.scheduleTime}`} />
          <StatTile label={grid.label} value={grid.published} hint="days published" />
          <StatTile label="Gaps this month" value={grid.gaps} hint="days with no entry" />
          <StatTile
            label="Values seen"
            value={`${100 - matrix.unseen}/100`}
            hint={`from ${pluralize(matrix.total, "entry", "entries")}`}
          />
        </div>

        {/* Calendar view ---------------------------------------------------- */}
        <Card className="mb-4">
          <CardHeader
            title={
              <span className="flex items-center gap-2">
                <CalendarRange className="size-4 shrink-0" aria-hidden="true" />
                Calendar — {grid.label}
              </span>
            }
            description={`Every published value for ${market.name}, laid out by date. Empty cells are days with no entry.`}
          />
          <div className="p-2 sm:p-4">
            <table className="w-full table-fixed border-collapse">
              <caption className="sr-only">
                {market.name} published values for {grid.label}
              </caption>
              <thead>
                <tr>
                  {WEEKDAY_HEADS.map((day) => (
                    <th
                      key={day}
                      scope="col"
                      className="pb-1.5 text-center text-[0.6875rem] font-medium text-muted sm:text-xs"
                    >
                      <span className="sm:hidden">{day.slice(0, 1)}</span>
                      <span className="hidden sm:inline">{day}</span>
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
                                  <span className="text-subtle" aria-label="no entry">
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
                Value frequency
              </span>
            }
            description={`How often each value has been published by ${market.name} across the whole archive. Rows are tens, columns are units.`}
          />
          <div className="scroll-x p-2 sm:p-4">
            <table className="w-full min-w-[19rem] border-collapse text-center">
              <caption className="sr-only">
                {market.name}: number of times each value from 00 to 99 has been published
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="w-7 text-[0.625rem] text-subtle">
                    <span className="sr-only">Tens digit</span>
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
                          title={`${cell.value}: published ${cell.count}× (${cell.share}%)`}
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
            Counts describe {pluralize(matrix.total, "published entry", "published entries")} from{" "}
            {formatDate(range.start)} to {formatDate(range.end)}. Past frequency says nothing about
            what any market will publish next.
          </p>
        </Card>

        <p className="mt-4 text-sm text-muted">
          Looking for the raw rows instead?{" "}
          <Link href={`/history?category=${market.slug}`} className="text-accent hover:underline">
            Open {market.name} in the archive
          </Link>
          .
        </p>
      </Container>
    </>
  );
}
