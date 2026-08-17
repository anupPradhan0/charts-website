import type { MetadataRoute } from "next";
import { getSnapshot } from "@/lib/data/snapshot";
import { SITE } from "@/lib/site";
import { NAV_PAGES } from "@/components/layout/nav";

/** Categories are database rows now, so the sitemap is generated per request
 *  rather than frozen at build time. */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { categories, lastUpdated } = await getSnapshot();
  const lastModified = lastUpdated ?? new Date().toISOString();
  const url = (path: string) => new URL(path, SITE.url).toString();

  const priorities: Record<string, number> = {
    "/": 1,
    "/results": 0.9,
    "/categories": 0.8,
    "/history": 0.8,
    "/charts": 0.8,
    "/statistics": 0.7,
  };

  return [
    ...NAV_PAGES.map((path) => ({
      url: url(path),
      lastModified,
      changeFrequency: (priorities[path] ? "daily" : "monthly") as "daily" | "monthly",
      priority: priorities[path] ?? 0.3,
    })),
    ...categories.map((category) => ({
      url: url(`/categories/${category.slug}`),
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  ];
}
