"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Package, Truck } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { getPurchaseOrder, receivePurchaseOrder } from "@/actions/purchases.actions"
import { toast } from "@/components/ui/toast"

interface PurchaseOrderDetail {
  _id: string
  poNumber: string
  supplier: { _id: string; name: string; company: string; email: string; phone: string; address: string } | null
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

export default function ReceiveStockPage() {
  const params = useParams()
  const router = useRouter()
  const [po, setPo] = React.useState<PurchaseOrderDetail | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [quantities, setQuantities] = React.useState<Record<string, number>>({})
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    async function load() {
      const res = await getPurchaseOrder(params.id as string)
      if (res.success) {
        const data = res.data as PurchaseOrderDetail
        setPo(data)
        const initial: Record<string, number> = {}
        data.items.forEach((item) => {
          initial[item.productId] = Math.max(item.quantity - item.received, 0)
        })
        setQuantities(initial)
      } else {
        toast.error(res.error)
      }
      setLoading(false)
    }
    load()
  }, [params.id])

  const canReceive = po?.status === "approved" || po?.status === "partial"

  const handleSubmit = async () => {
    if (!po) return
    for (const item of po.items) {
      const qty = quantities[item.productId] || 0
      const remaining = item.quantity - item.received
      if (qty > remaining) {
        toast.error(`Quantity received for ${item.name} cannot exceed ${remaining}`)
        return
      }
    }
    const items = po.items
      .map((item) => ({ productId: item.productId, quantity: quantities[item.productId] || 0 }))
      .filter((i) => i.quantity > 0)
    if (items.length === 0) {
      toast.error("Enter a quantity greater than zero for at least one item")
      return
    }
    setSaving(true)
    const res = await receivePurchaseOrder(po._id, items)
    if (res.success) {
      toast.success("Stock received")
      router.push(`/purchases/orders/${po._id}`)
    } else {
      toast.error(res.error)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="space-y-6 pb-8">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  if (!po) {
    return (
      <div className="space-y-6 pb-8">
        <EmptyState
          icon={<Package className="h-8 w-8" />}
          title="Purchase order not found"
          action={
            <Button variant="outline" onClick={() => router.push("/purchases/orders")}>
              Back to Purchase Orders
            </Button>
          }
        />
      </div>
    )
  }

  if (!canReceive) {
    return (
      <div className="space-y-6 pb-8">
        <PageHeader
          icon={<Truck className="h-5 w-5" />}
          title="Receive Stock"
          description={po.poNumber}
          actions={
            <Button variant="ghost" size="sm" onClick={() => router.push(`/purchases/orders/${po._id}`)}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          }
        />
        <EmptyState
          icon={<Truck className="h-8 w-8" />}
          title="Cannot receive stock"
          description={
            po.status === "received"
              ? "This purchase order has already been fully received"
              : po.status === "cancelled"
                ? "This purchase order has been cancelled"
                : "This purchase order must be approved before stock can be received"
          }
          action={
            <Button onClick={() => router.push(`/purchases/orders/${po._id}`)}>
              View Purchase Order
            </Button>
          }
        />
      </div>
    )
  }

  const hasRemaining = po.items.some((item) => item.quantity - item.received > 0)

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        icon={<Truck className="h-5 w-5" />}
        title="Receive Stock"
        description={`Receive stock for ${po.poNumber}`}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant={po.status === "partial" ? "default" : "primary"}>
              {po.status === "partial" ? "Partial" : "Approved"}
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => router.push(`/purchases/orders/${po._id}`)}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        }
      />

      <Card glass>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            Receive Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {po.items.map((item) => {
            const remaining = Math.max(item.quantity - item.received, 0)
            return (
              <div
                key={item.productId}
                className="flex flex-col gap-3 p-3 rounded-xl bg-muted/30 border border-border/30 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                  {item.sku && <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                    <span>Ordered: <span className="text-foreground font-medium">{item.quantity}</span></span>
                    <span>Received: <span className="text-foreground font-medium">{item.received}</span></span>
                    <span>Remaining: <span className="text-foreground font-medium">{remaining}</span></span>
                  </div>
                </div>
                <div className="w-full sm:w-40">
                  <Input
                    label="Quantity Received"
                    type="number"
                    min={0}
                    max={remaining}
                    value={quantities[item.productId] ?? 0}
                    onChange={(e) =>
                      setQuantities((prev) => ({
                        ...prev,
                        [item.productId]: Math.max(parseInt(e.target.value) || 0, 0),
                      }))
                    }
                  />
                </div>
              </div>
            )
          })}

          <div className="flex items-center justify-end pt-2 border-t border-border/30">
            <Button className="h-11 px-6" onClick={handleSubmit} loading={saving} disabled={!hasRemaining}>
              <Truck className="h-5 w-5" />
              Receive Stock
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
