import { Container } from "@/components/layout/PageShell";
import { Card, Skeleton } from "@/components/ui/primitives";
import { getT } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/core";

/**
 * Loading skeletons.
 *
 * These mirror the real responsive layout at every breakpoint — same grid
 * columns, same paddings, same heights — so the switch from placeholder to
 * content does not move anything on the page.
 */

export function PageHeaderSkeleton({ withMeta = true }: { withMeta?: boolean }) {
  return (
    <div className="border-b border-line bg-surface">
      <Container className="py-4 sm:py-8">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-3 h-7 w-56 max-w-full sm:h-8 sm:w-72" />
        <Skeleton className="mt-2.5 h-4 w-full max-w-lg" />
        {withMeta ? <Skeleton className="mt-3 h-4 w-48 sm:mt-4" /> : null}
      </Container>
    </div>
  );
}

/** Matches the 2-up stat tile grid used on phones. */
export function StatTilesSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className="h-[86px] rounded-card sm:h-[98px]" />
      ))}
    </div>
  );
}

/** Matches the result-card board: 1 column under 380px, then 2, then 4. */
export function ResultCardsSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-2.5 min-[380px]:grid-cols-2 sm:gap-3 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className="h-[164px] rounded-card sm:h-[180px]" />
      ))}
    </div>
  );
}

export function CategoryCardsSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className="h-[168px] rounded-card" />
      ))}
    </div>
  );
}

export function ChartCardSkeleton({ title = true }: { title?: boolean }) {
  return (
    <Card>
      {title ? (
        <div className="border-b border-line px-4 py-3 sm:px-5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-2 h-3 w-56 max-w-full" />
        </div>
      ) : null}
      <div className="p-2 sm:p-4">
        <Skeleton className="h-[220px] w-full sm:h-[260px]" />
      </div>
    </Card>
  );
}

/** Filter panel + rows. Below `md` the rows are cards, so the skeleton is too. */
export function TableCardSkeleton({
  rows = 8,
  withFilters = true,
}: {
  rows?: number;
  withFilters?: boolean;
}) {
  return (
    <Card>
      <div className="border-b border-line px-4 py-3 sm:px-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-2 h-3 w-44" />
      </div>

      {withFilters ? (
        <div className="border-b border-line px-4 py-3 lg:px-5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-11 w-24 rounded-lg lg:hidden" />
          </div>
          <div className="mt-3 hidden gap-3 lg:grid lg:grid-cols-4 xl:grid-cols-6">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </div>
      ) : null}

      <div className="divide-y divide-line">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5 sm:px-4">
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="size-9 shrink-0" />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-line px-4 py-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-11 w-24 sm:h-9" />
      </div>
    </Card>
  );
}

/** Announced once for the whole page rather than per placeholder. */
export async function LoadingAnnouncement({ labelKey }: { labelKey: TranslationKey }) {
  const t = await getT();
  return (
    <p className="sr-only" role="status" aria-live="polite">
      {t(labelKey)}
    </p>
  );
}
