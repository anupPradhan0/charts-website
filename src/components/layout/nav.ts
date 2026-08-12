/** Primary navigation, shared by the header, the footer and the sitemap. */
export const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/results", label: "Current Results" },
  { href: "/categories", label: "Categories" },
  { href: "/history", label: "Historical Results" },
  { href: "/statistics", label: "Statistics" },
  { href: "/about", label: "About" },
] as const;

export function isActivePath(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
