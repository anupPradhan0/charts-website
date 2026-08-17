import { Container } from "@/components/layout/PageShell";
import { Skeleton } from "@/components/ui/primitives";
import {
  LoadingAnnouncement,
  PageHeaderSkeleton,
  ResultCardsSkeleton,
  TableCardSkeleton,
} from "@/components/ui/skeletons";

export default function ResultsLoading() {
  return (
    <>
      <LoadingAnnouncement labelKey="loading.results" />
      <PageHeaderSkeleton />
      <Container className="py-6 sm:py-8">
        <Skeleton className="mb-3 h-5 w-40 sm:mb-4" />
        <ResultCardsSkeleton count={4} />
        <div className="mt-6 sm:mt-8">
          <TableCardSkeleton rows={8} withFilters={false} />
        </div>
      </Container>
    </>
  );
}
