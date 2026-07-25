import mongoose, { Schema, Document } from "mongoose";

export interface IProductVariant {
  name: string;
  value: string;
  price: number;
  stock: number;
  sku?: string;
}

export interface IProduct extends Document {
  businessId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  name: string;
  sku?: string;
  barcode?: string;
  qrCode?: string;
  categoryId?: mongoose.Types.ObjectId;
  brandId?: mongoose.Types.ObjectId;
  supplierId?: mongoose.Types.ObjectId;
  description?: string;
  purchasePrice: number;
  sellingPrice: number;
  wholesalePrice?: number;
  discountPrice?: number;
  minStock: number;
  maxStock?: number;
  currentStock: number;
  warehouse?: string;
  shelf?: string;
  expiryDate?: Date;
  batchNumber?: string;
  tax?: number;
  images: string[];
  variants: IProductVariant[];
  weight?: number;
  volume?: number;
  unit?: string;
  isActive: boolean;
  isArchived: boolean;
  trackSerial: boolean;
  trackBatch: boolean;
  trackExpiry: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch" },
    name: { type: String, required: true, trim: true },
    sku: { type: String, trim: true },
    barcode: { type: String },
    qrCode: { type: String },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
    brandId: { type: Schema.Types.ObjectId, ref: "Brand" },
    supplierId: { type: Schema.Types.ObjectId, ref: "Supplier" },
    description: { type: String },
    purchasePrice: { type: Number, required: true, default: 0 },
    sellingPrice: { type: Number, required: true, default: 0 },
    wholesalePrice: { type: Number },
    discountPrice: { type: Number },
    minStock: { type: Number, default: 0 },
    maxStock: { type: Number },
    currentStock: { type: Number, default: 0 },
    warehouse: { type: String },
    shelf: { type: String },
    expiryDate: { type: Date },
    batchNumber: { type: String },
    tax: { type: Number, default: 0 },
    images: [{ type: String }],
    variants: [
      {
        name: { type: String, required: true },
        value: { type: String, required: true },
        price: { type: Number, required: true },
        stock: { type: Number, default: 0 },
        sku: { type: String },
      },
    ],
    weight: { type: Number },
    volume: { type: Number },
    unit: { type: String },
    isActive: { type: Boolean, default: true },
    isArchived: { type: Boolean, default: false },
    trackSerial: { type: Boolean, default: false },
    trackBatch: { type: Boolean, default: false },
    trackExpiry: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ProductSchema.index({ businessId: 1 });
ProductSchema.index({ businessId: 1, sku: 1 }, { unique: true, sparse: true });
ProductSchema.index({ businessId: 1, barcode: 1 }, { sparse: true });
ProductSchema.index({ categoryId: 1 });
ProductSchema.index({ brandId: 1 });
ProductSchema.index({ supplierId: 1 });
ProductSchema.index({ branchId: 1 });
ProductSchema.index({ name: "text", description: "text" });

export const Product =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
