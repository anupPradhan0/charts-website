import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus, Power, PowerOff, Search, Tags } from "lucide-react";
import { Card, CardHeader, EmptyState, buttonClass } from "@/components/ui/primitives";
import { Pagination } from "@/components/ui/Pagination";
import {
  ActiveBadge,
  AdminPageHeader,
  Notice,
  TD,
  TH,
  TableScroller,
} from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { listAdminCategories } from "@/lib/admin/categories";
import { adminCategoryQuerySchema } from "@/lib/admin/schemas";
import { parsePageQuery } from "@/lib/services/query";
import { createFormatter } from "@/lib/utils/format";
import { getLocale, getT } from "@/lib/i18n";
import { localized } from "@/lib/i18n/localize";
import { FIELD } from "@/components/admin/fields";
import { deleteCategoryAction, toggleCategoryAction } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("admin.categories.title") };
}

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const t = await getT();
  const locale = await getLocale();
  const fmt = createFormatter(t);
  const raw = await searchParams;
  const query = parsePageQuery(adminCategoryQuerySchema, raw);
  const page = await listAdminCategories(query);

  const notice = typeof raw.notice === "string" ? raw.notice : undefined;
  const filtered = Boolean(query.search || query.status || query.group);

  return (
    <>
      <AdminPageHeader
        title={t("admin.categories.title")}
        description={t("admin.categories.description")}
        action={
          <Link href="/admin/categories/new" className={buttonClass("primary")}>
            <Plus className="size-4" aria-hidden="true" />
            {t("admin.categories.create")}
          </Link>
        }
      />

      <Notice notice={notice} />

      <Card>
        <CardHeader
          title={t("admin.categories.title")}
          description={t("admin.categories.resultCount", { count: fmt.number(page.total) })}
        />

        {/* Filters. A plain GET form: every filtered view is a shareable URL and
            it works before hydration. Stacks to one column on a phone. */}
        <form method="get" className="border-b border-line p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <label className="mb-1 block text-xs font-medium text-muted" htmlFor="search">
                {t("admin.categories.searchLabel")}
              </label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle"
                  aria-hidden="true"
                />
                <input
                  id="search"
                  name="search"
                  type="search"
                  defaultValue={query.search ?? ""}
                  placeholder={t("admin.categories.searchPlaceholder")}
                  className={`${FIELD} pl-9`}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted" htmlFor="status">
                {t("admin.common.status")}
              </label>
              <select id="status" name="status" defaultValue={query.status ?? ""} className={FIELD}>
                <option value="">{t("admin.common.all")}</option>
                <option value="active">{t("admin.common.active")}</option>
                <option value="inactive">{t("admin.common.inactive")}</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted" htmlFor="sort">
                {t("admin.common.sort")}
              </label>
              <select id="sort" name="sort" defaultValue={query.sort} className={FIELD}>
                <option value="order_asc">{t("admin.categories.sortOrder")}</option>
                <option value="name_asc">{t("admin.categories.sortNameAsc")}</option>
                <option value="name_desc">{t("admin.categories.sortNameDesc")}</option>
                <option value="created_desc">{t("admin.categories.sortCreated")}</option>
                <option value="updated_desc">{t("admin.categories.sortUpdated")}</option>
              </select>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <button type="submit" className={buttonClass("primary", "w-full sm:w-auto")}>
              {t("admin.common.apply")}
            </button>
            {filtered ? (
              <Link href="/admin/categories" className={buttonClass("ghost", "w-full sm:w-auto")}>
                {t("admin.common.clear")}
              </Link>
            ) : null}
          </div>
        </form>

        {page.items.length === 0 ? (
          <EmptyState
            icon={<Tags className="size-8" aria-hidden="true" />}
            title={filtered ? t("admin.categories.noMatchTitle") : t("admin.categories.emptyTitle")}
            description={
              filtered ? t("admin.categories.noMatchHint") : t("admin.categories.emptyHint")
            }
            action={
              filtered ? (
                <Link href="/admin/categories" className={buttonClass("secondary")}>
                  {t("admin.common.clear")}
                </Link>
              ) : (
                <Link href="/admin/categories/new" className={buttonClass("primary")}>
                  <Plus className="size-4" aria-hidden="true" />
                  {t("admin.categories.create")}
                </Link>
              )
            }
          />
        ) : (
          <>
            {/* Desktop: a real table inside a scroll container. */}
            <TableScroller>
              <table className="hidden w-full min-w-[52rem] border-collapse text-sm md:table">
                <thead className="border-b border-line bg-surface-2">
                  <tr>
                    <th scope="col" className={TH}>
                      {t("admin.categories.colName")}
                    </th>
                    <th scope="col" className={TH}>
                      {t("admin.categories.colSchedule")}
                    </th>
                    <th scope="col" className={TH}>
                      {t("admin.categories.colGroup")}
                    </th>
                    <th scope="col" className={`${TH} text-right`}>
                      {t("admin.categories.colOrder")}
                    </th>
                    <th scope="col" className={`${TH} text-right`}>
                      {t("admin.categories.colResults")}
                    </th>
                    <th scope="col" className={TH}>
                      {t("admin.categories.colStatus")}
                    </th>
                    <th scope="col" className={`${TH} text-right`}>
                      {t("admin.common.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {page.items.map((category) => (
                    <tr key={category.id} className="border-b border-line last:border-0">
                      <th scope="row" className={`${TD} text-left font-medium`}>
                        <Link
                          href={`/admin/categories/${category.id}`}
                          className="text-accent hover:underline"
                        >
                          {localized(category.name, locale)}
                        </Link>
                        <span className="block font-mono text-xs font-normal text-muted">
                          {category.slug}
                        </span>
                      </th>
                      <td className={`${TD} tabular whitespace-nowrap`}>
                        {fmt.schedule(category.scheduleTime)}
                      </td>
                      <td className={TD}>{t(`groups.${category.group}Label`)}</td>
                      <td className={`${TD} text-right tabular`}>
                        {fmt.number(category.displayOrder)}
                      </td>
                      <td className={`${TD} text-right tabular`}>
                        <Link
                          href={`/admin/results?category=${category.slug}`}
                          className="text-accent hover:underline"
                        >
                          {fmt.number(category.resultCount)}
                        </Link>
                      </td>
                      <td className={TD}>
                        <ActiveBadge isActive={category.isActive} />
                      </td>
                      <td className={`${TD} text-right`}>
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/categories/${category.id}`}
                            className={buttonClass("ghost", "px-2")}
                          >
                            <Pencil className="size-4" aria-hidden="true" />
                            <span className="sr-only">{t("admin.common.edit")}</span>
                          </Link>
                          <form action={toggleCategoryAction}>
                            <input type="hidden" name="id" value={category.id} />
                            <input
                              type="hidden"
                              name="isActive"
                              value={category.isActive ? "false" : "true"}
                            />
                            <button type="submit" className={buttonClass("ghost", "px-2")}>
                              {category.isActive ? (
                                <PowerOff className="size-4" aria-hidden="true" />
                              ) : (
                                <Power className="size-4" aria-hidden="true" />
                              )}
                              <span className="sr-only">
                                {category.isActive
                                  ? t("admin.categories.deactivate")
                                  : t("admin.categories.activate")}
                              </span>
                            </button>
                          </form>
                          <DeleteButton
                            compact
                            action={deleteCategoryAction}
                            id={category.id}
                            title={t("admin.categories.deleteTitle")}
                            subject={localized(category.name, locale)}
                            body={t("admin.categories.deleteBody")}
                            blockedReason={
                              category.resultCount > 0
                                ? t("admin.categories.deleteBlockedBody", {
                                    count: fmt.number(category.resultCount),
                                    name: localized(category.name, locale),
                                  })
                                : undefined
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableScroller>

            {/* Mobile: one card per category — seven columns is not a phone table. */}
            <ul className="divide-y divide-line md:hidden">
              {page.items.map((category) => (
                <li key={category.id} className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        href={`/admin/categories/${category.id}`}
                        className="block truncate text-sm font-semibold text-accent"
                      >
                        {localized(category.name, locale)}
                      </Link>
                      <p className="truncate font-mono text-xs text-muted">{category.slug}</p>
                    </div>
                    <ActiveBadge isActive={category.isActive} />
                  </div>

                  <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted">
                    <div className="flex gap-1">
                      <dt>{t("admin.categories.colSchedule")}:</dt>
                      <dd className="tabular text-fg">{fmt.schedule(category.scheduleTime)}</dd>
                    </div>
                    <div className="flex gap-1">
                      <dt>{t("admin.categories.colGroup")}:</dt>
                      <dd className="text-fg">{t(`groups.${category.group}Label`)}</dd>
                    </div>
                    <div className="flex gap-1">
                      <dt>{t("admin.categories.colOrder")}:</dt>
                      <dd className="tabular text-fg">{fmt.number(category.displayOrder)}</dd>
                    </div>
                    <div className="flex gap-1">
                      <dt>{t("admin.categories.colResults")}:</dt>
                      <dd className="tabular text-fg">{fmt.number(category.resultCount)}</dd>
                    </div>
                  </dl>

                  <div className="mt-2.5 flex flex-wrap gap-2">
                    <Link
                      href={`/admin/categories/${category.id}`}
                      className={buttonClass("secondary")}
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                      {t("admin.common.edit")}
                    </Link>
                    <form action={toggleCategoryAction}>
                      <input type="hidden" name="id" value={category.id} />
                      <input
                        type="hidden"
                        name="isActive"
                        value={category.isActive ? "false" : "true"}
                      />
                      <button type="submit" className={buttonClass("secondary")}>
                        {category.isActive
                          ? t("admin.categories.deactivate")
                          : t("admin.categories.activate")}
                      </button>
                    </form>
                    <DeleteButton
                      action={deleteCategoryAction}
                      id={category.id}
                      title={t("admin.categories.deleteTitle")}
                      subject={localized(category.name, locale)}
                      body={t("admin.categories.deleteBody")}
                      blockedReason={
                        category.resultCount > 0
                          ? t("admin.categories.deleteBlockedBody", {
                              count: fmt.number(category.resultCount),
                              name: localized(category.name, locale),
                            })
                          : undefined
                      }
                    />
                  </div>
                </li>
              ))}
            </ul>

            <Pagination
              page={page.page}
              totalPages={page.totalPages}
              total={page.total}
              limit={page.limit}
              basePath="/admin/categories"
              query={query}
            />
          </>
        )}
      </Card>
    </>
  );
}
