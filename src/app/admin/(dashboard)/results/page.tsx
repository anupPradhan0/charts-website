import type { Metadata } from "next";
import Link from "next/link";
import { ListOrdered, Pencil, Plus, Search, Upload } from "lucide-react";
import { Card, CardHeader, EmptyState, buttonClass } from "@/components/ui/primitives";
import { Pagination } from "@/components/ui/Pagination";
import {
  AdminPageHeader,
  Notice,
  ResultStatusBadge,
  TD,
  TH,
  TableScroller,
} from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { FIELD } from "@/components/admin/fields";
import { listCategoryOptions } from "@/lib/admin/categories";
import { listAdminResults } from "@/lib/admin/results";
import { adminResultQuerySchema } from "@/lib/admin/schemas";
import { parsePageQuery } from "@/lib/services/query";
import { createFormatter } from "@/lib/utils/format";
import { getLocale, getT } from "@/lib/i18n";
import { localized } from "@/lib/i18n/localize";
import { deleteResultAction } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("admin.results.title") };
}

export default async function AdminResultsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const t = await getT();
  const locale = await getLocale();
  const fmt = createFormatter(t);
  const raw = await searchParams;
  const query = parsePageQuery(adminResultQuerySchema, raw);

  const [page, categories] = await Promise.all([listAdminResults(query), listCategoryOptions()]);
  const notice = typeof raw.notice === "string" ? raw.notice : undefined;
  const count = typeof raw.count === "string" ? raw.count : undefined;
  const filtered = Boolean(
    query.search || query.category || query.status || query.startDate || query.endDate || query.date,
  );

  return (
    <>
      <AdminPageHeader
        title={t("admin.results.title")}
        description={t("admin.results.description")}
        action={
          <>
            <Link href="/admin/results/new" className={buttonClass("primary")}>
              <Plus className="size-4" aria-hidden="true" />
              {t("admin.results.create")}
            </Link>
            <Link href="/admin/results/bulk" className={buttonClass("secondary")}>
              <Upload className="size-4" aria-hidden="true" />
              {t("admin.results.bulk")}
            </Link>
          </>
        }
      />

      <Notice notice={notice} count={count} />

      <Card>
        <CardHeader
          title={t("admin.results.title")}
          description={t("pagination.showing", {
            first: fmt.number(Math.min((page.page - 1) * page.limit + 1, page.total)),
            last: fmt.number(Math.min(page.page * page.limit, page.total)),
            total: fmt.number(page.total),
          })}
        />

        <form method="get" className="border-b border-line p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <div className="xl:col-span-2">
              <label className="mb-1 block text-xs font-medium text-muted" htmlFor="search">
                {t("admin.results.searchLabel")}
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
                  placeholder={t("admin.results.searchPlaceholder")}
                  className={`${FIELD} pl-9`}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted" htmlFor="category">
                {t("admin.form.category")}
              </label>
              <select
                id="category"
                name="category"
                defaultValue={query.category ?? ""}
                className={FIELD}
              >
                <option value="">{t("admin.results.allCategories")}</option>
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {localized(category.name, locale)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted" htmlFor="status">
                {t("admin.common.status")}
              </label>
              <select id="status" name="status" defaultValue={query.status ?? ""} className={FIELD}>
                <option value="">{t("admin.results.anyStatus")}</option>
                <option value="published">{t("status.published")}</option>
                <option value="pending">{t("status.pending")}</option>
                <option value="scheduled">{t("status.scheduled")}</option>
              </select>
            </div>

            {/* The date pair shares one row on phones — two full-width date
                fields would push the rest below the fold. */}
            <div className="grid grid-cols-2 gap-3 sm:col-span-2 lg:col-span-1 xl:contents">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted" htmlFor="startDate">
                  {t("admin.results.from")}
                </label>
                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  defaultValue={query.startDate ?? ""}
                  className={FIELD}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted" htmlFor="endDate">
                  {t("admin.results.to")}
                </label>
                <input
                  id="endDate"
                  name="endDate"
                  type="date"
                  defaultValue={query.endDate ?? ""}
                  className={FIELD}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted" htmlFor="sort">
                {t("admin.common.sort")}
              </label>
              <select id="sort" name="sort" defaultValue={query.sort} className={FIELD}>
                <option value="date_desc">{t("admin.results.sortDateDesc")}</option>
                <option value="date_asc">{t("admin.results.sortDateAsc")}</option>
                <option value="value_desc">{t("admin.results.sortValueDesc")}</option>
                <option value="value_asc">{t("admin.results.sortValueAsc")}</option>
                <option value="category_asc">{t("admin.results.sortCategory")}</option>
                <option value="updated_desc">{t("admin.results.sortUpdated")}</option>
              </select>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <button type="submit" className={buttonClass("primary", "w-full sm:w-auto")}>
              {t("admin.common.apply")}
            </button>
            {filtered ? (
              <Link href="/admin/results" className={buttonClass("ghost", "w-full sm:w-auto")}>
                {t("admin.common.clear")}
              </Link>
            ) : null}
          </div>
        </form>

        {page.items.length === 0 ? (
          <EmptyState
            icon={<ListOrdered className="size-8" aria-hidden="true" />}
            title={filtered ? t("admin.results.noMatchTitle") : t("admin.results.emptyTitle")}
            description={filtered ? t("admin.results.noMatchHint") : t("admin.results.emptyHint")}
            action={
              filtered ? (
                <Link href="/admin/results" className={buttonClass("secondary")}>
                  {t("admin.common.clear")}
                </Link>
              ) : (
                <Link href="/admin/results/new" className={buttonClass("primary")}>
                  <Plus className="size-4" aria-hidden="true" />
                  {t("admin.results.create")}
                </Link>
              )
            }
          />
        ) : (
          <>
            <TableScroller>
              <table className="hidden w-full min-w-[46rem] border-collapse text-sm md:table">
                <thead className="border-b border-line bg-surface-2">
                  <tr>
                    <th scope="col" className={TH}>
                      {t("admin.results.colDate")}
                    </th>
                    <th scope="col" className={TH}>
                      {t("admin.results.colCategory")}
                    </th>
                    <th scope="col" className={`${TH} text-center`}>
                      {t("admin.results.colValue")}
                    </th>
                    <th scope="col" className={TH}>
                      {t("admin.results.colTime")}
                    </th>
                    <th scope="col" className={TH}>
                      {t("admin.results.colStatus")}
                    </th>
                    <th scope="col" className={`${TH} text-right`}>
                      {t("admin.common.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {page.items.map((row) => (
                    <tr key={row.id} className="border-b border-line last:border-0">
                      <th scope="row" className={`${TD} text-left font-medium whitespace-nowrap`}>
                        <span className="tabular">{fmt.date(row.publishedDate)}</span>
                        <span className="block text-xs font-normal text-muted">
                          {fmt.weekdayShort(row.publishedDate)}
                        </span>
                      </th>
                      <td className={TD}>
                        <Link
                          href={`/admin/categories/${row.categoryId}`}
                          className="text-accent hover:underline"
                        >
                          {localized(row.categoryName, locale)}
                        </Link>
                      </td>
                      <td className={`${TD} text-center font-mono text-base font-semibold tabular`}>
                        {row.value ?? "––"}
                      </td>
                      <td className={`${TD} tabular whitespace-nowrap`}>
                        {fmt.schedule(row.publishedTime)}
                      </td>
                      <td className={TD}>
                        <ResultStatusBadge status={row.status} />
                      </td>
                      <td className={`${TD} text-right`}>
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/results/${row.id}`}
                            className={buttonClass("ghost", "px-2")}
                          >
                            <Pencil className="size-4" aria-hidden="true" />
                            <span className="sr-only">{t("admin.common.edit")}</span>
                          </Link>
                          <DeleteButton
                            compact
                            action={deleteResultAction}
                            id={row.id}
                            title={t("admin.results.deleteTitle")}
                            subject={t("admin.results.deleteSubject", {
                              category: localized(row.categoryName, locale),
                              date: fmt.date(row.publishedDate),
                            })}
                            body={t("admin.results.deleteBody")}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableScroller>

            <ul className="divide-y divide-line md:hidden">
              {page.items.map((row) => (
                <li key={row.id} className="flex items-start gap-3 p-3">
                  <span className="w-10 shrink-0 text-center font-mono text-xl font-semibold tabular">
                    {row.value ?? "––"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/results/${row.id}`}
                      className="block truncate text-sm font-semibold text-accent"
                    >
                      {localized(row.categoryName, locale)}
                    </Link>
                    <p className="text-xs text-muted tabular">
                      {fmt.date(row.publishedDate)} · {fmt.schedule(row.publishedTime)}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <ResultStatusBadge status={row.status} />
                      <Link
                        href={`/admin/results/${row.id}`}
                        className="text-xs font-medium text-accent"
                      >
                        {t("admin.common.edit")}
                      </Link>
                    </div>
                  </div>
                  <DeleteButton
                    compact
                    action={deleteResultAction}
                    id={row.id}
                    title={t("admin.results.deleteTitle")}
                    subject={t("admin.results.deleteSubject", {
                      category: localized(row.categoryName, locale),
                      date: fmt.date(row.publishedDate),
                    })}
                    body={t("admin.results.deleteBody")}
                  />
                </li>
              ))}
            </ul>

            <Pagination
              page={page.page}
              totalPages={page.totalPages}
              total={page.total}
              limit={page.limit}
              basePath="/admin/results"
              query={query}
            />
          </>
        )}
      </Card>
    </>
  );
}
