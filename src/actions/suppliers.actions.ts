"use server";

import { connectDB } from "@/lib/db/mongoose";
import { auth } from "@/lib/auth/config";
import { requirePermission } from "@/lib/auth/rbac";
import { Supplier } from "@/models/Supplier";
import { AuditLog } from "@/models/AuditLog";
import { supplierSchema } from "@/lib/validations/inventory";
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

export async function getSuppliersList(filters: {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const { search = "", isActive, page = 1, limit = 20 } = filters;

    const query: Record<string, unknown> = { businessId: new mongoose.Types.ObjectId(businessId) };

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { name: { $regex: escaped, $options: "i" } },
        { company: { $regex: escaped, $options: "i" } },
        { email: { $regex: escaped, $options: "i" } },
      ];
    }
    if (isActive !== undefined) query.isActive = isActive;

    const skip = (page - 1) * limit;

    const [suppliers, total] = await Promise.all([
      Supplier.find(query).sort({ name: 1 }).skip(skip).limit(limit).lean(),
      Supplier.countDocuments(query),
    ]);

    const data = suppliers.map((s) => ({
      _id: s._id.toString(),
      name: s.name,
      company: s.company || "",
      email: s.email || "",
      phone: s.phone || "",
      address: s.address || "",
      taxId: s.taxId || "",
      paymentTerms: s.paymentTerms || "",
      outstandingBalance: s.outstandingBalance,
      notes: s.notes || "",
      isActive: s.isActive,
      createdAt: s.createdAt?.toISOString(),
    }));

    return {
      success: true as const,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  } catch (error) {
    console.error("getSuppliersList error:", error);
    return { success: false as const, error: "Failed to fetch suppliers" };
  }
}

export async function getSupplier(id: string) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const supplier = await Supplier.findOne({
      _id: new mongoose.Types.ObjectId(id),
      businessId: new mongoose.Types.ObjectId(businessId),
    }).lean();

    if (!supplier) return { success: false as const, error: "Supplier not found" };

    return {
      success: true as const,
      data: {
        _id: supplier._id.toString(),
        name: supplier.name,
        company: supplier.company || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
        taxId: supplier.taxId || "",
        paymentTerms: supplier.paymentTerms || "",
        outstandingBalance: supplier.outstandingBalance,
        notes: supplier.notes || "",
        isActive: supplier.isActive,
        createdAt: supplier.createdAt?.toISOString(),
        updatedAt: supplier.updatedAt?.toISOString(),
      },
    };
  } catch (error) {
    console.error("getSupplier error:", error);
    return { success: false as const, error: "Failed to fetch supplier" };
  }
}

export async function createSupplier(data: unknown) {
  try {
    await requirePermission("suppliers:manage");
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const parsed = supplierSchema.parse(data);

    const supplier = await Supplier.create({
      businessId: new mongoose.Types.ObjectId(businessId),
      name: parsed.name,
      company: parsed.company || undefined,
      email: parsed.email || undefined,
      phone: parsed.phone || undefined,
      address: parsed.address || undefined,
      taxId: parsed.taxId || undefined,
      paymentTerms: parsed.paymentTerms || undefined,
    });

    await logAudit(session, businessId, "supplier.created", "Supplier", supplier._id.toString(), {
      name: parsed.name,
      company: parsed.company,
    });

    return { success: true as const, data: { _id: supplier._id.toString(), name: supplier.name } };
  } catch (error: any) {
    console.error("createSupplier error:", error);
    if (error?.issues) return { success: false as const, error: "Validation failed", details: error.issues };
    if (error?.code === 11000) return { success: false as const, error: "A supplier with this name already exists" };
    return { success: false as const, error: error.message || "Failed to create supplier" };
  }
}

export async function updateSupplier(id: string, data: unknown) {
  try {
    await requirePermission("suppliers:manage");
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const parsed = supplierSchema.parse(data);

    const updateData: Record<string, unknown> = {
      name: parsed.name,
      company: parsed.company || null,
      email: parsed.email || null,
      phone: parsed.phone || null,
      address: parsed.address || null,
      taxId: parsed.taxId || null,
      paymentTerms: parsed.paymentTerms || null,
    };

    const supplier = await Supplier.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), businessId: new mongoose.Types.ObjectId(businessId) },
      { $set: updateData },
      { new: true }
    );

    if (!supplier) return { success: false as const, error: "Supplier not found" };

    await logAudit(session, businessId, "supplier.updated", "Supplier", id, { name: parsed.name });

    return { success: true as const, data: { _id: id } };
  } catch (error: any) {
    console.error("updateSupplier error:", error);
    if (error?.issues) return { success: false as const, error: "Validation failed", details: error.issues };
    if (error?.code === 11000) return { success: false as const, error: "A supplier with this name already exists" };
    return { success: false as const, error: "Failed to update supplier" };
  }
}

export async function deleteSupplier(id: string) {
  try {
    await requirePermission("suppliers:manage");
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const supplier = await Supplier.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), businessId: new mongoose.Types.ObjectId(businessId) },
      { $set: { isActive: false } },
      { new: true }
    );

    if (!supplier) return { success: false as const, error: "Supplier not found" };

    await logAudit(session, businessId, "supplier.deactivated", "Supplier", id, { name: supplier.name });

    return { success: true as const, data: { _id: id } };
  } catch (error) {
    console.error("deleteSupplier error:", error);
    return { success: false as const, error: "Failed to deactivate supplier" };
  }
}

export async function reactivateSupplier(id: string) {
  try {
    await requirePermission("suppliers:manage");
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const supplier = await Supplier.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), businessId: new mongoose.Types.ObjectId(businessId) },
      { $set: { isActive: true } },
      { new: true }
    );

    if (!supplier) return { success: false as const, error: "Supplier not found" };

    return { success: true as const, data: { _id: id } };
  } catch (error) {
    console.error("reactivateSupplier error:", error);
    return { success: false as const, error: "Failed to reactivate supplier" };
  }
}
