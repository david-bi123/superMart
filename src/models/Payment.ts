import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  businessId: mongoose.Types.ObjectId;
  subscriptionId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  method: string;
  status: "pending" | "completed" | "failed" | "refunded";
  transactionId?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: "Subscription", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "GHS" },
    method: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    transactionId: { type: String },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

PaymentSchema.index({ businessId: 1 });
PaymentSchema.index({ subscriptionId: 1 });
PaymentSchema.index({ transactionId: 1 }, { sparse: true });

export const Payment =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);
