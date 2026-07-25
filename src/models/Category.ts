import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  parentId?: mongoose.Types.ObjectId;
  description?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true },
    parentId: { type: Schema.Types.ObjectId, ref: "Category" },
    description: { type: String },
    image: { type: String },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CategorySchema.index({ businessId: 1 });
CategorySchema.index({ businessId: 1, slug: 1 }, { unique: true });
CategorySchema.index({ parentId: 1 });

export const Category =
  mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);
