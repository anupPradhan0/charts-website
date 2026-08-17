import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifyPassword } from "./password";
import { SESSION_COOKIE } from "./session-cookie";

/**
 * The authentication boundary for /admin.
 *
 * A session is a random 32-byte token in an httpOnly cookie. Only its SHA-256
 * hash is stored, so a database dump does not hand over live sessions. Every
 * admin read and every admin mutation resolves the session server-side —
 * `proxy.ts` only redirects a browser without a cookie to the sign-in page, and
 * is never the thing that decides whether a request is allowed.
 *
 * No credentials live in source: the first administrator comes from
 * ADMIN_EMAIL / ADMIN_PASSWORD at seed time.
 */

export { SESSION_COOKIE };

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

/** Thrown by `requireAdmin()`. Route handlers turn it into a 401; server
 *  actions turn it into an error state. */
export class UnauthorizedError extends Error {
  constructor(message = "Administrator sign-in required") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Verifies credentials and opens a session. Returns null on any failure —
 *  the caller must not tell the visitor which half was wrong. */
export async function signIn(email: string, password: string): Promise<string | null> {
  const admin = await prisma.admin.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!admin) {
    // Hash anyway so a missing account is not measurably faster than a wrong
    // password.
    await verifyPassword(password, `scrypt$${"00".repeat(16)}$${"00".repeat(64)}`);
    return null;
  }
  if (!(await verifyPassword(password, admin.passwordHash))) return null;

  const token = randomBytes(32).toString("hex");
  await prisma.$transaction([
    prisma.session.create({
      data: {
        token: hashToken(token),
        adminId: admin.id,
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      },
    }),
    prisma.admin.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } }),
    // Housekeeping: expired rows are dead weight and a needless liability.
    prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } }),
  ]);
  return token;
}

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function signOut(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await prisma.session.deleteMany({ where: { token: hashToken(token) } });
  store.delete(SESSION_COOKIE);
}

/** The signed-in administrator, or null. Never throws. */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token: hashToken(token) },
    include: { admin: { select: { id: true, email: true, name: true } } },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return session.admin;
}

/** The gate every admin service call passes through. */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getCurrentAdmin();
  if (!admin) throw new UnauthorizedError();
  return admin;
}
