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
import { formatDate, formatDateTime, formatRelative, pluralize } from "@/lib/utils/format";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  title: "Historical Results",
  description:
    "The full result archive. Filter by category, date range and status, sort by date or value, and page through every published entry.",
  alternates: { canonical: canonical("/history") },
  openGraph: {
    title: "Historical Results · Numera",
    description: "Search and filter the complete archive of published results.",
    url: canonical("/history"),
  },
};

export const dynamic = "force-dynamic";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const query = parsePageQuery(resultQuerySchema, raw);
  const page = listResults(query);
  const categories = listCategories();
  const range = getArchiveRange();
  const lastUpdated = getLastUpdated();

  return (
    <>
      <PageHeader
        title="Historical Results"
        description={`Every entry from ${formatDate(range.start)} to ${formatDate(range.end)}, across all categories.`}
        breadcrumbs={[{ href: "/", label: "Home" }, { label: "Historical Results" }]}
        meta={
          lastUpdated ? (
            <UpdatedStamp
              timestamp={formatDateTime(lastUpdated)}
              relative={formatRelative(lastUpdated)}
            />
          ) : null
        }
      />

      <Container className="py-8">
        <Card>
          <CardHeader
            title="Archive"
            description={`${pluralize(page.total, "entry", "entries")} match the current filters.`}
            action={
              <Link href="/statistics" className="text-sm font-medium text-accent hover:underline">
                Statistics
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
            {page.total} results found, showing page {page.page} of {page.totalPages}
          </p>

          <ResultsTable
            rows={page.items}
            basePath="/history"
            query={query}
            sort={query.sort}
            emptyAction={
              <Link href="/history" className={buttonClass("secondary")}>
                Clear filters
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
