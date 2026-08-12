import Link from "next/link";
import type { Metadata } from "next";
import { Search, SearchX } from "lucide-react";
import { Container, PageHeader } from "@/components/layout/PageShell";
import { Card, EmptyState, buttonClass } from "@/components/ui/primitives";
import { CategoryCard } from "@/components/results/cards";
import { getCategorySummaries } from "@/lib/services/categories";
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
        title="Categories"
        description="Each category publishes a single value at a fixed daily slot. Open one for its own archive, statistics and chart."
        breadcrumbs={[{ href: "/", label: "Home" }, { label: "Categories" }]}
      />

      <Container className="py-8">
        <form method="get" role="search" className="mb-6 flex max-w-md gap-2">
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
              className="h-10 w-full rounded-lg border border-line bg-surface pr-3 pl-9 text-sm"
            />
          </div>
          <button type="submit" className={buttonClass("secondary")}>
            Filter
          </button>
        </form>

        <p className="sr-only" role="status" aria-live="polite">
          {summaries.length} categories shown
        </p>

        {summaries.length === 0 ? (
          <Card>
            <EmptyState
              icon={<SearchX className="size-8" aria-hidden="true" />}
              title={`No category matches “${search}”`}
              description="Check the spelling, or clear the filter to see all categories."
              action={
                <Link href="/categories" className={buttonClass("secondary")}>
                  Clear filter
                </Link>
              }
            />
          </Card>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
