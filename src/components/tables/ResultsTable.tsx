import Link from "next/link";
import { ArrowDown, ArrowUp, ChevronsUpDown, SearchX } from "lucide-react";
import { EmptyState, ResultValue, StatusBadge } from "@/components/ui/primitives";
import { buildQuery } from "@/lib/services/query";
import { cn, formatDate, formatTime, formatWeekday } from "@/lib/utils/format";
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
  label,
  asc,
  desc,
  sort,
  basePath,
  query,
  className,
}: {
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
          {isDesc ? "sorted descending, " : isAsc ? "sorted ascending, " : ""}
          sort {next === asc ? "ascending" : "descending"}
        </span>
      </Link>
    </th>
  );
}

/** Mobile sort control: the desktop column headers are gone, so sorting needs
 *  its own affordance. Plain links, same URLs the headers use. */
function MobileSortBar({
  sort,
  basePath,
  query,
}: {
  sort: SortValue;
  basePath: string;
  query: Record<string, unknown>;
}) {
  const options: { value: SortValue; label: string }[] = [
    { value: "date_desc", label: "Newest" },
    { value: "date_asc", label: "Oldest" },
    { value: "value_desc", label: "Value ↓" },
    { value: "value_asc", label: "Value ↑" },
    { value: "category_asc", label: "A–Z" },
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

export function ResultsTable({
  rows,
  basePath,
  query,
  sort,
  showCategory = true,
  caption = "Historical results",
  emptyTitle = "No results match these filters",
  emptyDescription = "Try widening the date range, choosing a different category, or clearing the search term.",
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
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={<SearchX className="size-8" aria-hidden="true" />}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <>
      <MobileSortBar sort={sort} basePath={basePath} query={query} />

      {/* Desktop / tablet */}
      <div className="scroll-x hidden md:block">
        <table className="w-full min-w-[38rem] border-collapse text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="border-b border-line bg-surface-2 text-xs text-muted uppercase">
            <tr>
              <SortableHeader
                label="Date"
                asc="date_asc"
                desc="date_desc"
                sort={sort}
                basePath={basePath}
                query={query}
              />
              {showCategory ? (
                <SortableHeader
                  label="Category"
                  asc="category_asc"
                  desc="category_asc"
                  sort={sort}
                  basePath={basePath}
                  query={query}
                />
              ) : null}
              <SortableHeader
                label="Result"
                asc="value_asc"
                desc="value_desc"
                sort={sort}
                basePath={basePath}
                query={query}
                className="text-center"
              />
              <th scope="col" className="px-4 py-2.5 text-left font-medium">
                Status
              </th>
              <th scope="col" className="px-4 py-2.5 text-right font-medium">
                Published
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-line last:border-0 hover:bg-surface-2">
                <th scope="row" className="px-4 py-3 text-left font-medium whitespace-nowrap">
                  <span className="tabular">{formatDate(row.date)}</span>
                  <span className="block text-xs font-normal text-muted">
                    {formatWeekday(row.date)}
                  </span>
                </th>
                {showCategory ? (
                  <td className="px-4 py-3">
                    <Link
                      href={`/categories/${row.categorySlug}`}
                      className="font-medium text-accent hover:underline"
                    >
                      {row.categoryName}
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
                  {formatTime(row.publishedAt)}
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
                {formatDate(row.date)}
                <span className="ml-1.5 text-xs font-normal text-subtle">
                  {formatWeekday(row.date).slice(0, 3)}
                </span>
              </p>
              {showCategory ? (
                <p className="truncate text-sm">
                  <Link
                    href={`/categories/${row.categorySlug}`}
                    className="-mx-1 inline-flex min-h-8 items-center px-1 text-accent"
                  >
                    {row.categoryName}
                  </Link>
                </p>
              ) : null}
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                <StatusBadge status={row.status} />
                {row.publishedAt ? (
                  <span className="text-xs text-muted tabular">{formatTime(row.publishedAt)}</span>
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
