"use server";

import { connectDB } from "@/lib/db/mongoose";
import { auth } from "@/lib/auth/config";
import { Sale } from "@/models/Sale";
import { Product } from "@/models/Product";
import { Customer } from "@/models/Customer";
import { Expense } from "@/models/Expense";
import mongoose from "mongoose";

function getBusinessId(session: any): string {
  const bid = session?.user?.businessId;
  if (!bid) throw new Error("Not authenticated");
  return bid;
}

export async function getRevenueReport(dateRange: { from?: string; to?: string; groupBy?: "daily" | "weekly" | "monthly" }) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const { from = "", to = "", groupBy = "daily" } = dateRange;

    const matchStage: Record<string, unknown> = {
      businessId: new mongoose.Types.ObjectId(businessId),
      status: "completed",
    };

    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (from) dateFilter.$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        dateFilter.$lte = end;
      }
      matchStage.createdAt = dateFilter;
    }

    let groupId: Record<string, unknown>;
    if (groupBy === "monthly") {
      groupId = { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } };
    } else if (groupBy === "weekly") {
      groupId = { year: { $year: "$createdAt" }, week: { $isoWeek: "$createdAt" } };
    } else {
      groupId = { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } };
    }

    const revenue = await Sale.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: groupId,
          revenue: { $sum: "$grandTotal" },
          count: { $sum: 1 },
          itemsSold: { $sum: { $sum: "$items.quantity" } },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]).allowDiskUse(true);

    const total = revenue.reduce((sum: number, r: any) => sum + r.revenue, 0);
    const totalCount = revenue.reduce((sum, r) => sum + r.count, 0);

    return {
      success: true as const,
      data: {
        totalRevenue: Math.round(total * 100) / 100,
        totalTransactions: totalCount,
        averageOrderValue: totalCount > 0 ? Math.round((total / totalCount) * 100) / 100 : 0,
        breakdown: revenue.map((r) => ({
          period: groupBy === "monthly"
            ? `${r._id.year}-${String(r._id.month).padStart(2, "0")}`
            : `${r._id.year}-${String(r._id.month).padStart(2, "0")}-${String(r._id.day || "").padStart(2, "0")}`,
          revenue: Math.round(r.revenue * 100) / 100,
          count: r.count,
          itemsSold: r.itemsSold,
        })),
      },
    };
  } catch (error) {
    console.error("getRevenueReport error:", error);
    return { success: false as const, error: "Failed to fetch revenue report" };
  }
}

export async function getProfitReport(dateRange: { from?: string; to?: string }) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const { from = "", to = "" } = dateRange;

    const dateFilter: Record<string, Date> = {};
    if (from) dateFilter.$gte = new Date(from);
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      dateFilter.$lte = end;
    }

    const saleMatch: Record<string, unknown> = { businessId: new mongoose.Types.ObjectId(businessId), status: "completed" };
    const expenseMatch: Record<string, unknown> = { businessId: new mongoose.Types.ObjectId(businessId) };
    if (Object.keys(dateFilter).length > 0) {
      saleMatch.createdAt = dateFilter;
      expenseMatch.date = dateFilter;
    }

    const sales = await Sale.find(saleMatch).lean();
    const expenses = await Expense.find(expenseMatch).lean();

    const totalRevenue = sales.reduce((sum, s) => sum + s.grandTotal, 0);
    const totalCOGS = sales.reduce((sum: number, s: any) => sum + s.items.reduce((p: number, i: any) => p + i.cost * i.quantity, 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const grossProfit = totalRevenue - totalCOGS;
    const netProfit = grossProfit - totalExpenses;
    const margin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    const profitByMonth = await Sale.aggregate([
      { $match: saleMatch },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          revenue: { $sum: "$grandTotal" },
          cogs: { $sum: { $sum: { $map: { input: "$items", as: "item", in: { $multiply: ["$$item.cost", "$$item.quantity"] } } } } },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]).allowDiskUse(true);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const breakdown = profitByMonth.map((r: any) => {
      const monthExpenses = expenses
        .filter((e) => {
          const d = new Date(e.date);
          return d.getFullYear() === r._id.year && d.getMonth() + 1 === r._id.month;
        })
        .reduce((sum, e) => sum + e.amount, 0);
      const gp = r.revenue - r.cogs;
      return {
        month: `${monthNames[r._id.month - 1]} ${r._id.year}`,
        revenue: Math.round(r.revenue * 100) / 100,
        cogs: Math.round(r.cogs * 100) / 100,
        grossProfit: Math.round(gp * 100) / 100,
        expenses: Math.round(monthExpenses * 100) / 100,
        netProfit: Math.round((gp - monthExpenses) * 100) / 100,
        margin: r.revenue > 0 ? Math.round((gp / r.revenue) * 10000) / 100 : 0,
      };
    });

    return {
      success: true as const,
      data: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalCOGS: Math.round(totalCOGS * 100) / 100,
        grossProfit: Math.round(grossProfit * 100) / 100,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        netProfit: Math.round(netProfit * 100) / 100,
        grossMargin: Math.round(margin * 100) / 100,
        netMargin: Math.round(netMargin * 100) / 100,
        breakdown,
      },
    };
  } catch (error) {
    console.error("getProfitReport error:", error);
    return { success: false as const, error: "Failed to fetch profit report" };
  }
}

