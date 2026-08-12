import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardHeader, buttonClass } from "@/components/ui/primitives";
import { Container, PageHeader, UpdatedStamp } from "@/components/layout/PageShell";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { ResultsTable } from "@/components/tables/ResultsTable";
import { Pagination } from "@/components/ui/Pagination";
import { listCategories } from "@/lib/services/categories";
import { getLastUpdated, listResults } from "@/lib/services/results";
import { parsePageQuery, resultQuerySchema } from "@/lib/services/query";
import { getArchiveRange } from "@/lib/data/results";
import { createFormatter } from "@/lib/utils/format";
import { getT } from "@/lib/i18n";
import { canonical } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("history.title"),
    description: t("history.metaDescription"),
    alternates: { canonical: canonical("/history") },
    openGraph: {
      title: `${t("history.title")} · ${t("meta.brand")}`,
      description: t("history.metaDescription"),
      url: canonical("/history"),
    },
  };
}

export const dynamic = "force-dynamic";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const t = await getT();
  const fmt = createFormatter(t);
  const raw = await searchParams;
  const query = parsePageQuery(resultQuerySchema, raw);
  const page = listResults(query);
  const categories = listCategories();
  const range = getArchiveRange();
  const lastUpdated = getLastUpdated();

  return (
    <>
      <PageHeader
        title={t("history.title")}
        description={t("history.description", {
          start: fmt.date(range.start),
          end: fmt.date(range.end),
        })}
        breadcrumbs={[{ href: "/", label: t("nav.home") }, { label: t("history.title") }]}
        meta={
          lastUpdated ? (
            <UpdatedStamp
              timestamp={fmt.dateTime(lastUpdated)}
              relative={fmt.relative(lastUpdated)}
            />
          ) : null
        }
      />

      <Container className="py-6 sm:py-8">
        <Card>
          <CardHeader
            title={t("history.archive")}
            description={t("history.matching", {
              count: t.plural("common.entry", page.total, { count: fmt.number(page.total) }),
            })}
            action={
              <Link href="/statistics" className="text-sm font-medium text-accent hover:underline">
                {t("nav.statistics")}
              </Link>
            }
          />

          <FilterPanel
            basePath="/history"
            categories={categories}
            min={range.start}
            max={range.end}
            defaults={{
              search: query.search ?? "",
              category: query.category ?? "",
              status: query.status ?? "",
              startDate: query.startDate ?? "",
              endDate: query.endDate ?? "",
              sort: query.sort,
            }}
          />

          <p className="sr-only" role="status" aria-live="polite">
            {t("history.statusMessage", {
              count: fmt.number(page.total),
              page: fmt.number(page.page),
              pages: fmt.number(page.totalPages),
            })}
          </p>

          <ResultsTable
            rows={page.items}
            basePath="/history"
            query={query}
            sort={query.sort}
            emptyAction={
              <Link href="/history" className={buttonClass("secondary")}>
                {t("common.clearFilters")}
              </Link>
            }
          />

          <Pagination
            page={page.page}
            totalPages={page.totalPages}
            total={page.total}
            limit={page.limit}
            basePath="/history"
            query={query}
          />
        </Card>
      </Container>
    </>
  );
}
