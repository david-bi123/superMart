import mongoose, { Schema, Document } from "mongoose";

export interface ISubscriptionFeatures {
  [key: string]: boolean | number | string;
}

export interface ISubscription extends Document {
  businessId: mongoose.Types.ObjectId;
  tier: "free" | "starter" | "professional" | "enterprise";
  status: "active" | "expired" | "cancelled" | "trialing";
  startDate: Date;
  endDate?: Date;
  amount?: number;
  paymentId?: string;
  features: ISubscriptionFeatures;
  maxUsers: number;
  maxStorage: number;
  maxBranches: number;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    tier: {
      type: String,
      enum: ["free", "starter", "professional", "enterprise"],
      required: true,
      default: "free",
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled", "trialing"],
      required: true,
      default: "trialing",
    },
    startDate: { type: Date, required: true, default: Date.now },
    endDate: { type: Date },
    amount: { type: Number },
    paymentId: { type: String },
    features: { type: Schema.Types.Mixed, default: {} },
    maxUsers: { type: Number, default: 1 },
    maxStorage: { type: Number, default: 100 },
    maxBranches: { type: Number, default: 1 },
  },
  { timestamps: true }
);

SubscriptionSchema.index({ businessId: 1 }, { unique: true });
SubscriptionSchema.index({ status: 1 });

export const Subscription =
  mongoose.models.Subscription ||
  mongoose.model<ISubscription>("Subscription", SubscriptionSchema);
