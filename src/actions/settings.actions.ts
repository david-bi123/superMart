"use server";

import { connectDB } from "@/lib/db/mongoose";
import { auth } from "@/lib/auth/config";
import { requirePermission } from "@/lib/auth/rbac";
import { Business } from "@/models/Business";
import { User } from "@/models/User";
import { Tax } from "@/models/Tax";
import { Notification } from "@/models/Notification";
import { AuditLog } from "@/models/AuditLog";
import {
  businessProfileSchema,
  businessSettingsSchema,
  createUserSchema,
  updateUserSchema,
  createTaxSchema,
  updateTaxSchema,
  notificationFilterSchema,
  auditLogFilterSchema,
} from "@/lib/validations/settings";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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
      ip: "",
      userAgent: "",
    });
  } catch (e) {
    console.error("Audit log error:", e);
  }
}

export async function getBusinessSettings() {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const business = await Business.findById(new mongoose.Types.ObjectId(businessId)).lean();
    if (!business) return { success: false as const, error: "Business not found" };

    return {
      success: true as const,
      data: {
        _id: business._id.toString(),
        name: business.name,
        slug: business.slug,
        email: business.email,
        phone: business.phone,
        logo: business.logo || "",
        address: business.address,
        tin: business.tin || "",
        currency: business.currency,
        timezone: business.timezone,
        dateFormat: business.dateFormat,
        settings: business.settings,
        subscriptionTier: business.subscriptionTier,
        subscriptionStatus: business.subscriptionStatus,
        storageUsed: business.storageUsed,
        storageLimit: business.storageLimit,
        createdAt: business.createdAt?.toISOString(),
      },
    };
  } catch (error) {
    console.error("getBusinessSettings error:", error);
    return { success: false as const, error: "Failed to fetch business settings" };
  }
}

export async function updateBusinessProfile(data: unknown) {
  try {
    await connectDB();
    await requirePermission("settings:manage");
    const session = await auth();
    const businessId = getBusinessId(session);

    const parsed = businessProfileSchema.parse(data);

    const updateData: Record<string, unknown> = {
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone,
      "address.street": parsed.address.street,
      "address.city": parsed.address.city,
      "address.state": parsed.address.state,
      "address.zip": parsed.address.zip,
      "address.country": parsed.address.country || "US",
      currency: parsed.currency,
      timezone: parsed.timezone,
    };
    if (parsed.logo !== undefined) updateData.logo = parsed.logo;
    if (parsed.tin !== undefined) updateData.tin = parsed.tin;

    const business = await Business.findByIdAndUpdate(
      new mongoose.Types.ObjectId(businessId),
      { $set: updateData },
      { new: true }
    );

    if (!business) return { success: false as const, error: "Business not found" };

    await logAudit(session, businessId, "settings.profile_updated", "Business", businessId, { name: parsed.name });

    return { success: true as const, data: { _id: business._id.toString() } };
  } catch (error: any) {
    console.error("updateBusinessProfile error:", error);
    if (error?.issues) return { success: false as const, error: "Validation failed", details: error.issues };
    return { success: false as const, error: error.message || "Failed to update profile" };
  }
}

export async function updateBusinessSettings(data: unknown) {
  try {
    await connectDB();
    await requirePermission("settings:manage");
    const session = await auth();
    const businessId = getBusinessId(session);

    const parsed = businessSettingsSchema.parse(data);

    const updateData: Record<string, unknown> = {
      currency: parsed.currency,
      timezone: parsed.timezone,
      dateFormat: parsed.dateFormat,
      "settings.receiptFooter": parsed.receiptFooter,
      "settings.receiptTerms": parsed.receiptTerms,
      "settings.defaultTax": parsed.defaultTax,
      "settings.enableMultiCurrency": parsed.enableMultiCurrency,
      "settings.enableLoyalty": parsed.enableLoyalty,
      "settings.enableBranches": parsed.enableBranches,
      "settings.enableSerialTracking": parsed.enableSerialTracking,
      "settings.enableBatchTracking": parsed.enableBatchTracking,
      "settings.enableExpiryTracking": parsed.enableExpiryTracking,
    };

    const business = await Business.findByIdAndUpdate(
      new mongoose.Types.ObjectId(businessId),
      { $set: updateData },
      { new: true }
    );

    if (!business) return { success: false as const, error: "Business not found" };

    await logAudit(session, businessId, "settings.updated", "Business", businessId, { currency: parsed.currency });

    return { success: true as const, data: { _id: business._id.toString() } };
  } catch (error: any) {
    console.error("updateBusinessSettings error:", error);
    if (error?.issues) return { success: false as const, error: "Validation failed", details: error.issues };
    return { success: false as const, error: error.message || "Failed to update settings" };
  }
}

