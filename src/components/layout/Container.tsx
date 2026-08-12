import type { ReactNode } from "react";
import { cn } from "@/lib/utils/format";

/**
 * Kept in its own file, deliberately free of any server-only import.
 *
 * `error.tsx` is a mandatory client component and renders this directly, so
 * if this file pulled in `getT` (which needs `next/headers`) the whole
 * module — and everything re-exporting it — would fail to bundle for the
 * client. `PageShell.tsx` re-exports `Container` for its many server-page
 * callers; only `error.tsx` needs to import it from here directly.
 */
export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}
