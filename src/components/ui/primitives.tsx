import type { ReactNode } from "react";
import { cn } from "@/lib/utils/format";
import type { ResultStatus } from "@/types";

/* Shared primitives. Server-safe: none of these carry client state. */

export function Card({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "li";
}) {
  return (
    <Tag
      className={cn(
        "rounded-card border border-line bg-surface shadow-card",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({
  title,
  description,
  action,
  as: Tag = "h2",
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  as?: "h2" | "h3";
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
      <div className="min-w-0">
        <Tag className="text-sm font-semibold tracking-tight text-fg sm:text-base">{title}</Tag>
        {description ? (
          <p className="mt-0.5 text-xs text-muted sm:text-sm">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function SectionHeader({
  title,
  description,
  action,
  id,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  id?: string;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 id={id} className="text-lg font-semibold tracking-tight sm:text-xl">
          {title}
        </h2>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

const BADGE_TONES = {
  neutral: "bg-surface-2 text-muted border-line",
  accent: "bg-accent-soft text-accent border-transparent",
  ok: "bg-ok-soft text-ok border-transparent",
  warn: "bg-warn-soft text-warn border-transparent",
  info: "bg-info-soft text-info border-transparent",
  danger: "bg-danger-soft text-danger border-transparent",
} as const;

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof BADGE_TONES;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        BADGE_TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const STATUS_TONE: Record<ResultStatus, keyof typeof BADGE_TONES> = {
  published: "ok",
  pending: "warn",
  scheduled: "info",
};

const STATUS_LABEL: Record<ResultStatus, string> = {
  published: "Published",
  pending: "Pending",
  scheduled: "Scheduled",
};

export function StatusBadge({ status }: { status: ResultStatus }) {
  return (
    <Badge tone={STATUS_TONE[status]}>
      <span
        aria-hidden="true"
        className="size-1.5 rounded-full bg-current"
      />
      {STATUS_LABEL[status]}
    </Badge>
  );
}

/** The headline number. `null` renders a placeholder, never a fake value. */
export function ResultValue({
  value,
  size = "md",
  className,
}: {
  value: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-5xl sm:text-6xl",
  } as const;
  if (value === null) {
    return (
      <span
        className={cn("font-mono font-semibold tabular text-subtle", sizes[size], className)}
        title="Not published yet"
      >
        ––
      </span>
    );
  }
  return (
    <span className={cn("font-mono font-semibold tabular text-fg", sizes[size], className)}>
      {value}
    </span>
  );
}

const BUTTON_VARIANTS = {
  primary:
    "bg-accent text-accent-fg border-transparent hover:bg-accent-hover",
  secondary: "bg-surface text-fg border-line-strong hover:bg-surface-2",
  ghost: "bg-transparent text-muted border-transparent hover:bg-surface-2 hover:text-fg",
} as const;

/** Shared button styling — used by <button> and by <Link> alike so links and
 *  buttons never drift apart visually. */
export function buttonClass(
  variant: keyof typeof BUTTON_VARIANTS = "secondary",
  className?: string,
): string {
  return cn(
    "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5",
    "text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
    BUTTON_VARIANTS[variant],
    className,
  );
}

export function StatTile({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium tracking-wide text-muted uppercase">{label}</p>
        {icon ? <span className="text-subtle">{icon}</span> : null}
      </div>
      <p className="mt-2 text-2xl font-semibold tabular tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </Card>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-surface-2", className)}
      aria-hidden="true"
    />
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      {icon ? <div className="mb-3 text-subtle">{icon}</div> : null}
      <p className="text-sm font-semibold text-fg">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-card border border-danger/30 bg-danger-soft px-6 py-10 text-center"
    >
      <p className="text-sm font-semibold text-danger">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

