import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { fromDateColumn, toDateColumn } from "@/lib/utils/date";
import type { LocalizedText, ResultStatus } from "@/types";
import { requireAdmin } from "./auth";
import {
  bulkResultsSchema,
  failWith,
  fieldErrorsOf,
  resultInputSchema,
  resultPatchSchema,
  succeed,
  type AdminResultQuery,
  type Outcome,
} from "./schemas";
import type { Page } from "./categories";

/**
 * Result management.
 *
 * Unlike the category list, this table grows by one row per market per day, so
 * filtering, sorting and pagination all happen in SQL — the admin panel never
 * pulls the archive into memory to slice it.
 */

export interface AdminResultRow {
  id: string;
  categoryId: string;
  categorySlug: string;
  categoryName: LocalizedText;
  value: string | null;
  publishedDate: string;
  publishedTime: string;
  status: ResultStatus;
  createdAt: string;
  updatedAt: string;
}

const WITH_CATEGORY = {
  category: { select: { id: true, slug: true, name: true } },
} as const;

function text(value: unknown): LocalizedText {
  const raw = (value ?? {}) as Partial<LocalizedText>;
  const en = raw.en ?? "";
  return { en, hi: raw.hi ?? en, or: raw.or ?? en };
}

type ResultRecord = {
  id: string;
  categoryId: string;
  value: string | null;
  publishedDate: Date;
  publishedTime: string;
  status: ResultStatus;
  createdAt: Date;
  updatedAt: Date;
  category: { id: string; slug: string; name: unknown };
};

function toRow(row: ResultRecord): AdminResultRow {
  return {
    id: row.id,
    categoryId: row.categoryId,
    categorySlug: row.category.slug,
    categoryName: text(row.category.name),
    value: row.value,
    publishedDate: fromDateColumn(row.publishedDate),
    publishedTime: row.publishedTime,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function refreshPublicViews(): void {
  revalidatePath("/", "layout");
}

function whereFor(query: AdminResultQuery) {
  const and: Record<string, unknown>[] = [];

  if (query.category) {
    and.push({ OR: [{ categoryId: query.category }, { category: { slug: query.category } }] });
  }
  if (query.status) and.push({ status: query.status });
  if (query.date) and.push({ publishedDate: toDateColumn(query.date) });
  if (query.startDate) and.push({ publishedDate: { gte: toDateColumn(query.startDate) } });
  if (query.endDate) and.push({ publishedDate: { lte: toDateColumn(query.endDate) } });

  if (query.search) {
    const term = query.search;
    const or: Record<string, unknown>[] = [
      { value: { contains: term } },
      { category: { slug: { contains: term, mode: "insensitive" } } },
      { category: { name: { path: ["en"], string_contains: term } } },
    ];
    if (/^\d{4}-\d{2}-\d{2}$/.test(term)) or.push({ publishedDate: toDateColumn(term) });
    and.push({ OR: or });
  }

  return and.length ? { AND: and } : {};
}

function orderFor(sort: AdminResultQuery["sort"]) {
  switch (sort) {
    case "date_asc":
      return [{ publishedDate: "asc" as const }, { publishedTime: "asc" as const }];
    case "value_asc":
      return [{ value: { sort: "asc" as const, nulls: "last" as const } }];
    case "value_desc":
      return [{ value: { sort: "desc" as const, nulls: "last" as const } }];
    case "category_asc":
      return [
        { category: { slug: "asc" as const } },
        { publishedDate: "desc" as const },
      ];
    case "updated_desc":
      return [{ updatedAt: "desc" as const }];
    case "date_desc":
    default:
      return [{ publishedDate: "desc" as const }, { publishedTime: "desc" as const }];
  }
}

export async function listAdminResults(query: AdminResultQuery): Promise<Page<AdminResultRow>> {
  await requireAdmin();
  const where = whereFor(query);

  const total = await prisma.result.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / query.limit));
  const page = Math.min(query.page, totalPages);

  const rows = await prisma.result.findMany({
    where,
    include: WITH_CATEGORY,
    orderBy: orderFor(query.sort),
    skip: (page - 1) * query.limit,
    take: query.limit,
  });

  return { items: rows.map(toRow), total, page, limit: query.limit, totalPages };
}

export async function getAdminResult(id: string): Promise<AdminResultRow | null> {
  await requireAdmin();
  const row = await prisma.result.findUnique({ where: { id }, include: WITH_CATEGORY });
  return row ? toRow(row) : null;
}

export async function createResult(input: unknown): Promise<Outcome<AdminResultRow>> {
  await requireAdmin();
  const parsed = resultInputSchema.safeParse(input);
  if (!parsed.success) {
    return failWith("validation", "admin.errors.checkFields", fieldErrorsOf(parsed.error));
  }
  const data = parsed.data;

  const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!category) {
    return failWith("validation", "admin.errors.checkFields", {
      categoryId: "admin.errors.categoryMissing",
    });
  }

  const clash = await prisma.result.findUnique({
    where: {
      categoryId_publishedDate: {
        categoryId: data.categoryId,
        publishedDate: toDateColumn(data.publishedDate),
      },
    },
  });
  if (clash) {
    return failWith("conflict", "admin.errors.resultExists", {
      publishedDate: "admin.errors.resultExists",
    });
  }

  const row = await prisma.result.create({
    data: {
      categoryId: data.categoryId,
      value: data.value,
      publishedDate: toDateColumn(data.publishedDate),
      publishedTime: data.publishedTime,
      status: data.status,
    },
    include: WITH_CATEGORY,
  });
  refreshPublicViews();
  return succeed(toRow(row));
}

