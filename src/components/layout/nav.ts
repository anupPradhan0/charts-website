/**
 * Primary navigation, shared by the header, the footer and the sitemap.
 *
 * The desktop bar renders the top level only. The mobile sheet renders the
 * whole tree, because a phone has the vertical room to show sub-sections and
 * no room for hover menus.
 */
import type { TranslationKey } from "@/lib/i18n/core";

export interface NavItem {
  href: string;
  labelKey: TranslationKey;
  children?: { href: string; labelKey: TranslationKey }[];
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", labelKey: "nav.dashboard" },
  {
    href: "/results",
    labelKey: "nav.liveResults",
    children: [
      { href: "/results?group=day", labelKey: "nav.dayMarkets" },
      { href: "/results?group=night", labelKey: "nav.nightMarkets" },
      { href: "/results?group=special", labelKey: "nav.specialMarkets" },
    ],
  },
  { href: "/categories", labelKey: "nav.markets" },
  { href: "/charts", labelKey: "nav.charts" },
  { href: "/history", labelKey: "nav.historical" },
  { href: "/statistics", labelKey: "nav.statistics" },
  {
    href: "/about",
    labelKey: "nav.information",
    children: [
      { href: "/about", labelKey: "nav.about" },
      { href: "/faqs", labelKey: "nav.faqs" },
      { href: "/disclaimer", labelKey: "nav.disclaimer" },
    ],
  },
];

/** Every distinct page in the tree — used by the sitemap. */
export const NAV_PAGES = [
  "/",
  "/results",
  "/categories",
  "/charts",
  "/history",
  "/statistics",
  "/about",
  "/faqs",
  "/disclaimer",
] as const;

export function isActivePath(pathname: string, href: string): boolean {
  const path = href.split("?")[0];
  return path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`);
}
