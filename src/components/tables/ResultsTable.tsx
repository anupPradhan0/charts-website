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
 * Desktop gets a real <table> with sortable column headers (plain links, so
 * sorting survives a page refresh and is shareable). Below `md` the same rows
 * are rendered as cards — a five-column table cannot be read on a phone, and
 * shrinking it would just produce a horizontal scrollbar over unreadable text.
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
        className="inline-flex items-center gap-1 rounded hover:text-fg"
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
      {/* Desktop / tablet */}
      <div className="hidden md:block">
        <table className="w-full border-collapse text-sm">
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

      {/* Mobile */}
      <ul className="divide-y divide-line md:hidden">
        {rows.map((row) => (
          <li key={row.id} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium tabular">{formatDate(row.date)}</p>
              {showCategory ? (
                <p className="truncate text-sm">
                  <Link
                    href={`/categories/${row.categorySlug}`}
                    className="text-accent hover:underline"
                  >
                    {row.categoryName}
                  </Link>
                </p>
              ) : (
                <p className="text-xs text-muted">{formatWeekday(row.date)}</p>
              )}
              <p className="mt-1.5 flex items-center gap-2">
                <StatusBadge status={row.status} />
                <span className="text-xs text-muted tabular">{formatTime(row.publishedAt)}</span>
              </p>
            </div>
            <ResultValue value={row.value} size="md" className="shrink-0" />
          </li>
        ))}
      </ul>
    </>
  );
}
