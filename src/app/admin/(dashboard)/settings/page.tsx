import type { Metadata } from "next";
import { Database, Globe, KeyRound, User } from "lucide-react";
import { Card, CardHeader, buttonClass } from "@/components/ui/primitives";
import { AdminPageHeader } from "@/components/admin/ui";
import { getAdminSettings } from "@/lib/admin/overview";
import { LOCALE_LIST } from "@/lib/i18n/config";
import { createFormatter } from "@/lib/utils/format";
import { getT } from "@/lib/i18n";
import { logoutAction } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("admin.settings.title") };
}

export default async function AdminSettingsPage() {
  const t = await getT();
  const fmt = createFormatter(t);
  const settings = await getAdminSettings();

  const row = (label: string, value: string) => (
    <div key={label} className="flex flex-wrap justify-between gap-x-3 gap-y-0.5 px-4 py-2.5">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-sm font-medium break-anywhere">{value}</dd>
    </div>
  );

  return (
    <>
      <AdminPageHeader
        title={t("admin.settings.title")}
        description={t("admin.settings.description")}
      />

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader
            title={t("admin.settings.account")}
            action={<User className="size-4 text-subtle" aria-hidden="true" />}
          />
          <dl className="divide-y divide-line">
            {row(t("admin.settings.name"), settings.account.name)}
            {row(t("admin.settings.email"), settings.account.email)}
            {row(
              t("admin.settings.lastLogin"),
              settings.account.lastLoginAt
                ? fmt.dateTime(settings.account.lastLoginAt)
                : t("admin.common.never"),
            )}
          </dl>
        </Card>

        <Card>
          <CardHeader
            title={t("admin.settings.database")}
            description={t("admin.settings.dataSourceHint")}
            action={<Database className="size-4 text-subtle" aria-hidden="true" />}
          />
          <dl className="divide-y divide-line">
            {row(t("admin.settings.categoriesStored"), fmt.number(settings.categories))}
            {row(t("admin.settings.resultsStored"), fmt.number(settings.results))}
            {row(
              t("admin.settings.oldestEntry"),
              settings.oldestEntry ? fmt.date(settings.oldestEntry) : "—",
            )}
            {row(
              t("admin.settings.newestEntry"),
              settings.newestEntry ? fmt.date(settings.newestEntry) : "—",
            )}
          </dl>
        </Card>

        <Card>
          <CardHeader
            title={t("admin.settings.localisation")}
            description={t("admin.settings.localisationHint")}
            action={<Globe className="size-4 text-subtle" aria-hidden="true" />}
          />
          <dl className="divide-y divide-line">
            {LOCALE_LIST.map((locale) => row(locale.englishName, locale.nativeName))}
          </dl>
        </Card>

        <Card>
          <CardHeader
            title={t("admin.settings.sessionTitle")}
            description={t("admin.settings.sessionHint")}
            action={<KeyRound className="size-4 text-subtle" aria-hidden="true" />}
          />
          <div className="p-4">
            <form action={logoutAction}>
              <button type="submit" className={buttonClass("secondary", "w-full sm:w-auto")}>
                {t("admin.signOut")}
              </button>
            </form>
          </div>
        </Card>
      </div>
    </>
  );
}
