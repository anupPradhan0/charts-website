"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_STORAGE_KEY,
  normalizeLocale,
  type Locale,
} from "./config";
import { createTranslator, type Translator } from "./core";

/**
 * The client half of the i18n system.
 *
 * Deliberately small: the provider holds one string. Server components are the
 * ones that translate the page — this exists only so the handful of components
 * that must be interactive (the header, the filter panel, the auto-refresh
 * status) can translate too, and so the selector can switch language without a
 * navigation.
 */

interface LocaleContextValue {
  locale: Locale;
  t: Translator;
  setLocale: (next: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale: initialLocale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback(
    (next: Locale) => {
      const value = normalizeLocale(next);

      // The cookie is what the server reads on the next render, so it has to be
      // written before the refresh. `localStorage` mirrors it so client-only
      // code can read the preference without parsing cookies.
      document.cookie = `${LOCALE_COOKIE}=${value};path=/;max-age=${LOCALE_COOKIE_MAX_AGE};samesite=lax`;
      try {
        window.localStorage.setItem(LOCALE_STORAGE_KEY, value);
      } catch {
        // Private mode or storage disabled — the cookie is enough.
      }

      // Client components update immediately…
      setLocaleState(value);
      document.documentElement.lang = value;
      // …and the server re-renders the current route in the new language.
      // `refresh()` keeps the URL, so filters, search and pagination survive.
      router.refresh();
    },
    [router],
  );

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, t: createTranslator(locale), setLocale }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

function useLocaleContext(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (context) return context;
  // A client component rendered outside the provider still renders English
  // rather than crashing.
  return {
    locale: DEFAULT_LOCALE,
    t: createTranslator(DEFAULT_LOCALE),
    setLocale: () => {},
  };
}

/** `const t = useT()` — the client-side twin of `await getT()`. */
export function useT(): Translator {
  return useLocaleContext().t;
}

export function useLocale(): Locale {
  return useLocaleContext().locale;
}

export function useSetLocale(): (next: Locale) => void {
  return useLocaleContext().setLocale;
}
