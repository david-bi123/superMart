import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "super_admin" | "business_owner" | "manager" | "cashier" | "inventory_officer" | "accountant";
  businessId?: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  isVerified: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  lastLogin?: Date;
  lastLoginIp?: string;
  permissions: string[];
  refreshToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  verificationToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["super_admin", "business_owner", "manager", "cashier", "inventory_officer", "accountant"],
      required: true,
      default: "cashier",
    },
    businessId: { type: Schema.Types.ObjectId, ref: "Business" },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch" },
    avatar: { type: String },
    phone: { type: String },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
    lastLogin: { type: Date },
    lastLoginIp: { type: String },
    permissions: [{ type: String }],
    refreshToken: { type: String },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    verificationToken: { type: String },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1, businessId: 1 }, { unique: true });
UserSchema.index({ businessId: 1 });
UserSchema.index({ role: 1 });

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
