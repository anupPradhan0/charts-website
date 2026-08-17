import Link from "next/link";
import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/primitives";
import { getCoverageDays } from "@/lib/data/snapshot";
import { listCategories } from "@/lib/services/categories";
import { createFormatter } from "@/lib/utils/format";
import { getT } from "@/lib/i18n";
import { canonical } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("nav.faqs"),
    description: t("faqs.metaDescription"),
    alternates: { canonical: canonical("/faqs") },
    openGraph: {
      title: `${t("nav.faqs")} · ${t("meta.brand")}`,
      description: t("faqs.metaDescription"),
      url: canonical("/faqs"),
    },
  };
}

export default async function FaqsPage() {
  const t = await getT();
  const fmt = createFormatter(t);
  const categories = await listCategories();
  const vars = {
    markets: fmt.number(categories.length),
    days: fmt.number(await getCoverageDays()),
  };
  const faqs = Array.from({ length: 9 }, (_, i) => ({
    q: t(`faqs.q${i + 1}` as "faqs.q1"),
    a: t(`faqs.a${i + 1}` as "faqs.a1", vars),
  }));

  return (
    <>
      <PageHeader
        title={t("faqs.title")}
        description={t("faqs.description")}
        breadcrumbs={[{ href: "/", label: t("nav.home") }, { label: t("nav.faqs") }]}
      />

      <Container className="py-6 sm:py-8">
        <div className="mx-auto max-w-3xl space-y-2.5">
          {faqs.map((faq, i) => (
            <Card key={faq.q} as="article">
              {/* <details> is the native disclosure: keyboard accessible and
                  announced correctly with no JavaScript at all. */}
              <details open={i === 0} className="group">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold sm:text-base">
                  {faq.q}
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-lg leading-none text-subtle transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <div className="border-t border-line px-4 py-3 text-sm text-muted text-pretty">
                  {faq.a}
                </div>
              </details>
            </Card>
          ))}
        </div>

        <p className="mx-auto mt-6 max-w-3xl text-sm text-muted text-pretty">
          {t("faqs.stillUnclear")}{" "}
          <Link href="/about" className="text-accent hover:underline">
            {t("nav.about")}
          </Link>
          {" · "}
          <Link href="/disclaimer" className="text-accent hover:underline">
            {t("nav.disclaimer")}
          </Link>
        </p>
      </Container>
    </>
  );
}
