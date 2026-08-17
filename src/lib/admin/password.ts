import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

/**
 * Password hashing.
 *
 * `scrypt` ships with Node, so there is no dependency here and nothing to keep
 * up to date. The salt is per-password and stored alongside the digest;
 * comparison is constant-time.
 *
 * Deliberately free of `@/` path aliases and of any Next.js import: the seed
 * script runs this file through tsx, outside the Next module graph.
 */

const KEY_LENGTH = 64;
const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const digest = await scryptAsync(password, salt, KEY_LENGTH);
  return `scrypt$${salt.toString("hex")}$${digest.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltHex, digestHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !digestHex) return false;
  const expected = Buffer.from(digestHex, "hex");
  if (expected.length !== KEY_LENGTH) return false;
  const actual = await scryptAsync(password, Buffer.from(saltHex, "hex"), KEY_LENGTH);
  return timingSafeEqual(expected, actual);
}
