import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/data/categories";
import { getDatasetTimestamp } from "@/lib/data/results";
import { SITE } from "@/lib/site";
import { NAV_PAGES } from "@/components/layout/nav";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = getDatasetTimestamp() ?? new Date().toISOString();
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
    ...CATEGORIES.map((category) => ({
      url: url(`/categories/${category.slug}`),
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  ];
}
