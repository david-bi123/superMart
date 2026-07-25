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
      <div className="flex min-h-screen bg-background">
        <div className="hidden md:flex w-72 flex-col border-r border-sidebar-border bg-sidebar p-4 space-y-4">
          <div className="skeleton-shimmer h-10 w-3/4 rounded-lg" />
          <div className="skeleton-shimmer h-4 w-full rounded" />
          <div className="skeleton-shimmer h-4 w-5/6 rounded" />
          <div className="skeleton-shimmer h-4 w-4/6 rounded" />
          <div className="skeleton-shimmer h-4 w-full rounded" />
          <div className="skeleton-shimmer h-4 w-3/4 rounded" />
          <div className="skeleton-shimmer h-4 w-2/3 rounded" />
          <div className="flex-1" />
          <div className="skeleton-shimmer h-12 w-full rounded-lg" />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="skeleton-shimmer h-16 w-full border-b border-border" />
          <div className="flex-1 p-6 space-y-6">
            <div className="skeleton-shimmer h-8 w-1/3 rounded-lg" />
            <div className="skeleton-shimmer h-48 w-full rounded-xl" />
            <div className="skeleton-shimmer h-32 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300 ease-in-out",
          "ml-0",
          isOpen ? "md:ml-72" : "md:ml-[72px]"
        )}
      >
        <Navbar />
        <main className="flex-1 min-h-screen">
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
