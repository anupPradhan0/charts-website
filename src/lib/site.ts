/** Site-wide constants used by metadata, the sitemap and the footer. */
export const SITE = {
  name: "Numera",
  tagline: "Results & Statistics Portal",
  description:
    "Numera publishes time-based numerical results and the statistics behind them: a live board of current values, a browsable archive, and descriptive charts. All data is fictional demonstration data.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

export function canonical(path: string): string {
  return new URL(path, SITE.url).toString();
}
