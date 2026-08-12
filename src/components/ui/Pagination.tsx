import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildQuery } from "@/lib/services/query";
import { cn, createFormatter } from "@/lib/utils/format";
import { getT } from "@/lib/i18n";

/** Link-based pagination: works without JavaScript and keeps every filter in
 *  the URL, so any page of results is shareable and back/forward behave. */
export async function Pagination({
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

  const t = await getT();
  const fmt = createFormatter(t);

  const href = (target: number) => `${basePath}${buildQuery(query, { page: target })}`;
  const first = (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);

  // A sliding window of at most five page numbers around the current page.
  const windowStart = Math.max(1, Math.min(page - 2, totalPages - 4));
  const windowEnd = Math.min(totalPages, Math.max(page + 2, 5));
  const pages: number[] = [];
  for (let i = windowStart; i <= windowEnd; i++) pages.push(i);

  // 44px targets on touch, 36px once there is a pointer and more room.
  const arrow =
    "inline-flex size-11 items-center justify-center rounded-lg border text-sm sm:size-9";

  return (
    <nav
      aria-label={t("pagination.label")}
      className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-line px-4 py-3"
    >
      <p className="text-xs text-muted tabular sm:text-sm" aria-live="polite">
        {t("pagination.showing", {
          first: fmt.number(first),
          last: fmt.number(last),
          total: fmt.number(total),
        })}
      </p>

      <ul className="flex items-center gap-1.5 sm:gap-1">
        <li>
          {page > 1 ? (
            <Link
              href={href(page - 1)}
              rel="prev"
              aria-label={t("pagination.previousPage")}
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
              aria-label={t("pagination.pageNumber", { page: n })}
              className={cn(
                arrow,
                "tabular",
                n === page
                  ? "border-transparent bg-accent font-semibold text-accent-fg"
                  : "border-line-strong text-fg hover:bg-surface-2",
              )}
            >
              {fmt.number(n)}
            </Link>
          </li>
        ))}

        <li className="px-1 text-sm font-medium text-muted tabular sm:hidden">
          {fmt.number(page)} / {fmt.number(totalPages)}
        </li>

        <li>
          {page < totalPages ? (
            <Link
              href={href(page + 1)}
              rel="next"
              aria-label={t("pagination.nextPage")}
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
