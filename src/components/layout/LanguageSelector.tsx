"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, Globe } from "lucide-react";
import { LOCALE_LIST, type Locale } from "@/lib/i18n/config";
import { useLocale, useSetLocale, useT } from "@/lib/i18n/client";
import { cn } from "@/lib/utils/format";

/**
 * Language selector.
 *
 * A button plus a menu, built on plain elements rather than a select so the
 * native names render in their own scripts. Keyboard support is the standard
 * menu-button contract: Enter/Space to open, arrows to move, Escape to close
 * and return focus, Tab or an outside click to dismiss.
 */
export function LanguageSelector({ className }: { className?: string }) {
  const locale = useLocale();
  const setLocale = useSetLocale();
  const t = useT();
  const id = useId();

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const current = LOCALE_LIST.find((l) => l.code === locale) ?? LOCALE_LIST[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  // Moving focus into the menu is what makes arrow keys feel right.
  useEffect(() => {
    if (!open) return;
    const index = LOCALE_LIST.findIndex((l) => l.code === locale);
    itemRefs.current[Math.max(0, index)]?.focus();
  }, [open, locale]);

  const choose = (next: Locale) => {
    setLocale(next);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const onMenuKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
      return;
    }
    const last = LOCALE_LIST.length - 1;
    const move = (to: number) => {
      event.preventDefault();
      itemRefs.current[to]?.focus();
    };
    if (event.key === "ArrowDown") move(index === last ? 0 : index + 1);
    if (event.key === "ArrowUp") move(index === 0 ? last : index - 1);
    if (event.key === "Home") move(0);
    if (event.key === "End") move(last);
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" && !open) {
            event.preventDefault();
            setOpen(true);
          }
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={`${id}-menu`}
        aria-label={`${t("language.selectorLabel")} — ${t("language.current", {
          language: current.englishName,
        })}`}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-line px-2.5 text-sm font-medium text-fg hover:bg-surface-2 sm:min-h-9"
      >
        <Globe className="size-4 shrink-0" aria-hidden="true" />
        <span className="max-w-24 truncate">{current.nativeName}</span>
        <span aria-hidden="true" className="text-xs text-subtle">
          ▾
        </span>
      </button>

      {open ? (
        <ul
          id={`${id}-menu`}
          role="menu"
          aria-label={t("language.label")}
          className="absolute right-0 z-50 mt-1 min-w-44 overflow-hidden rounded-lg border border-line bg-surface py-1 shadow-pop"
        >
          {LOCALE_LIST.map((option, index) => {
            const active = option.code === locale;
            return (
              <li key={option.code} role="none">
                <button
                  ref={(node) => {
                    itemRefs.current[index] = node;
                  }}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  lang={option.htmlLang}
                  onClick={() => choose(option.code)}
                  onKeyDown={(event) => onMenuKeyDown(event, index)}
                  className={cn(
                    "flex min-h-11 w-full items-center gap-2 px-3 text-left text-sm",
                    active ? "bg-accent-soft font-medium text-accent" : "text-fg hover:bg-surface-2",
                  )}
                >
                  <Check
                    className={cn("size-4 shrink-0", active ? "opacity-100" : "opacity-0")}
                    aria-hidden="true"
                  />
                  <span className="flex-1 truncate">{option.nativeName}</span>
                  {option.nativeName !== option.englishName ? (
                    <span className="shrink-0 text-xs text-subtle" lang="en">
                      {option.englishName}
                    </span>
                  ) : null}
                  {active ? <span className="sr-only">{t("language.selected")}</span> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

/** Flat list used inside the mobile menu, where a popup would be a second
 *  layer on top of a sheet that is already covering the page. */
export function LanguageOptions({ onSelected }: { onSelected?: () => void }) {
  const locale = useLocale();
  const setLocale = useSetLocale();
  const t = useT();

  return (
    <div>
      <p className="flex items-center gap-1.5 px-3 pt-1 pb-1 text-xs font-medium text-muted">
        <Globe className="size-3.5 shrink-0" aria-hidden="true" />
        {t("language.label")}
      </p>
      <ul>
        {LOCALE_LIST.map((option) => {
          const active = option.code === locale;
          return (
            <li key={option.code}>
              <button
                type="button"
                lang={option.htmlLang}
                aria-current={active ? "true" : undefined}
                onClick={() => {
                  setLocale(option.code);
                  onSelected?.();
                }}
                className={cn(
                  "flex min-h-12 w-full items-center gap-2 rounded-lg px-3 text-left text-base",
                  active ? "bg-accent-soft font-medium text-accent" : "text-fg hover:bg-surface-2",
                )}
              >
                <Check
                  className={cn("size-4 shrink-0", active ? "opacity-100" : "opacity-0")}
                  aria-hidden="true"
                />
                <span className="flex-1 truncate">{option.nativeName}</span>
                {option.nativeName !== option.englishName ? (
                  <span className="shrink-0 text-xs text-subtle" lang="en">
                    {option.englishName}
                  </span>
                ) : null}
                {active ? <span className="sr-only">{t("language.selected")}</span> : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
