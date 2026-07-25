import { z } from "zod"

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  supplierId: z.string().optional(),
  description: z.string().optional(),
  purchasePrice: z.coerce.number().min(0, "Must be at least 0"),
  sellingPrice: z.coerce.number().min(0, "Must be at least 0"),
  wholesalePrice: z.coerce.number().min(0).optional(),
  discountPrice: z.coerce.number().min(0).optional(),
  minStock: z.coerce.number().min(0).default(0),
  maxStock: z.coerce.number().min(0).optional(),
  currentStock: z.coerce.number().min(0).default(0),
  warehouse: z.string().optional(),
  shelf: z.string().optional(),
  expiryDate: z.string().optional(),
  batchNumber: z.string().optional(),
  tax: z.coerce.number().min(0).max(100).default(0),
  images: z.array(z.string()).default([]),
  variants: z.array(z.object({
    name: z.string().min(1, "Variant name required"),
    value: z.string().min(1, "Variant value required"),
    price: z.coerce.number().min(0),
    stock: z.coerce.number().min(0).default(0),
    sku: z.string().optional(),
  })).default([]),
  weight: z.coerce.number().min(0).optional(),
  volume: z.coerce.number().min(0).optional(),
  unit: z.string().optional(),
  isActive: z.boolean().default(true),
  trackSerial: z.boolean().default(false),
  trackBatch: z.boolean().default(false),
  trackExpiry: z.boolean().default(false),
})

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  parentId: z.string().optional(),
  image: z.string().optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
})

export const brandSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  logo: z.string().optional(),
})

export const supplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  company: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
  paymentTerms: z.string().optional(),
})

export type ProductInput = z.infer<typeof productSchema>
export type CategoryInput = z.infer<typeof categorySchema>
export type BrandInput = z.infer<typeof brandSchema>
export type SupplierInput = z.infer<typeof supplierSchema>
