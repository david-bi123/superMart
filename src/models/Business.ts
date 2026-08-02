import mongoose, { Schema, Document } from "mongoose";

export interface IBusiness extends Document {
  name: string;
  slug: string;
  email: string;
  phone: string;
  logo?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  tin?: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  isActive: boolean;
  isSuspended: boolean;
  approvalStatus: "pending" | "approved" | "rejected";
  subscriptionTier: "free" | "starter" | "professional" | "enterprise";
  subscriptionStatus: "active" | "expired" | "cancelled" | "trialing";
  subscriptionEndsAt?: Date;
  storageUsed: number;
  storageLimit: number;
  settings: {
    receiptFooter?: string;
    receiptTerms?: string;
    defaultTax?: number;
    enableMultiCurrency: boolean;
    enableLoyalty: boolean;
    enableBranches: boolean;
    enableSerialTracking: boolean;
    enableBatchTracking: boolean;
    enableExpiryTracking: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const BusinessSchema = new Schema<IBusiness>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    logo: { type: String },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      zip: { type: String, default: "" },
      country: { type: String, default: "US" },
    },
    tin: { type: String },
    currency: { type: String, default: "GHS" },
    timezone: { type: String, default: "Africa/Accra" },
    dateFormat: { type: String, default: "MM/DD/YYYY" },
    isActive: { type: Boolean, default: true },
    isSuspended: { type: Boolean, default: false },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
    subscriptionTier: {
      type: String,
      enum: ["free", "starter", "professional", "enterprise"],
      default: "free",
    },
    subscriptionStatus: {
      type: String,
      enum: ["active", "expired", "cancelled", "trialing"],
      default: "trialing",
    },
    subscriptionEndsAt: { type: Date },
    storageUsed: { type: Number, default: 0 },
    storageLimit: { type: Number, default: 100 },
    settings: {
      receiptFooter: { type: String, default: "Thank you for your purchase!" },
      receiptTerms: { type: String },
      defaultTax: { type: Number, default: 0 },
      enableMultiCurrency: { type: Boolean, default: false },
      enableLoyalty: { type: Boolean, default: true },
      enableBranches: { type: Boolean, default: false },
      enableSerialTracking: { type: Boolean, default: false },
      enableBatchTracking: { type: Boolean, default: true },
      enableExpiryTracking: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

BusinessSchema.index({ slug: 1 });
BusinessSchema.index({ email: 1 });

export const Business =
  mongoose.models.Business || mongoose.model<IBusiness>("Business", BusinessSchema);
