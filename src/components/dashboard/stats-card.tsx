"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: { value: number; positive: boolean };
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  loading?: boolean;
}

const variantStyles: Record<
  string,
  { circle: string; gradient: string; text: string; trendPositive: string; trendNegative: string }
> = {
  default: {
    circle: "bg-muted text-muted-foreground",
    gradient: "from-muted/50 to-transparent",
    text: "text-foreground",
    trendPositive: "text-emerald-600 dark:text-emerald-400",
    trendNegative: "text-destructive",
  },
  primary: {
    circle: "bg-primary/10 text-primary",
    gradient: "from-primary/5 to-transparent",
    text: "text-primary",
    trendPositive: "text-emerald-600 dark:text-emerald-400",
    trendNegative: "text-destructive",
  },
  success: {
    circle: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    gradient: "from-emerald-500/5 to-transparent",
    text: "text-emerald-600 dark:text-emerald-400",
    trendPositive: "text-emerald-600 dark:text-emerald-400",
    trendNegative: "text-destructive",
  },
  warning: {
    circle: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    gradient: "from-amber-500/5 to-transparent",
    text: "text-amber-600 dark:text-amber-400",
    trendPositive: "text-emerald-600 dark:text-emerald-400",
    trendNegative: "text-destructive",
  },
  danger: {
    circle: "bg-destructive/10 text-destructive",
    gradient: "from-destructive/5 to-transparent",
    text: "text-destructive",
    trendPositive: "text-emerald-600 dark:text-emerald-400",
    trendNegative: "text-destructive",
  },
};

function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number>(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const duration = 1000;
    const start = ref.current;
    const end = value;
    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      setDisplay(current);
      ref.current = current;

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    }

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value]);

  return <>{display.toLocaleString()}</>;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  variant = "default",
  loading = false,
}: StatsCardProps) {
  const styles = variantStyles[variant];

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <Skeleton className="h-3.5 w-24 rounded-lg" />
              <Skeleton className="h-7 w-32 rounded-lg" />
              {description && <Skeleton className="h-3 w-20 rounded-lg" />}
            </div>
            <Skeleton className="h-11 w-11 rounded-xl" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const numericValue = typeof value === "string" ? parseFloat(value) || 0 : value;

  return (
    <Card hover className="group relative overflow-hidden transition-all duration-300">
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100",
          styles.gradient,
        )}
      />
      <CardContent className="relative p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
                {typeof value === "number" && !isNaN(value) ? (
                  <AnimatedCounter value={value} />
                ) : (
                  value
                )}
              </p>
              {trend && (
                <div
                  className={cn(
                    "flex items-center gap-0.5 text-xs font-medium",
                    trend.positive ? styles.trendPositive : styles.trendNegative,
                  )}
                >
                  {trend.positive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(trend.value)}%
                </div>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground/60">{description}</p>
            )}
          </div>
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 group-hover:scale-110",
              styles.circle,
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
