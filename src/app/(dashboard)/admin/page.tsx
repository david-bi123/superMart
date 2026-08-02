import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/auth/rbac";
import { AdminPanel } from "./admin-panel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  try {
    await requireSuperAdmin();
  } catch {
    redirect("/dashboard");
  }
  return <AdminPanel />;
}