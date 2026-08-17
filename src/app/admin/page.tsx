import { redirect } from "next/navigation";

/** /admin is the dashboard's front door. */
export default function AdminIndex() {
  redirect("/admin/dashboard");
}
