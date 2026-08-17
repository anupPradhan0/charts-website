import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/admin/session-cookie";

/**
 * Routing-level convenience only.
 *
 * A browser with no session cookie is sent to the sign-in page instead of a
 * blank admin screen. This is *not* the security boundary: the cookie is not
 * validated here (the proxy runs before, and separately from, the render, and
 * cannot reach the database). Every admin read and write re-checks the session
 * server-side in `requireAdmin()`, so forging this cookie buys nothing.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  if (!request.cookies.has(SESSION_COOKIE)) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