export async function getTaxReport(dateRange: { from?: string; to?: string }) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const { from = "", to = "" } = dateRange;

    const matchStage: Record<string, unknown> = {
      businessId: new mongoose.Types.ObjectId(businessId),
      status: "completed",
    };

    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (from) dateFilter.$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        dateFilter.$lte = end;
      }
      matchStage.createdAt = dateFilter;
    }

    const sales = await Sale.find(matchStage).lean();

    const totalTax = sales.reduce((sum, s) => sum + s.taxTotal, 0);
    const totalRevenue = sales.reduce((sum, s) => sum + s.grandTotal, 0);
    const taxableSales = sales.filter((s) => s.taxTotal > 0);
    const taxFreeSales = sales.filter((s) => s.taxTotal === 0);

    const byMonth = await Sale.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          tax: { $sum: "$taxTotal" },
          revenue: { $sum: "$grandTotal" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]).allowDiskUse(true);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return {
      success: true as const,
      data: {
        totalTaxCollected: Math.round(totalTax * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        taxableTransactions: taxableSales.length,
        taxFreeTransactions: taxFreeSales.length,
        effectiveTaxRate: totalRevenue > 0 ? Math.round((totalTax / totalRevenue) * 10000) / 100 : 0,
        breakdown: byMonth.map((r) => ({
          month: `${monthNames[r._id.month - 1]} ${r._id.year}`,
          tax: Math.round(r.tax * 100) / 100,
          revenue: Math.round(r.revenue * 100) / 100,
          count: r.count,
          rate: r.revenue > 0 ? Math.round((r.tax / r.revenue) * 10000) / 100 : 0,
        })),
      },
    };
  } catch (error) {
    console.error("getTaxReport error:", error);
    return { success: false as const, error: "Failed to fetch tax report" };
  }
}

export async function getExpenseReport(dateRange: { from?: string; to?: string }) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const { from = "", to = "" } = dateRange;

    const matchStage: Record<string, unknown> = { businessId: new mongoose.Types.ObjectId(businessId) };
    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (from) dateFilter.$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        dateFilter.$lte = end;
      }
      matchStage.date = dateFilter;
    }

    const byCategory = await Expense.aggregate([
      { $match: matchStage },
      {
        $lookup: { from: "expensecategories", localField: "categoryId", foreignField: "_id", as: "category" },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ["$category.name", "Uncategorized"] },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const byMonth = await Expense.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const totalExpenses = byCategory.reduce((sum, c) => sum + c.total, 0);

    return {
      success: true as const,
      data: {
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        totalTransactions: byCategory.reduce((sum, c) => sum + c.count, 0),
        byCategory: byCategory.map((c) => ({
          category: c._id,
          total: Math.round(c.total * 100) / 100,
          count: c.count,
          percentage: totalExpenses > 0 ? Math.round((c.total / totalExpenses) * 10000) / 100 : 0,
        })),
        byMonth: byMonth.map((r) => ({
          month: `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][r._id.month - 1]} ${r._id.year}`,
          total: Math.round(r.total * 100) / 100,
          count: r.count,
        })),
      },
    };
  } catch (error) {
    console.error("getExpenseReport error:", error);
    return { success: false as const, error: "Failed to fetch expense report" };
  }
}

