import type { NextRequest } from "next/server";
import { okPrivate, parseQuery } from "@/lib/api/http";
import { handle, jsonBody, respond } from "@/lib/api/admin";
import { createCategory, listAdminCategories } from "@/lib/admin/categories";
import { adminCategoryQuerySchema } from "@/lib/admin/schemas";

export const dynamic = "force-dynamic";

/** GET /api/admin/categories?search=&status=&group=&sort=&page=&limit= */
export async function GET(request: NextRequest) {
  return handle(async () => {
    const parsed = parseQuery(adminCategoryQuerySchema, new URL(request.url));
    if ("response" in parsed) return parsed.response;
    const page = await listAdminCategories(parsed.data);
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

/** POST /api/admin/categories */
export async function POST(request: NextRequest) {
  return handle(async () => respond(await createCategory(await jsonBody(request)), 201));
}
