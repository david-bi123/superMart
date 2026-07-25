import mongoose, { Schema, Document } from "mongoose";

export interface ISupplier extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  paymentTerms?: string;
  outstandingBalance: number;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema = new Schema<ISupplier>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    name: { type: String, required: true, trim: true },
    company: { type: String },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String },
    address: { type: String },
    taxId: { type: String },
    paymentTerms: { type: String },
    outstandingBalance: { type: Number, default: 0 },
    notes: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

SupplierSchema.index({ businessId: 1 });
SupplierSchema.index({ businessId: 1, name: 1 }, { unique: true });

export const Supplier =
  mongoose.models.Supplier || mongoose.model<ISupplier>("Supplier", SupplierSchema);
