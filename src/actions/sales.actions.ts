"use server";

import { connectDB } from "@/lib/db/mongoose";
import { auth } from "@/lib/auth/config";
import { requirePermission } from "@/lib/auth/rbac";
import { Sale } from "@/models/Sale";
import { Product } from "@/models/Product";
import { Customer } from "@/models/Customer";
import { Receipt } from "@/models/Receipt";
import { InventoryMovement } from "@/models/InventoryMovement";
import { AuditLog } from "@/models/AuditLog";
import { createSaleSchema, refundSaleSchema, salesFilterSchema } from "@/lib/validations/sales";
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

async function generateInvoiceNumber(businessId: string): Promise<string> {
  const count = await Sale.countDocuments({ businessId: new mongoose.Types.ObjectId(businessId) });
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const seq = String(count + 1).padStart(4, "0");
  return `INV-${y}${m}${d}-${seq}`;
}

async function updateStock(
  businessId: string,
  items: { productId: string; name: string; quantity: number; price: number; cost: number }[],
  type: "sale" | "refund" | "cancel",
  session: any
) {
  const multiplier = type === "refund" ? 1 : -1;

  for (const item of items) {
    const product = await Product.findOne({
      _id: new mongoose.Types.ObjectId(item.productId),
      businessId: new mongoose.Types.ObjectId(businessId),
    });

    if (!product) throw new Error(`Product ${item.name} not found`);

    if (type === "sale" && product.currentStock < item.quantity) {
      throw new Error(`Insufficient stock for ${item.name}`);
    }

    product.currentStock += item.quantity * multiplier;
    await product.save();

    await InventoryMovement.create({
      businessId: new mongoose.Types.ObjectId(businessId),
      productId: new mongoose.Types.ObjectId(item.productId),
      userId: new mongoose.Types.ObjectId(getUserId(session)),
      type: type === "sale" ? "sale" : type === "refund" ? "return" : "cancellation",
      quantity: item.quantity,
      notes: `${type === "sale" ? "Sale" : type === "refund" ? "Refund" : "Cancellation"} - ${item.name}`,
    });
  }
}

async function updateCustomerStats(businessId: string, customerId: string | undefined, amount: number, type: "add" | "deduct") {
  if (!customerId) return;
  const multiplier = type === "add" ? 1 : -1;
  await Customer.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(customerId),
      businessId: new mongoose.Types.ObjectId(businessId),
    },
    {
      $inc: {
        totalPurchases: multiplier > 0 ? amount : 0,
        balance: amount * multiplier,
        loyaltyPoints: multiplier > 0 ? Math.floor(amount / 10) : 0,
      },
    }
  );
}

export async function getSales(filters: {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  customerId?: string;
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
      status = "",
      dateFrom = "",
      dateTo = "",
      customerId = "",
      page = 1,
      limit = 20,
      sort = "createdAt",
      order = "desc",
    } = filters;

    const query: Record<string, unknown> = { businessId: new mongoose.Types.ObjectId(businessId) };

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { invoiceNumber: { $regex: escaped, $options: "i" } },
      ];
    }

    if (status) query.status = status;
    if (customerId) query.customerId = new mongoose.Types.ObjectId(customerId);

    if (dateFrom || dateTo) {
      const dateFilter: Record<string, Date> = {};
      if (dateFrom) dateFilter.$gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        dateFilter.$lte = end;
      }
      query.createdAt = dateFilter;
    }

    const sortObj: Record<string, 1 | -1> = {};
    sortObj[sort] = order === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    const [sales, total] = await Promise.all([
      Sale.find(query)
        .populate("customerId", "name email phone")
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Sale.countDocuments(query),
    ]);

    const data = sales.map((s) => ({
      _id: s._id.toString(),
      invoiceNumber: s.invoiceNumber,
      customerId: s.customerId?._id?.toString() || s.customerId?.toString() || "",
      customerName: (s.customerId as any)?.name || "Walk-in Customer",
      customerEmail: (s.customerId as any)?.email || "",
      itemsCount: s.items?.length || 0,
      items: s.items.map((i: any) => ({
        ...i,
        productId: i.productId.toString(),
      })),
      subtotal: s.subtotal,
      discountTotal: s.discountTotal,
      taxTotal: s.taxTotal,
      grandTotal: s.grandTotal,
      paymentMethod: s.paymentMethod,
      paymentDetails: s.paymentDetails,
      status: s.status,
      notes: s.notes || "",
      createdAt: s.createdAt?.toISOString(),
      updatedAt: s.updatedAt?.toISOString(),
    }));

    return {
      success: true as const,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  } catch (error) {
    console.error("getSales error:", error);
    return { success: false as const, error: "Failed to fetch sales" };
  }
}

