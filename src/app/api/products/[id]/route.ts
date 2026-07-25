import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { connectDB } from "@/lib/db/mongoose";
import { Product } from "@/models/Product";
import { productSchema } from "@/lib/validations/inventory";
import mongoose from "mongoose";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const product = await Product.findOne({
      _id: new mongoose.Types.ObjectId(id),
      businessId: new mongoose.Types.ObjectId(session.user.businessId),
    })
      .populate("categoryId", "name slug")
      .populate("brandId", "name slug")
      .populate("supplierId", "name company email phone")
      .lean();

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const parsed = productSchema.partial().parse(body);

    const updateData: Record<string, unknown> = { ...parsed };
    if (parsed.categoryId) updateData.categoryId = new mongoose.Types.ObjectId(parsed.categoryId);
    else if (parsed.categoryId === null) updateData.categoryId = null;
    if (parsed.brandId) updateData.brandId = new mongoose.Types.ObjectId(parsed.brandId);
    else if (parsed.brandId === null) updateData.brandId = null;
    if (parsed.supplierId) updateData.supplierId = new mongoose.Types.ObjectId(parsed.supplierId);
    else if (parsed.supplierId === null) updateData.supplierId = null;

    const product = await Product.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), businessId: new mongoose.Types.ObjectId(session.user.businessId) },
      { $set: updateData },
      { new: true }
    );

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { _id: product._id.toString() } });
  } catch (error: any) {
    console.error("PATCH /api/products/[id] error:", error);
    if (error?.issues) {
      return NextResponse.json({ success: false, error: "Validation failed", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const product = await Product.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), businessId: new mongoose.Types.ObjectId(session.user.businessId) },
      { $set: { isArchived: true, isActive: false } },
      { new: true }
    );

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { _id: id } });
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to archive product" }, { status: 500 });
  }
}
