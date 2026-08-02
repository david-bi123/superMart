"use server";

import { connectDB } from "@/lib/db/mongoose";
import { auth } from "@/lib/auth/config";
import { requirePermission } from "@/lib/auth/rbac";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { Brand } from "@/models/Brand";
import { Supplier } from "@/models/Supplier";
import { InventoryMovement } from "@/models/InventoryMovement";
import { AuditLog } from "@/models/AuditLog";
import { productSchema, categorySchema, brandSchema } from "@/lib/validations/inventory";
import slugify from "slugify";
import mongoose from "mongoose";

function getBusinessId(session: any): string {
  const bid = session?.user?.businessId;
  if (!bid) throw new Error("Not authenticated");
  return bid;
}

async function logAudit(session: any, businessId: string, action: string, resource: string, resourceId?: string, details?: any) {
  try {
    await AuditLog.create({
      businessId: new mongoose.Types.ObjectId(businessId),
      userId: session?.user?.id ? new mongoose.Types.ObjectId(session.user.id) : undefined,
      action,
      resource,
      resourceId,
      details,
    });
  } catch (e) {
    console.error("Audit log error:", e);
  }
}

export async function getProducts(filters: {
  search?: string;
  category?: string;
  brand?: string;
  status?: string;
  isArchived?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const {
      search = "",
      category = "",
      brand = "",
      status = "",
      isArchived = false,
      page = 1,
      limit = 20,
      sort = "createdAt",
      order = "desc",
    } = filters;

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
      query.$expr = { $and: [{ $ne: ["$minStock", 0] }, { $lte: ["$currentStock", "$minStock"] }, { $gt: ["$currentStock", 0] }] };
    } else if (status === "out_of_stock") {
      query.currentStock = { $lte: 0 };
    } else if (status === "in_stock") {
      query.currentStock = { $gt: 0 };
    }

    const sortObj: Record<string, 1 | -1> = {};
    sortObj[sort] = order === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("categoryId", "name")
        .populate("brandId", "name")
        .sort(sortObj)
        .skip(skip)
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
      currentStock: p.currentStock,
      minStock: p.minStock,
      maxStock: p.maxStock,
      images: p.images || [],
      category: (p.categoryId as any)?.name || "",
      categoryId: p.categoryId?._id?.toString() || p.categoryId?.toString() || "",
      brand: (p.brandId as any)?.name || "",
      brandId: p.brandId?._id?.toString() || p.brandId?.toString() || "",
      isActive: p.isActive,
      createdAt: p.createdAt?.toISOString(),
      updatedAt: p.updatedAt?.toISOString(),
    }));

    return {
      success: true as const,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  } catch (error) {
    console.error("getProducts error:", error);
    return { success: false as const, error: "Failed to fetch products" };
  }
}

export async function getProduct(id: string) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const product = await Product.findOne({
      _id: new mongoose.Types.ObjectId(id),
      businessId: new mongoose.Types.ObjectId(businessId),
    })
      .populate("categoryId", "name")
      .populate("brandId", "name")
      .populate("supplierId", "name company")
      .lean();

    if (!product) return { success: false as const, error: "Product not found" };

    return {
      success: true as const,
      data: {
        ...product,
        _id: product._id.toString(),
        categoryId: product.categoryId?._id?.toString() || product.categoryId?.toString() || "",
        brandId: product.brandId?._id?.toString() || product.brandId?.toString() || "",
        supplierId: product.supplierId?._id?.toString() || product.supplierId?.toString() || "",
        createdAt: product.createdAt?.toISOString(),
        updatedAt: product.updatedAt?.toISOString(),
      },
    };
  } catch (error) {
    console.error("getProduct error:", error);
    return { success: false as const, error: "Failed to fetch product" };
  }
}