export async function getSale(id: string) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const sale = await Sale.findOne({
      _id: new mongoose.Types.ObjectId(id),
      businessId: new mongoose.Types.ObjectId(businessId),
    })
      .populate("customerId", "name email phone address loyaltyPoints")
      .populate("userId", "name email")
      .lean();

    if (!sale) return { success: false as const, error: "Sale not found" };

    const receipt = await Receipt.findOne({
      saleId: new mongoose.Types.ObjectId(id),
      businessId: new mongoose.Types.ObjectId(businessId),
    }).lean();

    const auditLogs = await AuditLog.find({
      businessId: new mongoose.Types.ObjectId(businessId),
      resource: "sale",
      resourceId: id,
    })
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return {
      success: true as const,
      data: {
        _id: sale._id.toString(),
        invoiceNumber: sale.invoiceNumber,
        customerId: sale.customerId?._id?.toString() || sale.customerId?.toString() || "",
        customer: sale.customerId ? {
          _id: (sale.customerId as any)._id?.toString(),
          name: (sale.customerId as any).name || "",
          email: (sale.customerId as any).email || "",
          phone: (sale.customerId as any).phone || "",
          address: (sale.customerId as any).address || "",
          loyaltyPoints: (sale.customerId as any).loyaltyPoints || 0,
        } : null,
        user: sale.userId ? {
          _id: (sale.userId as any)._id?.toString(),
          name: (sale.userId as any).name || "",
          email: (sale.userId as any).email || "",
        } : null,
        items: sale.items.map((i: any) => ({
          productId: i.productId.toString(),
          name: i.name,
          sku: i.sku || "",
          quantity: i.quantity,
          price: i.price,
          cost: i.cost,
          discount: i.discount,
          tax: i.tax,
          total: i.total,
        })),
        subtotal: sale.subtotal,
        discountTotal: sale.discountTotal,
        taxTotal: sale.taxTotal,
        grandTotal: sale.grandTotal,
        paymentMethod: sale.paymentMethod,
        paymentDetails: sale.paymentDetails,
        status: sale.status,
        notes: sale.notes || "",
        receipt: receipt
          ? {
              _id: receipt._id.toString(),
              receiptNumber: receipt.receiptNumber,
              publicUrl: receipt.publicUrl || "",
              printedAt: receipt.printedAt?.toISOString() || null,
              emailedAt: receipt.emailedAt?.toISOString() || null,
            }
          : null,
        timeline: auditLogs.map((log) => ({
          _id: log._id.toString(),
          action: log.action,
          user: (log.userId as any)?.name || "System",
          details: log.details,
          createdAt: log.createdAt?.toISOString(),
        })),
        createdAt: sale.createdAt?.toISOString(),
        updatedAt: sale.updatedAt?.toISOString(),
      },
    };
  } catch (error) {
    console.error("getSale error:", error);
    return { success: false as const, error: "Failed to fetch sale" };
  }
}

export async function createSale(data: unknown) {
  try {
    await connectDB();
    await requirePermission("sales:create");
    const session = await auth();
    const businessId = getBusinessId(session);
    const userId = getUserId(session);

    const parsed = createSaleSchema.parse(data);

    const invoiceNumber = await generateInvoiceNumber(businessId);

    await updateStock(businessId, parsed.items, "sale", session);

    const sale = await Sale.create({
      businessId: new mongoose.Types.ObjectId(businessId),
      userId: new mongoose.Types.ObjectId(userId),
      customerId: parsed.customerId ? new mongoose.Types.ObjectId(parsed.customerId) : undefined,
      invoiceNumber,
      items: parsed.items.map((i) => ({
        productId: new mongoose.Types.ObjectId(i.productId),
        name: i.name,
        sku: i.sku || "",
        quantity: i.quantity,
        price: i.price,
        cost: i.cost || 0,
        discount: i.discount || 0,
        tax: i.tax || 0,
        total: i.total,
      })),
      subtotal: parsed.subtotal,
      discountTotal: parsed.discountTotal || 0,
      taxTotal: parsed.taxTotal || 0,
      grandTotal: parsed.grandTotal,
      paymentMethod: parsed.paymentMethod,
      paymentDetails: parsed.paymentDetails || { cash: 0, card: 0, mobileMoney: 0, change: 0 },
      status: "completed",
      notes: parsed.notes,
    });

    await Receipt.create({
      businessId: new mongoose.Types.ObjectId(businessId),
      saleId: sale._id,
      receiptNumber: invoiceNumber.replace("INV", "RCP"),
      customerName: parsed.customerId ? undefined : "Walk-in Customer",
      items: parsed.items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        total: i.total,
      })),
      subtotal: parsed.subtotal,
      tax: parsed.taxTotal || 0,
      discount: parsed.discountTotal || 0,
      grandTotal: parsed.grandTotal,
      paymentMethod: parsed.paymentMethod,
    });

    await updateCustomerStats(businessId, parsed.customerId, parsed.grandTotal, "add");

    await logAudit(session, businessId, "sale.created", "sale", sale._id.toString(), {
      invoiceNumber,
      grandTotal: parsed.grandTotal,
      itemsCount: parsed.items.length,
    });

    return { success: true as const, data: { _id: sale._id.toString(), invoiceNumber } };
  } catch (error: any) {
    console.error("createSale error:", error);
    if (error?.issues) return { success: false as const, error: "Validation failed", details: error.issues };
    return { success: false as const, error: error.message || "Failed to create sale" };
  }
}

