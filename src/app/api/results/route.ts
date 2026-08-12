import type { NextRequest } from "next/server";
import { ok, parseQuery } from "@/lib/api/http";
import { listResults } from "@/lib/services/results";
import { resultQuerySchema } from "@/lib/services/query";

export const dynamic = "force-dynamic";

/**
 * GET /api/results
 * Query: category, date, startDate, endDate, search, status, sort, page, limit
 */
export async function GET(request: NextRequest) {
  const parsed = parseQuery(resultQuerySchema, new URL(request.url));
  if ("response" in parsed) return parsed.response;

  const page = listResults(parsed.data);
  return ok({
    data: page.items,
    meta: {
      total: page.total,
      page: page.page,
      limit: page.limit,
      totalPages: page.totalPages,
      query: parsed.data,
    },
  });
}
