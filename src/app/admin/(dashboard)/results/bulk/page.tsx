import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/ui";
import { BulkResultForm } from "@/components/admin/BulkResultForm";
import { listCategoryOptions } from "@/lib/admin/categories";
import { toISODate } from "@/lib/utils/date";
import { getT } from "@/lib/i18n";
import { bulkCreateResultsAction } from "../../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("admin.bulk.title") };
}

export default async function BulkResultsPage() {
  const t = await getT();
  const categories = await listCategoryOptions();

  return (
    <>
      <AdminPageHeader
        title={t("admin.bulk.title")}
        description={t("admin.bulk.description")}
        breadcrumb={{ href: "/admin/results", label: t("admin.results.title") }}
      />

      <div className="max-w-5xl">
        <BulkResultForm
          action={bulkCreateResultsAction}
          categories={categories}
          today={toISODate(new Date())}
        />
      </div>
    </>
  );
}