export async function getUsers(filters: {
  search?: string;
  role?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}) {
  try {
    await connectDB();
    await requirePermission("users:manage");
    const session = await auth();
    const businessId = getBusinessId(session);

    const { search = "", role = "", isActive, page = 1, limit = 20 } = filters;

    const query: Record<string, unknown> = { businessId: new mongoose.Types.ObjectId(businessId) };

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { name: { $regex: escaped, $options: "i" } },
        { email: { $regex: escaped, $options: "i" } },
      ];
    }
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive;

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password -refreshToken -twoFactorSecret -passwordResetToken -passwordResetExpires -verificationToken")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    const data = users.map((u) => ({
      _id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone || "",
      avatar: u.avatar || "",
      isActive: u.isActive,
      isVerified: u.isVerified,
      lastLogin: u.lastLogin?.toISOString() || null,
      createdAt: u.createdAt?.toISOString(),
    }));

    return {
      success: true as const,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  } catch (error) {
    console.error("getUsers error:", error);
    return { success: false as const, error: "Failed to fetch users" };
  }
}

export async function createUser(data: unknown) {
  try {
    await connectDB();
    await requirePermission("users:manage");
    const session = await auth();
    const businessId = getBusinessId(session);

    const parsed = createUserSchema.parse(data);

    const actorRole = session?.user?.role;
    if (parsed.role === "business_owner" && actorRole !== "super_admin" && actorRole !== "business_owner") {
      return { success: false as const, error: "Only the business owner can assign the owner role" };
    }

    const existing = await User.findOne({ email: parsed.email, businessId: new mongoose.Types.ObjectId(businessId) });
    if (existing) return { success: false as const, error: "A user with this email already exists" };

    const hashedPassword = await bcrypt.hash(parsed.password, 12);

    const user = await User.create({
      name: parsed.name,
      email: parsed.email,
      password: hashedPassword,
      role: parsed.role,
      businessId: new mongoose.Types.ObjectId(businessId),
      phone: parsed.phone || undefined,
      isVerified: true,
    });

    await logAudit(session, businessId, "user.created", "User", user._id.toString(), {
      name: parsed.name,
      email: parsed.email,
      role: parsed.role,
    });

    return { success: true as const, data: { _id: user._id.toString(), name: user.name } };
  } catch (error: any) {
    console.error("createUser error:", error);
    if (error?.issues) return { success: false as const, error: "Validation failed", details: error.issues };
    if (error?.code === 11000) return { success: false as const, error: "A user with this email already exists" };
    return { success: false as const, error: error.message || "Failed to create user" };
  }
}

export async function updateUser(id: string, data: unknown) {
  try {
    await connectDB();
    await requirePermission("users:manage");
    const session = await auth();
    const businessId = getBusinessId(session);

    const parsed = updateUserSchema.parse(data);

    const actorRole = session?.user?.role;
    if (parsed.role === "business_owner" && actorRole !== "super_admin" && actorRole !== "business_owner") {
      return { success: false as const, error: "Only the business owner can assign the owner role" };
    }

    const target = await User.findOne({
      _id: new mongoose.Types.ObjectId(id),
      businessId: new mongoose.Types.ObjectId(businessId),
    });
    if (!target) return { success: false as const, error: "User not found" };

    if (
      (parsed.isActive === false && target.role === "business_owner") ||
      (parsed.role && parsed.role !== "business_owner" && target.role === "business_owner")
    ) {
      return { success: false as const, error: "The business owner account cannot be demoted or deactivated" };
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.name !== undefined) updateData.name = parsed.name;
    if (parsed.email !== undefined) updateData.email = parsed.email;
    if (parsed.role !== undefined) updateData.role = parsed.role;
    if (parsed.phone !== undefined) updateData.phone = parsed.phone || null;
    if (parsed.isActive !== undefined) updateData.isActive = parsed.isActive;

    const user = await User.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), businessId: new mongoose.Types.ObjectId(businessId) },
      { $set: updateData },
      { new: true }
    );

    if (!user) return { success: false as const, error: "User not found" };

    await logAudit(session, businessId, "user.updated", "User", id, { name: user.name, role: user.role });

    return { success: true as const, data: { _id: id } };
  } catch (error: any) {
    console.error("updateUser error:", error);
    if (error?.issues) return { success: false as const, error: "Validation failed", details: error.issues };
    return { success: false as const, error: error.message || "Failed to update user" };
  }
}

