import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Card, CardHeader, buttonClass } from "@/components/ui/primitives";
import { AdminPageHeader, Notice, ResultStatusBadge } from "@/components/admin/ui";
import { ResultForm } from "@/components/admin/ResultForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { listCategoryOptions } from "@/lib/admin/categories";
import { getAdminResult } from "@/lib/admin/results";
import { createFormatter } from "@/lib/utils/format";
import { getLocale, getT } from "@/lib/i18n";
import { localized } from "@/lib/i18n/localize";
import { deleteResultAction, updateResultAction } from "../../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const t = await getT();
  const { id } = await params;
  const row = await getAdminResult(id);
  if (!row) notFound();
  return { title: `${row.categoryName.en} · ${t("admin.results.editTitle")}` };
}

export default async function EditResultPage({
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

  const [row, categories] = await Promise.all([getAdminResult(id), listCategoryOptions()]);
  if (!row) notFound();

  const name = localized(row.categoryName, locale);

  return (
    <>
      <AdminPageHeader
        title={t("admin.results.editTitle")}
        description={t("admin.results.editDescription")}
        breadcrumb={{ href: "/admin/results", label: t("admin.results.title") }}
        action={
          <Link
            href={`/categories/${row.categorySlug}`}
            className={buttonClass("ghost")}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink className="size-4" aria-hidden="true" />
            {t("admin.categories.viewPublic")}
          </Link>
        }
      />

      <Notice notice={typeof raw.notice === "string" ? raw.notice : undefined} />

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ResultForm
            action={updateResultAction}
            categories={categories}
            id={row.id}
            submitLabel={t("admin.common.saveChanges")}
            cancelHref="/admin/results"
            defaults={{
              categoryId: row.categoryId,
              value: row.value ?? "",
              publishedDate: row.publishedDate,
              publishedTime: row.publishedTime,
              status: row.status,
            }}
          />
        </div>

        <div className="space-y-3">
          <Card>
            <CardHeader title={t("admin.results.detailTitle")} />
            <div className="space-y-3 p-4">
              <p className="text-center font-mono text-4xl font-semibold tabular">
                {row.value ?? "––"}
              </p>
              <div className="flex items-center justify-between gap-2">
                <ResultStatusBadge status={row.status} />
                <span className="text-xs text-muted tabular">
                  {fmt.date(row.publishedDate)} · {fmt.schedule(row.publishedTime)}
                </span>
              </div>
              <dl className="space-y-1 text-xs text-muted">
                <div className="flex justify-between gap-2">
                  <dt>{t("admin.form.category")}</dt>
                  <dd className="text-fg">
                    <Link
                      href={`/admin/categories/${row.categoryId}`}
                      className="text-accent hover:underline"
                    >
                      {name}
                    </Link>
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>{t("admin.results.createdAt")}</dt>
                  <dd className="tabular text-fg">{fmt.dateTime(row.createdAt)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>{t("admin.results.updatedAt")}</dt>
                  <dd className="tabular text-fg">{fmt.dateTime(row.updatedAt)}</dd>
                </div>
              </dl>

              <DeleteButton
                action={deleteResultAction}
                id={row.id}
                title={t("admin.results.deleteTitle")}
                subject={t("admin.results.deleteSubject", {
                  category: name,
                  date: fmt.date(row.publishedDate),
                })}
                body={t("admin.results.deleteBody")}
              />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