export async function getInventoryReport() {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const products = await Product.find({
      businessId: new mongoose.Types.ObjectId(businessId),
      isArchived: false,
    }).populate("categoryId", "name").lean();

    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + p.currentStock, 0);
    const totalStockValue = products.reduce((sum, p) => sum + p.currentStock * p.purchasePrice, 0);
    const totalRetailValue = products.reduce((sum, p) => sum + p.currentStock * p.sellingPrice, 0);
    const potentialProfit = totalRetailValue - totalStockValue;

    const lowStock = products.filter((p) => p.minStock > 0 && p.currentStock <= p.minStock && p.currentStock > 0);
    const outOfStock = products.filter((p) => p.currentStock <= 0);
    const inStock = products.filter((p) => p.currentStock > 0);

    const now = new Date();
    const expiringSoon = products.filter((p) => p.expiryDate && new Date(p.expiryDate) <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000));

    const categoryMap: Record<string, { count: number; value: number; stock: number }> = {};
    for (const p of products) {
      const catName = (p.categoryId as any)?.name || "Uncategorized";
      if (!categoryMap[catName]) categoryMap[catName] = { count: 0, value: 0, stock: 0 };
      categoryMap[catName].count++;
      categoryMap[catName].value += p.currentStock * p.purchasePrice;
      categoryMap[catName].stock += p.currentStock;
    }

    const topByValue = [...products]
      .sort((a, b) => (b.currentStock * b.sellingPrice) - (a.currentStock * a.sellingPrice))
      .slice(0, 10)
      .map((p) => ({
        _id: p._id.toString(),
        name: p.name,
        sku: p.sku || "",
        stock: p.currentStock,
        value: p.currentStock * p.sellingPrice,
        category: (p.categoryId as any)?.name || "",
      }));

    return {
      success: true as const,
      data: {
        totalProducts,
        totalStock,
        totalStockValue: Math.round(totalStockValue * 100) / 100,
        totalRetailValue: Math.round(totalRetailValue * 100) / 100,
        potentialProfit: Math.round(potentialProfit * 100) / 100,
        averageStockPerProduct: totalProducts > 0 ? Math.round((totalStock / totalProducts) * 100) / 100 : 0,
        statusDistribution: {
          inStock: inStock.length,
          lowStock: lowStock.length,
          outOfStock: outOfStock.length,
        },
        lowStockItems: lowStock.map((p) => ({
          _id: p._id.toString(),
          name: p.name,
          sku: p.sku || "",
          currentStock: p.currentStock,
          minStock: p.minStock,
          sellingPrice: p.sellingPrice,
          value: p.currentStock * p.sellingPrice,
        })),
        expiringItems: expiringSoon.map((p) => ({
          _id: p._id.toString(),
          name: p.name,
          sku: p.sku || "",
          currentStock: p.currentStock,
          expiryDate: p.expiryDate?.toISOString().split("T")[0] || "",
          daysToExpiry: p.expiryDate ? Math.ceil((new Date(p.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0,
          value: p.currentStock * p.sellingPrice,
        })),
        topByValue,
        categoryBreakdown: Object.entries(categoryMap).map(([category, data]) => ({
          category,
          productCount: data.count,
          totalStock: data.stock,
          totalValue: Math.round(data.value * 100) / 100,
        })),
      },
    };
  } catch (error) {
    console.error("getInventoryReport error:", error);
    return { success: false as const, error: "Failed to fetch inventory report" };
  }
}

export async function getCustomerReport() {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const customers = await Customer.find({
      businessId: new mongoose.Types.ObjectId(businessId),
    }).lean();

    const sales = await Sale.find({
      businessId: new mongoose.Types.ObjectId(businessId),
      status: "completed",
    }).lean();

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalCustomers = customers.length;
    const activeCustomers = customers.filter((c) => c.isActive).length;
    const newCustomers30d = customers.filter((c) => c.createdAt >= thirtyDaysAgo).length;

    const customerSaleMap: Record<string, { count: number; total: number }> = {};
    for (const s of sales) {
      const cid = s.customerId?.toString() || "walk-in";
      if (!customerSaleMap[cid]) customerSaleMap[cid] = { count: 0, total: 0 };
      customerSaleMap[cid].count++;
      customerSaleMap[cid].total += s.grandTotal;
    }

    const repeatCustomers = Object.values(customerSaleMap).filter((v) => v.count > 1).length;
    const totalBuyingCustomers = Object.keys(customerSaleMap).filter((k) => k !== "walk-in").length;
    const repeatRate = totalBuyingCustomers > 0 ? (repeatCustomers / totalBuyingCustomers) * 100 : 0;

    const walkInSales = customerSaleMap["walk-in"]?.count || 0;
    const totalSalesCount = sales.length;
    const walkInRate = totalSalesCount > 0 ? (walkInSales / totalSalesCount) * 100 : 0;

    const avgSpend = totalBuyingCustomers > 0
      ? Object.entries(customerSaleMap)
          .filter(([k]) => k !== "walk-in")
          .reduce((sum, [, v]) => sum + v.total, 0) / totalBuyingCustomers
      : 0;

    const topCustomers = Object.entries(customerSaleMap)
      .filter(([k]) => k !== "walk-in")
      .map(([id, data]) => {
        const customer = customers.find((c) => c._id.toString() === id);
        return {
          _id: id,
          name: customer?.name || "Unknown",
          email: customer?.email || "",
          totalSpent: Math.round(data.total * 100) / 100,
          transactionCount: data.count,
          avgOrderValue: data.count > 0 ? Math.round((data.total / data.count) * 100) / 100 : 0,
        };
      })
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    return {
      success: true as const,
      data: {
        totalCustomers,
        activeCustomers,
        newCustomers30d,
        repeatCustomers,
        repeatRate: Math.round(repeatRate * 100) / 100,
        averageSpend: Math.round(avgSpend * 100) / 100,
        walkInRate: Math.round(walkInRate * 100) / 100,
        topCustomers,
      },
    };
  } catch (error) {
    console.error("getCustomerReport error:", error);
    return { success: false as const, error: "Failed to fetch customer report" };
  }
}

