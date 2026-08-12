import { Container } from "@/components/layout/PageShell";
import { Skeleton } from "@/components/ui/primitives";
import {
  CategoryCardsSkeleton,
  LoadingAnnouncement,
  PageHeaderSkeleton,
} from "@/components/ui/skeletons";

export default function CategoriesLoading() {
  return (
    <>
      <LoadingAnnouncement labelKey="loading.markets" />
      <PageHeaderSkeleton withMeta={false} />
      <Container className="py-6 sm:py-8">
        <Skeleton className="mb-5 h-11 w-full max-w-md sm:mb-6" />
        <CategoryCardsSkeleton />
      </Container>
    </>
  );
}
