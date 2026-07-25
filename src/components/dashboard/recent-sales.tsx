"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Receipt, Clock } from "lucide-react";

interface RecentSale {
  _id: string;
  invoiceNumber: string;
  customerName: string;
  grandTotal: number;
  status: string;
  createdAt: string;
  itemsCount: number;
}

interface RecentSalesProps {
  data?: RecentSale[];
  loading?: boolean;
}

function TimeAgo({ date }: { date: string }) {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString();
}

const statusVariant: Record<string, "success" | "warning" | "secondary" | "destructive"> = {
  completed: "success",
  draft: "warning",
  cancelled: "destructive",
  refunded: "destructive",
};

export function RecentSales({ data, loading }: RecentSalesProps) {
  return (
    <Card glass className="overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Receipt className="h-5 w-5 text-primary" />
          Recent Sales
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton variant="text" className="h-4 w-20" />
                <Skeleton variant="text" className="h-4 flex-1" />
                <Skeleton variant="text" className="h-4 w-16" />
                <Skeleton variant="text" className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : !data?.length ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Receipt className="mb-2 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground/50">No sales yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {data.map((sale, index) => (
              <motion.div
                key={sale._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.3 }}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/30"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Receipt className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                      {sale.invoiceNumber}
                    </span>
                    <Badge variant={statusVariant[sale.status] || "default"} className="px-2 py-0 text-[10px]">
                      {sale.status}
                    </Badge>
                  </div>
                  <p className="truncate text-xs text-muted-foreground/50">
                    {sale.customerName}
                    <span className="mx-1">·</span>
                    {sale.itemsCount} item{sale.itemsCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    ${sale.grandTotal.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground/50">
                    <Clock className="h-3 w-3" />
                    <TimeAgo date={sale.createdAt} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
