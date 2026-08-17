import { DEFAULT_LOCALE, type Locale } from "./config";
import type { Category, LocalizedText } from "@/types";

/**
 * Resolving localized data.
 *
 * Market names and descriptions are stored once as `{ en, hi, or }`; these
 * helpers pick the right one at the point of rendering, falling back to
 * English so a missing translation never renders empty.
 */

export function localized(text: LocalizedText, locale: Locale): string {
  return text[locale] || text[DEFAULT_LOCALE];
}

export interface LocalizedCategory extends Omit<Category, "name" | "description"> {
  name: string;
  description: string;
}

export function localizeCategory(category: Category, locale: Locale): LocalizedCategory {
  return {
    ...category,
    name: localized(category.name, locale),
    description: localized(category.description, locale),
  };
}

/** Client components import this module for `localized()`, so nothing here may
 *  reach the database. Resolving a display name from a slug needs the category
 *  set and therefore lives in `@/lib/services/categories` instead. */
