import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/ui";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { getNextDisplayOrder } from "@/lib/admin/categories";
import { getT } from "@/lib/i18n";
import { createCategoryAction } from "../../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("admin.categories.createTitle") };
}

export default async function NewCategoryPage() {
  const t = await getT();
  const displayOrder = await getNextDisplayOrder();

  return (
    <>
      <AdminPageHeader
        title={t("admin.categories.createTitle")}
        description={t("admin.categories.createDescription")}
        breadcrumb={{ href: "/admin/categories", label: t("admin.categories.title") }}
      />

      <div className="max-w-3xl">
        <CategoryForm
          action={createCategoryAction}
          submitLabel={t("admin.common.create")}
          cancelHref="/admin/categories"
          defaults={{
            name: { en: "", hi: "", or: "" },
            slug: "",
            description: { en: "", hi: "", or: "" },
            scheduleTime: "12:00",
            group: "day",
            isActive: true,
            displayOrder,
            updateFrequency: "Daily",
            accent: 1,
          }}
        />
      </div>
    </>
  );
}
