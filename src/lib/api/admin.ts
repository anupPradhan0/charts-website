import type { NextResponse } from "next/server";
import { fail, okPrivate } from "./http";
import { UnauthorizedError } from "@/lib/admin/auth";
import type { Outcome } from "@/lib/admin/schemas";

/**
 * The JSON face of the admin services.
 *
 * The route handlers are deliberately dumb: they hand the request body to the
 * same service function the server actions use and translate its outcome into
 * a status code. Authorization is not checked here — it is checked inside the
 * service, so this layer cannot forget it.
 */

const STATUS: Record<Extract<Outcome<unknown>, { ok: false }>["code"], number> = {
  unauthorized: 401,
  validation: 400,
  conflict: 409,
  not_found: 404,
  blocked: 409,
};

export function respond<T>(outcome: Outcome<T>, successStatus = 200): NextResponse {
  if (outcome.ok) return okPrivate({ data: outcome.data }, { status: successStatus });
  return fail(
    STATUS[outcome.code],
    outcome.code,
    outcome.message,
    outcome.fieldErrors
      ? Object.entries(outcome.fieldErrors).map(([field, message]) => ({ field, message }))
      : undefined,
  );
}

/** Runs a handler, turning a missing session into 401 and a malformed JSON
 *  body into 400 rather than a 500. */
export async function handle(run: () => Promise<NextResponse>): Promise<NextResponse> {
  try {
    return await run();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return fail(401, "unauthorized", "admin.errors.unauthorized");
    }
    if (error instanceof SyntaxError) {
      return fail(400, "invalid_body", "admin.errors.invalidBody");
    }
    throw error;
  }
}

export async function jsonBody(request: Request): Promise<unknown> {
  const text = await request.text();
  if (!text.trim()) return {};
  return JSON.parse(text);
}
