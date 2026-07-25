import mongoose, { Schema, Document } from "mongoose";

export interface ICustomer extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  loyaltyPoints: number;
  totalPurchases: number;
  balance: number;
  creditLimit: number;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String },
    address: { type: String },
    loyaltyPoints: { type: Number, default: 0 },
    totalPurchases: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    creditLimit: { type: Number, default: 0 },
    notes: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CustomerSchema.index({ businessId: 1 });
CustomerSchema.index({ businessId: 1, email: 1 }, { sparse: true });
CustomerSchema.index({ businessId: 1, phone: 1 }, { sparse: true });

export const Customer =
  mongoose.models.Customer || mongoose.model<ICustomer>("Customer", CustomerSchema);
