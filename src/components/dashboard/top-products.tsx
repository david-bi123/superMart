"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";
import { Trophy, Package } from "lucide-react";

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

const rankColors = [
  "text-amber-400",
  "text-gray-300",
  "text-amber-600",
] as const;

const rankBgColors = [
  "bg-amber-400/10 border-amber-400/20",
  "bg-gray-300/10 border-gray-300/20",
  "bg-amber-600/10 border-amber-600/20",
] as const;

export function TopProducts({ data, loading }: TopProductsProps) {
  return (
    <Card glass className="overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-white">
          <Trophy className="h-5 w-5 text-amber-400" />
          Top Products
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton variant="circular" className="h-8 w-8" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton variant="text" className="h-4 w-32" />
                  <Skeleton variant="text" className="h-3 w-24" />
                </div>
                <Skeleton variant="text" className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : !data?.length ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Package className="mb-2 h-8 w-8 text-white/20" />
            <p className="text-sm text-white/40">No product sales yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {data.map((product, index) => (
              <motion.div
                key={product.productId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className={cn(
                  "group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 transition-all duration-200 hover:border-white/10 hover:bg-white/[0.03]",
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-bold",
                    index < 3 ? rankBgColors[index] : "border-white/10 bg-white/5 text-white/40",
                  )}
                >
                  {index < 3 ? (
                    <span className={rankColors[index]}>#{index + 1}</span>
                  ) : (
                    <span className="text-white/40">#{index + 1}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {product.name}
                  </p>
                  <p className="text-xs text-white/40">
                    {product.quantity} units sold
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-emerald-400">
                    ${product.revenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-white/40">
                    ${product.profit.toLocaleString()} profit
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