export async function cancelSale(id: string) {
  try {
    await connectDB();
    await requirePermission("sales:cancel");
    const session = await auth();
    const businessId = getBusinessId(session);

    const sale = await Sale.findOne({
      _id: new mongoose.Types.ObjectId(id),
      businessId: new mongoose.Types.ObjectId(businessId),
    });

    if (!sale) return { success: false as const, error: "Sale not found" };
    if (sale.status === "cancelled") return { success: false as const, error: "Sale is already cancelled" };
    if (sale.status === "refunded") return { success: false as const, error: "Cannot cancel a refunded sale" };

    await updateStock(
      businessId,
      sale.items.map((i: any) => ({
        productId: i.productId.toString(),
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        cost: i.cost,
      })),
      "cancel",
      session
    );

    sale.status = "cancelled";
    await sale.save();

    if (sale.customerId) {
      await updateCustomerStats(businessId, sale.customerId.toString(), sale.grandTotal, "deduct");
    }

    await logAudit(session, businessId, "sale.cancelled", "sale", id, {
      invoiceNumber: sale.invoiceNumber,
      grandTotal: sale.grandTotal,
    });

    return { success: true as const, data: { _id: id, status: "cancelled" } };
  } catch (error: any) {
    console.error("cancelSale error:", error);
    return { success: false as const, error: error.message || "Failed to cancel sale" };
  }
}

export async function refundSale(id: string, data: unknown) {
  try {
    await connectDB();
    await requirePermission("sales:refund");
    const session = await auth();
    const businessId = getBusinessId(session);

    const parsed = refundSaleSchema.parse(data);

    const sale = await Sale.findOne({
      _id: new mongoose.Types.ObjectId(id),
      businessId: new mongoose.Types.ObjectId(businessId),
    });

    if (!sale) return { success: false as const, error: "Sale not found" };
    if (sale.status === "cancelled") return { success: false as const, error: "Cannot refund a cancelled sale" };
    if (sale.status === "refunded") return { success: false as const, error: "Sale is already refunded" };

    let refundItems = sale.items;
    if (parsed.items && parsed.items.length > 0) {
      refundItems = sale.items.filter((si: any) =>
        parsed.items!.some((ri: any) => ri.productId === si.productId.toString())
      );

      for (const ri of parsed.items) {
        const saleItem = sale.items.find((si: any) => si.productId.toString() === ri.productId);
        if (!saleItem || saleItem.quantity < ri.quantity) {
          return { success: false as const, error: `Invalid refund quantity for ${ri.productId}` };
        }
      }
    }

    await updateStock(
      businessId,
      refundItems.map((i: any) => ({
        productId: i.productId.toString(),
        name: i.name,
        quantity: parsed.items?.find((ri) => ri.productId === i.productId.toString())?.quantity || i.quantity,
        price: i.price,
        cost: i.cost,
      })),
      "refund",
      session
    );

    const refundTotal = refundItems.reduce((sum: number, i: any) => {
      const qty = parsed.items?.find((ri: any) => ri.productId === i.productId.toString())?.quantity || i.quantity;
      return sum + (i.price - i.discount + i.tax) * qty;
    }, 0);

    const isFullRefund = refundItems.length === sale.items.length;
    sale.status = isFullRefund ? "refunded" : "refunded";
    sale.notes = (sale.notes ? sale.notes + "\n" : "") + `Partial refund: $${refundTotal.toFixed(2)} - ${parsed.reason || "No reason provided"}`;
    await sale.save();

    if (sale.customerId) {
      await updateCustomerStats(businessId, sale.customerId.toString(), refundTotal, "deduct");
    }

    await logAudit(session, businessId, "sale.refunded", "sale", id, {
      invoiceNumber: sale.invoiceNumber,
      refundTotal,
      isFullRefund,
      reason: parsed.reason,
    });

    return { success: true as const, data: { _id: id, status: "refunded", refundTotal } };
  } catch (error: any) {
    console.error("refundSale error:", error);
    if (error?.issues) return { success: false as const, error: "Validation failed", details: error.issues };
    return { success: false as const, error: error.message || "Failed to refund sale" };
  }
}

