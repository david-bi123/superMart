"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Plus,
  Search,
  Calendar,
  Eye,
  CheckCircle2,
  XCircle,
  Truck,
  Ban,
  RefreshCw,
  Package,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/toast"
import {
  getPurchaseOrders,
  approvePurchaseOrder,
  cancelPurchaseOrder,
} from "@/actions/purchases.actions"

interface PurchaseOrderRow {
  _id: string
  poNumber: string
  supplierId: string
  supplierName: string
  supplierCompany: string
  userId: string
  userName: string
  itemsCount: number
  items: any[]
  subtotal: number
  taxTotal: number
  grandTotal: number
  status: "pending" | "approved" | "received" | "partial" | "cancelled"
  notes: string
  receivedAt: string | null
  createdAt: string
  updatedAt: string
}

const STATUS_CONFIG: Record<string, { label: string; color: "default" | "primary" | "secondary" | "destructive" | "success" | "warning" }> = {
  pending: { label: "Pending", color: "warning" },
  approved: { label: "Approved", color: "primary" },
  received: { label: "Received", color: "success" },
  partial: { label: "Partial", color: "default" },
  cancelled: { label: "Cancelled", color: "destructive" },
}

export default function PurchaseOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = React.useState<PurchaseOrderRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("")
  const [dateFrom, setDateFrom] = React.useState("")
  const [dateTo, setDateTo] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)

  const fetchOrders = React.useCallback(async () => {
    setLoading(true)
    const res = await getPurchaseOrders({
      search,
      status: statusFilter === "all" ? "" : statusFilter,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      page,
      limit: 15,
    })
    if (res.success) {
      setOrders(res.data as PurchaseOrderRow[])
      setTotalPages(res.pagination.totalPages)
    }
    setLoading(false)
  }, [search, statusFilter, dateFrom, dateTo, page])

  React.useEffect(() => { fetchOrders() }, [fetchOrders])

  const handleApprove = async (id: string) => {
    const res = await approvePurchaseOrder(id)
    if (res.success) {
      toast.success("Purchase order approved")
      fetchOrders()
    } else {
      toast.error(res.error)
    }
  }

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this purchase order?")) return
    const res = await cancelPurchaseOrder(id)
    if (res.success) {
      toast.success("Purchase order cancelled")
      fetchOrders()
    } else {
      toast.error(res.error)
    }
  }

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Purchase Orders"
        description="Manage orders to suppliers"
        actions={
          <Button size="sm" onClick={() => router.push("/purchases/orders/new")}>
            <Plus className="h-4 w-4" />
            New Purchase Order
          </Button>
        }
      />

      <Card glass className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search PO number..."
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
                className="w-[140px] pl-10"
              />
            </div>
            <span className="text-white/30">—</span>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
                className="w-[140px] pl-10"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32 flex-1" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={<Package className="h-8 w-8" />}
            title="No purchase orders"
            description={search || statusFilter ? "Try adjusting your filters" : "Create your first purchase order"}
            action={
              !search && (!statusFilter || statusFilter === "all") ? (
                <Button onClick={() => router.push("/purchases/orders/new")}>
                  <Plus className="h-4 w-4" />
                  New Purchase Order
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="p-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">PO#</th>
                  <th className="p-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Supplier</th>
                  <th className="p-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Date</th>
                  <th className="p-3 text-right text-xs font-medium text-white/50 uppercase tracking-wider">Items</th>
                  <th className="p-3 text-right text-xs font-medium text-white/50 uppercase tracking-wider">Total</th>
                  <th className="p-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Status</th>
                  <th className="w-16 p-3 text-right text-xs font-medium text-white/50 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => {
                  const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
                  return (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-white/5 transition-colors hover:bg-white/[0.03]"
                    >
                      <td className="p-3">
                        <span className="text-sm font-mono font-medium text-white">{order.poNumber}</span>
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="text-sm text-white">{order.supplierName}</p>
                          {order.supplierCompany && (
                            <p className="text-xs text-white/30">{order.supplierCompany}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-white/60">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <span className="text-sm text-white/80">{order.itemsCount}</span>
                      </td>
                      <td className="p-3 text-right">
                        <span className="text-sm font-semibold text-white">
                          ${order.grandTotal.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge variant={statusCfg.color}>{statusCfg.label}</Badge>
                      </td>
                      <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onClick={() => router.push(`/purchases/orders/${order._id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {order.status === "pending" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleApprove(order._id)}>
                                  <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-400" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleCancel(order._id)} className="text-red-400">
                                  <Ban className="h-4 w-4 mr-2" />
                                  Cancel
                                </DropdownMenuItem>
                              </>
                            )}
                            {(order.status === "approved" || order.status === "partial") && (
                              <DropdownMenuItem onClick={() => router.push(`/purchases/orders/${order._id}/receive`)}>
                                <Truck className="h-4 w-4 mr-2" />
                                Receive Stock
                              </DropdownMenuItem>
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
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/5">
            <p className="text-sm text-white/40">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
