import type { NextRequest } from "next/server";
import { okPrivate, parseQuery } from "@/lib/api/http";
import { handle, jsonBody, respond } from "@/lib/api/admin";
import { createResult, listAdminResults } from "@/lib/admin/results";
import { adminResultQuerySchema } from "@/lib/admin/schemas";

export const dynamic = "force-dynamic";

/** GET /api/admin/results?search=&category=&status=&date=&startDate=&endDate=&sort=&page=&limit= */
export async function GET(request: NextRequest) {
  return handle(async () => {
    const parsed = parseQuery(adminResultQuerySchema, new URL(request.url));
    if ("response" in parsed) return parsed.response;
    const page = await listAdminResults(parsed.data);
    return okPrivate({
      data: page.items,
      meta: {
        total: page.total,
        page: page.page,
        limit: page.limit,
        totalPages: page.totalPages,
        query: parsed.data,
      },
    });
  });
}

/** POST /api/admin/results */
export async function POST(request: NextRequest) {
  return handle(async () => respond(await createResult(await jsonBody(request)), 201));
}