export async function getSalesReport(dateRange: { from?: string; to?: string }) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const { from = "", to = "" } = dateRange;

    const matchStage: Record<string, unknown> = {
      businessId: new mongoose.Types.ObjectId(businessId),
      status: "completed",
    };

    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (from) dateFilter.$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        dateFilter.$lte = end;
      }
      matchStage.createdAt = dateFilter;
    }

    const sales = await Sale.find(matchStage).lean();

    const totalRevenue = sales.reduce((sum, s) => sum + s.grandTotal, 0);
    const totalCount = sales.length;
    const totalItems = sales.reduce((sum: number, s: any) => sum + s.items.reduce((p: number, i: any) => p + i.quantity, 0), 0);
    const avgOrderValue = totalCount > 0 ? totalRevenue / totalCount : 0;

    const paymentMethodBreakdown: Record<string, number> = {};
    for (const s of sales) {
      paymentMethodBreakdown[s.paymentMethod] = (paymentMethodBreakdown[s.paymentMethod] || 0) + s.grandTotal;
    }

    const hourlyDistribution: Record<number, { count: number; revenue: number }> = {};
    for (let i = 0; i < 24; i++) hourlyDistribution[i] = { count: 0, revenue: 0 };
    for (const s of sales) {
      const hour = new Date(s.createdAt).getHours();
      if (!hourlyDistribution[hour]) hourlyDistribution[hour] = { count: 0, revenue: 0 };
      hourlyDistribution[hour].count++;
      hourlyDistribution[hour].revenue += s.grandTotal;
    }

    const dayOfWeek: Record<string, { count: number; revenue: number }> = {
      Sun: { count: 0, revenue: 0 },
      Mon: { count: 0, revenue: 0 },
      Tue: { count: 0, revenue: 0 },
      Wed: { count: 0, revenue: 0 },
      Thu: { count: 0, revenue: 0 },
      Fri: { count: 0, revenue: 0 },
      Sat: { count: 0, revenue: 0 },
    };
    for (const s of sales) {
      const d = new Date(s.createdAt);
      const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
      dayOfWeek[dayName].count++;
      dayOfWeek[dayName].revenue += s.grandTotal;
    }

    const productMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
    for (const s of sales) {
      for (const item of s.items) {
        const key = item.productId.toString();
        if (!productMap[key]) productMap[key] = { name: item.name, quantity: 0, revenue: 0 };
        productMap[key].quantity += item.quantity;
        productMap[key].revenue += item.total;
      }
    }

    const topProducts = Object.entries(productMap)
      .map(([productId, data]) => ({ productId, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    const customerMap: Record<string, { name: string; count: number; total: number }> = {};
    for (const s of sales) {
      const cid = s.customerId?.toString() || "walk-in";
      if (!customerMap[cid]) customerMap[cid] = { name: "Walk-in Customer", count: 0, total: 0 };
      customerMap[cid].count++;
      customerMap[cid].total += s.grandTotal;
    }

    return {
      success: true as const,
      data: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalCount,
        totalItems,
        averageOrderValue: Math.round(avgOrderValue * 100) / 100,
        paymentMethodBreakdown: Object.entries(paymentMethodBreakdown).map(([method, total]) => ({
          method,
          total: Math.round(total * 100) / 100,
          percentage: totalRevenue > 0 ? Math.round((total / totalRevenue) * 10000) / 100 : 0,
        })),
        hourlyDistribution: Object.entries(hourlyDistribution).map(([hour, data]) => ({
          hour: `${hour}:00`,
          count: data.count,
          revenue: Math.round(data.revenue * 100) / 100,
        })),
        dayOfWeek: Object.entries(dayOfWeek).map(([day, data]) => ({
          day,
          count: data.count,
          revenue: Math.round(data.revenue * 100) / 100,
        })),
        topProducts,
        topCustomers: Object.entries(customerMap)
          .filter(([k]) => k !== "walk-in")
          .map(([id, data]) => ({
            id,
            name: data.name,
            transactionCount: data.count,
            totalSpent: Math.round(data.total * 100) / 100,
          }))
          .sort((a, b) => b.totalSpent - a.totalSpent)
          .slice(0, 10),
      },
    };
  } catch (error) {
    console.error("getSalesReport error:", error);
    return { success: false as const, error: "Failed to fetch sales report" };
  }
}

