import { Container } from "@/components/layout/PageShell";
import { Card, Skeleton } from "@/components/ui/primitives";

/** Skeleton for the archive while the server renders the filtered page. */
export default function HistoryLoading() {
  return (
    <>
      <div className="border-b border-line bg-surface">
        <Container className="py-6 sm:py-8">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-3 h-8 w-64" />
          <Skeleton className="mt-3 h-4 w-96 max-w-full" />
        </Container>
      </div>

      <Container className="py-8">
        <Card>
          <div className="border-b border-line px-5 py-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-2 h-4 w-48" />
          </div>
          <div className="grid gap-3 border-b border-line px-5 py-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
          <div className="divide-y divide-line">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="ml-auto h-6 w-10" />
              </div>
            ))}
          </div>
          <p className="sr-only" role="status">
            Loading results
          </p>
        </Card>
      </Container>
    </>
  );
}
