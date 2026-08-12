import { Container } from "@/components/layout/PageShell";
import {
  LoadingAnnouncement,
  PageHeaderSkeleton,
  TableCardSkeleton,
} from "@/components/ui/skeletons";

export default function HistoryLoading() {
  return (
    <>
      <LoadingAnnouncement label="Loading historical results" />
      <PageHeaderSkeleton />
      <Container className="py-6 sm:py-8">
        <TableCardSkeleton />
      </Container>
    </>
  );
}
