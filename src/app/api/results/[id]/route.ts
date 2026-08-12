import { notFound, ok } from "@/lib/api/http";
import { getResultById } from "@/lib/services/results";
import { getCategory } from "@/lib/services/categories";

export const dynamic = "force-dynamic";

/** GET /api/results/:id — a single result entry, with its category. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const result = getResultById(id);
  if (!result) return notFound(`No result with id "${id}"`);

  return ok({
    data: { ...result, category: getCategory(result.categorySlug) },
  });
}
