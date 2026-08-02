"use client";

import { useSession } from "next-auth/react";
import { hasPermission } from "@/lib/auth/permissions";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function PermissionGuard({ permission, children }: { permission: string; children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = session?.user?.role ?? "";

  const allowed = role === "super_admin" || hasPermission(role, permission);

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.replace("/login");
    }
  }, [status, session, router]);

  if (status === "loading" || !session) {
    return null;
  }

  if (!allowed) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <EmptyState
          icon={<ShieldAlert className="h-6 w-6" />}
          title="Access restricted"
          description="You do not have permission to view this page."
          action={
            <Button variant="outline" onClick={() => router.replace("/dashboard")}>
              Go to Dashboard
            </Button>
          }
        />
      </div>
    );
  }

  return <>{children}</>;
}
