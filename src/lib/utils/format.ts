import { LOCALE_META, type Locale } from "@/lib/i18n/config";
import type { Translator } from "@/lib/i18n/core";

/**
 * Formatting helpers.
 *
 * Dates, times and counts go through `Intl` with the active locale, so Hindi
 * reads "12 अगस्त 2026" and Odia reads in Odia numerals — no hand-rolled
 * month tables anywhere.
 *
 * Deliberately NOT localised: the two-digit result values, the frequency-grid
 * counts and the calendar day numbers. Those are tabular data that readers
 * compare against each other and against the API, and rewriting their digits
 * per language would change what the data looks like rather than how the UI
 * reads. `ResultValue` renders them verbatim.
 */

export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

/** A date-only ISO string is parsed as local midnight, not UTC. */
function toDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export interface Formatter {
  locale: Locale;
  /** "2026-08-12" -> "12 Aug 2026" / "12 अग॰ 2026" / "ଅଗଷ୍ଟ ୧୨, ୨୦୨୬" */
  date(iso: string): string;
  dateShort(iso: string): string;
  weekday(iso: string): string;
  weekdayShort(iso: string): string;
  /** ISO timestamp -> local clock time. */
  time(iso: string | null): string;
  dateTime(iso: string | null): string;
  /** 24h "15:30" -> "3:30 pm". No timezone maths, no locale digits: this is a
   *  schedule label that must line up with the table beside it. */
  schedule(hhmm: string): string;
  /** "14 min ago" and friends, translated. */
  relative(iso: string | null, now?: Date): string;
  /** Counts and totals — localised digits. */
  number(value: number): string;
  /** Month name for a "YYYY-MM" key. */
  month(yyyymm: string): string;
}

const cache = new Map<string, Intl.DateTimeFormat | Intl.NumberFormat>();

function dtf(tag: string, options: Intl.DateTimeFormatOptions, key: string): Intl.DateTimeFormat {
  const id = `${tag}|${key}`;
  let found = cache.get(id) as Intl.DateTimeFormat | undefined;
  if (!found) {
    found = new Intl.DateTimeFormat(tag, options);
    cache.set(id, found);
  }
  return found;
}

/**
 * Some browsers ship ICU data covering only a handful of locales and have no
 * entry at all for Odia — `supportedLocalesOf` returns `[]`, and every
 * `Intl` call silently substitutes the *browser's own* default locale rather
 * than erroring. That default is usually US-English, which orders a date as
 * "Aug 12" instead of this app's "12 Aug" — a worse, inconsistent fallback
 * than just using English on purpose. Node (where every page actually
 * renders its dates) always has full ICU, so this only matters for the
 * handful of client-only widgets (the header clock, chart tick labels).
 */
function resolveSupportedLocale(tag: string): string {
  try {
    return Intl.DateTimeFormat.supportedLocalesOf([tag]).length > 0
      ? tag
      : LOCALE_META.en.intl;
  } catch {
    return LOCALE_META.en.intl;
  }
}

export function createFormatter(t: Translator): Formatter {
  const tag = resolveSupportedLocale(LOCALE_META[t.locale].intl);

  const dateFmt = dtf(tag, { day: "2-digit", month: "short", year: "numeric" }, "date");
  const shortFmt = dtf(tag, { day: "2-digit", month: "short" }, "short");
  const weekdayFmt = dtf(tag, { weekday: "long" }, "weekday");
  const weekdayShortFmt = dtf(tag, { weekday: "short" }, "weekdayShort");
  const timeFmt = dtf(tag, { hour: "2-digit", minute: "2-digit", hour12: true }, "time");
  const monthFmt = dtf(tag, { month: "long", year: "numeric" }, "month");

  let numberFmt = cache.get(`${tag}|number`) as Intl.NumberFormat | undefined;
  if (!numberFmt) {
    numberFmt = new Intl.NumberFormat(tag);
    cache.set(`${tag}|number`, numberFmt);
  }

  return {
    locale: t.locale,
    date: (iso) => dateFmt.format(toDate(iso)),
    dateShort: (iso) => shortFmt.format(toDate(iso)),
    weekday: (iso) => weekdayFmt.format(toDate(iso)),
    weekdayShort: (iso) => weekdayShortFmt.format(toDate(iso)),
    time: (iso) => (iso ? timeFmt.format(new Date(iso)).toLowerCase() : "—"),
    dateTime: (iso) =>
      iso ? `${dateFmt.format(new Date(iso))}, ${timeFmt.format(new Date(iso)).toLowerCase()}` : "—",
    schedule: (hhmm) => {
      const [h, m] = hhmm.split(":").map(Number);
      const suffix = h < 12 ? "am" : "pm";
      const hour = h % 12 === 0 ? 12 : h % 12;
      return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
    },
    relative: (iso, now = new Date()) => {
      if (!iso) return "—";
      const diff = now.getTime() - new Date(iso).getTime();
      if (diff < 0) return t("common.scheduledFor");
      const minutes = Math.floor(diff / 60_000);
      if (minutes < 1) return t("common.justNow");
      if (minutes < 60) return t("common.minutesAgo", { count: numberFmt.format(minutes) });
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return t("common.hoursAgo", { count: numberFmt.format(hours) });
      const days = Math.floor(hours / 24);
      return days === 1
        ? t("common.yesterday")
        : t("common.daysAgo", { count: numberFmt.format(days) });
    },
    number: (value) => numberFmt.format(value),
    month: (yyyymm) => monthFmt.format(toDate(`${yyyymm}-01`)),
  };
}
