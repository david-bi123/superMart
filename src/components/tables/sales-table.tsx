"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Eye,
  Ban,
  RotateCcw,
  MoreHorizontal,
  ArrowUpDown,
  Search,
} from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface SaleRow {
  _id: string
  invoiceNumber: string
  customerId: string
  customerName: string
  customerEmail: string
  itemsCount: number
  subtotal: number
  discountTotal: number
  taxTotal: number
  grandTotal: number
  paymentMethod: string
  status: "draft" | "completed" | "cancelled" | "refunded"
  createdAt: string
}

interface SalesTableProps {
  data: SaleRow[]
  loading?: boolean
  totalPages?: number
  page?: number
  onPageChange?: (page: number) => void
  search?: string
  onSearchChange?: (value: string) => void
  statusFilter?: string
  onStatusFilterChange?: (value: string) => void
  dateFrom?: string
  dateTo?: string
  onDateFromChange?: (value: string) => void
  onDateToChange?: (value: string) => void
  onView?: (id: string) => void
  onCancel?: (id: string) => void
  onRefund?: (id: string) => void
  sortColumn?: string
  sortDirection?: "asc" | "desc"
  onSort?: (column: string) => void
}

const statusConfig: Record<string, { variant: "success" | "warning" | "destructive" | "outline"; label: string }> = {
  completed: { variant: "success", label: "Completed" },
  draft: { variant: "outline", label: "Draft" },
  cancelled: { variant: "destructive", label: "Cancelled" },
  refunded: { variant: "warning", label: "Refunded" },
}

const paymentLabels: Record<string, string> = {
  cash: "Cash",
  card: "Card",
  mobile_money: "Mobile Money",
  credit: "Credit",
  mixed: "Mixed",
}

function SortableHeader({
  column,
  label,
  sortColumn,
  sortDirection,
  onSort,
}: {
  column: string
  label: string
  sortColumn?: string
  sortDirection?: "asc" | "desc"
  onSort?: (column: string) => void
}) {
  const isActive = sortColumn === column
  return (
    <th
      className={cn(
        "p-3 text-left text-xs font-medium uppercase tracking-wider transition-colors",
        isActive ? "text-white" : "text-white/50",
        onSort && "cursor-pointer hover:text-white/80"
      )}
      onClick={() => onSort?.(column)}
    >
      <span className="inline-flex items-center gap-1.5">
        {label}
        <ArrowUpDown className="h-3 w-3" />
      </span>
    </th>
  )
}

export function SalesTable({
  data,
  loading = false,
  totalPages = 1,
  page = 1,
  onPageChange,
  search,
  onSearchChange,
  statusFilter = "",
  onStatusFilterChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onView,
  onCancel,
  onRefund,
  sortColumn = "createdAt",
  sortDirection = "desc",
  onSort,
}: SalesTableProps) {
  const router = useRouter()

  const handleView = (id: string) => {
    if (onView) onView(id)
    else router.push(`/sales/${id}`)
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={<Search className="h-8 w-8" />}
        title="No sales found"
        description={
          search || statusFilter || dateFrom || dateTo
            ? "Try adjusting your filters"
            : "No sales have been recorded yet"
        }
      />
    )
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <SortableHeader column="invoiceNumber" label="Invoice#" sortColumn={sortColumn} sortDirection={sortDirection} onSort={onSort} />
              <SortableHeader column="createdAt" label="Date" sortColumn={sortColumn} sortDirection={sortDirection} onSort={onSort} />
              <th className="p-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Customer</th>
              <th className="p-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Items</th>
              <SortableHeader column="grandTotal" label="Total" sortColumn={sortColumn} sortDirection={sortDirection} onSort={onSort} />
              <th className="p-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Payment</th>
              <SortableHeader column="status" label="Status" sortColumn={sortColumn} sortDirection={sortDirection} onSort={onSort} />
              <th className="w-16 p-3 text-right text-xs font-medium text-white/50 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((sale, index) => {
              const statusCfg = statusConfig[sale.status] || statusConfig.draft
              return (
                <motion.tr
                  key={sale._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="border-b border-white/5 transition-colors hover:bg-white/[0.03] cursor-pointer"
                  onClick={() => handleView(sale._id)}
                >
                  <td className="p-3">
                    <span className="text-sm font-mono font-medium text-white">
                      {sale.invoiceNumber}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-sm text-white/70">
                      {new Date(sale.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <br />
                    <span className="text-xs text-white/40">
                      {new Date(sale.createdAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-sm text-white/80">{sale.customerName}</span>
                  </td>
                  <td className="p-3">
                    <span className="text-sm text-white/60">{sale.itemsCount} item{sale.itemsCount !== 1 ? "s" : ""}</span>
                  </td>
                  <td className="p-3">
                    <span className="text-sm font-semibold text-white">
                      ${sale.grandTotal.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-xs text-white/50 capitalize">
                      {paymentLabels[sale.paymentMethod] || sale.paymentMethod}
                    </span>
                  </td>
                  <td className="p-3">
                    <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                  </td>
                  <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => handleView(sale._id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        {sale.status === "completed" && (
                          <>
                            <DropdownMenuItem
                              onClick={() => onCancel?.(sale._id)}
                              className="text-amber-400"
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Cancel
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onRefund?.(sale._id)}
                              className="text-red-400"
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Refund
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-white/40">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SalesTable
