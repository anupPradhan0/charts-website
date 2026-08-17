import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { LocalizedText, MarketGroup } from "@/types";
import { requireAdmin } from "./auth";
import {
  categoryInputSchema,
  categoryPatchSchema,
  failWith,
  fieldErrorsOf,
  succeed,
  type AdminCategoryQuery,
  type CategoryInput,
  type CategoryPatch,
  type Outcome,
} from "./schemas";

/**
 * Category management.
 *
 * Every function here starts with `requireAdmin()` — authorization is enforced
 * at the service, not at the surface, so a new route or action cannot forget
 * it. The public site reads the database per request, so a write is visible
 * there immediately.
 */

export interface AdminCategoryRow {
  id: string;
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  scheduleTime: string;
  group: MarketGroup;
  isActive: boolean;
  displayOrder: number;
  updateFrequency: string;
  accent: number;
  createdAt: string;
  updatedAt: string;
  resultCount: number;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function text(value: unknown): LocalizedText {
  const raw = (value ?? {}) as Partial<LocalizedText>;
  const en = raw.en ?? "";
  return { en, hi: raw.hi ?? en, or: raw.or ?? en };
}

type CategoryRecord = Awaited<ReturnType<typeof prisma.category.findMany>>[number] & {
  _count?: { results: number };
};

function toRow(row: CategoryRecord): AdminCategoryRow {
  return {
    id: row.id,
    slug: row.slug,
    name: text(row.name),
    description: text(row.description),
    scheduleTime: row.scheduleTime,
    group: row.group as MarketGroup,
    isActive: row.isActive,
    displayOrder: row.displayOrder,
    updateFrequency: row.updateFrequency,
    accent: row.accent,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    resultCount: row._count?.results ?? 0,
  };
}

/** The public pages read the database per request, so a write only has to clear
 *  what Next itself caches (the router cache and any prerendered route). */
function refreshPublicViews(): void {
  revalidatePath("/", "layout");
}

export async function listAdminCategories(
  query: AdminCategoryQuery,
): Promise<Page<AdminCategoryRow>> {
  await requireAdmin();

  const rows = await prisma.category.findMany({
    where: {
      ...(query.status ? { isActive: query.status === "active" } : {}),
      ...(query.group ? { group: query.group } : {}),
    },
    include: { _count: { select: { results: true } } },
  });

  // ponytail: the market list is tens of rows by nature, so the free-text match
  // (which has to look inside the localized JSON name) runs here rather than as
  // three `path` predicates in SQL. Push it down if this table ever grows.
  const needle = query.search?.toLowerCase();
  const filtered = rows.map(toRow).filter((row) => {
    if (!needle) return true;
    return (
      row.slug.includes(needle) ||
      Object.values(row.name).some((n) => n.toLowerCase().includes(needle))
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (query.sort) {
      case "name_asc":
        return a.name.en.localeCompare(b.name.en);
      case "name_desc":
        return b.name.en.localeCompare(a.name.en);
      case "created_desc":
        return b.createdAt.localeCompare(a.createdAt);
      case "updated_desc":
        return b.updatedAt.localeCompare(a.updatedAt);
      case "order_asc":
      default:
        return a.displayOrder - b.displayOrder || a.scheduleTime.localeCompare(b.scheduleTime);
    }
  });

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / query.limit));
  const page = Math.min(query.page, totalPages);
  const start = (page - 1) * query.limit;
  return {
    items: sorted.slice(start, start + query.limit),
    total,
    page,
    limit: query.limit,
    totalPages,
  };
}

export async function getAdminCategory(id: string): Promise<AdminCategoryRow | null> {
  await requireAdmin();
  const row = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { results: true } } },
  });
  return row ? toRow(row) : null;
}

/** Every category, ordered for a <select>. Used by the result forms. */
export async function listCategoryOptions(): Promise<
  { id: string; slug: string; name: LocalizedText; scheduleTime: string; isActive: boolean }[]
> {
  await requireAdmin();
  const rows = await prisma.category.findMany({
    orderBy: [{ displayOrder: "asc" }, { scheduleTime: "asc" }],
    select: { id: true, slug: true, name: true, scheduleTime: true, isActive: true },
  });
  return rows.map((row) => ({ ...row, name: text(row.name) }));
}

/** The order a new category should get: after everything that exists. */
export async function getNextDisplayOrder(): Promise<number> {
  await requireAdmin();
  const highest = await prisma.category.aggregate({ _max: { displayOrder: true } });
  return (highest._max.displayOrder ?? 0) + 1;
}

