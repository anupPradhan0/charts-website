import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/format";

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}

function Breadcrumbs({ trail }: { trail: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-3">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-muted">
        {trail.map((crumb, i) => (
          <li key={crumb.label} className="flex items-center gap-1">
            {i > 0 ? <ChevronRight className="size-3 text-subtle" aria-hidden="true" /> : null}
            {crumb.href ? (
              <Link href={crumb.href} className="hover:text-fg">
                {crumb.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-fg">
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
export function PageHeader({
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
      <Container className="py-6 sm:py-8">
        {breadcrumbs ? <Breadcrumbs trail={breadcrumbs} /> : null}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
            {description ? (
              <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
        {meta ? <div className="mt-4 flex flex-wrap items-center gap-3">{meta}</div> : null}
      </Container>
    </div>
  );
}

/** "Last updated ..." strip shown under page headings. */
export function UpdatedStamp({
  timestamp,
  relative,
  label = "Last updated",
}: {
  timestamp: string;
  relative: string;
  label?: string;
}) {
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
      {label}: <span className="font-medium text-fg tabular">{timestamp}</span>
      <span className="text-subtle">({relative})</span>
    </p>
  );
}
