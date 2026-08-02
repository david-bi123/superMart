"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Ban,
  Building2,
  CheckCircle2,
  DollarSign,
  FileText,
  Mail,
  MapPin,
  Package,
  Phone,
  Truck,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import {
  getPurchaseOrder,
  approvePurchaseOrder,
  cancelPurchaseOrder,
} from "@/actions/purchases.actions"
import { formatMoney } from "@/lib/format"
import { toast } from "@/components/ui/toast"

interface PurchaseOrderDetail {
  _id: string
  poNumber: string
  supplier: {
    _id: string
    name: string
    company: string
    email: string
    phone: string
    address: string
  } | null
  user: { _id: string; name: string; email: string } | null
  items: {
    productId: string
    name: string
    sku: string
    quantity: number
    received: number
    price: number
    total: number
  }[]
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

export default function PurchaseOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [po, setPo] = React.useState<PurchaseOrderDetail | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [actionLoading, setActionLoading] = React.useState<string | null>(null)

  const fetchPo = React.useCallback(async () => {
    setLoading(true)
    const res = await getPurchaseOrder(params.id as string)
    if (res.success) {
      setPo(res.data as PurchaseOrderDetail)
    } else {
      toast.error(res.error)
    }
    setLoading(false)
  }, [params.id])

  React.useEffect(() => {
    fetchPo()
  }, [fetchPo])

  const handleApprove = async () => {
    setActionLoading("approve")
    const res = await approvePurchaseOrder(po!._id)
    if (res.success) {
      toast.success("Purchase order approved")
      fetchPo()
    } else {
      toast.error(res.error)
    }
    setActionLoading(null)
  }

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this purchase order?")) return
    setActionLoading("cancel")
    const res = await cancelPurchaseOrder(po!._id)
    if (res.success) {
      toast.success("Purchase order cancelled")
      fetchPo()
    } else {
      toast.error(res.error)
    }
    setActionLoading(null)
  }

  if (loading) {
    return (
      <div className="space-y-6 pb-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!po) {
    return (
      <div className="space-y-6 pb-8">
        <EmptyState
          icon={<Package className="h-8 w-8" />}
          title="Purchase order not found"
          description="The purchase order you're looking for doesn't exist"
          action={
            <Button variant="outline" onClick={() => router.push("/purchases/orders")}>
              Back to Purchase Orders
            </Button>
          }
        />
      </div>
    )
  }

  const statusCfg = STATUS_CONFIG[po.status] || STATUS_CONFIG.pending

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        icon={<Package className="h-5 w-5" />}
        title={po.poNumber}
        description={`Created ${new Date(po.createdAt).toLocaleString()}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push("/purchases/orders")}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Badge variant={statusCfg.color}>{statusCfg.label}</Badge>
            {po.status === "pending" && (
              <>
                <Button size="sm" onClick={handleApprove} loading={actionLoading === "approve"}>
                  <CheckCircle2 className="h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  loading={actionLoading === "cancel"}
                  className="text-destructive"
                >
                  <Ban className="h-4 w-4" />
                  Cancel
                </Button>
              </>
            )}
            {po.status === "approved" && (
              <>
                <Button size="sm" onClick={() => router.push("./receive")}>
                  <Truck className="h-4 w-4" />
                  Receive Stock
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  loading={actionLoading === "cancel"}
                  className="text-destructive"
                >
                  <Ban className="h-4 w-4" />
                  Cancel
                </Button>
              </>
            )}
            {po.status === "partial" && (
              <Button size="sm" onClick={() => router.push("./receive")}>
                <Truck className="h-4 w-4" />
                Receive More Stock
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card glass>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="pb-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Product</th>
                      <th className="pb-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">SKU</th>
                      <th className="pb-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Ordered</th>
                      <th className="pb-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Received</th>
                      <th className="pb-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Unit Cost</th>
                      <th className="pb-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {po.items.map((item) => (
                      <tr key={item.productId} className="border-b border-border/30">
                        <td className="py-3">
                          <p className="text-sm font-medium text-foreground">{item.name}</p>
                        </td>
                        <td className="py-3">
                          {item.sku ? (
                            <span className="text-xs text-muted-foreground font-mono">{item.sku}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground/50">—</span>
                          )}
                        </td>
                        <td className="py-3 text-center text-sm text-muted-foreground">{item.quantity}</td>
                        <td className="py-3 text-center text-sm text-muted-foreground">{item.received}</td>
                        <td className="py-3 text-right text-sm text-muted-foreground">{formatMoney(item.price)}</td>
                        <td className="py-3 text-right text-sm font-semibold text-foreground">{formatMoney(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {po.notes && (
            <Card glass>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{po.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {po.supplier && (
            <Card glass>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  Supplier
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-semibold text-foreground">{po.supplier.name}</p>
                {po.supplier.company && (
                  <p className="text-xs text-muted-foreground">{po.supplier.company}</p>
                )}
                <div className="mt-4 space-y-3 text-sm">
                  {po.supplier.email && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span>{po.supplier.email}</span>
                    </div>
                  )}
                  {po.supplier.phone && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Phone className="h-4 w-4 shrink-0" />
                      <span>{po.supplier.phone}</span>
                    </div>
                  )}
                  {po.supplier.address && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span>{po.supplier.address}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card glass>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">{formatMoney(po.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="text-foreground">{formatMoney(po.taxTotal)}</span>
              </div>
              <Separator className="my-1" />
              <div className="flex justify-between">
                <span className="text-base font-semibold text-foreground">Grand Total</span>
                <span className="text-base font-bold text-foreground">{formatMoney(po.grandTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Items</span>
                <span className="text-foreground">{po.items.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