export async function createProduct(data: unknown) {
  try {
    await connectDB();
    await requirePermission("products:create");
    const session = await auth();
    const businessId = getBusinessId(session);

    const parsed = productSchema.parse(data);

    const product = await Product.create({
      ...parsed,
      businessId: new mongoose.Types.ObjectId(businessId),
      categoryId: parsed.categoryId ? new mongoose.Types.ObjectId(parsed.categoryId) : undefined,
      brandId: parsed.brandId ? new mongoose.Types.ObjectId(parsed.brandId) : undefined,
      supplierId: parsed.supplierId ? new mongoose.Types.ObjectId(parsed.supplierId) : undefined,
      expiryDate: parsed.expiryDate ? new Date(parsed.expiryDate) : undefined,
      variants: parsed.variants.map((v: any) => ({
        ...v,
        price: Number(v.price),
        stock: Number(v.stock),
      })),
      images: parsed.images || [],
    });

    await logAudit(session, businessId, "create", "product", product._id.toString(), { name: product.name });

    return { success: true as const, data: { _id: product._id.toString() } };
  } catch (error: any) {
    console.error("createProduct error:", error);
    if (error?.issues) return { success: false as const, error: "Validation failed", details: error.issues };
    if (error?.code === 11000) return { success: false as const, error: "A product with this SKU already exists" };
    return { success: false as const, error: "Failed to create product" };
  }
}

export async function updateProduct(id: string, data: unknown) {
  try {
    await connectDB();
    await requirePermission("products:update");
    const session = await auth();
    const businessId = getBusinessId(session);

    const parsed = productSchema.parse(data);

    const updateData: Record<string, unknown> = { ...parsed };
    if (parsed.categoryId) updateData.categoryId = new mongoose.Types.ObjectId(parsed.categoryId);
    else updateData.categoryId = null;
    if (parsed.brandId) updateData.brandId = new mongoose.Types.ObjectId(parsed.brandId);
    else updateData.brandId = null;
    if (parsed.supplierId) updateData.supplierId = new mongoose.Types.ObjectId(parsed.supplierId);
    else updateData.supplierId = null;
    if (parsed.expiryDate) updateData.expiryDate = new Date(parsed.expiryDate);
    else updateData.expiryDate = null;
    updateData.variants = parsed.variants.map((v: any) => ({
      ...v,
      price: Number(v.price),
      stock: Number(v.stock),
    }));

    const product = await Product.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), businessId: new mongoose.Types.ObjectId(businessId) },
      { $set: updateData },
      { new: true }
    );

    if (!product) return { success: false as const, error: "Product not found" };

    await logAudit(session, businessId, "update", "product", id, { name: parsed.name });

    return { success: true as const, data: { _id: product._id.toString() } };
  } catch (error: any) {
    console.error("updateProduct error:", error);
    if (error?.issues) return { success: false as const, error: "Validation failed", details: error.issues };
    return { success: false as const, error: "Failed to update product" };
  }
}

export async function deleteProduct(id: string) {
  try {
    await connectDB();
    await requirePermission("products:delete");
    const session = await auth();
    const businessId = getBusinessId(session);

    const product = await Product.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), businessId: new mongoose.Types.ObjectId(businessId) },
      { $set: { isArchived: true, isActive: false } },
      { new: true }
    );

    if (!product) return { success: false as const, error: "Product not found" };

    await logAudit(session, businessId, "archive", "product", id);

    return { success: true as const, data: { _id: id } };
  } catch (error) {
    console.error("deleteProduct error:", error);
    return { success: false as const, error: "Failed to archive product" };
  }
}

export async function restoreProduct(id: string) {
  try {
    await requirePermission("products:update");
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const product = await Product.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), businessId: new mongoose.Types.ObjectId(businessId) },
      { $set: { isArchived: false, isActive: true } },
      { new: true }
    );

    if (!product) return { success: false as const, error: "Product not found" };

    await logAudit(session, businessId, "restore", "product", id);

    return { success: true as const, data: { _id: id } };
  } catch (error) {
    console.error("restoreProduct error:", error);
    return { success: false as const, error: "Failed to restore product" };
  }
}

export async function bulkUploadCSV(rows: unknown[]) {
  try {
    await requirePermission("products:create");
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const products = rows.map((row: any) => ({
      ...row,
      businessId: new mongoose.Types.ObjectId(businessId),
      purchasePrice: Number(row.purchasePrice) || 0,
      sellingPrice: Number(row.sellingPrice) || 0,
      currentStock: Number(row.currentStock) || 0,
      minStock: Number(row.minStock) || 0,
    }));

    const result = await Product.insertMany(products, { ordered: false });

    await logAudit(session, businessId, "bulk_upload", "product", undefined, { count: result.length });

    return { success: true as const, data: { count: result.length } };
  } catch (error: any) {
    console.error("bulkUploadCSV error:", error);
    return { success: false as const, error: "Bulk upload failed", details: error?.writeErrors?.length || 0 };
  }
}

