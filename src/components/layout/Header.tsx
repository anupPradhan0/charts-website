"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Menu, Search, X } from "lucide-react";
import { cn } from "@/lib/utils/format";
import { LiveClock } from "./LiveClock";
import { NAV_ITEMS, isActivePath as isActive } from "./nav";
import { useT } from "@/lib/i18n/client";
import { LanguageOptions, LanguageSelector } from "./LanguageSelector";

/**
 * Mobile-first header.
 *
 * Phones get a compact 56px bar carrying only the brand, search and the menu
 * button — nothing that can overflow. The full navigation appears inline from
 * `lg`. The menu panel is a scrollable sheet: it never exceeds the viewport,
 * it locks the page behind it, Escape closes it, and every item is a 48px
 * target.
 */
export function Header() {
  const pathname = usePathname();
  const t = useT();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  // Escape closes the menu, and the page must not scroll behind the sheet.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const linkClass = (href: string) =>
    cn(
      "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
      isActive(pathname, href)
        ? "bg-accent-soft text-accent"
        : "text-muted hover:bg-surface-2 hover:text-fg",
    );

  const iconButton =
    "grid size-11 shrink-0 place-items-center rounded-lg border border-line text-muted";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:gap-3 sm:px-6 lg:h-16 lg:px-8">
        <Link
          href="/"
          onClick={close}
          className="-mx-1 flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-1 font-semibold tracking-tight"
          aria-label={t("nav.brandHome")}
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent text-accent-fg">
            <BarChart3 className="size-4.5" aria-hidden="true" />
          </span>
          <span className="text-base">{t("meta.brand")}</span>
        </Link>

        <nav aria-label={t("nav.label")} className="ml-2 hidden lg:block">
          <ul className="flex items-center gap-0.5">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={linkClass(item.href)}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                >
                  {t(item.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex min-w-0 items-center gap-2">
          <div className="hidden xl:block">
            <LiveClock />
          </div>

          {/* The inline search field only appears where there is room for it
              without squeezing the brand. */}
          <form action="/search" role="search" className="hidden lg:block">
            <label htmlFor="header-search" className="sr-only">
              {t("searchPage.inputLabel")}
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-subtle"
                aria-hidden="true"
              />
              <input
                id="header-search"
                type="search"
                name="q"
                placeholder={`${t("common.search")}…`}
                className="h-9 w-40 rounded-lg border border-line bg-surface-2 pr-3 pl-8 text-sm placeholder:text-subtle xl:w-56"
              />
            </div>
          </form>

          <LanguageSelector className="hidden lg:block" />

          <Link
            href="/search"
            onClick={close}
            aria-label={t("common.search")}
            className={cn(iconButton, "lg:hidden")}
          >
            <Search className="size-5" aria-hidden="true" />
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className={cn(iconButton, "lg:hidden")}
          >
            {open ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
            <span className="sr-only">{open ? t("nav.closeMenu") : t("nav.openMenu")}</span>
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          aria-label={t("nav.label")}
          className="max-h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain border-t border-line bg-surface lg:hidden"
        >
          <ul className="mx-auto max-w-7xl px-3 py-2 sm:px-6">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  className={cn(
                    "flex min-h-12 items-center rounded-lg px-3 text-base font-medium",
                    isActive(pathname, item.href)
                      ? "bg-accent-soft text-accent"
                      : "text-fg hover:bg-surface-2",
                  )}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                >
                  {t(item.labelKey)}
                </Link>
                {item.children ? (
                  <ul className="mb-1 ml-3 border-l border-line pl-3">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          onClick={close}
                          className="flex min-h-11 items-center rounded-lg px-3 text-sm text-muted hover:bg-surface-2 hover:text-fg"
                        >
                          {t(child.labelKey)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
            <li className="mt-1 border-t border-line pt-2">
              <LanguageOptions onSelected={close} />
            </li>
            <li className="border-t border-line px-3 py-3 xl:hidden">
              <LiveClock />
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
