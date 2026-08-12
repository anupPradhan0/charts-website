import Link from "next/link";
import type { Metadata } from "next";
import { Hash, Layers, Search as SearchIcon, SearchX } from "lucide-react";
import { Container, PageHeader } from "@/components/layout/PageShell";
import { Card, CardHeader, EmptyState, buttonClass } from "@/components/ui/primitives";
import { search } from "@/lib/services/results";
import { listCategories } from "@/lib/services/categories";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  title: "Search",
  description: "Search categories, dates and published values across the whole archive.",
  alternates: { canonical: canonical("/search") },
  // A search results page has no stable content worth indexing.
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const term = q.trim().slice(0, 64);
  const hits = term ? search(term, 12) : [];
  const categories = listCategories();

  return (
    <>
      <PageHeader
        title="Search"
        description="Find a category by name, or a result by date or value. Searching “12” matches both the value 12 and any date containing it."
        breadcrumbs={[{ href: "/", label: "Home" }, { label: "Search" }]}
      />

      <Container className="py-6 sm:py-8">
        <form method="get" role="search" className="mb-5 flex max-w-xl gap-2 sm:mb-6">
          <div className="relative flex-1">
            <label htmlFor="q" className="sr-only">
              Search categories, dates and values
            </label>
            <SearchIcon
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle"
              aria-hidden="true"
            />
            <input
              id="q"
              name="q"
              type="search"
              autoFocus
              defaultValue={term}
              maxLength={64}
              placeholder="e.g. Alpha, 2026-08-12, or 42"
              className="h-11 w-full rounded-lg border border-line bg-surface pr-3 pl-9 text-base"
            />
          </div>
          <button type="submit" className={buttonClass("primary", "h-11")}>
            Search
          </button>
        </form>

        <p className="sr-only" role="status" aria-live="polite">
          {term ? `${hits.length} results for ${term}` : "Enter a search term"}
        </p>

        {!term ? (
          <Card>
            <CardHeader title="Start typing" description="Or jump straight into a category." />
            <ul className="grid gap-2 p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-4">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/categories/${c.slug}`}
                    className="flex min-h-11 items-center rounded-lg border border-line px-3 text-sm hover:bg-surface-2"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ) : hits.length === 0 ? (
          <Card>
            <EmptyState
              icon={<SearchX className="size-8" aria-hidden="true" />}
              title={`Nothing matches “${term.slice(0, 40)}”`}
              description="Try a category name, a full date such as 2026-08-12, or a two-digit value."
              action={
                <Link href="/history" className={buttonClass("secondary")}>
                  Browse the archive instead
                </Link>
              }
            />
          </Card>
        ) : (
          <Card>
            <CardHeader
              title={`${hits.length} ${hits.length === 1 ? "match" : "matches"}`}
              description={`For “${term.slice(0, 40)}”.`}
            />
            <ul className="divide-y divide-line">
              {hits.map((hit) => (
                <li key={`${hit.type}-${hit.href}-${hit.title}`}>
                  <Link
                    href={hit.href}
                    className="flex min-h-14 items-center gap-3 px-3 py-2.5 hover:bg-surface-2 sm:px-4"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-2 text-subtle">
                      {hit.type === "category" ? (
                        <Layers className="size-4" aria-hidden="true" />
                      ) : (
                        <Hash className="size-4" aria-hidden="true" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{hit.title}</span>
                      <span className="block text-xs text-muted">{hit.subtitle}</span>
                    </span>
                    {hit.value ? (
                      <span className="font-mono text-lg font-semibold tabular">{hit.value}</span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </Container>
    </>
  );
}
