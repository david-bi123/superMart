import { z } from "zod"

export const saleItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  name: z.string().min(1),
  sku: z.string().optional(),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  price: z.coerce.number().min(0),
  cost: z.coerce.number().min(0).default(0),
  discount: z.coerce.number().min(0).default(0),
  tax: z.coerce.number().min(0).default(0),
  total: z.coerce.number().min(0),
})

export const createSaleSchema = z.object({
  customerId: z.string().optional(),
  items: z.array(saleItemSchema).min(1, "At least one item is required"),
  subtotal: z.coerce.number().min(0),
  discountTotal: z.coerce.number().min(0).default(0),
  taxTotal: z.coerce.number().min(0).default(0),
  grandTotal: z.coerce.number().min(0),
  paymentMethod: z.enum(["cash", "card", "mobile_money", "credit", "mixed"]),
  paymentDetails: z.object({
    cash: z.coerce.number().min(0).default(0),
    card: z.coerce.number().min(0).default(0),
    mobileMoney: z.coerce.number().min(0).default(0),
    change: z.coerce.number().min(0).default(0),
  }).optional(),
  notes: z.string().optional(),
})

export const updateSaleSchema = z.object({
  customerId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(["draft", "completed", "cancelled", "refunded"]).optional(),
})

export const refundSaleSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.coerce.number().min(1),
    reason: z.string().optional(),
  })).optional(),
  reason: z.string().optional(),
})

export const salesFilterSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["draft", "completed", "cancelled", "refunded"]).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  customerId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
})

export type SaleItemInput = z.infer<typeof saleItemSchema>
export type CreateSaleInput = z.infer<typeof createSaleSchema>
export type UpdateSaleInput = z.infer<typeof updateSaleSchema>
export type RefundSaleInput = z.infer<typeof refundSaleSchema>
export type SalesFilterInput = z.infer<typeof salesFilterSchema>
