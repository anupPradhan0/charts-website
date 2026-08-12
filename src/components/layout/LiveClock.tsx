"use client";

import { useSyncExternalStore } from "react";
import { Clock } from "lucide-react";
import { createFormatter } from "@/lib/utils/format";
import { useT } from "@/lib/i18n/client";
import { toISODate } from "@/lib/data/results";

/** Local date and time, ticking every 30 seconds.
 *
 *  The clock is an external store, not component state: the server has no
 *  business guessing the visitor's time or timezone, so the server snapshot is
 *  `null` and the field stays blank until hydration. That is what keeps this
 *  free of hydration mismatches. The fixed-width slot stops the header from
 *  shifting when the time appears.
 *
 *  Formatting goes through the shared `createFormatter` rather than calling
 *  `toLocaleDateString` directly, so it gets the same ICU-gap fallback every
 *  other date on the site gets — some browsers have no locale data for Odia
 *  at all and would otherwise silently render US-ordered English dates. */

const TICK_MS = 30_000;

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, TICK_MS);
  return () => clearInterval(id);
}

/** Bucketed so the snapshot is a stable primitive between ticks. */
const getSnapshot = () => Math.floor(Date.now() / TICK_MS);
const getServerSnapshot = () => null;

export function LiveClock() {
  const t = useT();
  const fmt = createFormatter(t);
  const tick = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const now = tick === null ? null : new Date(tick * TICK_MS);

  return (
    <p className="flex items-center gap-1.5 text-xs text-muted tabular">
      <Clock className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="min-w-32">
        {now ? (
          <>
            <span className="sr-only">{t("nav.currentTime")} </span>
            {fmt.dateShort(toISODate(now))}
            {" · "}
            {fmt.time(now.toISOString())}
          </>
        ) : (
          <span aria-hidden="true">&nbsp;</span>
        )}
      </span>
    </p>
  );
}