export async function deleteUser(id: string) {
  try {
    await connectDB();
    await requirePermission("users:manage");
    const session = await auth();
    const businessId = getBusinessId(session);

    const target = await User.findOne({
      _id: new mongoose.Types.ObjectId(id),
      businessId: new mongoose.Types.ObjectId(businessId),
    });
    if (!target) return { success: false as const, error: "User not found" };

    if (target.role === "business_owner") {
      return { success: false as const, error: "The business owner account cannot be deactivated" };
    }
    if (target._id.toString() === session?.user?.id) {
      return { success: false as const, error: "You cannot deactivate your own account" };
    }

    const user = await User.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), businessId: new mongoose.Types.ObjectId(businessId) },
      { $set: { isActive: false } },
      { new: true }
    );

    if (!user) return { success: false as const, error: "User not found" };

    await logAudit(session, businessId, "user.deactivated", "User", id, { name: user.name });

    return { success: true as const, data: { _id: id } };
  } catch (error) {
    console.error("deleteUser error:", error);
    return { success: false as const, error: "Failed to deactivate user" };
  }
}

export async function getTaxes() {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const taxes = await Tax.find({ businessId: new mongoose.Types.ObjectId(businessId) })
      .sort({ createdAt: -1 })
      .lean();

    const data = taxes.map((t) => ({
      _id: t._id.toString(),
      name: t.name,
      rate: t.rate,
      type: t.type,
      isDefault: t.isDefault,
      isActive: t.isActive,
      createdAt: t.createdAt?.toISOString(),
    }));

    return { success: true as const, data };
  } catch (error) {
    console.error("getTaxes error:", error);
    return { success: false as const, error: "Failed to fetch taxes" };
  }
}

export async function createTax(data: unknown) {
  try {
    await connectDB();
    await requirePermission("settings:manage");
    const session = await auth();
    const businessId = getBusinessId(session);

    const parsed = createTaxSchema.parse(data);

    if (parsed.isDefault) {
      await Tax.updateMany(
        { businessId: new mongoose.Types.ObjectId(businessId) },
        { $set: { isDefault: false } }
      );
    }

    const tax = await Tax.create({
      businessId: new mongoose.Types.ObjectId(businessId),
      name: parsed.name,
      rate: parsed.rate,
      type: parsed.type,
      isDefault: parsed.isDefault,
    });

    await logAudit(session, businessId, "tax.created", "Tax", tax._id.toString(), { name: parsed.name, rate: parsed.rate });

    return { success: true as const, data: { _id: tax._id.toString(), name: tax.name } };
  } catch (error: any) {
    console.error("createTax error:", error);
    if (error?.issues) return { success: false as const, error: "Validation failed", details: error.issues };
    if (error?.code === 11000) return { success: false as const, error: "A tax with this name already exists" };
    return { success: false as const, error: error.message || "Failed to create tax" };
  }
}

export async function updateTax(id: string, data: unknown) {
  try {
    await connectDB();
    await requirePermission("settings:manage");
    const session = await auth();
    const businessId = getBusinessId(session);

    const parsed = updateTaxSchema.parse(data);

    if (parsed.isDefault) {
      await Tax.updateMany(
        { businessId: new mongoose.Types.ObjectId(businessId) },
        { $set: { isDefault: false } }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.name !== undefined) updateData.name = parsed.name;
    if (parsed.rate !== undefined) updateData.rate = parsed.rate;
    if (parsed.type !== undefined) updateData.type = parsed.type;
    if (parsed.isDefault !== undefined) updateData.isDefault = parsed.isDefault;
    if (parsed.isActive !== undefined) updateData.isActive = parsed.isActive;

    const tax = await Tax.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), businessId: new mongoose.Types.ObjectId(businessId) },
      { $set: updateData },
      { new: true }
    );

    if (!tax) return { success: false as const, error: "Tax not found" };

    await logAudit(session, businessId, "tax.updated", "Tax", id, { name: tax.name });

    return { success: true as const, data: { _id: id } };
  } catch (error: any) {
    console.error("updateTax error:", error);
    if (error?.issues) return { success: false as const, error: "Validation failed", details: error.issues };
    return { success: false as const, error: error.message || "Failed to update tax" };
  }
}

