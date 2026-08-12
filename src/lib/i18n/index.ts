import { cookies } from "next/headers";
import { LOCALE_COOKIE, normalizeLocale, type Locale } from "./config";
import { createTranslator, type Translator } from "./core";

/** Server-side i18n entry points. */

/** Locale from the cookie the selector writes. Nothing here inspects
 *  `Accept-Language`, geography or IP — an unset cookie means English. */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return normalizeLocale(store.get(LOCALE_COOKIE)?.value);
}

/** The server-component entry point: `const t = await getT()`. */
export async function getT(): Promise<Translator> {
  return createTranslator(await getLocale());
}

export * from "./config";
export * from "./core";
