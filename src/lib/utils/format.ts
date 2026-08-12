/**
 * Formatting helpers.
 *
 * All of these use a fixed locale so that server-rendered output and any
 * client re-render agree exactly (a locale-dependent string is a classic
 * hydration mismatch). Timestamps are only ever formatted in server
 * components; client components receive strings that are already formatted.
 */

const LOCALE = "en-GB";

export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

const dateFmt = new Intl.DateTimeFormat(LOCALE, {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const dateShortFmt = new Intl.DateTimeFormat(LOCALE, {
  day: "2-digit",
  month: "short",
});

const weekdayFmt = new Intl.DateTimeFormat(LOCALE, { weekday: "long" });

const timeFmt = new Intl.DateTimeFormat(LOCALE, {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

/** "2026-08-12" -> "12 Aug 2026" */
export function formatDate(iso: string): string {
  return dateFmt.format(toDate(iso));
}

/** "2026-08-12" -> "12 Aug" */
export function formatDateShort(iso: string): string {
  return dateShortFmt.format(toDate(iso));
}

/** "2026-08-12" -> "Wednesday" */
export function formatWeekday(iso: string): string {
  return weekdayFmt.format(toDate(iso));
}

/** ISO timestamp -> "10:31 am" */
export function formatTime(iso: string | null): string {
  if (!iso) return "—";
  return timeFmt.format(new Date(iso)).toLowerCase();
}

/** ISO timestamp -> "12 Aug 2026, 10:31 am" */
export function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${dateFmt.format(d)}, ${timeFmt.format(d).toLowerCase()}`;
}

/** 24h schedule string "15:30" -> "3:30 pm" (no timezone maths involved). */
export function formatSchedule(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h < 12 ? "am" : "pm";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** Coarse relative time: "just now", "14 min ago", "3 h ago", "2 days ago". */
export function formatRelative(iso: string | null, now: Date = new Date()): string {
  if (!iso) return "—";
  const diff = now.getTime() - new Date(iso).getTime();
  if (diff < 0) return "scheduled";
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

/** A date-only ISO string is parsed as local midnight, not UTC. */
function toDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count.toLocaleString(LOCALE)} ${count === 1 ? singular : plural}`;
}