export async function createCategory(input: unknown): Promise<Outcome<AdminCategoryRow>> {
  await requireAdmin();
  const parsed = categoryInputSchema.safeParse(input);
  if (!parsed.success) {
    return failWith("validation", "admin.errors.checkFields", fieldErrorsOf(parsed.error));
  }
  const data = parsed.data;

  const clash = await findClash(data);
  if (clash) return clash;

  const row = await prisma.category.create({
    data: {
      slug: data.slug,
      name: withFallback(data.name),
      description: withFallback(data.description),
      scheduleTime: data.scheduleTime,
      group: data.group,
      isActive: data.isActive,
      displayOrder: data.displayOrder,
      updateFrequency: data.updateFrequency,
      accent: data.accent,
    },
    include: { _count: { select: { results: true } } },
  });
  refreshPublicViews();
  return succeed(toRow(row));
}

export async function updateCategory(
  id: string,
  patch: unknown,
): Promise<Outcome<AdminCategoryRow>> {
  await requireAdmin();
  const parsed = categoryPatchSchema.safeParse(patch);
  if (!parsed.success) {
    return failWith("validation", "admin.errors.checkFields", fieldErrorsOf(parsed.error));
  }
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) return failWith("not_found", "admin.errors.categoryMissing");

  const data = parsed.data;
  const clash = await findClash(data, id);
  if (clash) return clash;

  const row = await prisma.category.update({
    where: { id },
    data: {
      ...(data.slug !== undefined ? { slug: data.slug } : {}),
      ...(data.name !== undefined ? { name: withFallback(data.name) } : {}),
      ...(data.description !== undefined
        ? { description: withFallback(data.description) }
        : {}),
      ...(data.scheduleTime !== undefined ? { scheduleTime: data.scheduleTime } : {}),
      ...(data.group !== undefined ? { group: data.group } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      ...(data.displayOrder !== undefined ? { displayOrder: data.displayOrder } : {}),
      ...(data.updateFrequency !== undefined ? { updateFrequency: data.updateFrequency } : {}),
      ...(data.accent !== undefined ? { accent: data.accent } : {}),
    },
    include: { _count: { select: { results: true } } },
  });
  refreshPublicViews();
  return succeed(toRow(row));
}

export async function setCategoryActive(
  id: string,
  isActive: boolean,
): Promise<Outcome<AdminCategoryRow>> {
  return updateCategory(id, { isActive });
}

/**
 * Deletion is refused while the category still owns results — the archive rows
 * would go with it. The caller is pointed at deactivation instead, which is
 * what "retire a market" actually means here.
 */
export async function deleteCategory(id: string): Promise<Outcome<{ id: string }>> {
  await requireAdmin();
  const existing = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { results: true } } },
  });
  if (!existing) return failWith("not_found", "admin.errors.categoryMissing");
  if (existing._count.results > 0) {
    return failWith("blocked", "admin.errors.deleteBlocked");
  }

  await prisma.category.delete({ where: { id } });
  refreshPublicViews();
  return succeed({ id });
}

/** Blank Hindi/Odia strings fall back to English rather than rendering empty. */
function withFallback(value: { en: string; hi: string; or: string }): LocalizedText {
  return { en: value.en, hi: value.hi || value.en, or: value.or || value.en };
}

/** Unique slug, and a guard against creating the same market twice under a
 *  different slug — a duplicate English name is almost always a mistake. */
async function findClash(
  data: CategoryInput | CategoryPatch,
  ignoreId?: string,
): Promise<Extract<Outcome<never>, { ok: false }> | null> {
  if (data.slug) {
    const bySlug = await prisma.category.findUnique({ where: { slug: data.slug } });
    if (bySlug && bySlug.id !== ignoreId) {
      return failWith("conflict", "admin.errors.slugTaken", {
        slug: "admin.errors.slugTaken",
      }) as Extract<Outcome<never>, { ok: false }>;
    }
  }
  if (data.name?.en) {
    const sameName = await prisma.category.findFirst({
      where: { name: { path: ["en"], equals: data.name.en }, ...(ignoreId ? { NOT: { id: ignoreId } } : {}) },
    });
    if (sameName) {
      return failWith("conflict", "admin.errors.nameTaken", {
        "name.en": "admin.errors.nameTaken",
      }) as Extract<Outcome<never>, { ok: false }>;
    }
  }
  return null;
}
