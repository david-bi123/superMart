import mongoose, { Schema, Document } from "mongoose";

export interface IPurchaseOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  sku?: string;
  quantity: number;
  received: number;
  price: number;
  total: number;
}

export interface IPurchaseOrder extends Document {
  businessId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  supplierId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  poNumber: string;
  items: IPurchaseOrderItem[];
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  status: "pending" | "approved" | "received" | "partial" | "cancelled";
  notes?: string;
  receivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch" },
    supplierId: { type: Schema.Types.ObjectId, ref: "Supplier", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    poNumber: { type: String, required: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        sku: { type: String },
        quantity: { type: Number, required: true },
        received: { type: Number, default: 0 },
        price: { type: Number, required: true },
        total: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true },
    taxTotal: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "received", "partial", "cancelled"],
      default: "pending",
    },
    notes: { type: String },
    receivedAt: { type: Date },
  },
  { timestamps: true }
);

PurchaseOrderSchema.index({ businessId: 1 });
PurchaseOrderSchema.index({ businessId: 1, poNumber: 1 }, { unique: true });
PurchaseOrderSchema.index({ supplierId: 1 });
PurchaseOrderSchema.index({ status: 1 });
PurchaseOrderSchema.index({ branchId: 1 });

export const PurchaseOrder =
  mongoose.models.PurchaseOrder ||
  mongoose.model<IPurchaseOrder>("PurchaseOrder", PurchaseOrderSchema);
