import { z } from "zod"

export const createCustomerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  creditLimit: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
})

export const updateCustomerSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  creditLimit: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
})

export const customerFilterSchema = z.object({
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  hasBalance: z.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
})

export const addLoyaltyPointsSchema = z.object({
  customerId: z.string().min(1),
  points: z.coerce.number().int().min(1, "Points must be at least 1"),
  reason: z.string().optional(),
})

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>
export type CustomerFilterInput = z.infer<typeof customerFilterSchema>
export type AddLoyaltyPointsInput = z.infer<typeof addLoyaltyPointsSchema>
