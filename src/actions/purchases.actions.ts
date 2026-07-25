"use server";

import { connectDB } from "@/lib/db/mongoose";
import { auth } from "@/lib/auth/config";
import { PurchaseOrder } from "@/models/PurchaseOrder";
import { Supplier } from "@/models/Supplier";
import { Product } from "@/models/Product";
import { InventoryMovement } from "@/models/InventoryMovement";
import { AuditLog } from "@/models/AuditLog";
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

async function generatePONumber(businessId: string): Promise<string> {
  const count = await PurchaseOrder.countDocuments({ businessId: new mongoose.Types.ObjectId(businessId) });
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const seq = String(count + 1).padStart(4, "0");
  return `PO-${y}${m}-${seq}`;
}

export async function getPurchaseOrders(filters: {
  search?: string;
  status?: string;
  supplierId?: string;
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
      status = "",
      supplierId = "",
      dateFrom = "",
      dateTo = "",
      page = 1,
      limit = 20,
      sort = "createdAt",
      order = "desc",
    } = filters;

    const query: Record<string, unknown> = { businessId: new mongoose.Types.ObjectId(businessId) };

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { poNumber: { $regex: escaped, $options: "i" } },
      ];
    }
    if (status) query.status = status;
    if (supplierId) query.supplierId = new mongoose.Types.ObjectId(supplierId);

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

    const [orders, total] = await Promise.all([
      PurchaseOrder.find(query)
        .populate("supplierId", "name company")
        .populate("userId", "name")
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      PurchaseOrder.countDocuments(query),
    ]);

    const data = orders.map((o) => ({
      _id: o._id.toString(),
      poNumber: o.poNumber,
      supplierId: o.supplierId?._id?.toString() || o.supplierId?.toString() || "",
      supplierName: (o.supplierId as any)?.name || "Unknown Supplier",
      supplierCompany: (o.supplierId as any)?.company || "",
      userId: o.userId?._id?.toString() || o.userId?.toString() || "",
      userName: (o.userId as any)?.name || "System",
      itemsCount: o.items?.length || 0,
      items: o.items.map((i: any) => ({
        productId: i.productId.toString(),
        name: i.name,
        sku: i.sku || "",
        quantity: i.quantity,
        received: i.received,
        price: i.price,
        total: i.total,
      })),
      subtotal: o.subtotal,
      taxTotal: o.taxTotal,
      grandTotal: o.grandTotal,
      status: o.status,
      notes: o.notes || "",
      receivedAt: o.receivedAt?.toISOString() || null,
      createdAt: o.createdAt?.toISOString(),
      updatedAt: o.updatedAt?.toISOString(),
    }));

    return {
      success: true as const,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  } catch (error) {
    console.error("getPurchaseOrders error:", error);
    return { success: false as const, error: "Failed to fetch purchase orders" };
  }
}

export async function getPurchaseOrder(id: string) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const order = await PurchaseOrder.findOne({
      _id: new mongoose.Types.ObjectId(id),
      businessId: new mongoose.Types.ObjectId(businessId),
    })
      .populate("supplierId", "name company email phone address")
      .populate("userId", "name email")
      .lean();

    if (!order) return { success: false as const, error: "Purchase order not found" };

    return {
      success: true as const,
      data: {
        _id: order._id.toString(),
        poNumber: order.poNumber,
        supplier: order.supplierId ? {
          _id: (order.supplierId as any)._id?.toString(),
          name: (order.supplierId as any).name,
          company: (order.supplierId as any).company || "",
          email: (order.supplierId as any).email || "",
          phone: (order.supplierId as any).phone || "",
          address: (order.supplierId as any).address || "",
        } : null,
        user: order.userId ? {
          _id: (order.userId as any)._id?.toString(),
          name: (order.userId as any).name,
          email: (order.userId as any).email || "",
        } : null,
        items: order.items.map((i: any) => ({
          productId: i.productId.toString(),
          name: i.name,
          sku: i.sku || "",
          quantity: i.quantity,
          received: i.received,
          price: i.price,
          total: i.total,
        })),
        subtotal: order.subtotal,
        taxTotal: order.taxTotal,
        grandTotal: order.grandTotal,
        status: order.status,
        notes: order.notes || "",
        receivedAt: order.receivedAt?.toISOString() || null,
        createdAt: order.createdAt?.toISOString(),
        updatedAt: order.updatedAt?.toISOString(),
      },
    };
  } catch (error) {
    console.error("getPurchaseOrder error:", error);
    return { success: false as const, error: "Failed to fetch purchase order" };
  }
}

