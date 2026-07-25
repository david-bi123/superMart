"use client";

import { useSession } from "next-auth/react";
import { useSidebar } from "@/store/use-sidebar";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils/cn";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { Toaster } from "@/components/ui/toast";
import { ScrollArea } from "@/components/ui/scroll-area";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {!isMobile && <Sidebar />}
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300 ease-in-out",
          !isMobile && (isOpen ? "ml-72" : "ml-[72px]")
        )}
      >
        <Navbar />
        <main className="flex-1 overflow-auto">
          <ScrollArea className="h-full">
            <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 animate-in">
              {children}
            </div>
          </ScrollArea>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
