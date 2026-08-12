/**
 * Primary navigation, shared by the header, the footer and the sitemap.
 *
 * The desktop bar renders the top level only. The mobile sheet renders the
 * whole tree, because a phone has the vertical room to show sub-sections and
 * no room for hover menus.
 */
export interface NavItem {
  href: string;
  label: string;
  children?: { href: string; label: string }[];
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard" },
  {
    href: "/results",
    label: "Live Results",
    children: [
      { href: "/results?group=day", label: "Day Markets" },
      { href: "/results?group=night", label: "Night Markets" },
      { href: "/results?group=special", label: "Special Markets" },
    ],
  },
  { href: "/categories", label: "Markets" },
  { href: "/charts", label: "Charts" },
  { href: "/history", label: "Historical" },
  { href: "/statistics", label: "Statistics" },
  {
    href: "/about",
    label: "Information",
    children: [
      { href: "/about", label: "About" },
      { href: "/faqs", label: "FAQs" },
      { href: "/disclaimer", label: "Disclaimer" },
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