export async function updateResult(id: string, patch: unknown): Promise<Outcome<AdminResultRow>> {
  await requireAdmin();
  const parsed = resultPatchSchema.safeParse(patch);
  if (!parsed.success) {
    return failWith("validation", "admin.errors.checkFields", fieldErrorsOf(parsed.error));
  }
  const existing = await prisma.result.findUnique({ where: { id } });
  if (!existing) return failWith("not_found", "admin.errors.resultMissing");

  // The value/status rule is a property of the row after the patch, not of the
  // patch itself — check the merged shape.
  const merged = {
    categoryId: parsed.data.categoryId ?? existing.categoryId,
    value: parsed.data.value !== undefined ? parsed.data.value : existing.value,
    publishedDate: parsed.data.publishedDate ?? fromDateColumn(existing.publishedDate),
    publishedTime: parsed.data.publishedTime ?? existing.publishedTime,
    status: parsed.data.status ?? existing.status,
  };
  const validated = resultInputSchema.safeParse(merged);
  if (!validated.success) {
    return failWith("validation", "admin.errors.checkFields", fieldErrorsOf(validated.error));
  }

  const moved =
    merged.categoryId !== existing.categoryId ||
    merged.publishedDate !== fromDateColumn(existing.publishedDate);
  if (moved) {
    const clash = await prisma.result.findUnique({
      where: {
        categoryId_publishedDate: {
          categoryId: merged.categoryId,
          publishedDate: toDateColumn(merged.publishedDate),
        },
      },
    });
    if (clash && clash.id !== id) {
      return failWith("conflict", "admin.errors.resultExists", {
        publishedDate: "admin.errors.resultExists",
      });
    }
  }

  const row = await prisma.result.update({
    where: { id },
    data: {
      categoryId: merged.categoryId,
      value: merged.value,
      publishedDate: toDateColumn(merged.publishedDate),
      publishedTime: merged.publishedTime,
      status: merged.status,
    },
    include: WITH_CATEGORY,
  });
  refreshPublicViews();
  return succeed(toRow(row));
}

export async function deleteResult(id: string): Promise<Outcome<{ id: string }>> {
  await requireAdmin();
  const existing = await prisma.result.findUnique({ where: { id } });
  if (!existing) return failWith("not_found", "admin.errors.resultMissing");
  await prisma.result.delete({ where: { id } });
  refreshPublicViews();
  return succeed({ id });
}

/**
 * Bulk entry. Either every row lands or none does: the inserts run inside one
 * transaction, and duplicates are rejected before it opens so the failure is a
 * readable message rather than a constraint violation.
 */
export async function bulkCreateResults(
  input: unknown,
): Promise<Outcome<{ created: number; rows: AdminResultRow[] }>> {
  await requireAdmin();
  const parsed = bulkResultsSchema.safeParse(input);
  if (!parsed.success) {
    return failWith("validation", "admin.errors.checkFields", fieldErrorsOf(parsed.error));
  }
  const { rows } = parsed.data;

  const seen = new Set<string>();
  for (const [index, row] of rows.entries()) {
    const key = `${row.categoryId}|${row.publishedDate}`;
    if (seen.has(key)) {
      return failWith("conflict", "admin.errors.bulkDuplicate", {
        [`rows.${index}.publishedDate`]: "admin.errors.bulkDuplicate",
      });
    }
    seen.add(key);
  }

  const categoryIds = [...new Set(rows.map((r) => r.categoryId))];
  const known = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true },
  });
  if (known.length !== categoryIds.length) {
    return failWith("validation", "admin.errors.categoryMissing");
  }

  const existing = await prisma.result.findMany({
    where: {
      OR: rows.map((row) => ({
        categoryId: row.categoryId,
        publishedDate: toDateColumn(row.publishedDate),
      })),
    },
    select: { categoryId: true, publishedDate: true },
  });
  if (existing.length > 0) {
    const clashes = new Set(
      existing.map((row) => `${row.categoryId}|${fromDateColumn(row.publishedDate)}`),
    );
    const index = rows.findIndex((row) => clashes.has(`${row.categoryId}|${row.publishedDate}`));
    return failWith("conflict", "admin.errors.resultExists", {
      [`rows.${Math.max(index, 0)}.publishedDate`]: "admin.errors.resultExists",
    });
  }

  const created = await prisma.$transaction(
    rows.map((row) =>
      prisma.result.create({
        data: {
          categoryId: row.categoryId,
          value: row.value,
          publishedDate: toDateColumn(row.publishedDate),
          publishedTime: row.publishedTime,
          status: row.status,
        },
        include: WITH_CATEGORY,
      }),
    ),
  );
  refreshPublicViews();
  return succeed({ created: created.length, rows: created.map(toRow) });
}
