import { z } from "zod"

export const businessProfileSchema = z.object({
  name: z.string().min(1, "Business name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone is required"),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional(),
  }),
  logo: z.string().optional(),
  tin: z.string().optional(),
  currency: z.string().min(1),
  timezone: z.string().min(1),
})

export const businessSettingsSchema = z.object({
  currency: z.string().min(1),
  timezone: z.string().min(1),
  dateFormat: z.string().min(1),
  receiptFooter: z.string().optional(),
  receiptTerms: z.string().optional(),
  defaultTax: z.coerce.number().min(0).default(0),
  enableMultiCurrency: z.boolean().default(false),
  enableLoyalty: z.boolean().default(true),
  enableBranches: z.boolean().default(false),
  enableSerialTracking: z.boolean().default(false),
  enableBatchTracking: z.boolean().default(true),
  enableExpiryTracking: z.boolean().default(true),
})

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["super_admin", "business_owner", "manager", "cashier", "inventory_officer", "accountant"]),
  phone: z.string().optional(),
})

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(["super_admin", "business_owner", "manager", "cashier", "inventory_officer", "accountant"]).optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
})

export const createTaxSchema = z.object({
  name: z.string().min(1, "Tax name is required"),
  rate: z.coerce.number().min(0, "Rate must be at least 0").max(100, "Rate cannot exceed 100"),
  type: z.enum(["inclusive", "exclusive"]).default("exclusive"),
  isDefault: z.boolean().default(false),
})

export const updateTaxSchema = z.object({
  name: z.string().min(1).optional(),
  rate: z.coerce.number().min(0).max(100).optional(),
  type: z.enum(["inclusive", "exclusive"]).optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
})

export const notificationFilterSchema = z.object({
  type: z.string().optional(),
  read: z.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const auditLogFilterSchema = z.object({
  action: z.string().optional(),
  userId: z.string().optional(),
  resource: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})

export type BusinessProfileInput = z.infer<typeof businessProfileSchema>
export type BusinessSettingsInput = z.infer<typeof businessSettingsSchema>
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type CreateTaxInput = z.infer<typeof createTaxSchema>
export type UpdateTaxInput = z.infer<typeof updateTaxSchema>
export type NotificationFilterInput = z.infer<typeof notificationFilterSchema>
export type AuditLogFilterInput = z.infer<typeof auditLogFilterSchema>
