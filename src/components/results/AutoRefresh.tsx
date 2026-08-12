"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { buttonClass } from "@/components/ui/primitives";
import { cn } from "@/lib/utils/format";
import { useT } from "@/lib/i18n/client";

/**
 * Keeps a server-rendered board current.
 *
 * `router.refresh()` re-runs the server component and swaps in new markup —
 * no client-side data layer, no duplicate rendering path. Polling is gentle
 * (once a minute), stops while the tab is hidden, and can be triggered by hand.
 */
export function AutoRefresh({ intervalMs = 60_000 }: { intervalMs?: number }) {
  const router = useRouter();
  const t = useT();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "updated" | "error">("idle");

  const refresh = useCallback(() => {
    startTransition(() => {
      try {
        router.refresh();
        setStatus("updated");
      } catch {
        setStatus("error");
      }
    });
  }, [router]);

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const id = setInterval(tick, intervalMs);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [intervalMs, refresh]);

  const message = pending
    ? t("results.updating")
    : status === "error"
      ? t("results.connectionProblem")
      : status === "updated"
        ? t("results.updatedNow")
        : t("results.autoUpdating");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <p
        role="status"
        aria-live="polite"
        className={cn(
          "text-xs",
          status === "error" ? "font-medium text-danger" : "text-muted",
        )}
      >
        {message}
      </p>
      <button
        type="button"
        onClick={refresh}
        disabled={pending}
        className={buttonClass("ghost", "min-h-8 px-2 py-1 text-xs")}
      >
        <RefreshCw
          className={cn("size-3.5", pending && "motion-safe:animate-spin")}
          aria-hidden="true"
        />
        {t("results.refreshNow")}
      </button>
    </div>
  );
}
