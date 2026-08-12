import Link from "next/link";
import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/primitives";
import { ARCHIVE_DAYS } from "@/lib/data/results";
import { CATEGORIES } from "@/lib/data/categories";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQs",
  description:
    "Common questions about how Numera publishes results, what the statuses mean, how the archive and charts work, and what this demonstration site is not.",
  alternates: { canonical: canonical("/faqs") },
  openGraph: {
    title: "FAQs · Numera",
    description: "How the board, the archive and the charts work.",
    url: canonical("/faqs"),
  },
};

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "What does this site publish?",
    a: (
      <>
        One numerical value per market per scheduled day, plus the archive of every value already
        published and plain statistics describing it. There are {CATEGORIES.length} markets, split
        into day, night and special groups.
      </>
    ),
  },
  {
    q: "Is any of this real data?",
    a: (
      <>
        No. Every market name, schedule and value is invented for this demonstration. Values come
        from a seeded pseudo-random function keyed on the market and the date, which is why the
        archive is reproducible — the same date always yields the same value.
      </>
    ),
  },
  {
    q: "What do Published, Pending and Scheduled mean?",
    a: (
      <>
        <strong>Scheduled</strong> means the slot is still in the future. <strong>Pending</strong>{" "}
        means the slot has passed but no value has been published yet. <strong>Published</strong>{" "}
        means a value exists and carries a publication timestamp.
      </>
    ),
  },
  {
    q: "How often does the board update?",
    a: (
      <>
        The current results page refreshes itself about once a minute while the tab is visible, and
        shows when it last updated. Every page also carries a &ldquo;last updated&rdquo; stamp so
        you can tell how fresh the data is.
      </>
    ),
  },
  {
    q: "How far back does the archive go?",
    a: (
      <>
        {ARCHIVE_DAYS} days. The{" "}
        <Link href="/history" className="text-accent hover:underline">
          historical results
        </Link>{" "}
        page lets you filter by market, date range and status, sort by date or value, and page
        through the whole set.
      </>
    ),
  },
  {
    q: "What are the two charts?",
    a: (
      <>
        The{" "}
        <Link href="/charts" className="text-accent hover:underline">
          charts page
        </Link>{" "}
        has a calendar view, which lays a month of one market&rsquo;s published values out by date,
        and a frequency grid, which counts how often each value from 00 to 99 has appeared. Both
        describe what has already happened.
      </>
    ),
  },
  {
    q: "Do the statistics predict anything?",
    a: (
      <>
        No, and they are not intended to. Every chart on this site is a summary of past data.
        Frequency counts, distributions and timings say nothing about what any market will publish
        next — each value is independent of the ones before it.
      </>
    ),
  },
  {
    q: "Why is one market paused?",
    a: (
      <>
        Express Results is paused in the demo data to show how the interface handles a market that
        has stopped publishing: its history stays browsable and searchable, but no new entries are
        added and it is marked Paused everywhere it appears.
      </>
    ),
  },
  {
    q: "Can I read this data programmatically?",
    a: (
      <>
        Yes. There is a read-only JSON API covering markets, results, history and statistics, with
        the same filtering, sorting and pagination the site uses. The endpoints are listed on the{" "}
        <Link href="/about" className="text-accent hover:underline">
          about page
        </Link>
        .
      </>
    ),
  },
];

export default function FaqsPage() {
  return (
    <>
      <PageHeader
        title="Frequently asked questions"
        description="How the board, the archive and the charts work — and what this site deliberately does not do."
        breadcrumbs={[{ href: "/", label: "Home" }, { label: "FAQs" }]}
      />

      <Container className="py-6 sm:py-8">
        <div className="mx-auto max-w-3xl space-y-2.5">
          {FAQS.map((faq, i) => (
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
          Still unclear on something? The{" "}
          <Link href="/about" className="text-accent hover:underline">
            about page
          </Link>{" "}
          covers how the data is generated, and the{" "}
          <Link href="/disclaimer" className="text-accent hover:underline">
            disclaimer
          </Link>{" "}
          sets out what this site is and is not.
        </p>
      </Container>
    </>
  );
}
