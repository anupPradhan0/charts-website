import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { CATEGORIES } from "@/lib/data/categories";
import { MARKET_GROUPS } from "@/types";
import { getLocale, getT } from "@/lib/i18n";
import { localized } from "@/lib/i18n/localize";
import { NAV_ITEMS } from "./nav";

export async function Footer() {
  const t = await getT();
  const locale = await getLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:gap-8 sm:px-6 sm:py-10 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="grid size-8 place-items-center rounded-lg bg-accent text-accent-fg">
              <BarChart3 className="size-4.5" aria-hidden="true" />
            </span>
            {t("meta.brand")}
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted text-pretty">{t("footer.blurb")}</p>
        </div>

        <nav aria-labelledby="footer-pages">
          <h2 id="footer-pages" className="text-sm font-semibold">
            {t("footer.pages")}
          </h2>
          <ul className="mt-1 grid grid-cols-2 gap-x-4 md:grid-cols-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="-mx-2 flex min-h-11 items-center rounded-lg px-2 text-sm text-muted hover:text-fg md:min-h-9"
                >
                  {t(item.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {MARKET_GROUPS.map((group) => (
          <nav key={group.value} aria-labelledby={`footer-${group.value}`}>
            <h2 id={`footer-${group.value}`} className="text-sm font-semibold">
              {t(`groups.${group.value}Label`)}
            </h2>
            <ul className="mt-1">
              {CATEGORIES.filter((c) => c.group === group.value).map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/categories/${category.slug}`}
                    className="-mx-2 flex min-h-11 items-center rounded-lg px-2 text-sm text-muted hover:text-fg md:min-h-9"
                  >
                    <span className="truncate">{localized(category.name, locale)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-muted text-pretty sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>{t("footer.copyright", { year })}</p>
          <p>{t("footer.generated")}</p>
        </div>
      </div>
    </footer>
  );
}
