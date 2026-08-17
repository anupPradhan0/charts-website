import Link from "next/link";
import { ArrowDown, ArrowUp, ChevronsUpDown, SearchX } from "lucide-react";
import { EmptyState, ResultValue } from "@/components/ui/primitives";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { buildQuery } from "@/lib/services/query";
import { cn, createFormatter, type Formatter } from "@/lib/utils/format";
import { getLocale, getT } from "@/lib/i18n";
import { categoryNamer } from "@/lib/services/categories";
import type { Translator } from "@/lib/i18n/core";
import type { ResultEntry } from "@/types";
import type { ResultQuery } from "@/lib/services/query";

/**
 * The archive table.
 *
 * Below `md` the rows become cards. A five-column table on a 360px screen is
 * not a table anyone can read, and squeezing it would only produce a scrollbar
 * over unreadable text — so the same rows are laid out vertically instead,
 * with the value kept large and to the right where the thumb is.
 *
 * From `md` it is a real <table> with sortable headers (plain links, so
 * sorting survives a refresh and is shareable), inside a scroll container so a
 * narrow tablet scrolls the table rather than the page.
 */

type SortValue = ResultQuery["sort"];

function SortableHeader({
  t,
  label,
  asc,
  desc,
  sort,
  basePath,
  query,
  className,
}: {
  t: Translator;
  label: string;
  asc: SortValue;
  desc: SortValue;
  sort: SortValue;
  basePath: string;
  query: Record<string, unknown>;
  className?: string;
}) {
  const isAsc = sort === asc;
  const isDesc = sort === desc;
  const next = isDesc ? asc : desc;
  const Icon = isAsc ? ArrowUp : isDesc ? ArrowDown : ChevronsUpDown;

  return (
    <th
      scope="col"
      aria-sort={isAsc ? "ascending" : isDesc ? "descending" : "none"}
      className={cn("px-4 py-2.5 text-left font-medium", className)}
    >
      <Link
        href={`${basePath}${buildQuery(query, { sort: next, page: 1 })}`}
        className="inline-flex min-h-9 items-center gap-1 rounded hover:text-fg"
      >
        {label}
        <Icon
          className={cn("size-3.5", isAsc || isDesc ? "text-accent" : "text-subtle")}
          aria-hidden="true"
        />
        <span className="sr-only">
          {isDesc ? t("table.sortedDescending") : isAsc ? t("table.sortedAscending") : ""}{" "}
          {next === asc ? t("table.sortAscending") : t("table.sortDescending")}
        </span>
      </Link>
    </th>
  );
}

/** Mobile sort control: the desktop column headers are gone, so sorting needs
 *  its own affordance. Plain links, same URLs the headers use. */
function MobileSortBar({
  t,
  sort,
  basePath,
  query,
}: {
  t: Translator;
  sort: SortValue;
  basePath: string;
  query: Record<string, unknown>;
}) {
  const options: { value: SortValue; label: string }[] = [
    { value: "date_desc", label: t("sort.chipNewest") },
    { value: "date_asc", label: t("sort.chipOldest") },
    { value: "value_desc", label: t("sort.chipValueHigh") },
    { value: "value_asc", label: t("sort.chipValueLow") },
    { value: "category_asc", label: t("sort.chipAZ") },
  ];

  return (
    <div className="scroll-x border-b border-line md:hidden">
      <ul className="flex w-max gap-1.5 px-3 py-2">
        {options.map((option) => (
          <li key={option.value}>
            <Link
              href={`${basePath}${buildQuery(query, { sort: option.value, page: 1 })}`}
              aria-current={sort === option.value ? "true" : undefined}
              className={cn(
                "inline-flex min-h-9 items-center rounded-full border px-3 text-xs font-medium whitespace-nowrap",
                sort === option.value
                  ? "border-transparent bg-accent text-accent-fg"
                  : "border-line text-muted",
              )}
            >
              {option.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function ResultsTable({
  rows,
  basePath,
  query,
  sort,
  showCategory = true,
  caption,
  emptyTitle,
  emptyDescription,
  emptyAction,
}: {
  rows: ResultEntry[];
  basePath: string;
  query: Record<string, unknown>;
  sort: SortValue;
  showCategory?: boolean;
  caption?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
}) {
  const t = await getT();
  const locale = await getLocale();
  const fmt: Formatter = createFormatter(t);
  const nameOf = await categoryNamer(locale);

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={<SearchX className="size-8" aria-hidden="true" />}
        title={emptyTitle ?? t("history.emptyTitle")}
        description={emptyDescription ?? t("history.emptyHint")}
        action={emptyAction}
      />
    );
  }

  return (
    <>
      <MobileSortBar t={t} sort={sort} basePath={basePath} query={query} />

      {/* Desktop / tablet */}
      <div className="scroll-x hidden md:block">
        <table className="w-full min-w-[38rem] border-collapse text-sm">
          <caption className="sr-only">{caption ?? t("history.caption")}</caption>
          <thead className="border-b border-line bg-surface-2 text-xs text-muted uppercase">
            <tr>
              <SortableHeader
                t={t}
                label={t("table.date")}
                asc="date_asc"
                desc="date_desc"
                sort={sort}
                basePath={basePath}
                query={query}
              />
              {showCategory ? (
                <SortableHeader
                    t={t}
                  label={t("table.market")}
                  asc="category_asc"
                  desc="category_asc"
                  sort={sort}
                  basePath={basePath}
                  query={query}
                />
              ) : null}
              <SortableHeader
                t={t}
                label={t("table.result")}
                asc="value_asc"
                desc="value_desc"
                sort={sort}
                basePath={basePath}
                query={query}
                className="text-center"
              />
              <th scope="col" className="px-4 py-2.5 text-left font-medium">
                {t("table.status")}
              </th>
              <th scope="col" className="px-4 py-2.5 text-right font-medium">
                {t("table.published")}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-line last:border-0 hover:bg-surface-2">
                <th scope="row" className="px-4 py-3 text-left font-medium whitespace-nowrap">
                  <span className="tabular">{fmt.date(row.date)}</span>
                  <span className="block text-xs font-normal text-muted">
                    {fmt.weekday(row.date)}
                  </span>
                </th>
                {showCategory ? (
                  <td className="px-4 py-3">
                    <Link
                      href={`/categories/${row.categorySlug}`}
                      className="font-medium text-accent hover:underline"
                    >
                      {nameOf(row.categorySlug)}
                    </Link>
                  </td>
                ) : null}
                <td className="px-4 py-3 text-center">
                  <ResultValue value={row.value} size="sm" />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap tabular text-muted">
                  {fmt.time(row.publishedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: one card per row, value kept prominent */}
      <ul className="divide-y divide-line md:hidden">
        {rows.map((row) => (
          <li key={row.id} className="flex items-center gap-3 px-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium tabular">
                {fmt.date(row.date)}
                <span className="ml-1.5 text-xs font-normal text-subtle">
                  {fmt.weekdayShort(row.date)}
                </span>
              </p>
              {showCategory ? (
                <p className="truncate text-sm">
                  <Link
                    href={`/categories/${row.categorySlug}`}
                    className="-mx-1 inline-flex min-h-8 items-center px-1 text-accent"
                  >
                    {nameOf(row.categorySlug)}
                  </Link>
                </p>
              ) : null}
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                <StatusBadge status={row.status} />
                {row.publishedAt ? (
                  <span className="text-xs text-muted tabular">{fmt.time(row.publishedAt)}</span>
                ) : null}
              </p>
            </div>
            <ResultValue value={row.value} size="md" className="shrink-0" />
          </li>
        ))}
      </ul>
    </>
  );
}
