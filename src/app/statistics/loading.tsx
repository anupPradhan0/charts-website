import { Container } from "@/components/layout/PageShell";
import { Skeleton } from "@/components/ui/primitives";
import {
  ChartCardSkeleton,
  LoadingAnnouncement,
  PageHeaderSkeleton,
  StatTilesSkeleton,
} from "@/components/ui/skeletons";

export default function StatisticsLoading() {
  return (
    <>
      <LoadingAnnouncement label="Loading statistics" />
      <PageHeaderSkeleton />
      <Container className="py-6 sm:py-8">
        <Skeleton className="mb-5 h-40 rounded-card sm:mb-6 sm:h-20" />
        <div className="mb-6 sm:mb-8">
          <StatTilesSkeleton />
        </div>
        <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <ChartCardSkeleton />
          </div>
          <ChartCardSkeleton />
          <ChartCardSkeleton />
        </div>
      </Container>
    </>
  );
}
