import Link from "next/link";
import { ArrowUpRight, CalendarClock, History } from "lucide-react";
import { Badge, Card, ResultValue, StatusBadge } from "@/components/ui/primitives";
import { formatDate, formatRelative, formatSchedule, formatTime, pluralize } from "@/lib/utils/format";
import type { Category, CategorySummary, ResultEntry } from "@/types";

/**
 * Result and category cards.
 *
 * Each card is a single link target: the whole surface is clickable via a
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
      className="relative flex flex-col p-4 transition-colors focus-within:border-accent hover:border-line-strong"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold tracking-tight">
          <Link
            href={`/categories/${entry.categorySlug}`}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {entry.categoryName}
            <span className="sr-only"> — open category details</span>
          </Link>
        </h3>
        <StatusBadge status={entry.status} />
      </div>

      <div className="my-4 flex items-baseline justify-center gap-2">
        <ResultValue value={entry.value} size={featured ? "lg" : "md"} />
      </div>

      <dl className="mt-auto grid grid-cols-2 gap-2 border-t border-line pt-3 text-xs">
        <div>
          <dt className="text-muted">Result date</dt>
          <dd className="font-medium tabular">{formatDate(entry.date)}</dd>
        </div>
        <div className="text-right">
          <dt className="text-muted">Published</dt>
          <dd className="font-medium tabular">{formatTime(entry.publishedAt)}</dd>
        </div>
      </dl>

      <p className="mt-2 flex items-center gap-1 text-xs text-subtle">
        <History className="size-3" aria-hidden="true" />
        Updated {formatRelative(entry.updatedAt)}
        {category ? ` · slot ${formatSchedule(category.scheduleTime)}` : null}
      </p>
    </Card>
  );
}

export function CategoryCard({ summary }: { summary: CategorySummary }) {
  const { category, latest, publishedCount } = summary;

  return (
    <Card
      as="article"
      className="relative flex h-full flex-col p-4 transition-colors focus-within:border-accent hover:border-line-strong"
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
          <p className="mt-1 flex items-center gap-1 text-xs text-muted">
            <CalendarClock className="size-3 shrink-0" aria-hidden="true" />
            {formatSchedule(category.scheduleTime)} · {category.updateFrequency}
          </p>
        </div>
        <ResultValue value={latest?.value ?? null} size="sm" />
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-muted">{category.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3">
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
    <li className="relative flex items-center gap-3 px-4 py-3 transition-colors focus-within:bg-surface-2 hover:bg-surface-2">
      <ResultValue value={entry.value} size="sm" className="w-10 shrink-0 text-center" />
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
