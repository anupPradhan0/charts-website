import { Card, Skeleton } from "@/components/ui/primitives";

/**
 * Loading states for the admin list screens.
 *
 * Only the list routes get one. A `loading.tsx` flushes the response shell, and
 * the detail routes call `notFound()` from `generateMetadata` for an id that no
 * longer exists — a boundary above them would turn that 404 into a 200.
 */

export function AdminListSkeleton({ rows = 8, tiles = 0 }: { rows?: number; tiles?: number }) {
  return (
    <div aria-busy="true">
      <div className="mb-4 sm:mb-6">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="mt-2 h-4 w-72 max-w-full" />
      </div>

      {tiles > 0 ? (
        <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: tiles }, (_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-3 h-7 w-16" />
              <Skeleton className="mt-2 h-3 w-20" />
            </Card>
          ))}
        </div>
      ) : null}

      <Card>
        <div className="border-b border-line p-4 sm:p-5">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="border-b border-line p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-11" />
            ))}
          </div>
        </div>
        <ul className="divide-y divide-line">
          {Array.from({ length: rows }, (_, i) => (
            <li key={i} className="flex items-center gap-3 p-4">
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-4 w-40 max-w-full" />
                <Skeleton className="mt-1.5 h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-20 shrink-0 rounded-full" />
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
