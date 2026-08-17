import { prisma } from "@/lib/db";
import { fromDateColumn, toDateColumn, toISODate } from "@/lib/utils/date";
import type { ResultStatus } from "@/types";
import { requireAdmin } from "./auth";
import type { AdminCategoryRow } from "./categories";
import type { AdminResultRow } from "./results";
import { listAdminCategories } from "./categories";
import { listAdminResults } from "./results";

/**
 * The dashboard numbers.
 *
 * Every figure is counted in PostgreSQL. Nothing here is estimated, sampled or
 * invented — an empty database produces zeros, not placeholder statistics.
 */

export interface AdminOverview {
  totalCategories: number;
  activeCategories: number;
  totalResults: number;
  publishedToday: number;
  pendingToday: number;
  byStatus: Record<ResultStatus, number>;
  /** Entries published per day over the last 14 days, oldest first. */
  activity: { date: string; count: number }[];
  recentResults: AdminResultRow[];
  recentCategories: AdminCategoryRow[];
  latestUpdates: AdminResultRow[];
  lastUpdatedAt: string | null;
}

export interface AdminSettings {
  account: { name: string; email: string; lastLoginAt: string | null };
  categories: number;
  results: number;
  oldestEntry: string | null;
  newestEntry: string | null;
}

/** What the settings screen reports: who is signed in, and what is stored. */
export async function getAdminSettings(): Promise<AdminSettings> {
  const admin = await requireAdmin();
  const [account, categories, results, oldest, newest] = await Promise.all([
    prisma.admin.findUnique({ where: { id: admin.id }, select: { lastLoginAt: true } }),
    prisma.category.count(),
    prisma.result.count(),
    prisma.result.findFirst({ orderBy: { publishedDate: "asc" }, select: { publishedDate: true } }),
    prisma.result.findFirst({ orderBy: { publishedDate: "desc" }, select: { publishedDate: true } }),
  ]);

  return {
    account: {
      name: admin.name,
      email: admin.email,
      lastLoginAt: account?.lastLoginAt?.toISOString() ?? null,
    },
    categories,
    results,
    oldestEntry: oldest ? fromDateColumn(oldest.publishedDate) : null,
    newestEntry: newest ? fromDateColumn(newest.publishedDate) : null,
  };
}

export async function getAdminOverview(): Promise<AdminOverview> {
  await requireAdmin();
  const today = toISODate(new Date());
  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - 13);

  const [
    totalCategories,
    activeCategories,
    totalResults,
    publishedToday,
    pendingToday,
    statusGroups,
    activityGroups,
    newest,
  ] = await Promise.all([
    prisma.category.count(),
    prisma.category.count({ where: { isActive: true } }),
    prisma.result.count(),
    prisma.result.count({ where: { publishedDate: toDateColumn(today), status: "published" } }),
    prisma.result.count({ where: { publishedDate: toDateColumn(today), status: "pending" } }),
    prisma.result.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.result.groupBy({
      by: ["publishedDate"],
      where: {
        status: "published",
        publishedDate: { gte: toDateColumn(toISODate(windowStart)) },
      },
      _count: { _all: true },
    }),
    prisma.result.findFirst({ orderBy: { updatedAt: "desc" }, select: { updatedAt: true } }),
  ]);

  const byStatus: Record<ResultStatus, number> = { published: 0, pending: 0, scheduled: 0 };
  for (const group of statusGroups) byStatus[group.status] = group._count._all;

  const counted = new Map(
    activityGroups.map((g) => [fromDateColumn(g.publishedDate), g._count._all]),
  );
  const activity: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    const date = toISODate(day);
    activity.push({ date, count: counted.get(date) ?? 0 });
  }

  const [recentResults, recentCategories, latestUpdates] = await Promise.all([
    listAdminResults({ sort: "date_desc", page: 1, limit: 8 }),
    listAdminCategories({ sort: "created_desc", page: 1, limit: 5 }),
    listAdminResults({ sort: "updated_desc", page: 1, limit: 6 }),
  ]);

  return {
    totalCategories,
    activeCategories,
    totalResults,
    publishedToday,
    pendingToday,
    byStatus,
    activity,
    recentResults: recentResults.items,
    recentCategories: recentCategories.items,
    latestUpdates: latestUpdates.items,
    lastUpdatedAt: newest?.updatedAt.toISOString() ?? null,
  };
}
