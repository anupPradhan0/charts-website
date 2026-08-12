import Link from "next/link";
import type { Metadata } from "next";
import { Search, SearchX } from "lucide-react";
import { Container, PageHeader } from "@/components/layout/PageShell";
import { Card, EmptyState, buttonClass } from "@/components/ui/primitives";
import { CategoryCard } from "@/components/results/cards";
import { getCategorySummaries } from "@/lib/services/categories";
import { MARKET_GROUPS } from "@/types";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Every result category, its publication schedule, its most recent value and how many entries it has in the archive.",
  alternates: { canonical: canonical("/categories") },
  openGraph: {
    title: "Categories · Numera",
    description: "Browse every result category and its publication schedule.",
    url: canonical("/categories"),
  },
};

export const dynamic = "force-dynamic";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search = "" } = await searchParams;
  const term = search.trim().toLowerCase();
  const all = getCategorySummaries();
  const summaries = term
    ? all.filter(
        (s) =>
          s.category.name.toLowerCase().includes(term) || s.category.slug.includes(term),
      )
    : all;

  return (
    <>
      <PageHeader
        title="Markets"
        description="Every market, grouped by when it publishes. Open one for its own archive, statistics and charts."
        breadcrumbs={[{ href: "/", label: "Home" }, { label: "Categories" }]}
      />

      <Container className="py-6 sm:py-8">
        <form method="get" role="search" className="mb-5 flex max-w-md gap-2 sm:mb-6">
          <div className="relative flex-1">
            <label htmlFor="category-search" className="sr-only">
              Filter categories by name
            </label>
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle"
              aria-hidden="true"
            />
            <input
              id="category-search"
              type="search"
              name="search"
              defaultValue={search}
              placeholder="Filter categories…"
              className="h-11 w-full rounded-lg border border-line bg-surface pr-3 pl-9 text-base sm:h-10 sm:text-sm"
            />
          </div>
          <button type="submit" className={buttonClass("secondary")}>
            Filter
          </button>
        </form>

        <p className="sr-only" role="status" aria-live="polite">
          {summaries.length} categories shown
        </p>

        {summaries.length > 0 && !term ? (
          <div className="space-y-6 sm:space-y-8">
            {MARKET_GROUPS.map((group) => {
              const inGroup = summaries.filter((s) => s.category.group === group.value);
              if (inGroup.length === 0) return null;
              return (
                <section key={group.value} aria-labelledby={`markets-${group.value}`}>
                  <div className="mb-3 sm:mb-4">
                    <h2
                      id={`markets-${group.value}`}
                      className="text-base font-semibold tracking-tight sm:text-lg"
                    >
                      {group.label}
                      <span className="ml-2 text-sm font-normal text-muted tabular">
                        ({inGroup.length})
                      </span>
                    </h2>
                    <p className="mt-1 text-sm text-muted text-pretty">{group.blurb}</p>
                  </div>
                  <ul className="grid gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4">
                    {inGroup.map((summary) => (
                      <li key={summary.category.id}>
                        <CategoryCard summary={summary} />
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        ) : summaries.length === 0 ? (
          <Card>
            <EmptyState
              icon={<SearchX className="size-8" aria-hidden="true" />}
              title={`No category matches “${search.slice(0, 40)}”`}
              description="Check the spelling, or clear the filter to see all categories."
              action={
                <Link href="/categories" className={buttonClass("secondary")}>
                  Clear filter
                </Link>
              }
            />
          </Card>
        ) : (
          <ul className="grid gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4">
            {summaries.map((summary) => (
              <li key={summary.category.id}>
                <CategoryCard summary={summary} />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </>
  );
}
