import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { CATEGORIES } from "@/lib/data/categories";
import { NAV_ITEMS } from "./nav";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <div className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="grid size-8 place-items-center rounded-lg bg-accent text-accent-fg">
              <BarChart3 className="size-4.5" aria-hidden="true" />
            </span>
            Numera
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted">
            A results and statistics portal. Every category, schedule and value on this site is
            fictional demonstration data.
          </p>
        </div>

        <nav aria-labelledby="footer-pages">
          <h2 id="footer-pages" className="text-sm font-semibold">
            Pages
          </h2>
          <ul className="mt-3 space-y-2">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-muted hover:text-fg">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-categories">
          <h2 id="footer-categories" className="text-sm font-semibold">
            Categories
          </h2>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
            {CATEGORIES.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/categories/${category.slug}`}
                  className="text-sm text-muted hover:text-fg"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {year} Numera. Demonstration project — not affiliated with any real service.</p>
          <p>
            All data is generated. Nothing on this site is an offer, a service, or a
            recommendation.
          </p>
        </div>
      </div>
    </footer>
  );
}
