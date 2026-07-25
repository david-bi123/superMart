"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Package,
  CreditCard,
  Clock,
  CalendarDays,
  Users,
  Crown,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AreaChart } from "@/components/charts/area-chart";
import { PieChart } from "@/components/charts/pie-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { getSalesReport, getRevenueReport } from "@/actions/reports.actions";
import { cn } from "@/lib/utils/cn";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function SalesReportsPage() {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  const [dateFrom, setDateFrom] = useState(thirtyDaysAgo.toISOString().split("T")[0]);
  const [dateTo, setDateTo] = useState(today.toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any>(null);

  const dateRange = { from: dateFrom, to: dateTo };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [salesRes, revenueRes] = await Promise.all([
        getSalesReport(dateRange),
        getRevenueReport({ ...dateRange, groupBy: "daily" }),
      ]);
      if (salesRes.success) setSalesData(salesRes.data);
      if (revenueRes.success) setRevenueData(revenueRes.data);
    } catch (error) {
      console.error("Failed to load sales reports:", error);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const formatCurrency = (v: number) => `$${v.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  const paymentColors: Record<string, string> = {
    cash: "#10b981",
    card: "#3b82f6",
    mobile_money: "#8b5cf6",
    credit: "#f59e0b",
    split: "#ec4899",
    gift_card: "#14b8a6",
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loading text="Loading sales reports..." />
      </div>
    );
  }

  const summaryCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(salesData?.totalRevenue || 0),
      icon: TrendingUp,
      variant: "success" as const,
    },
    {
      title: "Transactions",
      value: salesData?.totalCount || 0,
      icon: ShoppingCart,
      variant: "primary" as const,
    },
    {
      title: "Items Sold",
      value: salesData?.totalItems || 0,
      icon: Package,
      variant: "default" as const,
    },
    {
      title: "Avg Order Value",
      value: formatCurrency(salesData?.averageOrderValue || 0),
      icon: DollarSign,
      variant: "success" as const,
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
        title="Sales Reports"
        description="Sales performance, trends, and analysis"
      />

      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3">
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="w-[160px]"
        />
        <span className="text-white/40">to</span>
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="w-[160px]"
        />
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {summaryCards.map((card) => (
          <Card key={card.title} glass>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-white/50">{card.title}</p>
                  <p className={cn(
                    "text-2xl font-bold tracking-tight",
                    card.variant === "success" ? "text-emerald-400" :
                    card.variant === "primary" ? "text-blue-400" :
                    "text-white"
                  )}>
                    {card.value}
                  </p>
                </div>
                <div className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg",
                  card.variant === "success" ? "bg-emerald-500/15 text-emerald-400" :
                  card.variant === "primary" ? "bg-blue-500/15 text-blue-400" :
                  "bg-white/10 text-white"
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
            <CardTitle className="text-lg font-semibold text-white">Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <AreaChart
              data={revenueData?.breakdown || []}
              xKey="period"
              series={[
                { key: "revenue", name: "Revenue", color: "#8b5cf6", gradientId: "salesGrad" },
              ]}
              height={280}
              valueFormatter={formatCurrency}
              showLegend
            />
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">Sales by Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart
              data={(salesData?.paymentMethodBreakdown || []).map((p: any) => ({
                name: p.method.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
                value: p.total,
                color: paymentColors[p.method] || "#64748b",
              }))}
              height={280}
              donut
              valueFormatter={formatCurrency}
            />
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-400" />
              Hourly Sales Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={salesData?.hourlyDistribution || []}
              xKey="hour"
              series={[
                { key: "revenue", name: "Revenue", color: "#8b5cf6" },
              ]}
              height={250}
              valueFormatter={formatCurrency}
              showLegend={false}
            />
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-emerald-400" />
              Sales by Day of Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={salesData?.dayOfWeek || []}
              xKey="day"
              series={[
                { key: "revenue", name: "Revenue", color: "#10b981" },
                { key: "count", name: "Transactions", color: "#3b82f6" },
              ]}
              height={250}
              valueFormatter={(v: number) => v > 1000 ? formatCurrency(v) : v.toString()}
            />
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <Crown className="h-4 w-4 text-amber-400" />
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!salesData?.topProducts?.length ? (
              <EmptyState title="No products sold" description="No sales data available" />
            ) : (
              <div className="rounded-xl border border-white/10 overflow-hidden max-h-[350px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesData.topProducts.map((item: any, i: number) => (
                      <TableRow key={item.productId}>
                        <TableCell className="text-white/40">{i + 1}</TableCell>
                        <TableCell className="text-white font-medium">{item.name}</TableCell>
                        <TableCell>
                          <Badge variant="primary">{item.quantity}</Badge>
                        </TableCell>
                        <TableCell className="text-white font-medium">
                          {formatCurrency(item.revenue)}
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
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-violet-400" />
              Top Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!salesData?.topCustomers?.length ? (
              <EmptyState title="No customer data" description="No customers with purchases yet" />
            ) : (
              <div className="rounded-xl border border-white/10 overflow-hidden max-h-[350px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Total Spent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesData.topCustomers.map((item: any, i: number) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-white/40">{i + 1}</TableCell>
                        <TableCell className="text-white font-medium">{item.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.transactionCount}</Badge>
                        </TableCell>
                        <TableCell className="text-white font-medium">
                          {formatCurrency(item.totalSpent)}
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
