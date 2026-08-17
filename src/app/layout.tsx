import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Devanagari, Noto_Sans_Oriya } from "next/font/google";
import { LocaleProvider } from "@/lib/i18n/client";
import { LOCALE_META } from "@/lib/i18n/config";
import { getLocale, getT } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

/**
 * The document shell: fonts, language and the locale provider, and nothing
 * else. The public site's header, demo banner and footer live in
 * `(site)/layout.tsx`; the admin panel has its own chrome in
 * `admin/(dashboard)/layout.tsx`. Both are children of this one, so the two
 * areas share a document and a language without sharing a navigation.
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

  return (
    <html
      lang={LOCALE_META[locale].htmlLang}
      className={`${geistSans.variable} ${geistMono.variable} ${devanagari.variable} ${odia.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-bg text-fg">
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
