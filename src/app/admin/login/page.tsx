import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/primitives";
import { LoginForm } from "@/components/admin/LoginForm";
import { getCurrentAdmin } from "@/lib/admin/auth";
import { getT } from "@/lib/i18n";
import { loginAction } from "../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("admin.login.title"), robots: { index: false, follow: false } };
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const t = await getT();
  const { next } = await searchParams;
  if (await getCurrentAdmin()) redirect(next?.startsWith("/admin") ? next : "/admin/dashboard");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="grid size-11 place-items-center rounded-xl bg-accent text-accent-fg">
            <BarChart3 className="size-6" aria-hidden="true" />
          </span>
          <h1 className="mt-3 text-xl font-semibold tracking-tight">{t("admin.login.title")}</h1>
          <p className="mt-1.5 text-sm text-muted text-pretty">{t("admin.login.description")}</p>
        </div>

        <Card className="p-4 sm:p-5">
          <LoginForm action={loginAction} next={next} />
        </Card>

        <p className="mt-4 text-center text-xs text-muted text-pretty">{t("admin.login.hint")}</p>
        <p className="mt-2 text-center text-sm">
          <Link href="/" className="text-accent hover:underline">
            {t("admin.login.backToSite")}
          </Link>
        </p>
      </div>
    </div>
  );
}
