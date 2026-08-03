import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { connectDB } from "@/lib/db/mongoose";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { Brand } from "@/models/Brand";
import { productSchema } from "@/lib/validations/inventory";
import mongoose from "mongoose";

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
    const brand = searchParams.get("brand") || "";
    const status = searchParams.get("status") || "";
    const isArchived = searchParams.get("isArchived") === "true";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") === "asc" ? 1 : -1;

    const businessId = session.user.businessId;
    const query: Record<string, unknown> = { businessId: new mongoose.Types.ObjectId(businessId), isArchived };

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { name: { $regex: escaped, $options: "i" } },
        { sku: { $regex: escaped, $options: "i" } },
        { barcode: { $regex: escaped, $options: "i" } },
      ];
    }

    if (category) query.categoryId = new mongoose.Types.ObjectId(category);
    if (brand) query.brandId = new mongoose.Types.ObjectId(brand);

    if (status === "low_stock") {
      query.$expr = {
        $and: [
          { $ne: ["$minStock", 0] },
          { $lte: ["$currentStock", "$minStock"] },
          { $gt: ["$currentStock", 0] },
        ],
      };
    } else if (status === "out_of_stock") {
      query.currentStock = { $lte: 0 };
    } else if (status === "in_stock") {
      query.currentStock = { $gt: 0 };
    }

    const sortObj: Record<string, 1 | -1> = { [sort]: order };

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate({ path: "categoryId", select: "name", model: Category })
        .populate({ path: "brandId", select: "name", model: Brand })
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    const data = products.map((p) => ({
      _id: p._id.toString(),
      name: p.name,
      sku: p.sku || "",
      barcode: p.barcode || "",
      sellingPrice: p.sellingPrice,
      purchasePrice: p.purchasePrice,
      wholesalePrice: p.wholesalePrice,
      discountPrice: p.discountPrice,
      currentStock: p.currentStock,
      minStock: p.minStock,
      maxStock: p.maxStock,
      images: p.images || [],
      category: (p.categoryId as any)?.name || "",
      categoryId: p.categoryId?._id?.toString() || p.categoryId?.toString() || "",
      brand: (p.brandId as any)?.name || "",
      brandId: p.brandId?._id?.toString() || p.brandId?.toString() || "",
      isActive: p.isActive,
      tax: p.tax,
      unit: p.unit,
      createdAt: p.createdAt?.toISOString(),
      updatedAt: p.updatedAt?.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 });
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
    const parsed = productSchema.parse(body);

    const product = await Product.create({
      ...parsed,
      businessId: new mongoose.Types.ObjectId(session.user.businessId),
      categoryId: parsed.categoryId ? new mongoose.Types.ObjectId(parsed.categoryId) : undefined,
      brandId: parsed.brandId ? new mongoose.Types.ObjectId(parsed.brandId) : undefined,
      supplierId: parsed.supplierId ? new mongoose.Types.ObjectId(parsed.supplierId) : undefined,
      expiryDate: parsed.expiryDate ? new Date(parsed.expiryDate) : undefined,
    });

    return NextResponse.json(
      { success: true, data: { _id: product._id.toString() } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/products error:", error);
    if (error?.issues) {
      return NextResponse.json({ success: false, error: "Validation failed", details: error.issues }, { status: 400 });
    }
    if (error?.code === 11000) {
      return NextResponse.json({ success: false, error: "Duplicate SKU or barcode" }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: "Failed to create product" }, { status: 500 });
  }
}
