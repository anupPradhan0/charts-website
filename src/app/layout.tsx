import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Devanagari, Noto_Sans_Oriya } from "next/font/google";
import { Info } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LocaleProvider } from "@/lib/i18n/client";
import { LOCALE_META } from "@/lib/i18n/config";
import { getLocale, getT } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

/**
 * Geist covers Latin only. Rather than swapping the whole typeface per
 * language, the Devanagari and Odia faces are loaded alongside it and listed
 * as fallbacks — the browser resolves missing glyphs per character, so mixed
 * text (an Odia label next to a Latin result value) renders correctly without
 * any locale branching in CSS.
 */
const devanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
  display: "swap",
});

const odia = Noto_Sans_Oriya({
  variable: "--font-odia",
  subsets: ["oriya"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    metadataBase: new URL(SITE.url),
    title: {
      default: `${t("meta.brand")} — ${t("meta.tagline")}`,
      template: `%s · ${t("meta.brand")}`,
    },
    description: t("meta.description"),
    applicationName: t("meta.brand"),
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: t("meta.brand"),
      title: `${t("meta.brand")} — ${t("meta.tagline")}`,
      description: t("meta.description"),
      url: "/",
    },
    twitter: {
      card: "summary",
      title: `${t("meta.brand")} — ${t("meta.tagline")}`,
      description: t("meta.description"),
    },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const t = await getT();

  return (
    <html
      lang={LOCALE_META[locale].htmlLang}
      className={`${geistSans.variable} ${geistMono.variable} ${devanagari.variable} ${odia.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-bg text-fg">
        <LocaleProvider locale={locale}>
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
        </LocaleProvider>
      </body>
    </html>
  );
}
