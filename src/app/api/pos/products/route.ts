import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { connectDB } from "@/lib/db/mongoose";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));

    const businessId = session.user.businessId;
    const filter: Record<string, unknown> = {
      businessId,
      isActive: true,
      isArchived: false,
    };

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: { $regex: escaped, $options: "i" } },
        { sku: { $regex: escaped, $options: "i" } },
        { barcode: { $regex: escaped, $options: "i" } },
      ];
    }

    if (category) {
      filter.categoryId = category;
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .select("name sku sellingPrice currentStock images categoryId barcode tax")
        .populate({ path: "categoryId", select: "name", model: Category })
        .sort({ name: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    const data = products.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      sku: p.sku || "",
      price: p.sellingPrice,
      image: p.images?.[0] || "",
      stock: p.currentStock,
      category: (p.categoryId as { name?: string } as any)?.name || "",
      categoryId: p.categoryId?._id?.toString() || p.categoryId?.toString() || "",
      barcode: p.barcode || "",
      tax: p.tax || 0,
    }));

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("POS products fetch error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 });
  }
}
