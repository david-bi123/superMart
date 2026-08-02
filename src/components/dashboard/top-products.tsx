"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";
import { Trophy, Package } from "lucide-react";
import { formatMoney } from "@/lib/format";

interface TopProduct {
  productId: string;
  name: string;
  quantity: number;
  revenue: number;
  profit: number;
}

interface TopProductsProps {
  data?: TopProduct[];
  loading?: boolean;
}

export function TopProducts({ data, loading }: TopProductsProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Trophy className="h-4 w-4" />
          </div>
          Top Products
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-32 rounded-lg" />
                  <Skeleton className="h-2.5 w-24 rounded-lg" />
                </div>
                <Skeleton className="h-3.5 w-16 rounded-lg" />
              </div>
            ))}
          </div>
        ) : !data?.length ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Package className="mb-2 h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground/50">No product sales yet</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {data.map((product, index) => (
              <div
                key={product.productId}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 hover:bg-muted/50",
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-bold",
                    index === 0
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                      : index === 1
                      ? "bg-gray-100 dark:bg-gray-500/10 border-gray-200 dark:border-gray-500/20 text-gray-600 dark:text-gray-400"
                      : index === 2
                      ? "bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20 text-orange-600 dark:text-orange-400"
                      : "bg-muted/50 border-border/50 text-muted-foreground/50",
                  )}
                >
                  #{index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {product.name}
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    {product.quantity} units sold
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatMoney(product.revenue, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground/50">
                    {formatMoney(product.profit, 0)} profit
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
