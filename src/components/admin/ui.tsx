import type { ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { getT } from "@/lib/i18n";
import { Badge, type BADGE_TONES } from "@/components/ui/primitives";
import { cn } from "@/lib/utils/format";
import type { ResultStatus } from "@/types";

/* Small shared pieces of the admin chrome. Server components — the admin panel
   keeps state in the URL, so almost nothing here needs to be interactive. */

export function AdminPageHeader({
  title,
  description,
  action,
  breadcrumb,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  breadcrumb?: { href: string; label: string };
}) {
  return (
    <div className="mb-4 sm:mb-6">
      {breadcrumb ? (
        <Link
          href={breadcrumb.href}
          className="mb-1 inline-flex min-h-8 items-center text-xs text-muted hover:text-fg"
        >
          ← {breadcrumb.label}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-balance sm:text-2xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 max-w-2xl text-sm text-muted text-pretty">{description}</p>
          ) : null}
        </div>
        {action ? <div className="flex w-full flex-wrap gap-2 sm:w-auto">{action}</div> : null}
      </div>
    </div>
  );
}

const NOTICE_KEYS = [
  "created",
  "updated",
  "deleted",
  "activated",
  "deactivated",
  "bulkCreated",
  "error",
] as const;

type NoticeKey = (typeof NOTICE_KEYS)[number];

function isNotice(value: unknown): value is NoticeKey {
  return typeof value === "string" && (NOTICE_KEYS as readonly string[]).includes(value);
}

/**
 * The success (or failure) banner after a redirect.
 *
 * Carried in the URL rather than in client state, so it survives the redirect a
 * successful mutation performs and needs no toast machinery.
 */
export async function Notice({ notice, count }: { notice?: string; count?: string }) {
  if (!isNotice(notice)) return null;
  const t = await getT();
  const bad = notice === "error";

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "mb-4 flex items-start gap-2 rounded-card border px-3 py-2.5 text-sm",
        bad
          ? "border-danger/30 bg-danger-soft text-danger"
          : "border-ok/30 bg-ok-soft text-ok",
      )}
    >
      {bad ? (
        <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      ) : (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      )}
      <p className="text-pretty">
        {notice === "bulkCreated"
          ? t("admin.notices.bulkCreated", { count: count ?? "0" })
          : t(`admin.notices.${notice}`)}
      </p>
    </div>
  );
}

const RESULT_TONE: Record<ResultStatus, keyof typeof BADGE_TONES> = {
  published: "ok",
  pending: "warn",
  scheduled: "info",
};

export async function ResultStatusBadge({ status }: { status: ResultStatus }) {
  const t = await getT();
  return (
    <Badge tone={RESULT_TONE[status]}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {t(`status.${status}`)}
    </Badge>
  );
}

export async function ActiveBadge({ isActive }: { isActive: boolean }) {
  const t = await getT();
  return (
    <Badge tone={isActive ? "ok" : "neutral"}>
      {isActive ? t("admin.common.active") : t("admin.common.inactive")}
    </Badge>
  );
}

/** Wraps a genuinely tabular block so a narrow screen scrolls the table rather
 *  than the page. Card layouts are used where a row is not really tabular. */
export function TableScroller({ children }: { children: ReactNode }) {
  return <div className="scroll-x">{children}</div>;
}

export const TH = "px-3 py-2.5 text-left text-xs font-medium uppercase text-muted";
export const TD = "px-3 py-3 align-middle";