export async function getCashFlow(dateRange: { from?: string; to?: string }) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const { from = "", to = "" } = dateRange;

    const dateFilter: Record<string, Date> = {};
    if (from) dateFilter.$gte = new Date(from);
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      dateFilter.$lte = end;
    }

    const saleMatch: Record<string, unknown> = { businessId: new mongoose.Types.ObjectId(businessId), status: "completed" };
    const expenseMatch: Record<string, unknown> = { businessId: new mongoose.Types.ObjectId(businessId) };
    if (Object.keys(dateFilter).length > 0) {
      saleMatch.createdAt = dateFilter;
      expenseMatch.date = dateFilter;
    }

    const cashIn = await Sale.aggregate([
      { $match: saleMatch },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          total: { $sum: "$grandTotal" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]).allowDiskUse(true);

    const cashOut = await Expense.aggregate([
      { $match: expenseMatch },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const allMonths = new Set<string>();
    for (const r of cashIn) allMonths.add(`${r._id.year}-${r._id.month}`);
    for (const r of cashOut) allMonths.add(`${r._id.year}-${r._id.month}`);

    const cashInByMonth: Record<string, number> = {};
    for (const r of cashIn) cashInByMonth[`${r._id.year}-${r._id.month}`] = r.total;
    const cashOutByMonth: Record<string, number> = {};
    for (const r of cashOut) cashOutByMonth[`${r._id.year}-${r._id.month}`] = r.total;

    const breakdown = Array.from(allMonths)
      .sort()
      .map((key) => {
        const [y, m] = key.split("-").map(Number);
        const inflow = cashInByMonth[key] || 0;
        const outflow = cashOutByMonth[key] || 0;
        return {
          month: `${monthNames[m - 1]} ${y}`,
          inflow: Math.round(inflow * 100) / 100,
          outflow: Math.round(outflow * 100) / 100,
          net: Math.round((inflow - outflow) * 100) / 100,
        };
      });

    const totalInflow = breakdown.reduce((sum, r) => sum + r.inflow, 0);
    const totalOutflow = breakdown.reduce((sum, r) => sum + r.outflow, 0);

    return {
      success: true as const,
      data: {
        totalInflow: Math.round(totalInflow * 100) / 100,
        totalOutflow: Math.round(totalOutflow * 100) / 100,
        netCashFlow: Math.round((totalInflow - totalOutflow) * 100) / 100,
        breakdown,
      },
    };
  } catch (error) {
    console.error("getCashFlow error:", error);
    return { success: false as const, error: "Failed to fetch cash flow" };
  }
}

export async function getGrossMargin(dateRange: { from?: string; to?: string }) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const { from = "", to = "" } = dateRange;

    const matchStage: Record<string, unknown> = {
      businessId: new mongoose.Types.ObjectId(businessId),
      status: "completed",
    };

    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (from) dateFilter.$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        dateFilter.$lte = end;
      }
      matchStage.createdAt = dateFilter;
    }

    const sales = await Sale.find(matchStage).lean();

    let totalRevenue = 0;
    let totalCOGS = 0;
    const productMargins: Record<string, { name: string; revenue: number; cogs: number; quantity: number }> = {};

    for (const s of sales) {
      totalRevenue += s.grandTotal;
      for (const item of s.items) {
        totalCOGS += item.cost * item.quantity;
        const key = item.productId.toString();
        if (!productMargins[key]) productMargins[key] = { name: item.name, revenue: 0, cogs: 0, quantity: 0 };
        productMargins[key].revenue += item.total;
        productMargins[key].cogs += item.cost * item.quantity;
        productMargins[key].quantity += item.quantity;
      }
    }

    const grossProfit = totalRevenue - totalCOGS;
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    const byProduct = Object.entries(productMargins)
      .map(([productId, data]) => ({
        productId,
        name: data.name,
        revenue: Math.round(data.revenue * 100) / 100,
        cogs: Math.round(data.cogs * 100) / 100,
        profit: Math.round((data.revenue - data.cogs) * 100) / 100,
        margin: data.revenue > 0 ? Math.round(((data.revenue - data.cogs) / data.revenue) * 10000) / 100 : 0,
        quantity: data.quantity,
      }))
      .sort((a, b) => b.profit - a.profit);

    return {
      success: true as const,
      data: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalCOGS: Math.round(totalCOGS * 100) / 100,
        grossProfit: Math.round(grossProfit * 100) / 100,
        grossMargin: Math.round(grossMargin * 100) / 100,
        byProduct,
      },
    };
  } catch (error) {
    console.error("getGrossMargin error:", error);
    return { success: false as const, error: "Failed to fetch gross margin" };
  }
}