export async function bulkExportCSV(filters: { search?: string; category?: string; brand?: string; status?: string }) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const query: Record<string, unknown> = { businessId: new mongoose.Types.ObjectId(businessId), isArchived: false };
    const { search = "", category = "", brand = "", status = "" } = filters;

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { name: { $regex: escaped, $options: "i" } },
        { sku: { $regex: escaped, $options: "i" } },
      ];
    }
    if (category) query.categoryId = new mongoose.Types.ObjectId(category);
    if (brand) query.brandId = new mongoose.Types.ObjectId(brand);
    if (status === "low_stock") query.$expr = { $lte: ["$currentStock", "$minStock"] };
    else if (status === "out_of_stock") query.currentStock = { $lte: 0 };

    const products = await Product.find(query).populate("categoryId", "name").populate("brandId", "name").lean();

    const header = "Name,SKU,Barcode,Category,Brand,Purchase Price,Selling Price,Stock,Min Stock\n";
    const rows = products.map((p) =>
      [
        `"${p.name}"`,
        p.sku || "",
        p.barcode || "",
        (p.categoryId as any)?.name || "",
        (p.brandId as any)?.name || "",
        p.purchasePrice,
        p.sellingPrice,
        p.currentStock,
        p.minStock,
      ].join(",")
    ).join("\n");

    return { success: true as const, data: header + rows };
  } catch (error) {
    console.error("bulkExportCSV error:", error);
    return { success: false as const, error: "Failed to export products" };
  }
}

export async function getCategories(businessId?: string) {
  try {
    await connectDB();
    const session = await auth();
    const bid = businessId || getBusinessId(session);

    const categories = await Category.find({
      businessId: new mongoose.Types.ObjectId(bid),
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
    }));

    return { success: true as const, data };
  } catch (error) {
    console.error("getCategories error:", error);
    return { success: false as const, error: "Failed to fetch categories" };
  }
}

export async function createCategory(data: unknown) {
  try {
    await requirePermission("products:create");
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const parsed = categorySchema.parse(data);
    const slug = slugify(parsed.name, { lower: true, strict: true });

    const category = await Category.create({
      name: parsed.name,
      slug,
      businessId: new mongoose.Types.ObjectId(businessId),
      description: parsed.description,
      parentId: parsed.parentId ? new mongoose.Types.ObjectId(parsed.parentId) : undefined,
      image: parsed.image,
      sortOrder: parsed.sortOrder,
    });

    await logAudit(session, businessId, "create", "category", category._id.toString(), { name: parsed.name });

    return { success: true as const, data: { _id: category._id.toString(), name: category.name, slug: category.slug } };
  } catch (error: any) {
    console.error("createCategory error:", error);
    if (error?.issues) return { success: false as const, error: "Validation failed", details: error.issues };
    return { success: false as const, error: "Failed to create category" };
  }
}

export async function updateCategory(id: string, data: unknown) {
  try {
    await requirePermission("products:update");
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const parsed = categorySchema.parse(data);
    const slug = slugify(parsed.name, { lower: true, strict: true });

    const category = await Category.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), businessId: new mongoose.Types.ObjectId(businessId) },
      {
        $set: {
          name: parsed.name,
          slug,
          description: parsed.description,
          parentId: parsed.parentId ? new mongoose.Types.ObjectId(parsed.parentId) : null,
          image: parsed.image,
          sortOrder: parsed.sortOrder,
        },
      },
      { new: true }
    );

    if (!category) return { success: false as const, error: "Category not found" };

    await logAudit(session, businessId, "update", "category", id);

    return { success: true as const, data: { _id: id } };
  } catch (error: any) {
    if (error?.issues) return { success: false as const, error: "Validation failed", details: error.issues };
    return { success: false as const, error: "Failed to update category" };
  }
}

