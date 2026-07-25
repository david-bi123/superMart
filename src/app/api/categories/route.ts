import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { connectDB } from "@/lib/db/mongoose";
import { Category } from "@/models/Category";
import { categorySchema } from "@/lib/validations/inventory";
import slugify from "slugify";
import mongoose from "mongoose";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.businessId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const categories = await Category.find({
      businessId: new mongoose.Types.ObjectId(session.user.businessId),
    })
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    const data = categories.map((c) => ({
      _id: c._id.toString(),
      name: c.name,
      slug: c.slug,
      parentId: c.parentId?.toString() || null,
      description: c.description || "",
      image: c.image || "",
      isActive: c.isActive,
      sortOrder: c.sortOrder,
      createdAt: c.createdAt?.toISOString(),
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const parsed = categorySchema.parse(body);

    const slug = slugify(parsed.name, { lower: true, strict: true });

    const category = await Category.create({
      name: parsed.name,
      slug,
      businessId: new mongoose.Types.ObjectId(session.user.businessId),
      description: parsed.description,
      parentId: parsed.parentId ? new mongoose.Types.ObjectId(parsed.parentId) : undefined,
      image: parsed.image,
      sortOrder: parsed.sortOrder,
    });

    return NextResponse.json(
      { success: true, data: { _id: category._id.toString(), name: category.name, slug: category.slug } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/categories error:", error);
    if (error?.issues) {
      return NextResponse.json({ success: false, error: "Validation failed", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Failed to create category" }, { status: 500 });
  }
}
