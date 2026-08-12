import Link from "next/link";
import type { Metadata } from "next";
import { Hash, Layers, Search as SearchIcon, SearchX } from "lucide-react";
import { Container, PageHeader } from "@/components/layout/PageShell";
import { Card, CardHeader, EmptyState, buttonClass } from "@/components/ui/primitives";
import { search } from "@/lib/services/results";
import { listCategories } from "@/lib/services/categories";
import { canonical } from "@/lib/site";
import { createFormatter } from "@/lib/utils/format";
import { getLocale, getT } from "@/lib/i18n";
import { categoryName, localized } from "@/lib/i18n/localize";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("searchPage.title"),
    description: t("searchPage.metaDescription"),
    alternates: { canonical: canonical("/search") },
    // A search results page has no stable content worth indexing.
    robots: { index: false, follow: true },
  };
}

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const t = await getT();
  const locale = await getLocale();
  const fmt = createFormatter(t);
  const { q = "" } = await searchParams;
  const term = q.trim().slice(0, 64);
  const hits = term ? search(term, 12) : [];
  const categories = listCategories();

  return (
    <>
      <PageHeader
        title={t("searchPage.title")}
        description={t("searchPage.description")}
        breadcrumbs={[{ href: "/", label: t("nav.home") }, { label: t("searchPage.title") }]}
      />

      <Container className="py-6 sm:py-8">
        <form method="get" role="search" className="mb-5 flex max-w-xl gap-2 sm:mb-6">
          <div className="relative flex-1">
            <label htmlFor="q" className="sr-only">
              {t("searchPage.inputLabel")}
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
              placeholder={t("searchPage.placeholder")}
              className="h-11 w-full rounded-lg border border-line bg-surface pr-3 pl-9 text-base"
            />
          </div>
          <button type="submit" className={buttonClass("primary", "h-11")}>
            {t("searchPage.button")}
          </button>
        </form>

        <p className="sr-only" role="status" aria-live="polite">
          {term
            ? t("searchPage.resultsFor", { count: fmt.number(hits.length), term })
            : t("searchPage.enterTerm")}
        </p>

        {!term ? (
          <Card>
            <CardHeader title={t("searchPage.startTyping")} description={t("searchPage.startTypingHint")} />
            <ul className="grid gap-2 p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-4">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/categories/${c.slug}`}
                    className="flex min-h-11 items-center rounded-lg border border-line px-3 text-sm hover:bg-surface-2"
                  >
                    {localized(c.name, locale)}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ) : hits.length === 0 ? (
          <Card>
            <EmptyState
              icon={<SearchX className="size-8" aria-hidden="true" />}
              title={t("searchPage.noMatch", { term: term.slice(0, 40) })}
              description={t("searchPage.noMatchHint")}
              action={
                <Link href="/history" className={buttonClass("secondary")}>
                  {t("searchPage.browseArchive")}
                </Link>
              }
            />
          </Card>
        ) : (
          <Card>
            <CardHeader
              title={t.plural("searchPage.match", hits.length, { count: fmt.number(hits.length) })}
              description={t("searchPage.forTerm", { term: term.slice(0, 40) })}
            />
            <ul className="divide-y divide-line">
              {hits.map((hit) => (
                <li key={`${hit.type}-${hit.href}`}>
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
                      <span className="block truncate text-sm font-medium">
                        {hit.type === "category"
                          ? categoryName(hit.slug, locale)
                          : `${categoryName(hit.slug, locale)} — ${hit.date ? fmt.date(hit.date) : ""}`}
                      </span>
                      <span className="block text-xs text-muted">
                        {hit.type === "category"
                          ? t("searchPage.hitCategory", { slot: fmt.schedule(hit.scheduleTime ?? "00:00") })
                          : hit.status === "published"
                            ? t("searchPage.hitPublished")
                            : t("searchPage.hitStatus", {
                                status: t(`status.${hit.status ?? "pending"}`),
                              })}
                      </span>
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
