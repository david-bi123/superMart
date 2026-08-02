"use server";

import { connectDB } from "@/lib/db/mongoose";
import { auth } from "@/lib/auth/config";
import { requirePermission } from "@/lib/auth/rbac";
import { Branch } from "@/models/Branch";
import { AuditLog } from "@/models/AuditLog";
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

export async function getBranches(filters: {
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
        { code: { $regex: escaped, $options: "i" } },
      ];
    }
    if (isActive !== undefined) query.isActive = isActive;

    const skip = (page - 1) * limit;

    const [branches, total] = await Promise.all([
      Branch.find(query)
        .populate("managerId", "name email")
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Branch.countDocuments(query),
    ]);

    const data = branches.map((b) => ({
      _id: b._id.toString(),
      name: b.name,
      code: b.code,
      address: b.address || {},
      phone: b.phone || "",
      email: b.email || "",
      manager: (b.managerId as any)?.name || "",
      managerId: b.managerId?._id?.toString() || b.managerId?.toString() || "",
      isActive: b.isActive,
      createdAt: b.createdAt?.toISOString(),
    }));

    return {
      success: true as const,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  } catch (error) {
    console.error("getBranches error:", error);
    return { success: false as const, error: "Failed to fetch branches" };
  }
}

export async function getBranch(id: string) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const branch = await Branch.findOne({
      _id: new mongoose.Types.ObjectId(id),
      businessId: new mongoose.Types.ObjectId(businessId),
    })
      .populate("managerId", "name email phone")
      .lean();

    if (!branch) return { success: false as const, error: "Branch not found" };

    return {
      success: true as const,
      data: {
        _id: branch._id.toString(),
        name: branch.name,
        code: branch.code,
        address: branch.address || {},
        phone: branch.phone || "",
        email: branch.email || "",
        managerId: branch.managerId?._id?.toString() || branch.managerId?.toString() || "",
        managerName: (branch.managerId as any)?.name || "",
        isActive: branch.isActive,
        createdAt: branch.createdAt?.toISOString(),
        updatedAt: branch.updatedAt?.toISOString(),
      },
    };
  } catch (error) {
    console.error("getBranch error:", error);
    return { success: false as const, error: "Failed to fetch branch" };
  }
}

export async function createBranch(data: unknown) {
  try {
    await requirePermission("settings:manage");
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const parsed = data as {
      name: string;
      code: string;
      address?: { street?: string; city?: string; state?: string; zip?: string; country?: string };
      phone?: string;
      email?: string;
      managerId?: string;
    };

    if (!parsed.name || !parsed.code) {
      return { success: false as const, error: "Name and code are required" };
    }

    const existing = await Branch.findOne({
      businessId: new mongoose.Types.ObjectId(businessId),
      code: parsed.code,
    });
    if (existing) return { success: false as const, error: "A branch with this code already exists" };

    const branch = await Branch.create({
      businessId: new mongoose.Types.ObjectId(businessId),
      name: parsed.name,
      code: parsed.code,
      address: parsed.address || {},
      phone: parsed.phone || undefined,
      email: parsed.email || undefined,
      managerId: parsed.managerId ? new mongoose.Types.ObjectId(parsed.managerId) : undefined,
    });

    await logAudit(session, businessId, "branch.created", "Branch", branch._id.toString(), {
      name: parsed.name,
      code: parsed.code,
    });

    return { success: true as const, data: { _id: branch._id.toString(), name: branch.name } };
  } catch (error: any) {
    console.error("createBranch error:", error);
    if (error?.code === 11000) return { success: false as const, error: "A branch with this code already exists" };
    return { success: false as const, error: error.message || "Failed to create branch" };
  }
}

export async function updateBranch(id: string, data: unknown) {
  try {
    await requirePermission("settings:manage");
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const parsed = data as {
      name?: string;
      code?: string;
      address?: { street?: string; city?: string; state?: string; zip?: string; country?: string };
      phone?: string;
      email?: string;
      managerId?: string;
      isActive?: boolean;
    };

    const updateData: Record<string, unknown> = {};
    if (parsed.name !== undefined) updateData.name = parsed.name;
    if (parsed.code !== undefined) updateData.code = parsed.code;
    if (parsed.address !== undefined) updateData.address = parsed.address;
    if (parsed.phone !== undefined) updateData.phone = parsed.phone || null;
    if (parsed.email !== undefined) updateData.email = parsed.email || null;
    if (parsed.isActive !== undefined) updateData.isActive = parsed.isActive;
    if (parsed.managerId !== undefined) updateData.managerId = parsed.managerId ? new mongoose.Types.ObjectId(parsed.managerId) : null;

    const branch = await Branch.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), businessId: new mongoose.Types.ObjectId(businessId) },
      { $set: updateData },
      { new: true }
    );

    if (!branch) return { success: false as const, error: "Branch not found" };

    await logAudit(session, businessId, "branch.updated", "Branch", id, { name: branch.name });

    return { success: true as const, data: { _id: id } };
  } catch (error: any) {
    console.error("updateBranch error:", error);
    if (error?.code === 11000) return { success: false as const, error: "A branch with this code already exists" };
    return { success: false as const, error: error.message || "Failed to update branch" };
  }
}

export async function deleteBranch(id: string) {
  try {
    await requirePermission("settings:manage");
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const branch = await Branch.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), businessId: new mongoose.Types.ObjectId(businessId) },
      { $set: { isActive: false } },
      { new: true }
    );

    if (!branch) return { success: false as const, error: "Branch not found" };

    await logAudit(session, businessId, "branch.deactivated", "Branch", id, { name: branch.name });

    return { success: true as const, data: { _id: id } };
  } catch (error) {
    console.error("deleteBranch error:", error);
    return { success: false as const, error: "Failed to deactivate branch" };
  }
}

export async function getAllBranches() {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const branches = await Branch.find({
      businessId: new mongoose.Types.ObjectId(businessId),
      isActive: true,
    })
      .sort({ name: 1 })
      .lean();

    const data = branches.map((b) => ({
      _id: b._id.toString(),
      name: b.name,
      code: b.code,
    }));

    return { success: true as const, data };
  } catch (error) {
    console.error("getAllBranches error:", error);
    return { success: false as const, error: "Failed to fetch branches" };
  }
}
