"use server";

import { connectDB } from "@/lib/db/mongoose";
import { auth } from "@/lib/auth/config";
import { Sale } from "@/models/Sale";
import { Product } from "@/models/Product";
import { Customer } from "@/models/Customer";
import { Expense } from "@/models/Expense";
import { InventoryMovement } from "@/models/InventoryMovement";

export async function getDashboardStats() {
  try {
    await connectDB();
    const session = await auth();
    const businessId = (session?.user as any)?.businessId;

    if (!businessId) {
      return {
        success: false as const,
        error: "Not authenticated",
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySales = await Sale.find({
      businessId,
      createdAt: { $gte: today },
      status: "completed",
    });

    const totalRevenue = todaySales.reduce((sum, s) => sum + s.grandTotal, 0);

    const totalProfit = todaySales.reduce(
      (sum, s) =>
        sum +
        (s.items?.reduce(
          (p: number, i: any) => p + (i.price - i.cost) * i.quantity,
          0
        ) || 0),
      0
    );

    const allProducts = await Product.find({ businessId });
    const lowStockCount = allProducts.filter(
      (p) => p.minStock && p.currentStock <= p.minStock
    ).length;
    const outOfStockCount = allProducts.filter(
      (p) => p.currentStock <= 0
    ).length;
    const inventoryValue = allProducts.reduce(
      (sum, p) => sum + p.currentStock * p.purchasePrice,
      0
    );

    const todayExpenses = await Expense.find({
      businessId,
      date: { $gte: today },
    });
    const totalExpenses = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

    return {
      success: true as const,
      data: {
        todaySalesCount: todaySales.length,
        todayOrders: todaySales.length,
        revenue: totalRevenue,
        profit: totalProfit,
        expenses: totalExpenses,
        lowStock: lowStockCount,
        outOfStock: outOfStockCount,
        inventoryValue,
      },
    };
  } catch (error) {
    console.error("getDashboardStats error:", error);
    return { success: false as const, error: "Failed to fetch dashboard stats" };
  }
}

export async function getSalesChart(days: number = 30) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = (session?.user as any)?.businessId;

    if (!businessId) {
      return { success: false as const, error: "Not authenticated" };
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const sales = await Sale.find({
      businessId,
      createdAt: { $gte: startDate },
      status: "completed",
    }).sort({ createdAt: 1 });

    const dateMap: Record<string, { revenue: number; profit: number }> = {};

    for (let i = 0; i <= days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const key = date.toISOString().split("T")[0];
      dateMap[key] = { revenue: 0, profit: 0 };
    }

    for (const sale of sales) {
      const key = new Date(sale.createdAt).toISOString().split("T")[0];
      if (dateMap[key]) {
        dateMap[key].revenue += sale.grandTotal;
        dateMap[key].profit +=
          sale.items?.reduce(
            (p: number, i: any) => p + (i.price - i.cost) * i.quantity,
            0
          ) || 0;
      }
    }

    const chartData = Object.entries(dateMap).map(([date, values]) => ({
      date,
      revenue: Math.round(values.revenue * 100) / 100,
      profit: Math.round(values.profit * 100) / 100,
    }));

    return { success: true as const, data: chartData };
  } catch (error) {
    console.error("getSalesChart error:", error);
    return { success: false as const, error: "Failed to fetch sales chart data" };
  }
}

export async function getTopProducts(limit: number = 10) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = (session?.user as any)?.businessId;

    if (!businessId) {
      return { success: false as const, error: "Not authenticated" };
    }

    const sales = await Sale.find({
      businessId,
      status: "completed",
    });

    const productMap: Record<
      string,
      { name: string; quantity: number; revenue: number; profit: number }
    > = {};

    for (const sale of sales) {
      for (const item of sale.items) {
        const key = item.productId.toString();
        if (!productMap[key]) {
          productMap[key] = {
            name: item.name,
            quantity: 0,
            revenue: 0,
            profit: 0,
          };
        }
        productMap[key].quantity += item.quantity;
        productMap[key].revenue += item.total;
        productMap[key].profit += (item.price - item.cost) * item.quantity;
      }
    }

    const products = Object.entries(productMap)
      .map(([productId, data]) => ({
        productId,
        ...data,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit);

    return { success: true as const, data: products };
  } catch (error) {
    console.error("getTopProducts error:", error);
    return { success: false as const, error: "Failed to fetch top products" };
  }
}

export async function getRecentSales(limit: number = 10) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = (session?.user as any)?.businessId;

    if (!businessId) {
      return { success: false as const, error: "Not authenticated" };
    }

    const sales = await Sale.find({ businessId, status: "completed" })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const customerIds = sales
      .filter((s) => s.customerId)
      .map((s) => s.customerId);

    const customers = await Customer.find({
      _id: { $in: customerIds },
    }).lean();
    const customerMap = new Map(
      customers.map((c) => [c._id.toString(), c.name])
    );

    const data = sales.map((sale) => ({
      _id: sale._id.toString(),
      invoiceNumber: sale.invoiceNumber,
      customerName: sale.customerId
        ? customerMap.get(sale.customerId.toString()) || "Unknown"
        : "Walk-in Customer",
      grandTotal: sale.grandTotal,
      status: sale.status,
      createdAt: sale.createdAt.toISOString(),
      itemsCount: sale.items?.length || 0,
    }));

    return { success: true as const, data };
  } catch (error) {
    console.error("getRecentSales error:", error);
    return { success: false as const, error: "Failed to fetch recent sales" };
  }
}

export async function getMonthlyComparison() {
  try {
    await connectDB();
    const session = await auth();
    const businessId = (session?.user as any)?.businessId;

    if (!businessId) {
      return { success: false as const, error: "Not authenticated" };
    }

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const sales = await Sale.find({
      businessId,
      createdAt: { $gte: twelveMonthsAgo },
      status: "completed",
    });

    const expenses = await Expense.find({
      businessId,
      date: { $gte: twelveMonthsAgo },
    });

    const monthMap: Record<
      string,
      { sales: number; profit: number; expenses: number }
    > = {};

    for (let i = 0; i < 12; i++) {
      const date = new Date(twelveMonthsAgo);
      date.setMonth(date.getMonth() + i);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthMap[key] = { sales: 0, profit: 0, expenses: 0 };
    }

    for (const sale of sales) {
      const d = new Date(sale.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (monthMap[key]) {
        monthMap[key].sales += sale.grandTotal;
        monthMap[key].profit +=
          sale.items?.reduce(
            (p: number, i: any) => p + (i.price - i.cost) * i.quantity,
            0
          ) || 0;
      }
    }

    for (const expense of expenses) {
      const d = new Date(expense.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (monthMap[key]) {
        monthMap[key].expenses += expense.amount;
      }
    }

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const chartData = Object.entries(monthMap).map(([key, values]) => {
      const [year, month] = key.split("-");
      return {
        month: `${monthNames[parseInt(month) - 1]} ${year}`,
        sales: Math.round(values.sales * 100) / 100,
        profit: Math.round(values.profit * 100) / 100,
        expenses: Math.round(values.expenses * 100) / 100,
      };
    });

    return { success: true as const, data: chartData };
  } catch (error) {
    console.error("getMonthlyComparison error:", error);
    return {
      success: false as const,
      error: "Failed to fetch monthly comparison",
    };
  }
}
