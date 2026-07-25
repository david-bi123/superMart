"use client";

import { motion } from "framer-motion";
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
  { circle: string; gradient: string; text: string }
> = {
  default: {
    circle: "bg-white/10 text-white",
    gradient: "from-white/5 to-transparent",
    text: "text-white",
  },
  primary: {
    circle: "bg-blue-500/15 text-blue-400",
    gradient: "from-blue-500/10 to-transparent",
    text: "text-blue-400",
  },
  success: {
    circle: "bg-emerald-500/15 text-emerald-400",
    gradient: "from-emerald-500/10 to-transparent",
    text: "text-emerald-400",
  },
  warning: {
    circle: "bg-amber-500/15 text-amber-400",
    gradient: "from-amber-500/10 to-transparent",
    text: "text-amber-400",
  },
  danger: {
    circle: "bg-red-500/15 text-red-400",
    gradient: "from-red-500/10 to-transparent",
    text: "text-red-400",
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
      <Card glass className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <Skeleton variant="text" className="h-4 w-24" />
              <Skeleton variant="text" className="h-8 w-32" />
              {description && <Skeleton variant="text" className="h-3 w-20" />}
            </div>
            <Skeleton variant="circular" className="h-12 w-12" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const numericValue = typeof value === "string" ? parseFloat(value) || 0 : value;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card
        glass
        className={cn(
          "group relative overflow-hidden transition-shadow duration-300 hover:shadow-xl hover:shadow-white/5",
        )}
      >
        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100",
            styles.gradient,
          )}
        />
        <CardContent className="relative p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-white/50">{title}</p>
              <div className="flex items-baseline gap-2">
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" as const }}
                  className="text-3xl font-bold tracking-tight text-white"
                >
                  {typeof value === "number" && !isNaN(value) ? (
                    <>
                      <AnimatedCounter value={value} />
                    </>
                  ) : (
                    value
                  )}
                </motion.p>
                {trend && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                    className={cn(
                      "flex items-center gap-0.5 text-xs font-medium",
                      trend.positive ? "text-emerald-400" : "text-red-400",
                    )}
                  >
                    {trend.positive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(trend.value)}%
                  </motion.div>
                )}
              </div>
              {description && (
                <p className="text-xs text-white/40">{description}</p>
              )}
            </div>
            <motion.div
              whileHover={{ rotate: -5, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
                styles.circle,
              )}
            >
              <Icon className="h-5 w-5" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