export async function deleteCategory(id: string) {
  try {
    await requirePermission("products:delete");
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    await Category.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(id),
      businessId: new mongoose.Types.ObjectId(businessId),
    });

    await Category.updateMany(
      { parentId: new mongoose.Types.ObjectId(id), businessId: new mongoose.Types.ObjectId(businessId) },
      { $set: { parentId: null } }
    );

    await logAudit(session, businessId, "delete", "category", id);

    return { success: true as const, data: { _id: id } };
  } catch (error) {
    return { success: false as const, error: "Failed to delete category" };
  }
}

export async function getBrands() {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const brands = await Brand.find({ businessId: new mongoose.Types.ObjectId(businessId) })
      .sort({ name: 1 })
      .lean();

    const data = brands.map((b) => ({
      _id: b._id.toString(),
      name: b.name,
      slug: b.slug,
      description: b.description || "",
      logo: b.logo || "",
      isActive: b.isActive,
    }));

    return { success: true as const, data };
  } catch (error) {
    return { success: false as const, error: "Failed to fetch brands" };
  }
}

export async function createBrand(data: unknown) {
  try {
    await requirePermission("products:create");
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const parsed = brandSchema.parse(data);
    const slug = slugify(parsed.name, { lower: true, strict: true });

    const brand = await Brand.create({
      name: parsed.name,
      slug,
      businessId: new mongoose.Types.ObjectId(businessId),
      description: parsed.description,
      logo: parsed.logo,
    });

    await logAudit(session, businessId, "create", "brand", brand._id.toString(), { name: parsed.name });

    return { success: true as const, data: { _id: brand._id.toString(), name: brand.name } };
  } catch (error: any) {
    if (error?.issues) return { success: false as const, error: "Validation failed", details: error.issues };
    return { success: false as const, error: "Failed to create brand" };
  }
}

export async function updateBrand(id: string, data: unknown) {
  try {
    await requirePermission("products:update");
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const parsed = brandSchema.parse(data);
    const slug = slugify(parsed.name, { lower: true, strict: true });

    const brand = await Brand.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), businessId: new mongoose.Types.ObjectId(businessId) },
      { $set: { name: parsed.name, slug, description: parsed.description, logo: parsed.logo } },
      { new: true }
    );

    if (!brand) return { success: false as const, error: "Brand not found" };
    await logAudit(session, businessId, "update", "brand", id);

    return { success: true as const, data: { _id: id } };
  } catch (error: any) {
    if (error?.issues) return { success: false as const, error: "Validation failed", details: error.issues };
    return { success: false as const, error: "Failed to update brand" };
  }
}

export async function deleteBrand(id: string) {
  try {
    await requirePermission("products:delete");
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    await Brand.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(id),
      businessId: new mongoose.Types.ObjectId(businessId),
    });

    await logAudit(session, businessId, "delete", "brand", id);
    return { success: true as const, data: { _id: id } };
  } catch (error) {
    return { success: false as const, error: "Failed to delete brand" };
  }
}

export async function getSuppliers() {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const suppliers = await Supplier.find({ businessId: new mongoose.Types.ObjectId(businessId) })
      .sort({ name: 1 })
      .lean();

    const data = suppliers.map((s) => ({
      _id: s._id.toString(),
      name: s.name,
      company: s.company || "",
      email: s.email || "",
      phone: s.phone || "",
      address: s.address || "",
      taxId: s.taxId || "",
      paymentTerms: s.paymentTerms || "",
      isActive: s.isActive,
    }));

    return { success: true as const, data };
  } catch (error) {
    return { success: false as const, error: "Failed to fetch suppliers" };
  }
}

export async function getInventoryMovements(productId: string) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const movements = await InventoryMovement.find({
      businessId: new mongoose.Types.ObjectId(businessId),
      productId: new mongoose.Types.ObjectId(productId),
    })
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const data = movements.map((m) => ({
      _id: m._id.toString(),
      type: m.type,
      quantity: m.quantity,
      reference: m.reference || "",
      notes: m.notes || "",
      batchNumber: m.batchNumber || "",
      user: (m.userId as any)?.name || "Unknown",
      createdAt: m.createdAt?.toISOString(),
    }));

    return { success: true as const, data };
  } catch (error) {
    return { success: false as const, error: "Failed to fetch movements" };
  }
}

