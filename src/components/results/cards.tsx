import Link from "next/link";
import { ArrowUpRight, CalendarClock } from "lucide-react";
import { Badge, Card, ResultValue, StatusBadge } from "@/components/ui/primitives";
import { formatDate, formatRelative, formatSchedule, formatTime, pluralize } from "@/lib/utils/format";
import type { Category, CategorySummary, ResultEntry } from "@/types";

/**
 * Result and category cards.
 *
 * Built for a ~150px column first: the title, the value and the metadata each
 * own a full-width row rather than competing for one line, so two cards sit
 * side by side on a 390px phone without truncating anything that matters.
 *
 * Each card is a single link target — the whole surface is clickable via a
 * stretched anchor, but only one focusable element exists, so keyboard and
 * screen-reader users get one clear stop per card.
 */

export function ResultCard({
  entry,
  category,
  featured = false,
}: {
  entry: ResultEntry;
  category?: Category;
  featured?: boolean;
}) {
  return (
    <Card
      as="article"
      className="relative flex h-full flex-col p-3 transition-colors focus-within:border-accent hover:border-line-strong sm:p-4"
    >
      <h3 className="truncate text-sm font-semibold tracking-tight">
        <Link
          href={`/categories/${entry.categorySlug}`}
          className="after:absolute after:inset-0 after:content-['']"
        >
          {entry.categoryName}
          <span className="sr-only"> — open category details</span>
        </Link>
      </h3>
      {category ? (
        <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted">
          <CalendarClock className="size-3 shrink-0" aria-hidden="true" />
          {formatSchedule(category.scheduleTime)}
        </p>
      ) : null}

      <div className="my-3 flex justify-center sm:my-4">
        <ResultValue value={entry.value} size={featured ? "lg" : "md"} />
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-t border-line pt-2.5">
        <StatusBadge status={entry.status} />
        <p className="text-xs text-muted tabular">{formatDate(entry.date)}</p>
      </div>

      {/* Just the clock time: at two cards per row there is no space for the
          relative time as well, and truncating it reads as broken. */}
      <p className="mt-1 truncate text-xs text-subtle tabular">
        {entry.publishedAt ? `Published ${formatTime(entry.publishedAt)}` : "Not published yet"}
      </p>
    </Card>
  );
}

export function CategoryCard({ summary }: { summary: CategorySummary }) {
  const { category, latest, publishedCount } = summary;

  return (
    <Card
      as="article"
      className="relative flex h-full flex-col p-3 transition-colors focus-within:border-accent hover:border-line-strong sm:p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold tracking-tight">
            <Link
              href={`/categories/${category.slug}`}
              className="after:absolute after:inset-0 after:content-['']"
            >
              {category.name}
            </Link>
          </h3>
          <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted">
            <CalendarClock className="size-3 shrink-0" aria-hidden="true" />
            {formatSchedule(category.scheduleTime)} · {category.updateFrequency}
          </p>
        </div>
        <ResultValue value={latest?.value ?? null} size="sm" />
      </div>

      <p className="mt-2.5 line-clamp-2 text-sm text-muted text-pretty">{category.description}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-2.5">
        <Badge tone={category.status === "active" ? "ok" : "neutral"}>
          {category.status === "active" ? "Active" : "Paused"}
        </Badge>
        <Badge tone="neutral">{pluralize(publishedCount, "entry", "entries")}</Badge>
        <span className="ml-auto flex items-center gap-0.5 text-xs font-medium text-accent">
          View
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </span>
      </div>
    </Card>
  );
}

/** Compact row used in the "recently published" rail. */
export function RecentResultRow({ entry }: { entry: ResultEntry }) {
  return (
    <li className="relative flex min-h-14 items-center gap-3 px-3 py-2.5 transition-colors focus-within:bg-surface-2 hover:bg-surface-2 sm:px-4">
      <ResultValue value={entry.value} size="sm" className="w-9 shrink-0 text-center" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          <Link
            href={`/categories/${entry.categorySlug}`}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {entry.categoryName}
          </Link>
        </p>
        <p className="text-xs text-muted tabular">{formatDate(entry.date)}</p>
      </div>
      <p className="shrink-0 text-right text-xs text-muted tabular">
        {formatTime(entry.publishedAt)}
        <span className="block text-subtle">{formatRelative(entry.publishedAt)}</span>
      </p>
    </li>
  );
}
