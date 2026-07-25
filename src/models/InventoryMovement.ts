import mongoose, { Schema, Document } from "mongoose";

export interface IInventoryMovement extends Document {
  businessId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: "stock_in" | "stock_out" | "adjustment" | "transfer" | "return" | "damaged" | "expired";
  quantity: number;
  reference?: string;
  notes?: string;
  batchNumber?: string;
  toBranchId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryMovementSchema = new Schema<IInventoryMovement>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch" },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["stock_in", "stock_out", "adjustment", "transfer", "return", "damaged", "expired"],
      required: true,
    },
    quantity: { type: Number, required: true },
    reference: { type: String },
    notes: { type: String },
    batchNumber: { type: String },
    toBranchId: { type: Schema.Types.ObjectId, ref: "Branch" },
  },
  { timestamps: true }
);

InventoryMovementSchema.index({ businessId: 1 });
InventoryMovementSchema.index({ productId: 1 });
InventoryMovementSchema.index({ branchId: 1 });
InventoryMovementSchema.index({ type: 1 });
InventoryMovementSchema.index({ createdAt: -1 });

export const InventoryMovement =
  mongoose.models.InventoryMovement ||
  mongoose.model<IInventoryMovement>("InventoryMovement", InventoryMovementSchema);
