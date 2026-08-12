"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils/format";
import { useT } from "@/lib/i18n/client";

/**
 * Lazy chart entry point.
 *
 * Recharts is by far the heaviest dependency here and no chart is above the
 * fold, so it is split out of the initial bundle — which matters most on the
 * phones this site is built for. The placeholder reserves the chart's exact
 * height at each breakpoint, so deferring costs no layout shift.
 */

function ChartSkeleton({ vertical = false }: { vertical?: boolean }) {
  const t = useT();
  return (
    <div
      className={cn(
        "w-full animate-pulse rounded-lg bg-surface-2",
        vertical ? "h-[220px] sm:h-[260px]" : "h-[220px] sm:h-[260px]",
      )}
      role="status"
      aria-label={t("charts.loadingChart")}
    />
  );
}

export const TrendChart = dynamic(
  () => import("./ChartsImpl").then((m) => m.TrendChart),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

export const SimpleBarChart = dynamic(
  () => import("./ChartsImpl").then((m) => m.SimpleBarChart),
  { ssr: false, loading: () => <ChartSkeleton vertical /> },
);
