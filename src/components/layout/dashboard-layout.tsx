"use client";

import { useSession } from "next-auth/react";
import { useSidebar } from "@/store/use-sidebar";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils/cn";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { ScrollArea } from "@/components/ui/scroll-area";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen bg-background mesh-gradient-bg">
        <div className="hidden md:flex w-72 flex-col border-r border-sidebar-border bg-sidebar p-4 space-y-3">
          <div className="flex items-center gap-3 mb-6">
            <div className="skeleton-shimmer h-10 w-10 rounded-xl shrink-0" />
            <div className="space-y-2">
              <div className="skeleton-shimmer h-4 w-24 rounded-lg" />
              <div className="skeleton-shimmer h-2.5 w-16 rounded" />
            </div>
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="skeleton-shimmer h-5 w-5 rounded-lg shrink-0" />
              <div className="skeleton-shimmer h-4 flex-1 rounded-lg" style={{ width: `${60 + Math.random() * 30}%` }} />
            </div>
          ))}
          <div className="flex-1" />
          <div className="skeleton-shimmer h-12 w-full rounded-xl" />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="skeleton-shimmer h-16 w-full border-b border-border" />
          <div className="flex-1 p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="skeleton-shimmer h-10 w-10 rounded-xl" />
              <div className="space-y-2">
                <div className="skeleton-shimmer h-6 w-32 rounded-lg" />
                <div className="skeleton-shimmer h-3.5 w-48 rounded" />
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton-shimmer h-28 rounded-xl" />
              ))}
            </div>
            <div className="skeleton-shimmer h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background mesh-gradient-bg">
      <Sidebar />
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300 ease-in-out min-w-0",
          "ml-0",
          isOpen ? "md:ml-72" : "md:ml-[72px]"
        )}
      >
        <Navbar />
        <main className="flex-1 min-w-0">
          <ScrollArea className="h-full">
            <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
}
