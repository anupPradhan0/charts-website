import type { Metadata } from "next";
import Link from "next/link";
import { ListOrdered, Plus, Tags, Upload } from "lucide-react";
import { Card, CardHeader, EmptyState, StatTile, buttonClass } from "@/components/ui/primitives";
import { AdminPageHeader, ResultStatusBadge, ActiveBadge } from "@/components/admin/ui";
import { getAdminOverview } from "@/lib/admin/overview";
import { createFormatter } from "@/lib/utils/format";
import { getLocale, getT } from "@/lib/i18n";
import { localized } from "@/lib/i18n/localize";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("admin.dashboard.title") };
}

export default async function AdminDashboardPage() {
  const t = await getT();
  const locale = await getLocale();
  const fmt = createFormatter(t);
  const overview = await getAdminOverview();

  const peak = Math.max(1, ...overview.activity.map((d) => d.count));

  return (
    <>
      <AdminPageHeader
        title={t("admin.dashboard.title")}
        description={t("admin.dashboard.description")}
        action={
          <>
            <Link href="/admin/categories/new" className={buttonClass("primary")}>
              <Plus className="size-4" aria-hidden="true" />
              {t("admin.categories.create")}
            </Link>
            <Link href="/admin/results/new" className={buttonClass("secondary")}>
              <Plus className="size-4" aria-hidden="true" />
              {t("admin.results.create")}
            </Link>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label={t("admin.dashboard.totalCategories")}
          value={fmt.number(overview.totalCategories)}
          hint={t("admin.dashboard.pausedCount", {
            count: fmt.number(overview.totalCategories - overview.activeCategories),
          })}
          icon={<Tags className="size-4" aria-hidden="true" />}
        />
        <StatTile
          label={t("admin.dashboard.activeCategories")}
          value={fmt.number(overview.activeCategories)}
          hint={t("admin.dashboard.ofTotal", { count: fmt.number(overview.totalCategories) })}
        />
        <StatTile
          label={t("admin.dashboard.totalResults")}
          value={fmt.number(overview.totalResults)}
          hint={t("admin.dashboard.archiveSize")}
          icon={<ListOrdered className="size-4" aria-hidden="true" />}
        />
        <StatTile
          label={t("admin.dashboard.publishedToday")}
          value={fmt.number(overview.publishedToday)}
          hint={t("admin.dashboard.pendingToday", { count: fmt.number(overview.pendingToday) })}
        />
      </div>

      <p className="mt-3 text-xs text-muted tabular">
        {t("admin.dashboard.statusBreakdown", {
          published: fmt.number(overview.byStatus.published),
          pending: fmt.number(overview.byStatus.pending),
          scheduled: fmt.number(overview.byStatus.scheduled),
        })}
        {overview.lastUpdatedAt
          ? ` · ${t("admin.dashboard.lastUpdated")}: ${fmt.dateTime(overview.lastUpdatedAt)}`
          : null}
      </p>

      <div className="mt-4 grid gap-3 sm:mt-6 lg:grid-cols-3">
        {/* Activity ------------------------------------------------------- */}
        <Card className="lg:col-span-2">
          <CardHeader
            title={t("admin.dashboard.activity")}
            description={t("admin.dashboard.activityHint")}
          />
          <div className="p-4 sm:p-5">
            {/* A bar per day. Plain CSS heights: a chart library would be a
                dependency for fourteen numbers. */}
            <ul className="flex h-32 items-end gap-1 sm:gap-1.5">
              {overview.activity.map((day) => (
                <li key={day.date} className="flex h-full flex-1 flex-col justify-end">
                  <span
                    className="rounded-t bg-accent/80"
                    style={{ height: `${Math.max(2, (day.count / peak) * 100)}%` }}
                    title={`${fmt.date(day.date)}: ${fmt.number(day.count)}`}
                  />
                  <span className="sr-only">
                    {fmt.date(day.date)}: {fmt.number(day.count)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex justify-between text-xs text-muted tabular">
              <span>{fmt.dateShort(overview.activity[0].date)}</span>
              <span>{fmt.dateShort(overview.activity[overview.activity.length - 1].date)}</span>
            </div>
          </div>
        </Card>

        {/* Recently created categories ------------------------------------ */}
        <Card>
          <CardHeader
            title={t("admin.dashboard.recentCategories")}
            description={t("admin.dashboard.recentCategoriesHint")}
            action={
              <Link
                href="/admin/categories"
                className="text-sm font-medium text-accent hover:underline"
              >
                {t("admin.common.all")}
              </Link>
            }
          />
          {overview.recentCategories.length === 0 ? (
            <EmptyState
              title={t("admin.dashboard.noCategoriesYet")}
              action={
                <Link href="/admin/categories/new" className={buttonClass("primary")}>
                  <Plus className="size-4" aria-hidden="true" />
                  {t("admin.categories.create")}
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-line">
              {overview.recentCategories.map((category) => (
                <li key={category.id} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/categories/${category.id}`}
                      className="block truncate text-sm font-medium text-accent hover:underline"
                    >
                      {localized(category.name, locale)}
                    </Link>
                    <p className="text-xs text-muted tabular">
                      {fmt.schedule(category.scheduleTime)} · {fmt.date(category.createdAt.slice(0, 10))}
                    </p>
                  </div>
                  <ActiveBadge isActive={category.isActive} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Recent results ------------------------------------------------- */}
        <Card className="lg:col-span-2">
          <CardHeader
            title={t("admin.dashboard.recentResults")}
            description={t("admin.dashboard.recentResultsHint")}
            action={
              <Link href="/admin/results" className="text-sm font-medium text-accent hover:underline">
                {t("admin.common.all")}
              </Link>
            }
          />
          {overview.recentResults.length === 0 ? (
            <EmptyState
              title={t("admin.dashboard.noResultsYet")}
              description={t("admin.dashboard.noResultsYetHint")}
            />
          ) : (
            <ul className="divide-y divide-line">
              {overview.recentResults.map((row) => (
                <li key={row.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="w-9 shrink-0 text-center font-mono text-lg font-semibold tabular">
                    {row.value ?? "––"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/results/${row.id}`}
                      className="block truncate text-sm font-medium text-accent hover:underline"
                    >
                      {localized(row.categoryName, locale)}
                    </Link>
                    <p className="text-xs text-muted tabular">
                      {fmt.date(row.publishedDate)} · {row.publishedTime}
                    </p>
                  </div>
                  <ResultStatusBadge status={row.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Latest updates ------------------------------------------------- */}
        <Card>
          <CardHeader
            title={t("admin.dashboard.latestUpdates")}
            description={t("admin.dashboard.latestUpdatesHint")}
          />
          {overview.latestUpdates.length === 0 ? (
            <EmptyState title={t("admin.dashboard.noResultsYet")} />
          ) : (
            <ul className="divide-y divide-line">
              {overview.latestUpdates.map((row) => (
                <li key={row.id} className="px-4 py-2.5">
                  <Link
                    href={`/admin/results/${row.id}`}
                    className="block truncate text-sm font-medium text-accent hover:underline"
                  >
                    {localized(row.categoryName, locale)} · {row.value ?? "––"}
                  </Link>
                  <p className="text-xs text-muted tabular">{fmt.relative(row.updatedAt)}</p>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-line p-4">
            <Link href="/admin/results/bulk" className={buttonClass("secondary", "w-full")}>
              <Upload className="size-4" aria-hidden="true" />
              {t("admin.results.bulk")}
            </Link>
          </div>
        </Card>
      </div>
    </>
  );
}
