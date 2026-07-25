import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  businessId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  sentAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    link: { type: String },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

NotificationSchema.index({ businessId: 1 });
NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ sentAt: -1 });

export const Notification =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);
