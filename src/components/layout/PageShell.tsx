import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getT } from "@/lib/i18n";
import { Container } from "./Container";

/** Re-exported so the many server pages that already `import { Container }
 *  from "./PageShell"` keep working. `error.tsx` (a client component) must
 *  import `Container` from `./Container` directly instead — see that file
 *  for why. */
export { Container };

async function Breadcrumbs({ trail }: { trail: { href?: string; label: string }[] }) {
  const t = await getT();
  return (
    <nav aria-label={t("nav.breadcrumb")} className="mb-3">
      <ol className="flex flex-wrap items-center gap-x-1 text-xs text-muted">
        {trail.map((crumb, i) => (
          <li key={crumb.label} className="flex items-center gap-1">
            {i > 0 ? <ChevronRight className="size-3 text-subtle" aria-hidden="true" /> : null}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="-mx-1 inline-flex min-h-8 items-center rounded px-1 hover:text-fg"
              >
                {crumb.label}
              </Link>
            ) : (
              <span aria-current="page" className="inline-flex min-h-8 items-center text-fg">
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Standard page heading block: one <h1> per page, optional meta strip. */
export async function PageHeader({
  title,
  description,
  meta,
  actions,
  breadcrumbs,
}: {
  title: string;
  description?: string;
  meta?: ReactNode;
  actions?: ReactNode;
  breadcrumbs?: { href?: string; label: string }[];
}) {
  return (
    <div className="border-b border-line bg-surface">
      <Container className="py-4 sm:py-8">
        {breadcrumbs ? <Breadcrumbs trail={breadcrumbs} /> : null}
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight text-balance sm:text-2xl lg:text-3xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-1.5 max-w-2xl text-sm text-muted text-pretty sm:mt-2 sm:text-base">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex w-full flex-wrap gap-2 sm:w-auto">{actions}</div>
          ) : null}
        </div>
        {meta ? (
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 sm:mt-4">{meta}</div>
        ) : null}
      </Container>
    </div>
  );
}

/** "Last updated ..." strip shown under page headings. */
export async function UpdatedStamp({
  timestamp,
  relative,
  label,
}: {
  timestamp: string;
  relative: string;
  label?: string;
}) {
  const t = await getT();
  return (
    <p
      className="flex items-center gap-1.5 text-xs text-muted"
      role="status"
      aria-live="polite"
    >
      <span className="relative flex size-2" aria-hidden="true">
        <span className="absolute inline-flex size-2 rounded-full bg-ok opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-ok" />
      </span>
      {label ?? t("common.lastUpdated")}: <span className="font-medium text-fg tabular">{timestamp}</span>
      <span className="text-subtle">({relative})</span>
    </p>
  );
}
