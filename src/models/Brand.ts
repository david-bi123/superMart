import mongoose, { Schema, Document } from "mongoose";

export interface IBrand extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema = new Schema<IBrand>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true },
    description: { type: String },
    logo: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

BrandSchema.index({ businessId: 1 });
BrandSchema.index({ businessId: 1, slug: 1 }, { unique: true });

export const Brand = mongoose.models.Brand || mongoose.model<IBrand>("Brand", BrandSchema);
