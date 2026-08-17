import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, ListOrdered } from "lucide-react";
import { Card, CardHeader, EmptyState, buttonClass } from "@/components/ui/primitives";
import {
  ActiveBadge,
  AdminPageHeader,
  Notice,
  ResultStatusBadge,
} from "@/components/admin/ui";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { getAdminCategory } from "@/lib/admin/categories";
import { listAdminResults } from "@/lib/admin/results";
import { createFormatter } from "@/lib/utils/format";
import { getLocale, getT } from "@/lib/i18n";
import { localized } from "@/lib/i18n/localize";
import { deleteCategoryAction, toggleCategoryAction, updateCategoryAction } from "../../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const t = await getT();
  const { id } = await params;
  const category = await getAdminCategory(id);
  if (!category) notFound();
  return { title: `${category.name.en} · ${t("admin.categories.editTitle")}` };
}

export default async function EditCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const t = await getT();
  const locale = await getLocale();
  const fmt = createFormatter(t);
  const { id } = await params;
  const raw = await searchParams;

  const category = await getAdminCategory(id);
  if (!category) notFound();

  const recent = await listAdminResults({
    category: category.id,
    sort: "date_desc",
    page: 1,
    limit: 8,
  });
  const name = localized(category.name, locale);

  return (
    <>
      <AdminPageHeader
        title={name}
        description={t("admin.categories.editDescription")}
        breadcrumb={{ href: "/admin/categories", label: t("admin.categories.title") }}
        action={
          <>
            <Link
              href={`/admin/results?category=${category.slug}`}
              className={buttonClass("secondary")}
            >
              <ListOrdered className="size-4" aria-hidden="true" />
              {t("admin.categories.viewResults")}
            </Link>
            <Link
              href={`/categories/${category.slug}`}
              className={buttonClass("ghost")}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="size-4" aria-hidden="true" />
              {t("admin.categories.viewPublic")}
            </Link>
          </>
        }
      />

      <Notice notice={typeof raw.notice === "string" ? raw.notice : undefined} />

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CategoryForm
            action={updateCategoryAction}
            id={category.id}
            submitLabel={t("admin.common.saveChanges")}
            cancelHref="/admin/categories"
            defaults={{
              name: category.name,
              slug: category.slug,
              description: category.description,
              scheduleTime: category.scheduleTime,
              group: category.group,
              isActive: category.isActive,
              displayOrder: category.displayOrder,
              updateFrequency: category.updateFrequency,
              accent: category.accent,
            }}
          />
        </div>

        <div className="space-y-3">
          <Card>
            <CardHeader title={t("admin.common.status")} />
            <div className="space-y-3 p-4">
              <div className="flex items-center justify-between gap-2">
                <ActiveBadge isActive={category.isActive} />
                <span className="text-xs text-muted tabular">
                  {t("admin.categories.resultCount", { count: fmt.number(category.resultCount) })}
                </span>
              </div>
              <dl className="space-y-1 text-xs text-muted">
                <div className="flex justify-between gap-2">
                  <dt>{t("admin.results.createdAt")}</dt>
                  <dd className="tabular text-fg">{fmt.dateTime(category.createdAt)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>{t("admin.results.updatedAt")}</dt>
                  <dd className="tabular text-fg">{fmt.dateTime(category.updatedAt)}</dd>
                </div>
              </dl>

              <form action={toggleCategoryAction}>
                <input type="hidden" name="id" value={category.id} />
                <input
                  type="hidden"
                  name="isActive"
                  value={category.isActive ? "false" : "true"}
                />
                <input type="hidden" name="returnTo" value={`/admin/categories/${category.id}`} />
                <button type="submit" className={buttonClass("secondary", "w-full")}>
                  {category.isActive
                    ? t("admin.categories.deactivate")
                    : t("admin.categories.activate")}
                </button>
              </form>

              <DeleteButton
                action={deleteCategoryAction}
                id={category.id}
                title={t("admin.categories.deleteTitle")}
                subject={name}
                body={t("admin.categories.deleteBody")}
                blockedReason={
                  category.resultCount > 0
                    ? t("admin.categories.deleteBlockedBody", {
                        count: fmt.number(category.resultCount),
                        name,
                      })
                    : undefined
                }
              />
            </div>
          </Card>

          <Card>
            <CardHeader
              title={t("admin.categories.inThisCategory")}
              description={t("admin.categories.inThisCategoryHint")}
              action={
                <Link
                  href={`/admin/results?category=${category.slug}`}
                  className="text-sm font-medium text-accent hover:underline"
                >
                  {t("admin.common.all")}
                </Link>
              }
            />
            {recent.items.length === 0 ? (
              <EmptyState
                title={t("admin.results.emptyTitle")}
                action={
                  <Link
                    href={`/admin/results/new?category=${category.id}`}
                    className={buttonClass("primary")}
                  >
                    {t("admin.results.create")}
                  </Link>
                }
              />
            ) : (
              <ul className="divide-y divide-line">
                {recent.items.map((row) => (
                  <li key={row.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="w-8 shrink-0 text-center font-mono font-semibold tabular">
                      {row.value ?? "––"}
                    </span>
                    <Link
                      href={`/admin/results/${row.id}`}
                      className="min-w-0 flex-1 truncate text-sm text-accent hover:underline tabular"
                    >
                      {fmt.date(row.publishedDate)}
                    </Link>
                    <ResultStatusBadge status={row.status} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
