import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/ui";
import { ResultForm } from "@/components/admin/ResultForm";
import { listCategoryOptions } from "@/lib/admin/categories";
import { toISODate } from "@/lib/utils/date";
import { getT } from "@/lib/i18n";
import { createResultAction } from "../../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("admin.results.createTitle") };
}

export default async function NewResultPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; date?: string }>;
}) {
  const t = await getT();
  const { category, date } = await searchParams;
  const categories = await listCategoryOptions();
  const preselected = categories.find((c) => c.id === category || c.slug === category);

  return (
    <>
      <AdminPageHeader
        title={t("admin.results.createTitle")}
        description={t("admin.results.createDescription")}
        breadcrumb={{ href: "/admin/results", label: t("admin.results.title") }}
      />

      <div className="max-w-2xl">
        <ResultForm
          action={createResultAction}
          categories={categories}
          submitLabel={t("admin.common.create")}
          cancelHref="/admin/results"
          defaults={{
            categoryId: preselected?.id ?? "",
            value: "",
            publishedDate: date ?? toISODate(new Date()),
            publishedTime: preselected?.scheduleTime ?? "12:00",
            status: "published",
          }}
        />
      </div>
    </>
  );
}
