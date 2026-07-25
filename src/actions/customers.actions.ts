"use server";

import { connectDB } from "@/lib/db/mongoose";
import { auth } from "@/lib/auth/config";
import { Customer } from "@/models/Customer";
import { Sale } from "@/models/Sale";
import { AuditLog } from "@/models/AuditLog";
import { createCustomerSchema, updateCustomerSchema, customerFilterSchema, addLoyaltyPointsSchema } from "@/lib/validations/customers";
import mongoose from "mongoose";

function getBusinessId(session: any): string {
  const bid = session?.user?.businessId;
  if (!bid) throw new Error("Not authenticated");
  return bid;
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

export async function getCustomers(filters: {
  search?: string;
  isActive?: boolean;
  hasBalance?: boolean;
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
      isActive,
      hasBalance,
      page = 1,
      limit = 20,
      sort = "createdAt",
      order = "desc",
    } = filters;

    const query: Record<string, unknown> = { businessId: new mongoose.Types.ObjectId(businessId) };

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { name: { $regex: escaped, $options: "i" } },
        { email: { $regex: escaped, $options: "i" } },
        { phone: { $regex: escaped, $options: "i" } },
      ];
    }

    if (isActive !== undefined) query.isActive = isActive;
    if (hasBalance !== undefined) {
      if (hasBalance) {
        query.balance = { $gt: 0 };
      } else {
        query.balance = { $lte: 0 };
      }
    }

    const sortObj: Record<string, 1 | -1> = {};
    sortObj[sort] = order === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      Customer.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Customer.countDocuments(query),
    ]);

    const data = customers.map((c) => ({
      _id: c._id.toString(),
      name: c.name,
      email: c.email || "",
      phone: c.phone || "",
      address: c.address || "",
      loyaltyPoints: c.loyaltyPoints,
      totalPurchases: c.totalPurchases,
      balance: c.balance,
      creditLimit: c.creditLimit,
      notes: c.notes || "",
      isActive: c.isActive,
      createdAt: c.createdAt?.toISOString(),
      updatedAt: c.updatedAt?.toISOString(),
    }));

    return {
      success: true as const,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  } catch (error) {
    console.error("getCustomers error:", error);
    return { success: false as const, error: "Failed to fetch customers" };
  }
}

export async function getCustomer(id: string) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const customer = await Customer.findOne({
      _id: new mongoose.Types.ObjectId(id),
      businessId: new mongoose.Types.ObjectId(businessId),
    }).lean();

    if (!customer) return { success: false as const, error: "Customer not found" };

    const sales = await Sale.find({
      businessId: new mongoose.Types.ObjectId(businessId),
      customerId: new mongoose.Types.ObjectId(id),
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const salesData = sales.map((s) => ({
      _id: s._id.toString(),
      invoiceNumber: s.invoiceNumber,
      grandTotal: s.grandTotal,
      status: s.status,
      itemsCount: s.items?.length || 0,
      createdAt: s.createdAt?.toISOString(),
    }));

    const totalSpent = sales
      .filter((s) => s.status === "completed")
      .reduce((sum, s) => sum + s.grandTotal, 0);

    return {
      success: true as const,
      data: {
        _id: customer._id.toString(),
        name: customer.name,
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
        loyaltyPoints: customer.loyaltyPoints,
        totalPurchases: customer.totalPurchases,
        balance: customer.balance,
        creditLimit: customer.creditLimit,
        notes: customer.notes || "",
        isActive: customer.isActive,
        totalSpent,
        salesCount: salesData.length,
        sales: salesData,
        createdAt: customer.createdAt?.toISOString(),
        updatedAt: customer.updatedAt?.toISOString(),
      },
    };
  } catch (error) {
    console.error("getCustomer error:", error);
    return { success: false as const, error: "Failed to fetch customer" };
  }
}

export async function createCustomer(data: unknown) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const parsed = createCustomerSchema.parse(data);

    const customer = await Customer.create({
      businessId: new mongoose.Types.ObjectId(businessId),
      name: parsed.name,
      email: parsed.email || undefined,
      phone: parsed.phone || undefined,
      address: parsed.address || undefined,
      creditLimit: parsed.creditLimit || 0,
      notes: parsed.notes || undefined,
    });

    await logAudit(session, businessId, "customer.created", "customer", customer._id.toString(), {
      name: parsed.name,
    });

    return { success: true as const, data: { _id: customer._id.toString(), name: customer.name } };
  } catch (error: any) {
    console.error("createCustomer error:", error);
    if (error?.issues) return { success: false as const, error: "Validation failed", details: error.issues };
    if (error?.code === 11000) return { success: false as const, error: "A customer with this email or phone already exists" };
    return { success: false as const, error: "Failed to create customer" };
  }
}

