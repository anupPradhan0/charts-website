"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Menu, Search, X } from "lucide-react";
import { cn } from "@/lib/utils/format";
import { LiveClock } from "./LiveClock";
import { NAV_ITEMS, isActivePath as isActive } from "./nav";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  // Escape closes the menu, and the body must not scroll behind the panel.
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

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-semibold tracking-tight"
          aria-label="Numera — home"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-accent text-accent-fg">
            <BarChart3 className="size-4.5" aria-hidden="true" />
          </span>
          <span className="text-base">Numera</span>
        </Link>

        <nav aria-label="Primary" className="ml-2 hidden lg:block">
          <ul className="flex items-center gap-0.5">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={linkClass(item.href)}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:block">
            <LiveClock />
          </div>

          <form action="/search" role="search" className="hidden sm:block">
            <label htmlFor="header-search" className="sr-only">
              Search results and categories
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
                placeholder="Search…"
                className="h-9 w-40 rounded-lg border border-line bg-surface-2 pr-3 pl-8 text-sm placeholder:text-subtle lg:w-56"
              />
            </div>
          </form>

          <Link
            href="/search"
            aria-label="Search"
            className="grid size-9 place-items-center rounded-lg border border-line text-muted sm:hidden"
          >
            <Search className="size-4" aria-hidden="true" />
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="grid size-9 place-items-center rounded-lg border border-line text-muted lg:hidden"
          >
            {open ? (
              <X className="size-4" aria-hidden="true" />
            ) : (
              <Menu className="size-4" aria-hidden="true" />
            )}
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          aria-label="Primary"
          className="border-t border-line bg-surface lg:hidden"
        >
          <ul className="mx-auto max-w-7xl px-4 py-2 sm:px-6">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  className={cn(
                    "block rounded-lg px-3 py-3 text-base font-medium",
                    isActive(pathname, item.href)
                      ? "bg-accent-soft text-accent"
                      : "text-fg hover:bg-surface-2",
                  )}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="px-3 py-3 md:hidden">
              <LiveClock />
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
