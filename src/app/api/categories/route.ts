import type { NextRequest } from "next/server";
import { z } from "zod";
import { ok, parseQuery } from "@/lib/api/http";
import { getCategorySummaries, listCategories } from "@/lib/services/categories";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  search: z.string().trim().min(1).max(64).optional(),
  status: z.enum(["active", "paused"]).optional(),
  /** `summary=true` decorates each category with its latest value and volume. */
  summary: z.enum(["true", "false"]).default("false"),
});

/** GET /api/categories */
export async function GET(request: NextRequest) {
  const parsed = parseQuery(querySchema, new URL(request.url));
  if ("response" in parsed) return parsed.response;

  const { search, status, summary } = parsed.data;

  if (summary === "true") {
    const rows = getCategorySummaries().filter(
      (s) =>
        (!status || s.category.status === status) &&
        (!search || s.category.name.toLowerCase().includes(search.toLowerCase())),
    );
    return ok({ data: rows, meta: { total: rows.length } });
  }

  const rows = listCategories({ search, status });
  return ok({ data: rows, meta: { total: rows.length } });
}
