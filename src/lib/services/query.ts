import { z } from "zod";

/**
 * The single query contract shared by API routes and server-rendered pages.
 * API routes reject invalid input with 400; pages fall back to defaults so a
 * hand-edited URL degrades into a usable screen instead of an error.
 */

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected a YYYY-MM-DD date");

export const SORT_OPTIONS = [
  { value: "date_desc", label: "Newest first" },
  { value: "date_asc", label: "Oldest first" },
  { value: "value_desc", label: "Value: high to low" },
  { value: "value_asc", label: "Value: low to high" },
  { value: "category_asc", label: "Category A–Z" },
] as const;

export const STATUS_OPTIONS = [
  { value: "published", label: "Published" },
  { value: "pending", label: "Pending" },
  { value: "scheduled", label: "Scheduled" },
] as const;

export const GROUP_OPTIONS = [
  { value: "day", label: "Day markets" },
  { value: "night", label: "Night markets" },
  { value: "special", label: "Special markets" },
] as const;

export const resultQuerySchema = z.object({
  category: z.string().min(1).max(64).optional(),
  group: z.enum(["day", "night", "special"]).optional(),
  date: isoDate.optional(),
  startDate: isoDate.optional(),
  endDate: isoDate.optional(),
  search: z.string().trim().min(1).max(64).optional(),
  status: z.enum(["published", "pending", "scheduled"]).optional(),
  sort: z
    .enum(["date_desc", "date_asc", "value_desc", "value_asc", "category_asc"])
    .default("date_desc"),
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ResultQuery = z.infer<typeof resultQuerySchema>;

export const statisticsQuerySchema = z.object({
  category: z.string().min(1).max(64).optional(),
  group: z.enum(["day", "night", "special"]).optional(),
  days: z.coerce.number().int().min(7).max(60).default(30),
});

export type StatisticsQuery = z.infer<typeof statisticsQuerySchema>;

/** Next's `searchParams` and `URLSearchParams` normalised to a flat record,
 *  with blank values dropped so `?category=` behaves like "no filter". */
export type RawParams = Record<string, string | string[] | undefined> | URLSearchParams;

export function normalizeParams(raw: RawParams): Record<string, string> {
  const entries =
    raw instanceof URLSearchParams ? [...raw.entries()] : Object.entries(raw);
  const out: Record<string, string> = {};
  for (const [key, value] of entries) {
    const first = Array.isArray(value) ? value[0] : value;
    if (typeof first === "string" && first.trim() !== "") out[key] = first.trim();
  }
  return out;
}

/** Lenient parse for pages: bad params are ignored rather than fatal. */
export function parsePageQuery<T extends z.ZodType>(
  schema: T,
  raw: RawParams,
): z.infer<T> {
  const params = normalizeParams(raw);
  const parsed = schema.safeParse(params);
  if (parsed.success) return parsed.data;
  // Drop only the offending keys, keep everything else.
  const bad = new Set(parsed.error.issues.map((i) => String(i.path[0])));
  for (const key of bad) delete params[key];
  const retry = schema.safeParse(params);
  return retry.success ? retry.data : schema.parse({});
}

/** Build a query string from the current query plus a patch, dropping
 *  defaults and empty values so URLs stay short and canonical. */
export function buildQuery(
  current: Record<string, unknown>,
  patch: Record<string, unknown> = {},
): string {
  const merged = { ...current, ...patch };
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (value === undefined || value === null || value === "") continue;
    if (key === "page" && Number(value) === 1) continue;
    if (key === "sort" && value === "date_desc") continue;
    if (key === "limit" && Number(value) === 20) continue;
    sp.set(key, String(value));
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}
