import { notFound, ok } from "@/lib/api/http";
import { getCategorySummary } from "@/lib/services/categories";
import { getResultsForCategory } from "@/lib/services/results";

export const dynamic = "force-dynamic";

/** GET /api/categories/:slug — category, latest value and its recent entries. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const summary = getCategorySummary(slug);
  if (!summary) return notFound(`No category with slug "${slug}"`);

  return ok({
    data: {
      ...summary,
      recentResults: getResultsForCategory(slug, 30),
    },
  });
}
