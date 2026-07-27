"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  Wallet,
  Percent,
  FileText,
  Download,
  CalendarRange,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AreaChart } from "@/components/charts/area-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { PieChart } from "@/components/charts/pie-chart";
import { Loading } from "@/components/ui/loading";
import {
  getRevenueReport,
  getProfitReport,
  getCashFlow,
  getExpenseReport,
} from "@/actions/reports.actions";
import { cn } from "@/lib/utils/cn";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function FinancialReportsPage() {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  const [dateFrom, setDateFrom] = useState(thirtyDaysAgo.toISOString().split("T")[0]);
  const [dateTo, setDateTo] = useState(today.toISOString().split("T")[0]);
  const [groupBy, setGroupBy] = useState<"daily" | "weekly" | "monthly">("daily");
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [profitData, setProfitData] = useState<any>(null);
  const [cashFlowData, setCashFlowData] = useState<any>(null);
  const [expenseData, setExpenseData] = useState<any>(null);

  const dateRange = { from: dateFrom, to: dateTo };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [revenueRes, profitRes, cashFlowRes, expenseRes] = await Promise.all([
        getRevenueReport({ ...dateRange, groupBy }),
        getProfitReport(dateRange),
        getCashFlow(dateRange),
        getExpenseReport(dateRange),
      ]);
      if (revenueRes.success) setRevenueData(revenueRes.data);
      if (profitRes.success) setProfitData(profitRes.data);
      if (cashFlowRes.success) setCashFlowData(cashFlowRes.data);
      if (expenseRes.success) setExpenseData(expenseRes.data);
    } catch (error) {
      console.error("Failed to load financial reports:", error);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, groupBy]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const formatCurrency = (v: number) => `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const summaryCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(profitData?.totalRevenue || 0),
      icon: TrendingUp,
      variant: "success" as const,
      description: "Total sales revenue",
    },
    {
      title: "COGS",
      value: formatCurrency(profitData?.totalCOGS || 0),
      icon: DollarSign,
      variant: "danger" as const,
      description: "Cost of goods sold",
    },
    {
      title: "Gross Profit",
      value: formatCurrency(profitData?.grossProfit || 0),
      icon: TrendingUp,
      variant: "success" as const,
      description: `Margin: ${profitData?.grossMargin || 0}%`,
    },
    {
      title: "Expenses",
      value: formatCurrency(profitData?.totalExpenses || 0),
      icon: Wallet,
      variant: "danger" as const,
      description: "Operating expenses",
    },
    {
      title: "Net Profit",
      value: formatCurrency(profitData?.netProfit || 0),
      icon: PiggyBank,
      variant: (profitData?.netProfit || 0) >= 0 ? "success" as const : "danger" as const,
      description: `Net margin: ${profitData?.netMargin || 0}%`,
    },
    {
      title: "Gross Margin",
      value: `${profitData?.grossMargin || 0}%`,
      icon: Percent,
      variant: "primary" as const,
      description: "Profitability ratio",
    },
  ];

  const handleExportPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Financial Report", 20, 20);
    doc.setFontSize(10);
    doc.text(`Period: ${dateFrom} to ${dateTo}`, 20, 30);
    doc.text(`Revenue: ${summaryCards[0].value}`, 20, 40);
    doc.text(`COGS: ${summaryCards[1].value}`, 20, 45);
    doc.text(`Gross Profit: ${summaryCards[2].value}`, 20, 50);
    doc.text(`Expenses: ${summaryCards[3].value}`, 20, 55);
    doc.text(`Net Profit: ${summaryCards[4].value}`, 20, 60);
    doc.text(`Gross Margin: ${summaryCards[5].value}`, 20, 65);
    doc.save("financial-report.pdf");
  };

  const handleExportExcel = () => {
    const rows = [
      ["Metric", "Value"],
      ["Revenue", profitData?.totalRevenue || 0],
      ["COGS", profitData?.totalCOGS || 0],
      ["Gross Profit", profitData?.grossProfit || 0],
      ["Expenses", profitData?.totalExpenses || 0],
      ["Net Profit", profitData?.netProfit || 0],
      ["Gross Margin", `${profitData?.grossMargin || 0}%`],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "financial-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loading text="Loading financial reports..." />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-8"
    >
      <PageHeader
        title="Financial Reports"
        description="Revenue, profit, expenses and cash flow analysis"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExportPDF}>
              <FileText className="h-4 w-4" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={handleExportExcel}>
              <Download className="h-4 w-4" />
              Export Excel
            </Button>
          </div>
        }
      />

      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <CalendarRange className="h-4 w-4 text-muted-foreground/50" />
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-[160px]"
          />
          <span className="text-muted-foreground/50">to</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-[160px]"
          />
        </div>
        <Select value={groupBy} onValueChange={(v) => setGroupBy(v as any)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

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
                    card.variant === "success" ? "text-emerald-600 dark:text-emerald-400" :
                    card.variant === "danger" ? "text-red-600 dark:text-red-400" :
                    card.variant === "primary" ? "text-primary" :
                    "text-foreground"
                  )}>
                    {card.value}
                  </p>
                  <p className="text-[10px] text-muted-foreground/50">{card.description}</p>
                </div>
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg",
                  card.variant === "success" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" :
                  card.variant === "danger" ? "bg-red-500/15 text-red-600 dark:text-red-400" :
                  card.variant === "primary" ? "bg-primary/15 text-primary" :
                  "bg-muted text-muted-foreground"
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
            <CardTitle className="text-lg font-semibold text-foreground">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <AreaChart
              data={revenueData?.breakdown || []}
              xKey="period"
              series={[
                { key: "revenue", name: "Revenue", color: "#8b5cf6", gradientId: "revGrad" },
              ]}
              height={280}
              valueFormatter={formatCurrency}
              showLegend
            />
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart
              data={(expenseData?.byCategory || []).map((c: any) => ({
                name: c.category,
                value: c.total,
              }))}
              height={280}
              donut
              valueFormatter={formatCurrency}
            />
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Profit Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={profitData?.breakdown || []}
              xKey="month"
              series={[
                { key: "revenue", name: "Revenue", color: "#8b5cf6" },
                { key: "grossProfit", name: "Gross Profit", color: "#10b981" },
                { key: "netProfit", name: "Net Profit", color: "#3b82f6" },
              ]}
              height={280}
              valueFormatter={formatCurrency}
              stacked={false}
            />
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={cashFlowData?.breakdown || []}
              xKey="month"
              series={[
                { key: "inflow", name: "Cash In", color: "#10b981" },
                { key: "outflow", name: "Cash Out", color: "#ef4444" },
              ]}
              height={280}
              valueFormatter={formatCurrency}
            />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
