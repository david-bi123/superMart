"use server";

import { connectDB } from "@/lib/db/mongoose";
import { auth } from "@/lib/auth/config";
import { Expense } from "@/models/Expense";
import { ExpenseCategory } from "@/models/ExpenseCategory";
import { AuditLog } from "@/models/AuditLog";
import { expenseSchema, expenseCategorySchema } from "@/lib/validations/expenses";
import mongoose from "mongoose";

function getBusinessId(session: any): string {
  const bid = session?.user?.businessId;
  if (!bid) throw new Error("Not authenticated");
  return bid;
}

function getUserId(session: any): string {
  const uid = session?.user?.id;
  if (!uid) throw new Error("Not authenticated");
  return uid;
}

async function logAudit(session: any, businessId: string, action: string, resource: string, resourceId?: string, details?: any) {
  try {
    await AuditLog.create({
      businessId: new mongoose.Types.ObjectId(businessId),
      userId: session?.user?.id ? new mongoose.Types.ObjectId(session.user.id) : undefined,
      action,
      resource,
      resourceId,
      details,
    });
  } catch (e) {
    console.error("Audit log error:", e);
  }
}

export async function getExpenses(filters: {
  search?: string;
  categoryId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const {
      search = "",
      categoryId = "",
      dateFrom = "",
      dateTo = "",
      page = 1,
      limit = 20,
      sort = "date",
      order = "desc",
    } = filters;

    const query: Record<string, unknown> = { businessId: new mongoose.Types.ObjectId(businessId) };

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { description: { $regex: escaped, $options: "i" } },
      ];
    }

    if (categoryId) query.categoryId = new mongoose.Types.ObjectId(categoryId);

    if (dateFrom || dateTo) {
      const dateFilter: Record<string, Date> = {};
      if (dateFrom) dateFilter.$gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        dateFilter.$lte = end;
      }
      query.date = dateFilter;
    }

    const sortObj: Record<string, 1 | -1> = {};
    sortObj[sort] = order === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .populate("categoryId", "name")
        .populate("userId", "name")
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Expense.countDocuments(query),
    ]);

    const data = expenses.map((e) => ({
      _id: e._id.toString(),
      amount: e.amount,
      description: e.description,
      date: e.date?.toISOString(),
      category: (e.categoryId as any)?.name || "Uncategorized",
      categoryId: e.categoryId?._id?.toString() || e.categoryId?.toString() || "",
      user: (e.userId as any)?.name || "Unknown",
      userId: e.userId?._id?.toString() || e.userId?.toString() || "",
      paymentMethod: e.paymentMethod || "",
      isRecurring: e.isRecurring,
      recurringInterval: e.recurringInterval,
      createdAt: e.createdAt?.toISOString(),
    }));

    return {
      success: true as const,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  } catch (error) {
    console.error("getExpenses error:", error);
    return { success: false as const, error: "Failed to fetch expenses" };
  }
}

export async function getExpense(id: string) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const expense = await Expense.findOne({
      _id: new mongoose.Types.ObjectId(id),
      businessId: new mongoose.Types.ObjectId(businessId),
    })
      .populate("categoryId", "name budget")
      .populate("userId", "name email")
      .lean();

    if (!expense) return { success: false as const, error: "Expense not found" };

    return {
      success: true as const,
      data: {
        _id: expense._id.toString(),
        amount: expense.amount,
        description: expense.description,
        date: expense.date?.toISOString(),
        category: (expense.categoryId as any)?.name || "Uncategorized",
        categoryId: expense.categoryId?._id?.toString() || expense.categoryId?.toString() || "",
        categoryBudget: (expense.categoryId as any)?.budget || 0,
        user: (expense.userId as any)?.name || "Unknown",
        userId: expense.userId?._id?.toString() || expense.userId?.toString() || "",
        paymentMethod: expense.paymentMethod || "",
        isRecurring: expense.isRecurring,
        recurringInterval: expense.recurringInterval,
        attachment: expense.attachment || "",
        branchId: expense.branchId?.toString() || "",
        createdAt: expense.createdAt?.toISOString(),
        updatedAt: expense.updatedAt?.toISOString(),
      },
    };
  } catch (error) {
    console.error("getExpense error:", error);
    return { success: false as const, error: "Failed to fetch expense" };
  }
}

export async function createExpense(data: unknown) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);
    const userId = getUserId(session);

    const parsed = expenseSchema.parse(data);

    const expense = await Expense.create({
      businessId: new mongoose.Types.ObjectId(businessId),
      userId: new mongoose.Types.ObjectId(userId),
      categoryId: new mongoose.Types.ObjectId(parsed.categoryId),
      amount: parsed.amount,
      description: parsed.description,
      date: new Date(parsed.date),
      paymentMethod: parsed.paymentMethod || undefined,
      isRecurring: parsed.isRecurring,
      recurringInterval: parsed.recurringInterval,
      attachment: parsed.attachment || undefined,
      branchId: parsed.branchId ? new mongoose.Types.ObjectId(parsed.branchId) : undefined,
    });

    await logAudit(session, businessId, "expense.created", "expense", expense._id.toString(), {
      amount: parsed.amount,
      description: parsed.description,
    });

    return { success: true as const, data: { _id: expense._id.toString() } };
  } catch (error: any) {
    console.error("createExpense error:", error);
    if (error?.issues) return { success: false as const, error: "Validation failed", details: error.issues };
    return { success: false as const, error: error.message || "Failed to create expense" };
  }
}

