"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Eye,
  Pencil,
  MoreHorizontal,
  ArrowUpDown,
  Search,
} from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { Avatar, AvatarFallback, getInitials } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface CustomerRow {
  _id: string
  name: string
  email: string
  phone: string
  loyaltyPoints: number
  totalPurchases: number
  balance: number
  creditLimit: number
  isActive: boolean
  createdAt: string
}

interface CustomersTableProps {
  data: CustomerRow[]
  loading?: boolean
  totalPages?: number
  page?: number
  onPageChange?: (page: number) => void
  search?: string
  onSearchChange?: (value: string) => void
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  sortColumn?: string
  sortDirection?: "asc" | "desc"
  onSort?: (column: string) => void
}

function SortableHeader({
  column,
  label,
  sortColumn,
  sortDirection,
  onSort,
  className,
}: {
  column: string
  label: string
  sortColumn?: string
  sortDirection?: "asc" | "desc"
  onSort?: (column: string) => void
  className?: string
}) {
  const isActive = sortColumn === column
  return (
    <th
      className={cn(
        "p-3 text-left text-xs font-medium uppercase tracking-wider transition-colors",
        isActive ? "text-white" : "text-white/50",
        onSort && "cursor-pointer hover:text-white/80",
        className
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

export function CustomersTable({
  data,
  loading = false,
  totalPages = 1,
  page = 1,
  onPageChange,
  onView,
  onEdit,
  sortColumn = "createdAt",
  sortDirection = "desc",
  onSort,
}: CustomersTableProps) {
  const router = useRouter()

  const handleView = (id: string) => {
    if (onView) onView(id)
    else router.push(`/customers/${id}`)
  }

  const handleEdit = (id: string) => {
    if (onEdit) onEdit(id)
    else router.push(`/customers/${id}/edit`)
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3">
            <Skeleton variant="circular" className="h-10 w-10" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
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
        title="No customers found"
        description="Try adjusting your search or filters"
      />
    )
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <SortableHeader column="name" label="Customer" sortColumn={sortColumn} sortDirection={sortDirection} onSort={onSort} />
              <th className="p-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Contact</th>
              <SortableHeader column="loyaltyPoints" label="Points" sortColumn={sortColumn} sortDirection={sortDirection} onSort={onSort} className="text-right" />
              <SortableHeader column="totalPurchases" label="Total Purchases" sortColumn={sortColumn} sortDirection={sortDirection} onSort={onSort} className="text-right" />
              <SortableHeader column="balance" label="Balance" sortColumn={sortColumn} sortDirection={sortDirection} onSort={onSort} className="text-right" />
              <th className="p-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Status</th>
              <th className="w-16 p-3 text-right text-xs font-medium text-white/50 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((customer, index) => (
              <motion.tr
                key={customer._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="border-b border-white/5 transition-colors hover:bg-white/[0.03] cursor-pointer"
                onClick={() => handleView(customer._id)}
              >
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-white">{customer.name}</p>
                      {customer.email && (
                        <p className="text-xs text-white/40">{customer.email}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  {customer.phone ? (
                    <span className="text-sm text-white/70">{customer.phone}</span>
                  ) : (
                    <span className="text-sm text-white/30">—</span>
                  )}
                </td>
                <td className="p-3 text-right">
                  <span className="text-sm font-semibold text-amber-400">
                    {customer.loyaltyPoints}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <span className="text-sm text-white/80">
                    ${customer.totalPurchases.toFixed(2)}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <span className={cn(
                    "text-sm font-semibold",
                    customer.balance > 0 ? "text-red-400" : "text-white/60"
                  )}>
                    ${customer.balance.toFixed(2)}
                  </span>
                </td>
                <td className="p-3">
                  {customer.isActive ? (
                    <Badge variant="success">Active</Badge>
                  ) : (
                    <Badge variant="destructive">Inactive</Badge>
                  )}
                </td>
                <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => handleView(customer._id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(customer._id)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </motion.tr>
            ))}
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

export default CustomersTable
