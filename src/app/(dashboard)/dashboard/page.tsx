"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  PiggyBank,
  Wallet,
  AlertTriangle,
  XCircle,
  Package,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/dashboard/stats-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { ProfitChart } from "@/components/dashboard/profit-chart";
import { TopProducts } from "@/components/dashboard/top-products";
import { RecentSales } from "@/components/dashboard/recent-sales";
import { MonthlyComparison } from "@/components/dashboard/monthly-comparison";
import {
  getDashboardStats,
  getSalesChart,
  getTopProducts,
  getRecentSales,
  getMonthlyComparison,
} from "@/actions/dashboard.actions";

interface DashboardData {
  stats: {
    todaySalesCount: number;
    todayOrders: number;
    revenue: number;
    profit: number;
    expenses: number;
    lowStock: number;
    outOfStock: number;
    inventoryValue: number;
  } | null;
  salesChart: { date: string; revenue: number; profit: number }[];
  topProducts: {
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
    profit: number;
  }[];
  recentSales: {
    _id: string;
    invoiceNumber: string;
    customerName: string;
    grandTotal: number;
    status: string;
    createdAt: string;
    itemsCount: number;
  }[];
  monthlyComparison: {
    month: string;
    sales: number;
    profit: number;
    expenses: number;
  }[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    stats: null,
    salesChart: [],
    topProducts: [],
    recentSales: [],
    monthlyComparison: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [
          statsRes,
          salesChartRes,
          topProductsRes,
          recentSalesRes,
          monthlyCompRes,
        ] = await Promise.all([
          getDashboardStats(),
          getSalesChart(90),
          getTopProducts(10),
          getRecentSales(10),
          getMonthlyComparison(),
        ]);

        setData({
          stats: statsRes.success ? statsRes.data : null,
          salesChart: salesChartRes.success ? salesChartRes.data : [],
          topProducts: topProductsRes.success ? topProductsRes.data : [],
          recentSales: recentSalesRes.success ? recentSalesRes.data : [],
          monthlyComparison: monthlyCompRes.success ? monthlyCompRes.data : [],
        });
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const statsCards = [
    {
      title: "Today's Sales",
      value: data.stats?.todaySalesCount ?? 0,
      icon: DollarSign,
      variant: "primary" as const,
      description: "Completed transactions",
    },
    {
      title: "Today's Orders",
      value: data.stats?.todayOrders ?? 0,
      icon: ShoppingCart,
      variant: "primary" as const,
      description: "Total orders today",
    },
    {
      title: "Revenue",
      value: data.stats ? `$${(data.stats.revenue).toLocaleString()}` : "$0",
      icon: TrendingUp,
      variant: "success" as const,
      description: "Total revenue today",
    },
    {
      title: "Profit",
      value: data.stats ? `$${(data.stats.profit).toLocaleString()}` : "$0",
      icon: PiggyBank,
      variant: "success" as const,
      description: "Net profit today",
    },
    {
      title: "Expenses",
      value: data.stats ? `$${(data.stats.expenses).toLocaleString()}` : "$0",
      icon: Wallet,
      variant: "danger" as const,
      description: "Today's expenses",
    },
    {
      title: "Low Stock",
      value: data.stats?.lowStock ?? 0,
      icon: AlertTriangle,
      variant: "warning" as const,
      description: "Products below minimum",
    },
    {
      title: "Out of Stock",
      value: data.stats?.outOfStock ?? 0,
      icon: XCircle,
      variant: "danger" as const,
      description: "Products with 0 stock",
    },
    {
      title: "Inventory Value",
      value: data.stats
        ? `$${(data.stats.inventoryValue).toLocaleString()}`
        : "$0",
      icon: Package,
      variant: "primary" as const,
      description: "Total stock value",
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
        title="Dashboard"
        description="Overview of your retail business performance"
      />

      {/* Stats Cards Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {statsCards.map((card) => (
          <StatsCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            variant={card.variant}
            description={card.description}
            loading={loading}
          />
        ))}
      </motion.div>

      {/* Charts Row */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
      >
        <RevenueChart data={data.salesChart} loading={loading} />
        <ProfitChart data={data.salesChart} loading={loading} />
      </motion.div>

      {/* Monthly Comparison */}
      <motion.div variants={itemVariants}>
        <MonthlyComparison data={data.monthlyComparison} loading={loading} />
      </motion.div>

      {/* Bottom Row */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
      >
        <TopProducts data={data.topProducts} loading={loading} />
        <RecentSales data={data.recentSales} loading={loading} />
      </motion.div>
    </motion.div>
  );
}
