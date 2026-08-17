import type { NextRequest } from "next/server";
import { z } from "zod";
import { ok, parseQuery } from "@/lib/api/http";
import { getCategorySummaries, listCategories } from "@/lib/services/categories";
import { LOCALES, normalizeLocale } from "@/lib/i18n/config";
import { localizeCategory } from "@/lib/i18n/localize";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  search: z.string().trim().min(1).max(64).optional(),
  status: z.enum(["active", "paused"]).optional(),
  /** `summary=true` decorates each category with its latest value and volume. */
  summary: z.enum(["true", "false"]).default("false"),
  /** Resolves `name` and `description` to one language. Defaults to English. */
  locale: z.enum(LOCALES).optional(),
});

/** GET /api/categories */
export async function GET(request: NextRequest) {
  const parsed = parseQuery(querySchema, new URL(request.url));
  if ("response" in parsed) return parsed.response;

  const { search, status, summary } = parsed.data;
  const locale = normalizeLocale(parsed.data.locale);

  if (summary === "true") {
    const rows = (await getCategorySummaries())
      .filter(
        (s) =>
          (!status || s.category.status === status) &&
          (!search ||
            Object.values(s.category.name).some((n) =>
              n.toLowerCase().includes(search.toLowerCase()),
            )),
      )
      .map((s) => ({ ...s, category: localizeCategory(s.category, locale) }));
    return ok({ data: rows, meta: { total: rows.length, locale } });
  }

  const rows = (await listCategories({ search, status })).map((c) => localizeCategory(c, locale));
  return ok({ data: rows, meta: { total: rows.length, locale } });
}
