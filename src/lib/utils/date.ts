/**
 * Calendar-day helpers.
 *
 * Client-safe on purpose — the header clock imports `toISODate`, so nothing in
 * here may reach for the database or `next/headers`.
 */

/** Local-time "YYYY-MM-DD" (never UTC — the board is read in local time). */
export function toISODate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** A `@db.Date` column holds a calendar day with no timezone. It is written and
 *  read at UTC midnight so the day never shifts either side of the wire. */
export function toDateColumn(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

export function fromDateColumn(value: Date): string {
  return value.toISOString().slice(0, 10);
}

/** "YYYY-MM-DD" + "HH:MM" as a local timestamp, ISO-encoded. */
export function timestampOf(dayISO: string, hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const d = parseISODate(dayISO);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

export function daysBetween(startISO: string, endISO: string): number {
  const ms = parseISODate(endISO).getTime() - parseISODate(startISO).getTime();
  return Math.max(1, Math.round(ms / 86_400_000) + 1);
}
