import { Container } from "@/components/layout/PageShell";
import { Card, Skeleton } from "@/components/ui/primitives";
import { LoadingAnnouncement, PageHeaderSkeleton } from "@/components/ui/skeletons";

export default function SearchLoading() {
  return (
    <>
      <LoadingAnnouncement labelKey="loading.searching" />
      <PageHeaderSkeleton withMeta={false} />
      <Container className="py-6 sm:py-8">
        <Skeleton className="mb-5 h-11 w-full max-w-xl sm:mb-6" />
        <Card>
          <div className="divide-y divide-line">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="flex min-h-14 items-center gap-3 px-3 py-2.5 sm:px-4">
                <Skeleton className="size-9 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-40 max-w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </Container>
    </>
  );
}
