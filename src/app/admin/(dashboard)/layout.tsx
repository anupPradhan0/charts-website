import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { getCurrentAdmin } from "@/lib/admin/auth";
import { logoutAction } from "../actions";

/**
 * The signed-in half of /admin.
 *
 * The redirect here is for the browser's benefit only. The real guard is
 * `requireAdmin()` inside every service call underneath — a request that skipped
 * this layout (a route handler, a replayed server action) is still refused.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Numera Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <AdminShell admin={admin} signOut={logoutAction}>
      {children}
    </AdminShell>
  );
}
