import mongoose, { Schema, Document } from "mongoose";

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  businessId?: mongoose.Types.ObjectId;
  token: string;
  ip?: string;
  userAgent?: string;
  expiresAt: Date;
  isValid: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    businessId: { type: Schema.Types.ObjectId, ref: "Business" },
    token: { type: String, required: true },
    ip: { type: String },
    userAgent: { type: String },
    expiresAt: { type: Date, required: true },
    isValid: { type: Boolean, default: true },
  },
  { timestamps: true }
);

SessionSchema.index({ token: 1 }, { unique: true });
SessionSchema.index({ userId: 1 });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session =
  mongoose.models.Session || mongoose.model<ISession>("Session", SessionSchema);
