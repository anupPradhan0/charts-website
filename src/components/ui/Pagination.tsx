import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildQuery } from "@/lib/services/query";
import { cn } from "@/lib/utils/format";

/** Link-based pagination: works without JavaScript and keeps every filter in
 *  the URL, so any page of results is shareable and back/forward behave. */
export function Pagination({
  page,
  totalPages,
  total,
  limit,
  basePath,
  query,
}: {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  basePath: string;
  query: Record<string, unknown>;
}) {
  if (total === 0) return null;

  const href = (target: number) => `${basePath}${buildQuery(query, { page: target })}`;
  const first = (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);

  // A sliding window of at most five page numbers around the current page.
  const windowStart = Math.max(1, Math.min(page - 2, totalPages - 4));
  const windowEnd = Math.min(totalPages, Math.max(page + 2, 5));
  const pages: number[] = [];
  for (let i = windowStart; i <= windowEnd; i++) pages.push(i);

  const arrow = "inline-flex size-9 items-center justify-center rounded-lg border text-sm";

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3"
    >
      <p className="text-xs text-muted sm:text-sm" aria-live="polite">
        Showing <span className="font-medium text-fg tabular">{first}</span>–
        <span className="font-medium text-fg tabular">{last}</span> of{" "}
        <span className="font-medium text-fg tabular">{total.toLocaleString("en-GB")}</span>
      </p>

      <ul className="flex items-center gap-1">
        <li>
          {page > 1 ? (
            <Link
              href={href(page - 1)}
              rel="prev"
              aria-label="Previous page"
              className={cn(arrow, "border-line-strong text-fg hover:bg-surface-2")}
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className={cn(arrow, "border-line text-subtle opacity-50")}
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </span>
          )}
        </li>

        {pages.map((n) => (
          <li key={n} className="hidden sm:block">
            <Link
              href={href(n)}
              aria-current={n === page ? "page" : undefined}
              aria-label={`Page ${n}`}
              className={cn(
                arrow,
                "tabular",
                n === page
                  ? "border-transparent bg-accent font-semibold text-accent-fg"
                  : "border-line-strong text-fg hover:bg-surface-2",
              )}
            >
              {n}
            </Link>
          </li>
        ))}

        <li className="text-sm text-muted tabular sm:hidden">
          {page} / {totalPages}
        </li>

        <li>
          {page < totalPages ? (
            <Link
              href={href(page + 1)}
              rel="next"
              aria-label="Next page"
              className={cn(arrow, "border-line-strong text-fg hover:bg-surface-2")}
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className={cn(arrow, "border-line text-subtle opacity-50")}
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
