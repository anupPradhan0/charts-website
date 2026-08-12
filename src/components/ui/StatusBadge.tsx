import { getT } from "@/lib/i18n";
import { Badge, BADGE_TONES } from "./primitives";
import type { ResultStatus } from "@/types";

/**
 * Split out of `primitives.tsx` on purpose: this is the only primitive that
 * needs a translator, and `getT` pulls in `next/headers`. Keeping it in the
 * same file as the client-safe primitives (`Card`, `Badge`, `buttonClass`, …)
 * would taint that whole module for any client component that imports from
 * it — `error.tsx` does, for `ErrorState` and `buttonClass`.
 */

const STATUS_TONE: Record<ResultStatus, keyof typeof BADGE_TONES> = {
  published: "ok",
  pending: "warn",
  scheduled: "info",
};

export async function StatusBadge({ status }: { status: ResultStatus }) {
  const t = await getT();
  return (
    <Badge tone={STATUS_TONE[status]}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {t(`status.${status}`)}
    </Badge>
  );
}