export async function getSalesByCustomer(customerId: string) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const sales = await Sale.find({
      businessId: new mongoose.Types.ObjectId(businessId),
      customerId: new mongoose.Types.ObjectId(customerId),
    })
      .sort({ createdAt: -1 })
      .lean();

    const data = sales.map((s) => ({
      _id: s._id.toString(),
      invoiceNumber: s.invoiceNumber,
      grandTotal: s.grandTotal,
      status: s.status,
      itemsCount: s.items?.length || 0,
      createdAt: s.createdAt?.toISOString(),
    }));

    return { success: true as const, data };
  } catch (error) {
    console.error("getSalesByCustomer error:", error);
    return { success: false as const, error: "Failed to fetch customer sales" };
  }
}

export async function getDailySales(date?: string) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const startDate = date ? new Date(date) : new Date();
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setHours(23, 59, 59, 999);

    const sales = await Sale.find({
      businessId: new mongoose.Types.ObjectId(businessId),
      createdAt: { $gte: startDate, $lte: endDate },
    }).lean();

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, s) => sum + s.grandTotal, 0);
    const totalProfit = sales.reduce(
      (sum: number, s: any) => sum + s.items.reduce((p: number, i: any) => p + (i.price - i.cost) * i.quantity, 0),
      0
    );
    const totalDiscount = sales.reduce((sum: number, s: any) => sum + s.discountTotal, 0);
    const totalTax = sales.reduce((sum: number, s: any) => sum + s.taxTotal, 0);
    const completedSales = sales.filter((s: any) => s.status === "completed").length;
    const cancelledSales = sales.filter((s) => s.status === "cancelled").length;
    const refundedSales = sales.filter((s) => s.status === "refunded").length;

    const paymentBreakdown: Record<string, number> = {};
    for (const s of sales) {
      if (s.status === "completed") {
        paymentBreakdown[s.paymentMethod] = (paymentBreakdown[s.paymentMethod] || 0) + s.grandTotal;
      }
    }

    return {
      success: true as const,
      data: {
        date: startDate.toISOString().split("T")[0],
        totalSales,
        totalRevenue,
        totalProfit,
        totalDiscount,
        totalTax,
        completedSales,
        cancelledSales,
        refundedSales,
        averageOrderValue: totalSales > 0 ? totalRevenue / totalSales : 0,
        paymentBreakdown,
      },
    };
  } catch (error) {
    console.error("getDailySales error:", error);
    return { success: false as const, error: "Failed to fetch daily sales" };
  }
}

export async function getSalesStats(filters: {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
}) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const { dateFrom = "", dateTo = "", status = "" } = filters;

    const query: Record<string, unknown> = { businessId: new mongoose.Types.ObjectId(businessId) };
    if (status) query.status = status;

    if (dateFrom || dateTo) {
      const dateFilter: Record<string, Date> = {};
      if (dateFrom) dateFilter.$gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        dateFilter.$lte = end;
      }
      query.createdAt = dateFilter;
    }

    const sales = await Sale.find(query).lean();

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, s) => sum + s.grandTotal, 0);
    const totalProfit = sales.reduce(
      (sum: number, s: any) => sum + s.items.reduce((p: number, i: any) => p + (i.price - i.cost) * i.quantity, 0),
      0
    );
    const totalDiscount = sales.reduce((sum: number, s: any) => sum + s.discountTotal, 0);
    const totalTax = sales.reduce((sum: number, s: any) => sum + s.taxTotal, 0);
    const totalItemsSold = sales.reduce((sum: number, s: any) => sum + s.items.reduce((p: number, i: any) => p + i.quantity, 0), 0);

    const statusBreakdown = {
      completed: sales.filter((s) => s.status === "completed").length,
      draft: sales.filter((s) => s.status === "draft").length,
      cancelled: sales.filter((s) => s.status === "cancelled").length,
      refunded: sales.filter((s) => s.status === "refunded").length,
    };

    return {
      success: true as const,
      data: {
        totalSales,
        totalRevenue,
        totalProfit,
        totalDiscount,
        totalTax,
        totalItemsSold,
        averageOrderValue: totalSales > 0 ? totalRevenue / totalSales : 0,
        averageProfitPerSale: totalSales > 0 ? totalProfit / totalSales : 0,
        statusBreakdown,
      },
    };
  } catch (error) {
    console.error("getSalesStats error:", error);
    return { success: false as const, error: "Failed to fetch sales stats" };
  }
}
