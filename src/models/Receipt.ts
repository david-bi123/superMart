import mongoose, { Schema, Document } from "mongoose";

export interface IReceiptItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface IReceipt extends Document {
  businessId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  saleId: mongoose.Types.ObjectId;
  receiptNumber: string;
  customerName?: string;
  items: IReceiptItem[];
  subtotal: number;
  tax: number;
  discount: number;
  grandTotal: number;
  paymentMethod: string;
  qrCode?: string;
  publicUrl?: string;
  verifiedAt?: Date;
  emailedAt?: Date;
  printedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReceiptSchema = new Schema<IReceipt>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch" },
    saleId: { type: Schema.Types.ObjectId, ref: "Sale", required: true },
    receiptNumber: { type: String, required: true },
    customerName: { type: String },
    items: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        total: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    qrCode: { type: String },
    publicUrl: { type: String },
    verifiedAt: { type: Date },
    emailedAt: { type: Date },
    printedAt: { type: Date },
  },
  { timestamps: true }
);

ReceiptSchema.index({ businessId: 1 });
ReceiptSchema.index({ businessId: 1, receiptNumber: 1 }, { unique: true });
ReceiptSchema.index({ saleId: 1 });

export const Receipt =
  mongoose.models.Receipt || mongoose.model<IReceipt>("Receipt", ReceiptSchema);
