import mongoose, { Schema, Document } from "mongoose";

export interface ICoupon extends Document {
  businessId: mongoose.Types.ObjectId;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minPurchase?: number;
  maxUses?: number;
  uses: number;
  startsAt?: Date;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    type: { type: String, enum: ["percentage", "fixed"], required: true },
    value: { type: Number, required: true },
    minPurchase: { type: Number, default: 0 },
    maxUses: { type: Number },
    uses: { type: Number, default: 0 },
    startsAt: { type: Date },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CouponSchema.index({ businessId: 1 });
CouponSchema.index({ businessId: 1, code: 1 }, { unique: true });

export const Coupon =
  mongoose.models.Coupon || mongoose.model<ICoupon>("Coupon", CouponSchema);
