import { auth } from "./config";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session;
}

export async function requireRole(...roles: string[]) {
  const session = await requireAuth();
  if (!roles.includes((session.user as any).role)) {
    throw new Error("Forbidden");
  }
  return session;
}

export async function requireBusiness() {
  const session = await requireAuth();
  const businessId = (session.user as any).businessId;
  if (!businessId && (session.user as any).role !== "super_admin") {
    throw new Error("No business associated");
  }
  return { session, businessId: businessId as string | undefined };
}
