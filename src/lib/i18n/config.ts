/**
 * Locale configuration.
 *
 * Three locales, identified everywhere by these exact codes — `or` for Odia,
 * never `od`/`odia`/`oriya`.
 */

export const LOCALES = ["en", "hi", "or"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** The cookie is the source of truth: server components can read it, so the
 *  first paint is already in the right language with no flash of English.
 *  `localStorage` mirrors it for client-side reads. */
export const LOCALE_COOKIE = "numera_locale";
export const LOCALE_STORAGE_KEY = "numera:locale";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export interface LocaleMeta {
  code: Locale;
  /** Name in English, for the accessible label. */
  englishName: string;
  /** Name in its own script, which is what the selector shows. */
  nativeName: string;
  /** BCP-47 tag used for Intl formatting. */
  intl: string;
  /** `lang` attribute on <html>. */
  htmlLang: string;
}

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  en: {
    code: "en",
    englishName: "English",
    nativeName: "English",
    intl: "en-GB",
    htmlLang: "en",
  },
  hi: {
    code: "hi",
    englishName: "Hindi",
    nativeName: "हिन्दी",
    intl: "hi-IN",
    htmlLang: "hi",
  },
  or: {
    code: "or",
    englishName: "Odia",
    nativeName: "ଓଡ଼ିଆ",
    // `-u-nu-orya` renders dates and counts in Odia numerals, which is what an
    // Odia reader expects. Result values stay Latin — see `format.ts`.
    intl: "or-IN-u-nu-orya",
    htmlLang: "or",
  },
};

export const LOCALE_LIST: LocaleMeta[] = LOCALES.map((code) => LOCALE_META[code]);

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Never throws, never guesses from browser or IP — unknown input is English. */
export function normalizeLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
