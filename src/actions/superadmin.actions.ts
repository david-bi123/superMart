"use server";

import { connectDB } from "@/lib/db/mongoose";
import { requireSuperAdmin } from "@/lib/auth/rbac";
import { Business } from "@/models/Business";
import { User } from "@/models/User";
import { Branch } from "@/models/Branch";
import { AuditLog } from "@/models/AuditLog";
import { Subscription } from "@/models/Subscription";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import slugify from "slugify";

const BCRYPT_SALT_ROUNDS = 10;

function generateDefaultPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let pw = "Retail@" + chars[Math.floor(Math.random() * chars.length)];
  for (let i = 0; i < 7; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
}

async function logAudit(userId: string, businessId: string, action: string, resource: string, resourceId: string, details?: any) {
  try {
    await AuditLog.create({
      businessId: new mongoose.Types.ObjectId(businessId),
      userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      action,
      resource,
      resourceId,
      details,
      ip: "",
      userAgent: "",
    });
  } catch (e) {
    console.error("Audit log error:", e);
  }
}

export async function getTenants(filters: {
  search?: string;
  status?: string;
  tier?: string;
  page?: number;
  limit?: number;
}) {
  try {
    await requireSuperAdmin();
    await connectDB();

    const { search = "", status = "", tier = "", page = 1, limit = 20 } = filters;

    const query: Record<string, unknown> = {};
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { name: { $regex: escaped, $options: "i" } },
        { email: { $regex: escaped, $options: "i" } },
        { slug: { $regex: escaped, $options: "i" } },
      ];
    }
    if (status === "suspended") {
      query.isActive = false;
      query.approvalStatus = { $ne: "pending" };
    } else if (status === "active") {
      query.isActive = true;
      query.approvalStatus = "approved";
    } else if (status === "trialing") {
      query.subscriptionStatus = "trialing";
      query.approvalStatus = { $ne: "pending" };
    } else if (status === "pending") {
      query.approvalStatus = "pending";
    } else if (status === "rejected") {
      query.approvalStatus = "rejected";
    }
    if (tier) query.subscriptionTier = tier;

    const skip = (page - 1) * limit;

    const [tenants, total] = await Promise.all([
      Business.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Business.countDocuments(query),
    ]);

    const userIds = tenants.map((b) => b._id);
    const userCounts = await User.aggregate([
      { $match: { businessId: { $in: userIds } } },
      { $group: { _id: "$businessId", count: { $sum: 1 } } },
    ]);
    const userCountMap = new Map(
      userCounts.map((u) => [u._id.toString(), u.count])
    );

    const data = tenants.map((b) => ({
      _id: b._id.toString(),
      name: b.name,
      slug: b.slug,
      email: b.email,
      isActive: b.isActive,
      isSuspended: b.isSuspended,
      approvalStatus: b.approvalStatus,
      subscriptionTier: b.subscriptionTier,
      subscriptionStatus: b.subscriptionStatus,
      storageUsed: b.storageUsed,
      storageLimit: b.storageLimit,
      users: userCountMap.get(b._id.toString()) || 0,
      createdAt: b.createdAt?.toISOString(),
    }));

    return {
      success: true as const,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  } catch (error) {
    console.error("getTenants error:", error);
    return { success: false as const, error: "Failed to fetch tenants" };
  }
}

export async function getAdminStats() {
  try {
    await requireSuperAdmin();
    await connectDB();

    const [tenants, activeTenants, trialingTenants, pendingTenants, users] = await Promise.all([
      Business.countDocuments({}),
      Business.countDocuments({ isActive: true, approvalStatus: "approved" }),
      Business.countDocuments({ subscriptionStatus: "trialing", approvalStatus: { $ne: "pending" } }),
      Business.countDocuments({ approvalStatus: "pending" }),
      User.countDocuments({ role: { $ne: "super_admin" } }),
    ]);

    const revenueAgg = await Subscription.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const revenue = revenueAgg[0]?.total || 0;

return {
      success: true as const,
      data: {
        tenants,
        activeTenants,
        trialingTenants,
        pendingTenants,
        users,
        revenue,
      },
    };
  } catch (error) {
    console.error("getAdminStats error:", error);
    return { success: false as const, error: "Failed to fetch platform stats" };
  }
}

