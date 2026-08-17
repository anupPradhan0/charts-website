import type { NextRequest } from "next/server";
import { fail, ok, parseQuery } from "@/lib/api/http";
import { getStatistics } from "@/lib/services/statistics";
import { statisticsQuerySchema } from "@/lib/services/query";
import { categoryExists } from "@/lib/services/results";
import { normalizeLocale } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";

/** GET /api/statistics?category=&days= */
export async function GET(request: NextRequest) {
  const parsed = parseQuery(statisticsQuerySchema, new URL(request.url));
  if ("response" in parsed) return parsed.response;

  const { category } = parsed.data;
  if (category && !(await categoryExists(category))) {
    return fail(404, "not_found", `No category with slug "${category}"`);
  }

  const locale = normalizeLocale(new URL(request.url).searchParams.get("locale"));
  return ok({
    data: await getStatistics(parsed.data, locale),
    meta: { query: parsed.data, locale },
  });
}
