"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/PageShell";
import { ErrorState, buttonClass } from "@/components/ui/primitives";

/** Route-level error boundary: recoverable, and it never leaks a stack trace. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page render failed:", error);
  }, [error]);

  return (
    <Container className="py-16">
      <ErrorState
        title="This page could not be loaded"
        description="Something went wrong while building the page. Trying again usually resolves it."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" onClick={reset} className={buttonClass("primary")}>
              Try again
            </button>
            <Link href="/" className={buttonClass("secondary")}>
              Go to the homepage
            </Link>
          </div>
        }
      />
      {error.digest ? (
        <p className="mt-4 text-center text-xs text-subtle">Reference: {error.digest}</p>
      ) : null}
    </Container>
  );
}