export async function adjustStock(productId: string, quantity: number, reason: string) {
  try {
    await connectDB();
    await requirePermission("inventory:adjust");
    const session = await auth();
    const businessId = getBusinessId(session);
    const userId = session?.user?.id;

    const product = await Product.findOne({
      _id: new mongoose.Types.ObjectId(productId),
      businessId: new mongoose.Types.ObjectId(businessId),
    });

    if (!product) return { success: false as const, error: "Product not found" };

    const type = quantity >= 0 ? "stock_in" : "stock_out";

    product.currentStock += quantity;
    await product.save();

    await InventoryMovement.create({
      businessId: new mongoose.Types.ObjectId(businessId),
      productId: new mongoose.Types.ObjectId(productId),
      userId: new mongoose.Types.ObjectId(userId),
      type: quantity >= 0 ? "stock_in" : "stock_out",
      quantity: Math.abs(quantity),
      notes: reason,
    });

    await logAudit(session, businessId, "stock_adjustment", "product", productId, { quantity, reason, type });

    return { success: true as const, data: { currentStock: product.currentStock } };
  } catch (error) {
    return { success: false as const, error: "Failed to adjust stock" };
  }
}

export async function transferStock(productId: string, fromBranch: string, toBranch: string, quantity: number) {
  try {
    await connectDB();
    await requirePermission("inventory:transfer");
    const session = await auth();
    const businessId = getBusinessId(session);
    const userId = session?.user?.id;

    const product = await Product.findOne({
      _id: new mongoose.Types.ObjectId(productId),
      businessId: new mongoose.Types.ObjectId(businessId),
    });

    if (!product) return { success: false as const, error: "Product not found" };
    if (product.currentStock < quantity) return { success: false as const, error: "Insufficient stock" };

    const movement = await InventoryMovement.create({
      businessId: new mongoose.Types.ObjectId(businessId),
      productId: new mongoose.Types.ObjectId(productId),
      userId: new mongoose.Types.ObjectId(userId),
      type: "transfer",
      quantity,
      branchId: new mongoose.Types.ObjectId(fromBranch),
      toBranchId: new mongoose.Types.ObjectId(toBranch),
    });

    await logAudit(session, businessId, "stock_transfer", "product", productId, { fromBranch, toBranch, quantity });

    return { success: true as const, data: { _id: movement._id.toString() } };
  } catch (error) {
    return { success: false as const, error: "Failed to transfer stock" };
  }
}

export async function getLowStockProducts() {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const products = await Product.find({
      businessId: new mongoose.Types.ObjectId(businessId),
      isArchived: false,
      $expr: {
        $and: [
          { $ne: ["$minStock", 0] },
          { $lte: ["$currentStock", "$minStock"] },
        ],
      },
    })
      .select("name sku sellingPrice currentStock minStock images")
      .sort({ currentStock: 1 })
      .lean();

    const data = products.map((p) => ({
      _id: p._id.toString(),
      name: p.name,
      sku: p.sku || "",
      sellingPrice: p.sellingPrice,
      currentStock: p.currentStock,
      minStock: p.minStock,
      image: p.images?.[0] || "",
    }));

    return { success: true as const, data };
  } catch (error) {
    return { success: false as const, error: "Failed to fetch low stock products" };
  }
}

export async function getExpiringProducts(days: number = 30) {
  try {
    await connectDB();
    const session = await auth();
    const businessId = getBusinessId(session);

    const threshold = new Date();
    threshold.setDate(threshold.getDate() + days);

    const products = await Product.find({
      businessId: new mongoose.Types.ObjectId(businessId),
      isArchived: false,
      expiryDate: { $ne: null, $lte: threshold },
    })
      .select("name sku sellingPrice currentStock expiryDate batchNumber images")
      .sort({ expiryDate: 1 })
      .lean();

    const data = products.map((p) => ({
      _id: p._id.toString(),
      name: p.name,
      sku: p.sku || "",
      sellingPrice: p.sellingPrice,
      currentStock: p.currentStock,
      expiryDate: p.expiryDate?.toISOString().split("T")[0] || "",
      batchNumber: p.batchNumber || "",
      image: p.images?.[0] || "",
    }));

    return { success: true as const, data };
  } catch (error) {
    return { success: false as const, error: "Failed to fetch expiring products" };
  }
}
