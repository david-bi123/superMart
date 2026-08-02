import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/auth/rbac";
import { AdminPanel } from "./admin-panel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let isAdmin = false;
  try {
    await requireSuperAdmin();
    isAdmin = true;
  } catch {
    isAdmin = false;
  }
  if (!isAdmin) redirect("/dashboard");
  return <AdminPanel />;
}