"use server";

import { connectDB } from "@/lib/db/mongoose";
import { requireSuperAdmin } from "@/lib/auth/rbac";
import { Business } from "@/models/Business";
import { User } from "@/models/User";
import { Subscription } from "@/models/Subscription";
import mongoose from "mongoose";

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
    } else if (status === "active") {
      query.isActive = true;
    } else if (status === "trialing") {
      query.subscriptionStatus = "trialing";
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

    const [tenants, activeTenants, trialingTenants, users] = await Promise.all([
      Business.countDocuments({}),
      Business.countDocuments({ isActive: true }),
      Business.countDocuments({ subscriptionStatus: "trialing" }),
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