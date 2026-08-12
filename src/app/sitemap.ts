import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/data/categories";
import { getDatasetTimestamp } from "@/lib/data/results";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = getDatasetTimestamp() ?? new Date().toISOString();
  const url = (path: string) => new URL(path, SITE.url).toString();

  return [
    { url: url("/"), lastModified, changeFrequency: "hourly", priority: 1 },
    { url: url("/results"), lastModified, changeFrequency: "hourly", priority: 0.9 },
    { url: url("/categories"), lastModified, changeFrequency: "daily", priority: 0.8 },
    { url: url("/history"), lastModified, changeFrequency: "daily", priority: 0.8 },
    { url: url("/statistics"), lastModified, changeFrequency: "daily", priority: 0.7 },
    { url: url("/about"), changeFrequency: "monthly", priority: 0.3 },
    ...CATEGORIES.map((category) => ({
      url: url(`/categories/${category.slug}`),
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  ];
}