export async function updateExpense(id: string, data: unknown) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const parsed = expenseSchema.parse(data);

    const updateData: Record<string, unknown> = {
      amount: parsed.amount,
      description: parsed.description,
      date: new Date(parsed.date),
      paymentMethod: parsed.paymentMethod || null,
      isRecurring: parsed.isRecurring,
      recurringInterval: parsed.recurringInterval || null,
      attachment: parsed.attachment || null,
    };

    if (parsed.categoryId) updateData.categoryId = new mongoose.Types.ObjectId(parsed.categoryId);
    if (parsed.branchId) updateData.branchId = new mongoose.Types.ObjectId(parsed.branchId);
    else updateData.branchId = null;

    const expense = await Expense.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), businessId: new mongoose.Types.ObjectId(businessId) },
      { $set: updateData },
      { new: true }
    );

    if (!expense) return { success: false as const, error: "Expense not found" };

    await logAudit(session, businessId, "expense.updated", "expense", id, {
      amount: parsed.amount,
      description: parsed.description,
    });

    return { success: true as const, data: { _id: id } };
  } catch (error: any) {
    console.error("updateExpense error:", error);
    if (error?.issues) return { success: false as const, error: "Validation failed", details: error.issues };
    return { success: false as const, error: "Failed to update expense" };
  }
}

export async function deleteExpense(id: string) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const expense = await Expense.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(id),
      businessId: new mongoose.Types.ObjectId(businessId),
    });

    if (!expense) return { success: false as const, error: "Expense not found" };

    await logAudit(session, businessId, "expense.deleted", "expense", id, {
      amount: expense.amount,
      description: expense.description,
    });

    return { success: true as const, data: { _id: id } };
  } catch (error) {
    console.error("deleteExpense error:", error);
    return { success: false as const, error: "Failed to delete expense" };
  }
}

export async function getExpenseCategories() {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const categories = await ExpenseCategory.find({
      businessId: new mongoose.Types.ObjectId(businessId),
      isActive: true,
    })
      .sort({ name: 1 })
      .lean();

    const data = categories.map((c) => ({
      _id: c._id.toString(),
      name: c.name,
      description: c.description || "",
      budget: c.budget || 0,
      isActive: c.isActive,
    }));

    return { success: true as const, data };
  } catch (error) {
    console.error("getExpenseCategories error:", error);
    return { success: false as const, error: "Failed to fetch expense categories" };
  }
}

export async function createExpenseCategory(data: unknown) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const parsed = expenseCategorySchema.parse(data);

    const category = await ExpenseCategory.create({
      businessId: new mongoose.Types.ObjectId(businessId),
      name: parsed.name,
      description: parsed.description || undefined,
      budget: parsed.budget || undefined,
    });

    await logAudit(session, businessId, "expense_category.created", "expense_category", category._id.toString(), {
      name: parsed.name,
    });

    return { success: true as const, data: { _id: category._id.toString(), name: category.name } };
  } catch (error: any) {
    console.error("createExpenseCategory error:", error);
    if (error?.issues) return { success: false as const, error: "Validation failed", details: error.issues };
    if (error?.code === 11000) return { success: false as const, error: "A category with this name already exists" };
    return { success: false as const, error: "Failed to create expense category" };
  }
}

export async function getMonthlyExpenses(year?: number) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const targetYear = year || new Date().getFullYear();

    const result = await Expense.aggregate([
      {
        $match: {
          businessId: new mongoose.Types.ObjectId(businessId),
          date: {
            $gte: new Date(`${targetYear}-01-01`),
            $lte: new Date(`${targetYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$date" } },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const data = monthNames.map((name, i) => {
      const month = i + 1;
      const found = result.find((r) => r._id.month === month);
      return {
        month: name,
        total: found ? Math.round(found.total * 100) / 100 : 0,
        count: found ? found.count : 0,
      };
    });

    return { success: true as const, data };
  } catch (error) {
    console.error("getMonthlyExpenses error:", error);
    return { success: false as const, error: "Failed to fetch monthly expenses" };
  }
}

export async function getExpenseStats(filters: { dateFrom?: string; dateTo?: string }) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const { dateFrom = "", dateTo = "" } = filters;

    const matchStage: Record<string, unknown> = { businessId: new mongoose.Types.ObjectId(businessId) };

    if (dateFrom || dateTo) {
      const dateFilter: Record<string, Date> = {};
      if (dateFrom) dateFilter.$gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        dateFilter.$lte = end;
      }
      matchStage.date = dateFilter;
    }

    const byCategory = await Expense.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "expensecategories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
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
    const byMonthData = byMonth.map((r) => ({
      month: `${monthNames[r._id.month - 1]} ${r._id.year}`,
      total: Math.round(r.total * 100) / 100,
      count: r.count,
    }));

    const totalExpenses = byCategory.reduce((sum, c) => sum + c.total, 0);

    return {
      success: true as const,
      data: {
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        byCategory: byCategory.map((c) => ({
          category: c._id,
          total: Math.round(c.total * 100) / 100,
          count: c.count,
        })),
        byMonth: byMonthData,
      },
    };
  } catch (error) {
    console.error("getExpenseStats error:", error);
    return { success: false as const, error: "Failed to fetch expense stats" };
  }
}