export async function getNotifications(filters: {
  type?: string;
  read?: boolean;
  page?: number;
  limit?: number;
}) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);
    const userId = getUserId(session);

    const { type = "", read, page = 1, limit = 20 } = filters;

    const query: Record<string, unknown> = {
      businessId: new mongoose.Types.ObjectId(businessId),
      userId: new mongoose.Types.ObjectId(userId),
    };
    if (type) query.type = type;
    if (read !== undefined) query.read = read;

    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find(query).sort({ sentAt: -1 }).skip(skip).limit(limit).lean(),
      Notification.countDocuments(query),
    ]);

    const data = notifications.map((n) => ({
      _id: n._id.toString(),
      type: n.type,
      title: n.title,
      message: n.message,
      read: n.read,
      link: n.link || "",
      sentAt: n.sentAt?.toISOString(),
      createdAt: n.createdAt?.toISOString(),
    }));

    const unreadCount = await Notification.countDocuments({
      businessId: new mongoose.Types.ObjectId(businessId),
      userId: new mongoose.Types.ObjectId(userId),
      read: false,
    });

    return {
      success: true as const,
      data,
      unreadCount,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  } catch (error) {
    console.error("getNotifications error:", error);
    return { success: false as const, error: "Failed to fetch notifications" };
  }
}

export async function markNotificationRead(id: string) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);
    const userId = getUserId(session);

    const notification = await Notification.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        businessId: new mongoose.Types.ObjectId(businessId),
        userId: new mongoose.Types.ObjectId(userId),
      },
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) return { success: false as const, error: "Notification not found" };

    return { success: true as const, data: { _id: id } };
  } catch (error) {
    console.error("markNotificationRead error:", error);
    return { success: false as const, error: "Failed to mark notification as read" };
  }
}

export async function markAllNotificationsRead() {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);
    const userId = getUserId(session);

    await Notification.updateMany(
      {
        businessId: new mongoose.Types.ObjectId(businessId),
        userId: new mongoose.Types.ObjectId(userId),
        read: false,
      },
      { $set: { read: true } }
    );

    return { success: true as const, data: { message: "All notifications marked as read" } };
  } catch (error) {
    console.error("markAllNotificationsRead error:", error);
    return { success: false as const, error: "Failed to mark notifications as read" };
  }
}

export async function getAuditLogs(filters: {
  action?: string;
  userId?: string;
  resource?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  try {
    await connectDB();
    await requirePermission("settings:manage");
    const session = await auth();
    const businessId = getBusinessId(session);

    const {
      action = "",
      userId = "",
      resource = "",
      dateFrom = "",
      dateTo = "",
      search = "",
      page = 1,
      limit = 50,
    } = filters;

    const query: Record<string, unknown> = { businessId: new mongoose.Types.ObjectId(businessId) };

    if (action) query.action = { $regex: action, $options: "i" };
    if (userId) query.userId = new mongoose.Types.ObjectId(userId);
    if (resource) query.resource = { $regex: resource, $options: "i" };

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

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { action: { $regex: escaped, $options: "i" } },
        { resource: { $regex: escaped, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(query),
    ]);

    const data = logs.map((log) => ({
      _id: log._id.toString(),
      userId: log.userId?._id?.toString() || log.userId?.toString() || "",
      userName: (log.userId as any)?.name || "System",
      userEmail: (log.userId as any)?.email || "",
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId || "",
      details: log.details || null,
      ip: log.ip || "",
      userAgent: log.userAgent || "",
      createdAt: log.createdAt?.toISOString(),
    }));

    return {
      success: true as const,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  } catch (error) {
    console.error("getAuditLogs error:", error);
    return { success: false as const, error: "Failed to fetch audit logs" };
  }
}

export async function getNotificationPreferences() {
  try {
    await connectDB();
    const session = await auth();
    const userId = getUserId(session);

    const user = await User.findById(userId).select("notificationPreferences").lean();
    const prefs = (user?.notificationPreferences as Record<string, { email: boolean; inApp: boolean }>) || {};

    return { success: true as const, data: prefs };
  } catch (error) {
    console.error("getNotificationPreferences error:", error);
    return { success: false as const, error: "Failed to fetch notification preferences" };
  }
}

export async function updateNotificationPreferences(prefs: Record<string, { email: boolean; inApp: boolean }>) {
  try {
    await connectDB();
    const session = await auth();
    const userId = getUserId(session);

    const sanitized: Record<string, { email: boolean; inApp: boolean }> = {};
    for (const [key, value] of Object.entries(prefs || {})) {
      sanitized[key] = {
        email: !!value?.email,
        inApp: !!value?.inApp,
      };
    }

    await User.findByIdAndUpdate(userId, { $set: { notificationPreferences: sanitized } });

    return { success: true as const, data: { message: "Notification preferences saved" } };
  } catch (error) {
    console.error("updateNotificationPreferences error:", error);
    return { success: false as const, error: "Failed to save notification preferences" };
  }
}