export async function setTenantActive(id: string, isActive: boolean) {
  try {
    await requireSuperAdmin();
    await connectDB();

    const tenant = await Business.findByIdAndUpdate(
      new mongoose.Types.ObjectId(id),
      { $set: { isActive, isSuspended: !isActive } },
      { new: true }
    );

    if (!tenant) return { success: false as const, error: "Tenant not found" };

    return {
      success: true as const,
      data: { _id: id, isActive: tenant.isActive, isSuspended: tenant.isSuspended },
    };
  } catch (error: any) {
    console.error("setTenantActive error:", error);
    return { success: false as const, error: error.message || "Failed to update tenant" };
  }
}

export async function createTenant(data: {
  businessName: string;
  ownerName: string;
  email: string;
  phone?: string;
  password?: string;
}) {
  try {
    await requireSuperAdmin();
    await connectDB();

    const existing = await User.findOne({ email: data.email });
    if (existing) return { success: false as const, error: "Email is already in use" };

    const slug = slugify(data.businessName, { lower: true, strict: true }) + "-" + Date.now().toString(36);
    const password = data.password || generateDefaultPassword();
    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const business = await Business.create({
      name: data.businessName,
      slug,
      email: data.email,
      phone: data.phone,
      isActive: true,
      approvalStatus: "approved",
    });

    const user = await User.create({
      name: data.ownerName,
      email: data.email,
      password: hashedPassword,
      role: "business_owner",
      businessId: business._id,
      phone: data.phone,
      isVerified: true,
      isActive: true,
    });

    await logAudit(user._id.toString(), business._id.toString(), "tenant.created", "Business", business._id.toString(), {
      name: data.businessName,
      email: data.email,
    });

    return {
      success: true as const,
      data: {
        businessId: business._id.toString(),
        userId: user._id.toString(),
        email: data.email,
        temporaryPassword: password,
      },
    };
  } catch (error: any) {
    console.error("createTenant error:", error);
    return { success: false as const, error: error.message || "Failed to create tenant" };
  }
}

export async function approveTenant(id: string) {
  try {
    await requireSuperAdmin();
    await connectDB();

    const tenant = await Business.findByIdAndUpdate(
      new mongoose.Types.ObjectId(id),
      { $set: { approvalStatus: "approved", isActive: true, isSuspended: false } },
      { new: true }
    );
    if (!tenant) return { success: false as const, error: "Tenant not found" };

    await User.updateMany(
      { businessId: tenant._id, role: "business_owner" },
      { $set: { isActive: true, isVerified: true } }
    );

    await logAudit("", tenant._id.toString(), "tenant.approved", "Business", tenant._id.toString(), { name: tenant.name });

    return { success: true as const, data: { _id: id, approvalStatus: "approved", isActive: true } };
  } catch (error: any) {
    console.error("approveTenant error:", error);
    return { success: false as const, error: error.message || "Failed to approve tenant" };
  }
}

export async function rejectTenant(id: string) {
  try {
    await requireSuperAdmin();
    await connectDB();

    const tenant = await Business.findByIdAndUpdate(
      new mongoose.Types.ObjectId(id),
      { $set: { approvalStatus: "rejected", isActive: false, isSuspended: true } },
      { new: true }
    );
    if (!tenant) return { success: false as const, error: "Tenant not found" };

    await User.updateMany(
      { businessId: tenant._id },
      { $set: { isActive: false } }
    );

    await logAudit("", tenant._id.toString(), "tenant.rejected", "Business", tenant._id.toString(), { name: tenant.name });

    return { success: true as const, data: { _id: id, approvalStatus: "rejected", isActive: false } };
  } catch (error: any) {
    console.error("rejectTenant error:", error);
    return { success: false as const, error: error.message || "Failed to reject tenant" };
  }
}