export async function updateCustomer(id: string, data: unknown) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const parsed = updateCustomerSchema.parse(data);

    const updateData: Record<string, unknown> = {};
    if (parsed.name !== undefined) updateData.name = parsed.name;
    if (parsed.email !== undefined) updateData.email = parsed.email || null;
    if (parsed.phone !== undefined) updateData.phone = parsed.phone || null;
    if (parsed.address !== undefined) updateData.address = parsed.address || null;
    if (parsed.creditLimit !== undefined) updateData.creditLimit = parsed.creditLimit;
    if (parsed.notes !== undefined) updateData.notes = parsed.notes || null;
    if (parsed.isActive !== undefined) updateData.isActive = parsed.isActive;

    const customer = await Customer.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), businessId: new mongoose.Types.ObjectId(businessId) },
      { $set: updateData },
      { new: true }
    );

    if (!customer) return { success: false as const, error: "Customer not found" };

    await logAudit(session, businessId, "customer.updated", "customer", id, { name: customer.name });

    return { success: true as const, data: { _id: id } };
  } catch (error: any) {
    console.error("updateCustomer error:", error);
    if (error?.issues) return { success: false as const, error: "Validation failed", details: error.issues };
    return { success: false as const, error: "Failed to update customer" };
  }
}

export async function deleteCustomer(id: string) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const customer = await Customer.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), businessId: new mongoose.Types.ObjectId(businessId) },
      { $set: { isActive: false } },
      { new: true }
    );

    if (!customer) return { success: false as const, error: "Customer not found" };

    await logAudit(session, businessId, "customer.deactivated", "customer", id, { name: customer.name });

    return { success: true as const, data: { _id: id } };
  } catch (error) {
    console.error("deleteCustomer error:", error);
    return { success: false as const, error: "Failed to deactivate customer" };
  }
}

export async function addLoyaltyPoints(customerId: string, points: number, reason?: string) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    if (!Number.isInteger(points) || points <= 0) {
      return { success: false as const, error: "Points must be a positive integer" };
    }

    const customer = await Customer.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(customerId),
        businessId: new mongoose.Types.ObjectId(businessId),
      },
      { $inc: { loyaltyPoints: points } },
      { new: true }
    );

    if (!customer) return { success: false as const, error: "Customer not found" };

    await logAudit(session, businessId, "loyalty.points_added", "customer", customerId, {
      points,
      total: customer.loyaltyPoints,
      reason: reason || "Manual adjustment",
    });

    return {
      success: true as const,
      data: { loyaltyPoints: customer.loyaltyPoints },
    };
  } catch (error) {
    console.error("addLoyaltyPoints error:", error);
    return { success: false as const, error: "Failed to add loyalty points" };
  }
}

export async function getCustomerStatement(customerId: string, dateRange?: { from?: string; to?: string }) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const customer = await Customer.findOne({
      _id: new mongoose.Types.ObjectId(customerId),
      businessId: new mongoose.Types.ObjectId(businessId),
    }).lean();

    if (!customer) return { success: false as const, error: "Customer not found" };

    const query: Record<string, unknown> = {
      businessId: new mongoose.Types.ObjectId(businessId),
      customerId: new mongoose.Types.ObjectId(customerId),
    };

    if (dateRange?.from || dateRange?.to) {
      const dateFilter: Record<string, Date> = {};
      if (dateRange.from) dateFilter.$gte = new Date(dateRange.from);
      if (dateRange.to) {
        const end = new Date(dateRange.to);
        end.setHours(23, 59, 59, 999);
        dateFilter.$lte = end;
      }
      query.createdAt = dateFilter;
    }

    const sales = await Sale.find(query).sort({ createdAt: -1 }).lean();

    const transactions = sales.map((s) => ({
      _id: s._id.toString(),
      date: s.createdAt?.toISOString(),
      description: `Sale ${s.invoiceNumber}`,
      invoiceNumber: s.invoiceNumber,
      debit: s.grandTotal,
      credit: s.status === "cancelled" || s.status === "refunded" ? s.grandTotal : 0,
      balance: 0,
      status: s.status,
    }));

    let runningBalance = customer.balance;
    const transactionsWithBalance = transactions.map((t) => {
      runningBalance += t.debit - t.credit;
      return { ...t, balance: runningBalance };
    });

    return {
      success: true as const,
      data: {
        customer: {
          _id: customer._id.toString(),
          name: customer.name,
          email: customer.email || "",
          phone: customer.phone || "",
        },
        openingBalance: customer.balance,
        closingBalance: runningBalance,
        transactions: transactionsWithBalance,
      },
    };
  } catch (error) {
    console.error("getCustomerStatement error:", error);
    return { success: false as const, error: "Failed to fetch customer statement" };
  }
}
