import Link from "next/link";
import { Container } from "@/components/layout/PageShell";
import { Card, EmptyState, buttonClass } from "@/components/ui/primitives";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <Container className="py-16">
      <Card className="mx-auto max-w-lg">
        <EmptyState
          title="Page not found"
          description="That page does not exist. It may have been a category that has since been removed."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/" className={buttonClass("primary")}>
                Homepage
              </Link>
              <Link href="/categories" className={buttonClass("secondary")}>
                All categories
              </Link>
              <Link href="/history" className={buttonClass("secondary")}>
                Archive
              </Link>
            </div>
          }
        />
      </Card>
    </Container>
  );
}
