"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { ErrorState, buttonClass } from "@/components/ui/primitives";
import { useT } from "@/lib/i18n/client";

/** Route-level error boundary: recoverable, and it never leaks a stack trace. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useT();

  useEffect(() => {
    console.error("Page render failed:", error);
  }, [error]);

  return (
    <Container className="py-16">
      <ErrorState
        title={t("errors.pageTitle")}
        description={t("errors.pageHint")}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" onClick={reset} className={buttonClass("primary")}>
              {t("errors.tryAgain")}
            </button>
            <Link href="/" className={buttonClass("secondary")}>
              {t("errors.goHome")}
            </Link>
          </div>
        }
      />
      {error.digest ? (
        <p className="mt-4 text-center text-xs text-subtle">
          {t("errors.reference", { digest: error.digest })}
        </p>
      ) : null}
    </Container>
  );
}
