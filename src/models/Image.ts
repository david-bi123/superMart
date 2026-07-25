import mongoose, { Schema, Document } from "mongoose";

export interface IImage extends Document {
  businessId: mongoose.Types.ObjectId;
  url: string;
  publicId?: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  isThumbnail: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ImageSchema = new Schema<IImage>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    url: { type: String, required: true },
    publicId: { type: String },
    format: { type: String },
    width: { type: Number },
    height: { type: Number },
    bytes: { type: Number },
    isThumbnail: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ImageSchema.index({ businessId: 1 });
ImageSchema.index({ publicId: 1 }, { sparse: true });

export const Image = mongoose.models.Image || mongoose.model<IImage>("Image", ImageSchema);
