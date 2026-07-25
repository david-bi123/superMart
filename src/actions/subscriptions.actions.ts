"use server";

import { connectDB } from "@/lib/db/mongoose";
import { auth } from "@/lib/auth/config";
import { Business } from "@/models/Business";
import { Subscription } from "@/models/Subscription";
import { AuditLog } from "@/models/AuditLog";
import mongoose from "mongoose";

function getBusinessId(session: any): string {
  const bid = session?.user?.businessId;
  if (!bid) throw new Error("Not authenticated");
  return bid;
}

const PLANS = [
  {
    tier: "free",
    name: "Free",
    price: 0,
    currency: "USD",
    interval: "month",
    features: {
      maxUsers: 1,
      maxStorage: 100,
      maxBranches: 1,
      products: true,
      sales: true,
      reports: false,
      purchaseOrders: false,
      serialTracking: false,
      batchTracking: false,
      expiryTracking: false,
      multiCurrency: false,
      loyaltyProgram: false,
      apiAccess: false,
      prioritySupport: false,
    },
  },
  {
    tier: "starter",
    name: "Starter",
    price: 29,
    currency: "USD",
    interval: "month",
    features: {
      maxUsers: 3,
      maxStorage: 500,
      maxBranches: 1,
      products: true,
      sales: true,
      reports: true,
      purchaseOrders: true,
      serialTracking: true,
      batchTracking: false,
      expiryTracking: false,
      multiCurrency: false,
      loyaltyProgram: true,
      apiAccess: false,
      prioritySupport: false,
    },
  },
  {
    tier: "professional",
    name: "Professional",
    price: 79,
    currency: "USD",
    interval: "month",
    features: {
      maxUsers: 10,
      maxStorage: 2000,
      maxBranches: 3,
      products: true,
      sales: true,
      reports: true,
      purchaseOrders: true,
      serialTracking: true,
      batchTracking: true,
      expiryTracking: true,
      multiCurrency: true,
      loyaltyProgram: true,
      apiAccess: true,
      prioritySupport: false,
    },
  },
  {
    tier: "enterprise",
    name: "Enterprise",
    price: 199,
    currency: "USD",
    interval: "month",
    features: {
      maxUsers: -1,
      maxStorage: 10000,
      maxBranches: -1,
      products: true,
      sales: true,
      reports: true,
      purchaseOrders: true,
      serialTracking: true,
      batchTracking: true,
      expiryTracking: true,
      multiCurrency: true,
      loyaltyProgram: true,
      apiAccess: true,
      prioritySupport: true,
    },
  },
] as const;

export async function getSubscription() {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const business = await Business.findById(new mongoose.Types.ObjectId(businessId)).lean();
    if (!business) return { success: false as const, error: "Business not found" };

    const subscription = await Subscription.findOne({
      businessId: new mongoose.Types.ObjectId(businessId),
    }).lean();

    const plan = PLANS.find((p) => p.tier === business.subscriptionTier) || PLANS[0];

    return {
      success: true as const,
      data: {
        tier: business.subscriptionTier,
        status: business.subscriptionStatus,
        subscriptionEndsAt: business.subscriptionEndsAt?.toISOString() || null,
        plan: {
          ...plan,
          features: subscription?.features || plan.features,
        },
        usage: {
          users: 0,
          storage: business.storageUsed,
          branches: 0,
        },
      },
    };
  } catch (error) {
    console.error("getSubscription error:", error);
    return { success: false as const, error: "Failed to fetch subscription" };
  }
}

export async function getPlans() {
  try {
    return {
      success: true as const,
      data: PLANS.map((p) => ({
        tier: p.tier,
        name: p.name,
        price: p.price,
        currency: p.currency,
        interval: p.interval,
        features: p.features,
      })),
    };
  } catch (error) {
    console.error("getPlans error:", error);
    return { success: false as const, error: "Failed to fetch plans" };
  }
}

export async function upgradePlan(tier: string) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const plan = PLANS.find((p) => p.tier === tier);
    if (!plan) return { success: false as const, error: "Invalid plan tier" };

    const business = await Business.findById(new mongoose.Types.ObjectId(businessId));
    if (!business) return { success: false as const, error: "Business not found" };

    business.subscriptionTier = tier as any;
    business.subscriptionStatus = "active";
    business.storageLimit = plan.features.maxStorage;

    if (tier === "free") {
      business.subscriptionEndsAt = undefined;
    } else {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      business.subscriptionEndsAt = endDate;
    }

    await business.save();

    await Subscription.findOneAndUpdate(
      { businessId: new mongoose.Types.ObjectId(businessId) },
      {
        $set: {
          tier: plan.tier,
          status: "active",
          endDate: business.subscriptionEndsAt,
          maxUsers: plan.features.maxUsers,
          maxStorage: plan.features.maxStorage,
          maxBranches: plan.features.maxBranches,
          features: plan.features,
        },
      },
      { upsert: true, new: true }
    );

    await AuditLog.create({
      businessId: new mongoose.Types.ObjectId(businessId),
      userId: session?.user?.id ? new mongoose.Types.ObjectId(session.user.id) : undefined,
      action: "subscription.upgraded",
      resource: "Subscription",
      resourceId: businessId,
      details: { tier: plan.tier, plan: plan.name },
    });

    return { success: true as const, data: { tier: plan.tier, name: plan.name } };
  } catch (error: any) {
    console.error("upgradePlan error:", error);
    return { success: false as const, error: error.message || "Failed to upgrade plan" };
  }
}

export async function cancelSubscription() {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const business = await Business.findById(new mongoose.Types.ObjectId(businessId));
    if (!business) return { success: false as const, error: "Business not found" };

    business.subscriptionStatus = "cancelled";
    await business.save();

    await Subscription.findOneAndUpdate(
      { businessId: new mongoose.Types.ObjectId(businessId) },
      { $set: { status: "cancelled" } }
    );

    await AuditLog.create({
      businessId: new mongoose.Types.ObjectId(businessId),
      userId: session?.user?.id ? new mongoose.Types.ObjectId(session.user.id) : undefined,
      action: "subscription.cancelled",
      resource: "Subscription",
      resourceId: businessId,
    });

    return { success: true as const, data: { message: "Subscription cancelled" } };
  } catch (error: any) {
    console.error("cancelSubscription error:", error);
    return { success: false as const, error: error.message || "Failed to cancel subscription" };
  }
}

export async function getInvoices() {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const business = await Business.findById(new mongoose.Types.ObjectId(businessId)).lean();

    const invoices = [
      {
        _id: "1",
        invoiceNumber: "INV-001",
        plan: business?.subscriptionTier || "free",
        amount: business?.subscriptionTier === "free" ? 0 : business?.subscriptionTier === "starter" ? 29 : business?.subscriptionTier === "professional" ? 79 : 199,
        currency: "USD",
        status: "paid",
        periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        periodEnd: new Date().toISOString(),
        paidAt: new Date().toISOString(),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return { success: true as const, data: invoices };
  } catch (error) {
    console.error("getInvoices error:", error);
    return { success: false as const, error: "Failed to fetch invoices" };
  }
}
