import mongoose, { Schema, Document } from "mongoose";

export interface ISaleItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  sku?: string;
  quantity: number;
  price: number;
  cost: number;
  discount: number;
  tax: number;
  total: number;
}

export interface IPaymentDetails {
  cash?: number;
  card?: number;
  mobileMoney?: number;
  change?: number;
}

export interface ISale extends Document {
  businessId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  invoiceNumber: string;
  items: ISaleItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  paymentMethod: string;
  paymentDetails: IPaymentDetails;
  status: "draft" | "completed" | "cancelled" | "refunded";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SaleSchema = new Schema<ISale>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch" },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    invoiceNumber: { type: String, required: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        sku: { type: String },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        cost: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        total: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true },
    discountTotal: { type: Number, default: 0 },
    taxTotal: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    paymentDetails: {
      cash: { type: Number, default: 0 },
      card: { type: Number, default: 0 },
      mobileMoney: { type: Number, default: 0 },
      change: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ["draft", "completed", "cancelled", "refunded"],
      default: "draft",
    },
    notes: { type: String },
  },
  { timestamps: true }
);

SaleSchema.index({ businessId: 1 });
SaleSchema.index({ businessId: 1, invoiceNumber: 1 }, { unique: true });
SaleSchema.index({ customerId: 1 });
SaleSchema.index({ userId: 1 });
SaleSchema.index({ branchId: 1 });
SaleSchema.index({ status: 1 });
SaleSchema.index({ createdAt: -1 });

export const Sale = mongoose.models.Sale || mongoose.model<ISale>("Sale", SaleSchema);