export async function getDeadStock(days: number = 90) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const threshold = new Date();
    threshold.setDate(threshold.getDate() - days);

    const productsWithSales = await Sale.distinct("items.productId", {
      businessId: new mongoose.Types.ObjectId(businessId),
      createdAt: { $gte: threshold },
      status: "completed",
    });

    const productIds = productsWithSales.map((id) => id.toString());

    const deadStock = await Product.find({
      businessId: new mongoose.Types.ObjectId(businessId),
      isArchived: false,
      _id: { $nin: productsWithSales },
      currentStock: { $gt: 0 },
    })
      .populate("categoryId", "name")
      .sort({ currentStock: -1 })
      .lean();

    const data = deadStock.map((p) => ({
      _id: p._id.toString(),
      name: p.name,
      sku: p.sku || "",
      currentStock: p.currentStock,
      sellingPrice: p.sellingPrice,
      purchasePrice: p.purchasePrice,
      stockValue: p.currentStock * p.purchasePrice,
      category: (p.categoryId as any)?.name || "",
      daysWithoutSale: days,
      lastSaleDate: null,
    }));

    return {
      success: true as const,
      data: {
        totalProducts: data.length,
        totalValue: Math.round(data.reduce((sum, p) => sum + p.stockValue, 0) * 100) / 100,
        products: data,
      },
    };
  } catch (error) {
    console.error("getDeadStock error:", error);
    return { success: false as const, error: "Failed to fetch dead stock" };
  }
}
