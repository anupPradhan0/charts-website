import { NextResponse } from "next/server";
import type { ZodType } from "zod";
import { normalizeParams } from "@/lib/services/query";

/**
 * Shared HTTP plumbing for the public API: one response envelope, one error
 * shape, one place that decides cache headers.
 */

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
}

/** Results change at most once a minute, so a short shared cache is safe and
 *  keeps repeat traffic off the render path. */
const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=0, s-maxage=30, stale-while-revalidate=60",
};

export function ok<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, {
    ...init,
    headers: { ...CACHE_HEADERS, ...init?.headers },
  });
}

/** Admin responses are per-administrator and must never be cached anywhere. */
export function okPrivate<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, {
    ...init,
    headers: { "Cache-Control": "no-store", ...init?.headers },
  });
}

export function fail(
  status: number,
  code: string,
  message: string,
  details?: ApiError["error"]["details"],
): NextResponse {
  return NextResponse.json<ApiError>(
    { error: { code, message, ...(details ? { details } : {}) } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export function notFound(message = "Resource not found"): NextResponse {
  return fail(404, "not_found", message);
}

/** Validate query parameters, or return a 400 describing every bad field. */
export function parseQuery<T extends ZodType>(
  schema: T,
  url: URL,
): { data: import("zod").infer<T> } | { response: NextResponse } {
  const parsed = schema.safeParse(normalizeParams(url.searchParams));
  if (parsed.success) return { data: parsed.data };
  return {
    response: fail(
      400,
      "invalid_query",
      "One or more query parameters are invalid",
      parsed.error.issues.map((issue) => ({
        field: issue.path.join(".") || "(root)",
        message: issue.message,
      })),
    ),
  };
}
