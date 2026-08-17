import { notFound, ok } from "@/lib/api/http";
import { getCategorySummary } from "@/lib/services/categories";
import { getResultsForCategory } from "@/lib/services/results";
import { normalizeLocale } from "@/lib/i18n/config";
import { localizeCategory } from "@/lib/i18n/localize";

export const dynamic = "force-dynamic";

/** GET /api/categories/:slug — category, latest value and its recent entries. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const locale = normalizeLocale(new URL(request.url).searchParams.get("locale"));
  const summary = await getCategorySummary(slug);
  if (!summary) return notFound(`No category with slug "${slug}"`);

  return ok({
    data: {
      ...summary,
      category: localizeCategory(summary.category, locale),
      recentResults: await getResultsForCategory(slug, 30),
    },
    meta: { locale },
  });
}
