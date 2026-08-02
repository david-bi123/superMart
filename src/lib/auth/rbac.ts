import { auth } from "./config";
import { hasPermission, type Permission } from "./permissions";

export async function getAuthUser() {
  const session = await auth();
  const user = session?.user as any;
  if (!user?.id) throw new Error("Not authenticated");
  return user;
}

export async function requirePermission(permission: Permission) {
  const user = await getAuthUser();
  const role = (user.role as string) || "";
  if (role === "super_admin") return user;
  if (!hasPermission(role, permission)) {
    throw new Error("You do not have permission to perform this action");
  }
  return user;
}

export async function requireSuperAdmin() {
  const user = await getAuthUser();
  if (user.role !== "super_admin") {
    throw new Error("Only platform administrators can access this resource");
  }
  return user;
}

export function getBusinessId(user: any): string {
  const bid = user?.businessId;
  if (!bid) {
    if (user?.role === "super_admin") return "";
    throw new Error("Not authenticated");
  }
  return bid;
}
