import mongoose, { Schema, Document } from "mongoose";

export interface IExpense extends Document {
  businessId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  categoryId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number;
  description: string;
  date: Date;
  isRecurring: boolean;
  recurringInterval?: "daily" | "weekly" | "monthly" | "yearly";
  attachment?: string;
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch" },
    categoryId: { type: Schema.Types.ObjectId, ref: "ExpenseCategory" },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    isRecurring: { type: Boolean, default: false },
    recurringInterval: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
    },
    attachment: { type: String },
    paymentMethod: { type: String },
  },
  { timestamps: true }
);

ExpenseSchema.index({ businessId: 1 });
ExpenseSchema.index({ branchId: 1 });
ExpenseSchema.index({ categoryId: 1 });
ExpenseSchema.index({ date: -1 });

export const Expense =
  mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema);