export async function createPurchaseOrder(data: unknown) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);
    const userId = getUserId(session);

    const parsed = data as {
      supplierId: string;
      items: { productId: string; name: string; sku?: string; quantity: number; price: number; total: number }[];
      subtotal: number;
      taxTotal?: number;
      grandTotal: number;
      notes?: string;
    };

    if (!parsed.supplierId) return { success: false as const, error: "Supplier is required" };
    if (!parsed.items?.length) return { success: false as const, error: "At least one item is required" };

    const poNumber = await generatePONumber(businessId);

    const order = await PurchaseOrder.create({
      businessId: new mongoose.Types.ObjectId(businessId),
      supplierId: new mongoose.Types.ObjectId(parsed.supplierId),
      userId: new mongoose.Types.ObjectId(userId),
      poNumber,
      items: parsed.items.map((i) => ({
        productId: new mongoose.Types.ObjectId(i.productId),
        name: i.name,
        sku: i.sku || "",
        quantity: i.quantity,
        received: 0,
        price: i.price,
        total: i.total,
      })),
      subtotal: parsed.subtotal,
      taxTotal: parsed.taxTotal || 0,
      grandTotal: parsed.grandTotal,
      status: "pending",
      notes: parsed.notes || "",
    });

    await logAudit(session, businessId, "purchase_order.created", "PurchaseOrder", order._id.toString(), {
      poNumber,
      grandTotal: parsed.grandTotal,
      itemsCount: parsed.items.length,
    });

    return { success: true as const, data: { _id: order._id.toString(), poNumber } };
  } catch (error: any) {
    console.error("createPurchaseOrder error:", error);
    return { success: false as const, error: error.message || "Failed to create purchase order" };
  }
}

export async function approvePurchaseOrder(id: string) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const order = await PurchaseOrder.findOne({
      _id: new mongoose.Types.ObjectId(id),
      businessId: new mongoose.Types.ObjectId(businessId),
    });

    if (!order) return { success: false as const, error: "Purchase order not found" };
    if (order.status !== "pending") return { success: false as const, error: "Only pending orders can be approved" };

    order.status = "approved";
    await order.save();

    await logAudit(session, businessId, "purchase_order.approved", "PurchaseOrder", id, {
      poNumber: order.poNumber,
    });

    return { success: true as const, data: { _id: id, status: "approved" } };
  } catch (error: any) {
    console.error("approvePurchaseOrder error:", error);
    return { success: false as const, error: error.message || "Failed to approve purchase order" };
  }
}

export async function receivePurchaseOrder(id: string, items?: { productId: string; quantity: number }[]) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);
    const userId = getUserId(session);

    const order = await PurchaseOrder.findOne({
      _id: new mongoose.Types.ObjectId(id),
      businessId: new mongoose.Types.ObjectId(businessId),
    });

    if (!order) return { success: false as const, error: "Purchase order not found" };
    if (order.status === "cancelled") return { success: false as const, error: "Cannot receive a cancelled order" };
    if (order.status === "received") return { success: false as const, error: "Order is already fully received" };

    const receivedMap: Record<string, number> = {};
    if (items && items.length > 0) {
      for (const item of items) {
        const orderItem = order.items.find((oi: any) => oi.productId.toString() === item.productId);
        if (!orderItem) return { success: false as const, error: `Item ${item.productId} not found in order` };
        if (item.quantity <= 0) return { success: false as const, error: "Quantity must be positive" };
        if (orderItem.received + item.quantity > orderItem.quantity) {
          return { success: false as const, error: `Received quantity exceeds ordered quantity for ${orderItem.name}` };
        }
        receivedMap[item.productId] = item.quantity;
      }
    }

    for (const orderItem of order.items) {
      const pid = orderItem.productId.toString();
      const qty = receivedMap[pid] !== undefined ? receivedMap[pid] : orderItem.quantity - orderItem.received;
      if (qty <= 0) continue;

      orderItem.received += qty;

      await Product.findOneAndUpdate(
        {
          _id: orderItem.productId,
          businessId: new mongoose.Types.ObjectId(businessId),
        },
        { $inc: { currentStock: qty } }
      );

      await InventoryMovement.create({
        businessId: new mongoose.Types.ObjectId(businessId),
        productId: orderItem.productId,
        userId: new mongoose.Types.ObjectId(userId),
        type: "stock_in",
        quantity: qty,
        notes: `Purchase Order ${order.poNumber} - ${orderItem.name}`,
      });
    }

    const allReceived = order.items.every((oi: any) => oi.received >= oi.quantity);
    const anyReceived = order.items.some((oi: any) => oi.received > 0);

    if (allReceived) {
      order.status = "received";
      order.receivedAt = new Date();
    } else if (anyReceived) {
      order.status = "partial";
    }

    await order.save();

    await logAudit(session, businessId, "purchase_order.received", "PurchaseOrder", id, {
      poNumber: order.poNumber,
      status: order.status,
    });

    return { success: true as const, data: { _id: id, status: order.status } };
  } catch (error: any) {
    console.error("receivePurchaseOrder error:", error);
    return { success: false as const, error: error.message || "Failed to receive purchase order" };
  }
}

export async function cancelPurchaseOrder(id: string) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const order = await PurchaseOrder.findOne({
      _id: new mongoose.Types.ObjectId(id),
      businessId: new mongoose.Types.ObjectId(businessId),
    });

    if (!order) return { success: false as const, error: "Purchase order not found" };
    if (order.status === "received") return { success: false as const, error: "Cannot cancel a received order" };
    if (order.status === "cancelled") return { success: false as const, error: "Order is already cancelled" };

    order.status = "cancelled";
    await order.save();

    await logAudit(session, businessId, "purchase_order.cancelled", "PurchaseOrder", id, {
      poNumber: order.poNumber,
    });

    return { success: true as const, data: { _id: id, status: "cancelled" } };
  } catch (error: any) {
    console.error("cancelPurchaseOrder error:", error);
    return { success: false as const, error: error.message || "Failed to cancel purchase order" };
  }
}
