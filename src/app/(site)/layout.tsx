import { Info } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getT } from "@/lib/i18n";

/** The public site's chrome. The admin panel deliberately does not inherit it. */
export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const t = await getT();

  return (
    <>
      <a href="#main" className="skip-link rounded-lg bg-accent px-3 py-2 text-sm text-accent-fg">
        {t("nav.skipToContent")}
      </a>

      <Header />

      <p className="border-b border-line bg-surface-2 px-3 py-1.5 text-center text-xs text-muted text-pretty">
        <Info className="mr-1 inline size-3.5 align-[-2px]" aria-hidden="true" />
        {t("banner.demo")}
      </p>

      <main id="main" className="flex-1">
        {children}
      </main>

      <Footer />
    </>
  );
}
