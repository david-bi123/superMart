import { z } from "zod"

export const expenseSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  paymentMethod: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurringInterval: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
  attachment: z.string().optional(),
  branchId: z.string().optional(),
})

export const expenseCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  budget: z.coerce.number().min(0).optional(),
})

export const expenseFilterSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
})

export type ExpenseInput = z.infer<typeof expenseSchema>
export type ExpenseCategoryInput = z.infer<typeof expenseCategorySchema>
export type ExpenseFilterInput = z.infer<typeof expenseFilterSchema>
