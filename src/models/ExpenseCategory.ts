import mongoose, { Schema, Document } from "mongoose";

export interface IExpenseCategory extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  budget?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseCategorySchema = new Schema<IExpenseCategory>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    budget: { type: Number },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ExpenseCategorySchema.index({ businessId: 1 });
ExpenseCategorySchema.index({ businessId: 1, name: 1 }, { unique: true });

export const ExpenseCategory =
  mongoose.models.ExpenseCategory ||
  mongoose.model<IExpenseCategory>("ExpenseCategory", ExpenseCategorySchema);
