import Link from "next/link";
import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";
import { Container, PageHeader } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/primitives";
import { getT } from "@/lib/i18n";
import { canonical } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("nav.disclaimer"),
    description: t("disclaimer.metaDescription"),
    alternates: { canonical: canonical("/disclaimer") },
    openGraph: {
      title: `${t("nav.disclaimer")} · ${t("meta.brand")}`,
      description: t("disclaimer.metaDescription"),
      url: canonical("/disclaimer"),
    },
  };
}

export default async function DisclaimerPage() {
  const t = await getT();

  return (
    <>
      <PageHeader
        title={t("disclaimer.title")}
        description={t("disclaimer.description")}
        breadcrumbs={[{ href: "/", label: t("nav.home") }, { label: t("nav.disclaimer") }]}
      />

      <Container className="py-6 sm:py-8">
        <div className="mx-auto max-w-3xl space-y-3 sm:space-y-4">
          <Card className="flex gap-3 border-warn/40 bg-warn-soft p-4 sm:p-5">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warn" aria-hidden="true" />
            <p className="text-sm text-fg text-pretty">{t("disclaimer.warning")}</p>
          </Card>

          <Card className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold tracking-tight">{t("disclaimer.noAffiliation")}</h2>
            <p className="mt-3 text-sm text-muted text-pretty">{t("disclaimer.noAffiliationBody")}</p>
          </Card>

          <Card className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold tracking-tight">{t("disclaimer.descriptiveOnly")}</h2>
            <div className="mt-3 space-y-3 text-sm text-muted text-pretty">
              {t.list("disclaimer.descriptiveOnlyBody").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold tracking-tight">{t("disclaimer.doesNotDo")}</h2>
            <p className="mt-3 text-sm text-muted text-pretty">{t("disclaimer.doesNotDoBody")}</p>
          </Card>

          <Card className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold tracking-tight">{t("disclaimer.accuracy")}</h2>
            <p className="mt-3 text-sm text-muted text-pretty">{t("disclaimer.accuracyBody")}</p>
          </Card>

          <p className="text-sm text-muted text-pretty">
            {t("disclaimer.moreDetail")}{" "}
            <Link href="/about" className="text-accent hover:underline">
              {t("nav.about")}
            </Link>
            {" · "}
            <Link href="/faqs" className="text-accent hover:underline">
              {t("nav.faqs")}
            </Link>
          </p>
        </div>
      </Container>
    </>
  );
}
