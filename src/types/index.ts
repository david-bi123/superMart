export type UserRole =
  | "super_admin"
  | "business_owner"
  | "manager"
  | "cashier"
  | "inventory_officer"
  | "accountant";

export type SubscriptionTier = "free" | "starter" | "professional" | "enterprise";

export type PaymentMethod = "cash" | "card" | "mobile_money" | "split" | "gift_card" | "credit";

export type SaleStatus = "draft" | "completed" | "cancelled" | "refunded";

export type InventoryMovementType =
  | "stock_in"
  | "stock_out"
  | "adjustment"
  | "transfer"
  | "return"
  | "damaged"
  | "expired";

export type PurchaseOrderStatus = "pending" | "approved" | "received" | "partial" | "cancelled";

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface DashboardStats {
  todaySales: number;
  todayOrders: number;
  revenue: number;
  profit: number;
  expenses: number;
  lowStock: number;
  outOfStock: number;
  inventoryValue: number;
  topProducts: { name: string; sold: number; revenue: number }[];
  recentSales: any[];
  salesChart: { date: string; sales: number; profit: number }[];
  monthlyComparison: { month: string; sales: number; profit: number; expenses: number }[];
}

export interface ReceiptData {
  businessName: string;
  businessLogo?: string;
  address: string;
  phone: string;
  tin?: string;
  cashier: string;
  customer?: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  paymentMethod: string;
  amountPaid: number;
  change: number;
  receiptNumber: string;
  date: Date;
  footer?: string;
}
