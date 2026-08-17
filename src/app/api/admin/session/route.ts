import type { NextRequest } from "next/server";
import { fail, okPrivate } from "@/lib/api/http";
import { handle, jsonBody } from "@/lib/api/admin";
import { getCurrentAdmin, setSessionCookie, signIn, signOut } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

/**
 * The session endpoint.
 *
 * The sign-in form uses a server action; this exists so the admin API can be
 * driven programmatically (and so the test suite can authenticate). Both call
 * the same `signIn()`.
 */

/** GET /api/admin/session — who am I? */
export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return fail(401, "unauthorized", "admin.errors.unauthorized");
  return okPrivate({ data: admin });
}

/** POST /api/admin/session — `{ email, password }`, sets the session cookie. */
export async function POST(request: NextRequest) {
  return handle(async () => {
    const body = (await jsonBody(request)) as { email?: unknown; password?: unknown };
    const email = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || !password) {
      return fail(400, "validation", "admin.errors.credentialsRequired");
    }

    const token = await signIn(email, password);
    if (!token) return fail(401, "unauthorized", "admin.errors.badCredentials");

    await setSessionCookie(token);
    const admin = await getCurrentAdmin();
    return okPrivate({ data: admin });
  });
}

/** DELETE /api/admin/session — sign out. */
export async function DELETE() {
  await signOut();
  return okPrivate({ data: { signedOut: true } });
}
