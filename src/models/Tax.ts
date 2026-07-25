import mongoose, { Schema, Document } from "mongoose";

export interface ITax extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  rate: number;
  type: "inclusive" | "exclusive";
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TaxSchema = new Schema<ITax>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    name: { type: String, required: true, trim: true },
    rate: { type: Number, required: true },
    type: { type: String, enum: ["inclusive", "exclusive"], default: "exclusive" },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

TaxSchema.index({ businessId: 1 });
TaxSchema.index({ businessId: 1, name: 1 }, { unique: true });
TaxSchema.index({ isDefault: 1 });

export const Tax = mongoose.models.Tax || mongoose.model<ITax>("Tax", TaxSchema);
