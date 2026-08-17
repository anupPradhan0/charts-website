import { z } from "zod";

/**
 * The admin contract.
 *
 * One schema per shape, used by the server actions, the JSON API and the forms
 * alike — the browser never gets to decide what a valid category or result is.
 * Messages are translation keys, not prose: the UI resolves them so a Hindi
 * administrator reads a Hindi error.
 */

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
/** Two characters, "00".."99" — the value format the whole archive uses. */
const VALUE_PATTERN = /^\d{2}$/;

/** Turn a market name into a URL slug. The admin can still overwrite it. */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, "admin.errors.tooLong")
    .optional()
    .transform((v) => v ?? "");

/** English is the master string; Hindi and Odia fall back to it when blank. */
const localizedName = z.object({
  en: z.string().trim().min(2, "admin.errors.nameRequired").max(80, "admin.errors.tooLong"),
  hi: optionalText(80),
  or: optionalText(80),
});

const localizedDescription = z.object({
  en: z
    .string()
    .trim()
    .min(10, "admin.errors.descriptionRequired")
    .max(600, "admin.errors.tooLong"),
  hi: optionalText(600),
  or: optionalText(600),
});

export const categoryInputSchema = z.object({
  name: localizedName,
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "admin.errors.slugRequired")
    .max(64, "admin.errors.tooLong")
    .regex(SLUG_PATTERN, "admin.errors.slugFormat"),
  description: localizedDescription,
  scheduleTime: z.string().trim().regex(TIME_PATTERN, "admin.errors.timeFormat"),
  group: z.enum(["day", "night", "special"]),
  isActive: z.boolean(),
  displayOrder: z.coerce
    .number("admin.errors.displayOrder")
    .int("admin.errors.displayOrder")
    .min(0, "admin.errors.displayOrder")
    .max(9999, "admin.errors.displayOrder"),
  updateFrequency: z.string().trim().min(1, "admin.errors.required").max(32, "admin.errors.tooLong"),
  accent: z.coerce.number().int().min(1).max(6),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;

export const categoryPatchSchema = categoryInputSchema.partial();
export type CategoryPatch = z.infer<typeof categoryPatchSchema>;

const resultShape = {
  categoryId: z.string().trim().min(1, "admin.errors.categoryRequired"),
  value: z
    .string()
    .trim()
    .regex(VALUE_PATTERN, "admin.errors.valueFormat")
    .nullish()
    .transform((v) => v ?? null),
  publishedDate: z.string().trim().regex(ISO_DATE, "admin.errors.dateFormat"),
  publishedTime: z.string().trim().regex(TIME_PATTERN, "admin.errors.timeFormat"),
  status: z.enum(["published", "pending", "scheduled"]),
};

/** A published entry must carry a value; an unpublished one must not — the
 *  public board reads `value === null` as "nothing published yet". */
function checkValueAgainstStatus(
  row: { value: string | null; status: string },
  ctx: z.RefinementCtx,
) {
  if (row.status === "published" && row.value === null) {
    ctx.addIssue({ code: "custom", path: ["value"], message: "admin.errors.valueRequired" });
  }
  if (row.status !== "published" && row.value !== null) {
    ctx.addIssue({ code: "custom", path: ["value"], message: "admin.errors.valueNotPublished" });
  }
}

export const resultInputSchema = z.object(resultShape).superRefine(checkValueAgainstStatus);
export type ResultInput = z.infer<typeof resultInputSchema>;

export const resultPatchSchema = z.object(resultShape).partial();
export type ResultPatch = z.infer<typeof resultPatchSchema>;

/** Bulk entry. The whole batch is inserted in one transaction or not at all. */
export const bulkResultsSchema = z.object({
  rows: z.array(z.object(resultShape).superRefine(checkValueAgainstStatus)).min(1).max(100),
});
export type BulkResultsInput = z.infer<typeof bulkResultsSchema>;

// ------------------------------------------------------------------ queries ---

export const CATEGORY_SORTS = [
  "order_asc",
  "name_asc",
  "name_desc",
  "created_desc",
  "updated_desc",
] as const;

export const adminCategoryQuerySchema = z.object({
  search: z.string().trim().max(64).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  group: z.enum(["day", "night", "special"]).optional(),
  sort: z.enum(CATEGORY_SORTS).default("order_asc"),
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type AdminCategoryQuery = z.infer<typeof adminCategoryQuerySchema>;

export const RESULT_SORTS = [
  "date_desc",
  "date_asc",
  "value_asc",
  "value_desc",
  "category_asc",
  "updated_desc",
] as const;

export const adminResultQuerySchema = z.object({
  search: z.string().trim().max(64).optional(),
  /** Category id or slug — the list links both ways. */
  category: z.string().trim().max(64).optional(),
  status: z.enum(["published", "pending", "scheduled"]).optional(),
  date: z.string().regex(ISO_DATE).optional(),
  startDate: z.string().regex(ISO_DATE).optional(),
  endDate: z.string().regex(ISO_DATE).optional(),
  sort: z.enum(RESULT_SORTS).default("date_desc"),
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type AdminResultQuery = z.infer<typeof adminResultQuerySchema>;

// ------------------------------------------------------------------ outcome ---

export type FieldErrors = Record<string, string>;

export type Outcome<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      /** unauthorized | validation | conflict | not_found | blocked */
      code: "unauthorized" | "validation" | "conflict" | "not_found" | "blocked";
      /** A translation key, resolved by whichever surface renders it. */
      message: string;
      fieldErrors?: FieldErrors;
    };

export function succeed<T>(data: T): Outcome<T> {
  return { ok: true, data };
}

export function failWith<T>(
  code: Extract<Outcome<T>, { ok: false }>["code"],
  message: string,
  fieldErrors?: FieldErrors,
): Outcome<T> {
  return { ok: false, code, message, ...(fieldErrors ? { fieldErrors } : {}) };
}

/** Flatten Zod issues to `{ "name.en": "admin.errors.nameRequired" }`. */
export function fieldErrorsOf(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".") || "form";
    out[path] ??= issue.message;
  }
  return out;
}
