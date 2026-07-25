import mongoose, { Schema, Document } from "mongoose";

export interface ISaleItem extends Document {
  businessId: mongoose.Types.ObjectId;
  saleId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  name: string;
  sku?: string;
  quantity: number;
  price: number;
  cost: number;
  discount: number;
  tax: number;
  total: number;
  profit: number;
  createdAt: Date;
  updatedAt: Date;
}

const SaleItemSchema = new Schema<ISaleItem>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    saleId: { type: Schema.Types.ObjectId, ref: "Sale", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    sku: { type: String },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    cost: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    profit: { type: Number, default: 0 },
  },
  { timestamps: true }
);

SaleItemSchema.index({ businessId: 1 });
SaleItemSchema.index({ saleId: 1 });
SaleItemSchema.index({ productId: 1 });

export const SaleItem =
  mongoose.models.SaleItem || mongoose.model<ISaleItem>("SaleItem", SaleItemSchema);
