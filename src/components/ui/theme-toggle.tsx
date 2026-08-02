"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/providers/theme-provider";
import { cn } from "@/lib/utils/cn";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/50 bg-background/80 text-muted-foreground shadow-md backdrop-blur-md transition-colors hover:text-foreground",
        className
      )}
    >
      <Sun
        size={18}
        className={cn(
          "absolute scale-100 transition-all duration-300",
          isDark && "-rotate-90 scale-0"
        )}
      />
      <Moon
        size={18}
        className={cn(
          "absolute rotate-90 scale-0 transition-all duration-300",
          isDark && "rotate-0 scale-100"
        )}
      />
    </button>
  );
}