"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Package,
  AlertTriangle,
  XCircle,
  DollarSign,
  Clock,
  TrendingUp,
  TrendingDown,
  Box,
  PiggyBank,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PieChart } from "@/components/charts/pie-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { getInventoryReport, getDeadStock } from "@/actions/reports.actions";
import { cn } from "@/lib/utils/cn";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function InventoryReportsPage() {
  const [data, setData] = useState<any>(null);
  const [deadStock, setDeadStock] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [inventoryRes, deadStockRes] = await Promise.all([
          getInventoryReport(),
          getDeadStock(90),
        ]);
        if (inventoryRes.success) setData(inventoryRes.data);
        if (deadStockRes.success) setDeadStock(deadStockRes.data);
      } catch (error) {
        console.error("Failed to load inventory reports:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatCurrency = (v: number) => `$${v.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  const statusColors: Record<string, string> = {
    inStock: "bg-emerald-500/15 text-emerald-400",
    lowStock: "bg-amber-500/15 text-amber-400",
    outOfStock: "bg-red-500/15 text-red-400",
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loading text="Loading inventory reports..." />
      </div>
    );
  }

  const summaryCards = [
    {
      title: "Total Products",
      value: data?.totalProducts || 0,
      icon: Package,
      variant: "primary" as const,
    },
    {
      title: "Stock Value (Cost)",
      value: formatCurrency(data?.totalStockValue || 0),
      icon: DollarSign,
      variant: "success" as const,
    },
    {
      title: "Retail Value",
      value: formatCurrency(data?.totalRetailValue || 0),
      icon: TrendingUp,
      variant: "primary" as const,
    },
    {
      title: "Potential Profit",
      value: formatCurrency(data?.potentialProfit || 0),
      icon: PiggyBank,
      variant: "success" as const,
    },
    {
      title: "Low Stock Items",
      value: data?.statusDistribution?.lowStock || 0,
      icon: AlertTriangle,
      variant: "warning" as const,
    },
    {
      title: "Out of Stock",
      value: data?.statusDistribution?.outOfStock || 0,
      icon: XCircle,
      variant: "danger" as const,
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-8"
    >
      <PageHeader
        title="Inventory Reports"
        description="Stock value, status, and product analysis"
      />

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
      >
        {summaryCards.map((card) => (
          <Card key={card.title} glass>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">{card.title}</p>
                  <p className={cn(
                    "text-lg font-bold tracking-tight",
                    card.variant === "success" ? "text-emerald-400" :
                    card.variant === "danger" ? "text-red-400" :
                    card.variant === "warning" ? "text-amber-400" :
                    "text-blue-400"
                  )}>
                    {card.value}
                  </p>
                </div>
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg",
                  card.variant === "success" ? "bg-emerald-500/15 text-emerald-400" :
                  card.variant === "danger" ? "bg-red-500/15 text-red-400" :
                  card.variant === "warning" ? "bg-amber-500/15 text-amber-400" :
                  "bg-blue-500/15 text-blue-400"
                )}>
                  <card.icon className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card glass>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Stock Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart
              data={[
                { name: "In Stock", value: data?.statusDistribution?.inStock || 0, color: "#10b981" },
                { name: "Low Stock", value: data?.statusDistribution?.lowStock || 0, color: "#f59e0b" },
                { name: "Out of Stock", value: data?.statusDistribution?.outOfStock || 0, color: "#ef4444" },
              ]}
              height={280}
              donut
            />
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={data?.categoryBreakdown || []}
              xKey="category"
              series={[
                { key: "totalValue", name: "Stock Value", color: "#8b5cf6" },
              ]}
              height={280}
              valueFormatter={formatCurrency}
            />
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!data?.lowStockItems?.length ? (
              <EmptyState title="No low stock items" description="All products are well stocked" />
            ) : (
              <div className="rounded-xl border border-border/50 overflow-hidden max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Min</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.lowStockItems.map((item: any) => (
                      <TableRow key={item._id}>
                        <TableCell>
                          <div>
                            <p className="text-foreground font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground/50">{item.sku}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="warning">{item.currentStock}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{item.minStock}</TableCell>
                        <TableCell className="text-foreground font-medium">
                          {formatCurrency(item.value)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-400" />
              Expiring Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!data?.expiringItems?.length ? (
              <EmptyState title="No expiring products" description="No products expiring in the next 30 days" />
            ) : (
              <div className="rounded-xl border border-border/50 overflow-hidden max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead>Days Left</TableHead>
                      <TableHead>Stock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.expiringItems.map((item: any) => (
                      <TableRow key={item._id}>
                        <TableCell>
                          <p className="text-foreground font-medium">{item.name}</p>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{item.expiryDate}</TableCell>
                        <TableCell>
                          <Badge variant={item.daysToExpiry <= 7 ? "destructive" : "warning"}>
                            {item.daysToExpiry}d
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{item.currentStock}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-400" />
              Dead Stock (No Sales in 90 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!deadStock?.products?.length ? (
              <EmptyState title="No dead stock" description="All products have been sold recently" />
            ) : (
              <>
                <p className="mb-3 text-sm text-muted-foreground">
                  {deadStock.totalProducts} products — {formatCurrency(deadStock.totalValue)} tied up
                </p>
                <div className="rounded-xl border border-border/50 overflow-hidden max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Cost Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deadStock.products.map((item: any) => (
                        <TableRow key={item._id}>
                          <TableCell>
                            <div>
                              <p className="text-foreground font-medium">{item.name}</p>
                              <p className="text-xs text-muted-foreground/50">{item.category}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="destructive">{item.currentStock}</Badge>
                          </TableCell>
                          <TableCell className="text-foreground font-medium">
                            {formatCurrency(item.stockValue)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Box className="h-4 w-4 text-emerald-400" />
              Top Products by Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!data?.topByValue?.length ? (
              <EmptyState title="No products" description="Add products to see top by value" />
            ) : (
              <div className="rounded-xl border border-border/50 overflow-hidden max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Retail Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.topByValue.map((item: any, i: number) => (
                      <TableRow key={item._id}>
                        <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-foreground font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground/50">{item.category}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{item.stock}</TableCell>
                        <TableCell className="text-foreground font-medium">
                          {formatCurrency(item.value)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}


