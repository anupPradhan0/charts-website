import Link from "next/link";
import { Container } from "@/components/layout/PageShell";
import { Card, EmptyState, buttonClass } from "@/components/ui/primitives";
import { getT } from "@/lib/i18n";

export async function generateMetadata() {
  const t = await getT();
  return { title: t("errors.notFoundMeta") };
}

export default async function NotFound() {
  const t = await getT();
  return (
    <Container className="py-16">
      <Card className="mx-auto max-w-lg">
        <EmptyState
          title={t("errors.notFoundTitle")}
          description={t("errors.notFoundHint")}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/" className={buttonClass("primary")}>
                {t("errors.homepage")}
              </Link>
              <Link href="/categories" className={buttonClass("secondary")}>
                {t("errors.allMarkets")}
              </Link>
              <Link href="/history" className={buttonClass("secondary")}>
                {t("errors.archive")}
              </Link>
            </div>
          }
        />
      </Card>
    </Container>
  );
}
