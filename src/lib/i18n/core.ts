import { DEFAULT_LOCALE, type Locale } from "./config";
import { en } from "./translations/en";
import { hi } from "./translations/hi";
import { or } from "./translations/or";

/**
 * Translation lookup — no server-only imports, so client components can use
 * this module too.
 *
 * Translation lookup.
 *
 * `en` is the master dictionary and defines the key space; `hi` and `or` are
 * deep-partial, so a missing translation is a type-legal state that falls back
 * to English rather than rendering a key or `undefined`.
 */

export type Dictionary = typeof en;

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends string ? string : T[K] extends readonly string[] ? readonly string[] : DeepPartial<T[K]>;
};

/** Dot-paths into the dictionary that resolve to a string — so `t()` cannot be
 *  called with a key that does not exist. */
type LeafPaths<T> = {
  [K in keyof T & string]: T[K] extends string
    ? K
    : T[K] extends readonly unknown[]
      ? never
      : `${K}.${LeafPaths<T[K]>}`;
}[keyof T & string];

/** Dot-paths that resolve to a string array (paragraph blocks). */
type ListPaths<T> = {
  [K in keyof T & string]: T[K] extends readonly string[]
    ? K
    : T[K] extends string
      ? never
      : `${K}.${ListPaths<T[K]>}`;
}[keyof T & string];

export type TranslationKey = LeafPaths<Dictionary>;
export type TranslationListKey = ListPaths<Dictionary>;

export const DICTIONARIES: Record<Locale, DeepPartial<Dictionary>> = {
  en,
  hi: hi as DeepPartial<Dictionary>,
  or: or as DeepPartial<Dictionary>,
};

function lookup(dict: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (node, key) =>
        node && typeof node === "object" ? (node as Record<string, unknown>)[key] : undefined,
      dict,
    );
}

/** `{name}` placeholders are filled from `vars`. */
function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

export interface Translator {
  locale: Locale;
  /** Translate a key. Falls back to English; never returns the raw key. */
  (key: TranslationKey, vars?: Record<string, string | number>): string;
  /** Translate a key holding an array of paragraphs. */
  list: (key: TranslationListKey, vars?: Record<string, string | number>) => string[];
  /** Singular/plural pair: `t.plural("common.entry", n)` reads
   *  `common.entryOne` / `common.entryOther`. */
  plural: (
    key: string,
    count: number,
    vars?: Record<string, string | number>,
  ) => string;
}

export function createTranslator(locale: Locale): Translator {
  const primary = DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
  const fallback = DICTIONARIES[DEFAULT_LOCALE];

  const resolve = (key: string): string => {
    const hit = lookup(primary, key);
    if (typeof hit === "string" && hit.length > 0) return hit;
    const back = lookup(fallback, key);
    if (typeof back === "string") return back;
    // Both dictionaries lack the key. The typed key space makes this a
    // developer error, so surface it loudly in development and render nothing
    // in production rather than leaking "navigation.results" to a reader.
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[i18n] missing translation key: ${key}`);
    }
    return "";
  };

  const t = ((key: TranslationKey, vars?: Record<string, string | number>) =>
    interpolate(resolve(key), vars)) as Translator;

  t.locale = locale;

  t.list = (key, vars) => {
    const hit = lookup(primary, key) ?? lookup(fallback, key);
    if (!Array.isArray(hit)) return [];
    return hit.map((line) => interpolate(String(line), vars));
  };

  t.plural = (key, count, vars) => {
    const suffix = count === 1 ? "One" : "Other";
    return interpolate(resolve(`${key}${suffix}`), { count, ...vars });
  };

  return t;
}

