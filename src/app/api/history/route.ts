import type { NextRequest } from "next/server";
import { ok, parseQuery } from "@/lib/api/http";
import { listResults } from "@/lib/services/results";
import { resultQuerySchema } from "@/lib/services/query";
import { getArchiveRange } from "@/lib/data/results";

export const dynamic = "force-dynamic";

/**
 * GET /api/history
 * The archive view of /api/results: same filters, plus the coverage range so a
 * client can build a date picker without a second request.
 */
export async function GET(request: NextRequest) {
  const parsed = parseQuery(resultQuerySchema, new URL(request.url));
  if ("response" in parsed) return parsed.response;

  const page = listResults(parsed.data);
  const range = getArchiveRange();

  return ok({
    data: page.items,
    meta: {
      total: page.total,
      page: page.page,
      limit: page.limit,
      totalPages: page.totalPages,
      coverage: range,
      query: parsed.data,
    },
  });
}
