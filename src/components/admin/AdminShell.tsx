"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ExternalLink,
  LayoutDashboard,
  ListOrdered,
  Menu,
  Settings,
  Tags,
  X,
} from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { cn } from "@/lib/utils/format";
import { buttonClass } from "@/components/ui/primitives";

/**
 * The admin chrome.
 *
 * One client component for the whole shell, because the only interactive part
 * is the mobile drawer: below `lg` the sidebar collapses behind a menu button
 * and slides in over a backdrop; from `lg` it is a plain static column and the
 * drawer state is never consulted.
 *
 * Everything inside `children` stays a server component.
 */

const SECTIONS = [
  { href: "/admin/dashboard", key: "dashboard", Icon: LayoutDashboard },
  { href: "/admin/categories", key: "categories", Icon: Tags },
  { href: "/admin/results", key: "results", Icon: ListOrdered },
  { href: "/admin/settings", key: "settings", Icon: Settings },
] as const;

export function AdminShell({
  admin,
  signOut,
  children,
}: {
  admin: { name: string; email: string };
  /** The sign-out server action, passed down so this file stays client-only. */
  signOut: () => Promise<void>;
  children: ReactNode;
}) {
  const t = useT();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const nav = (
    <nav aria-label={t("admin.navLabel")} className="p-3">
      <ul className="space-y-1">
        {SECTIONS.map(({ href, key, Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                // Closing on click, not on a pathname effect: the drawer must
                // not survive the navigation it started.
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-2.5 rounded-lg px-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent-soft text-accent"
                    : "text-muted hover:bg-surface-2 hover:text-fg",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                {t(`admin.nav.${key}`)}
              </Link>
            </li>
          );
        })}
      </ul>

      <hr className="my-3 border-line" />

      <Link
        href="/"
        onClick={() => setOpen(false)}
        className="flex min-h-11 items-center gap-2.5 rounded-lg px-3 text-sm text-muted hover:bg-surface-2 hover:text-fg"
      >
        <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
        {t("admin.viewSite")}
      </Link>
    </nav>
  );

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="sticky top-0 z-40 border-b border-line bg-surface">
        <div className="flex h-14 items-center gap-2 px-3 sm:px-4">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={t("admin.openMenu")}
            aria-expanded={open}
            className={cn(buttonClass("ghost"), "px-2 lg:hidden")}
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>

          <Link
            href="/admin/dashboard"
            className="flex min-w-0 items-center gap-2 font-semibold tracking-tight"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent text-accent-fg">
              <BarChart3 className="size-4.5" aria-hidden="true" />
            </span>
            <span className="truncate">{t("admin.brand")}</span>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <p className="hidden max-w-[14rem] truncate text-xs text-muted sm:block">
              {t("admin.signedInAs", { name: admin.name })}
            </p>
            <span
              aria-hidden="true"
              className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-2 text-xs font-semibold text-muted"
            >
              {admin.name.slice(0, 1).toUpperCase()}
            </span>
            <form action={signOut}>
              <button type="submit" className={buttonClass("secondary")}>
                {t("admin.signOut")}
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-60 shrink-0 border-r border-line bg-surface lg:block">
          <div className="sticky top-14">{nav}</div>
        </aside>

        {/* Mobile drawer. Rendered only while open so nothing is focusable
            behind the backdrop. */}
        {open ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label={t("admin.closeMenu")}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/40"
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label={t("admin.menu")}
              className="relative flex h-full w-[17rem] max-w-[85vw] flex-col border-r border-line bg-surface shadow-pop"
            >
              <div className="flex h-14 items-center justify-between border-b border-line px-3">
                <span className="font-semibold tracking-tight">{t("admin.brand")}</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={t("admin.closeMenu")}
                  className={cn(buttonClass("ghost"), "px-2")}
                >
                  <X className="size-5" aria-hidden="true" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">{nav}</div>
            </div>
          </div>
        ) : null}

        <main className="min-w-0 flex-1 px-3 py-4 sm:px-5 sm:py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
