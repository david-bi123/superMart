import mongoose, { Schema, Document } from "mongoose";

export interface IBranch extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  code: string;
  address: { street: string; city: string; state: string; zip: string; country: string };
  phone: string;
  email: string;
  managerId?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BranchSchema = new Schema<IBranch>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    address: {
      street: String, city: String, state: String, zip: String, country: { type: String, default: "US" },
    },
    phone: String,
    email: String,
    managerId: { type: Schema.Types.ObjectId, ref: "User" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

BranchSchema.index({ businessId: 1 });

export const Branch = mongoose.models.Branch || mongoose.model<IBranch>("Branch", BranchSchema);
