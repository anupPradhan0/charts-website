import { notFound, ok } from "@/lib/api/http";
import { getResultById } from "@/lib/services/results";
import { getCategory } from "@/lib/services/categories";
import { normalizeLocale } from "@/lib/i18n/config";
import { localizeCategory } from "@/lib/i18n/localize";

export const dynamic = "force-dynamic";

/** GET /api/results/:id — a single result entry, with its category. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const result = await getResultById(id);
  if (!result) return notFound(`No result with id "${id}"`);

  const locale = normalizeLocale(new URL(request.url).searchParams.get("locale"));
  const category = await getCategory(result.categorySlug);

  return ok({
    data: { ...result, category: category ? localizeCategory(category, locale) : null },
    meta: { locale },
  });
}
