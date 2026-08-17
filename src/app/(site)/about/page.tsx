import Link from "next/link";
import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/layout/PageShell";
import { Card, CardHeader } from "@/components/ui/primitives";
import { getCoverageDays } from "@/lib/data/snapshot";
import { listCategories } from "@/lib/services/categories";
import { createFormatter } from "@/lib/utils/format";
import { getLocale, getT } from "@/lib/i18n";
import { localized } from "@/lib/i18n/localize";
import { MARKET_GROUPS } from "@/types";
import { canonical } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("nav.about"),
    description: t("about.metaDescription"),
    alternates: { canonical: canonical("/about") },
    openGraph: {
      title: `${t("nav.about")} · ${t("meta.brand")}`,
      description: t("about.metaDescription"),
      url: canonical("/about"),
    },
  };
}

export default async function AboutPage() {
  const t = await getT();
  const locale = await getLocale();
  const fmt = createFormatter(t);
  const categories = await listCategories();
  const archiveDays = await getCoverageDays();

  const sections = [
    { heading: t("about.whatItIs"), body: t.list("about.whatItIsBody", { days: fmt.number(archiveDays) }) },
    { heading: t("about.whatItIsNot"), body: t.list("about.whatItIsNotBody") },
    { heading: t("about.whereData"), body: t.list("about.whereDataBody") },
  ];

  return (
    <>
      <PageHeader
        title={t("about.title")}
        description={t("meta.tagline")}
        breadcrumbs={[{ href: "/", label: t("nav.home") }, { label: t("nav.about") }]}
      />

      <Container className="py-6 sm:py-8">
        <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
          <div className="space-y-3 sm:space-y-4 lg:col-span-2">
            {sections.map((section) => (
              <Card key={section.heading} className="p-4 sm:p-6">
                <h2 className="text-lg font-semibold tracking-tight text-pretty">
                  {section.heading}
                </h2>
                <div className="mt-3 space-y-3 text-sm text-muted text-pretty">
                  {section.body.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </Card>
            ))}

            <p className="text-sm text-muted text-pretty">
              {t("about.seeAlso")}{" "}
              <Link href="/faqs" className="text-accent hover:underline">
                {t("nav.faqs")}
              </Link>
              {" · "}
              <Link href="/disclaimer" className="text-accent hover:underline">
                {t("nav.disclaimer")}
              </Link>
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <Card>
              <CardHeader
                title={t("about.scheduleTitle")}
                description={t("about.scheduleHint", {
                  markets: fmt.number(categories.length),
                  groups: fmt.number(MARKET_GROUPS.length),
                })}
              />
              <ul className="divide-y divide-line text-sm">
                {categories.map((category) => (
                  <li
                    key={category.id}
                    className="flex min-h-11 items-baseline justify-between gap-3 px-4 py-2.5"
                  >
                    <Link
                      href={`/categories/${category.slug}`}
                      className="truncate text-accent hover:underline"
                    >
                      {localized(category.name, locale)}
                    </Link>
                    <span className="shrink-0 tabular text-muted">
                      {fmt.schedule(category.scheduleTime)}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <CardHeader title={t("about.statusTitle")} />
              <dl className="space-y-3 p-4 text-sm text-pretty">
                <div>
                  <dt className="font-medium">{t("status.published")}</dt>
                  <dd className="text-muted">{t("about.statusPublished")}</dd>
                </div>
                <div>
                  <dt className="font-medium">{t("status.pending")}</dt>
                  <dd className="text-muted">{t("about.statusPending")}</dd>
                </div>
                <div>
                  <dt className="font-medium">{t("status.scheduled")}</dt>
                  <dd className="text-muted">{t("about.statusScheduled")}</dd>
                </div>
              </dl>
            </Card>

            <Card>
              <CardHeader title={t("about.apiTitle")} description={t("about.apiHint")} />
              <ul className="space-y-1 p-4 font-mono text-xs text-muted break-anywhere" lang="en">
                <li>GET /api/categories</li>
                <li>GET /api/categories/[slug]</li>
                <li>GET /api/results</li>
                <li>GET /api/results/[id]</li>
                <li>GET /api/history</li>
                <li>GET /api/statistics</li>
              </ul>
            </Card>
          </div>
        </div>
      </Container>
    </>
  );
}
