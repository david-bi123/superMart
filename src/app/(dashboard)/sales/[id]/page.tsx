"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Printer,
  Mail,
  Ban,
  RotateCcw,
  Clock,
  User,
  CreditCard,
  Building2,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Package,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, getInitials } from "@/components/ui/avatar"
import { getSale, cancelSale, refundSale } from "@/actions/sales.actions"
import { toast } from "@/components/ui/toast"

interface SaleDetail {
  _id: string
  invoiceNumber: string
  customer: {
    _id: string
    name: string
    email: string
    phone: string
    address: string
    loyaltyPoints: number
  } | null
  user: { _id: string; name: string; email: string } | null
  items: {
    productId: string
    name: string
    sku: string
    quantity: number
    price: number
    cost: number
    discount: number
    tax: number
    total: number
  }[]
  subtotal: number
  discountTotal: number
  taxTotal: number
  grandTotal: number
  paymentMethod: string
  paymentDetails: {
    cash?: number
    card?: number
    mobileMoney?: number
    change?: number
  }
  status: "draft" | "completed" | "cancelled" | "refunded"
  notes: string
  receipt: {
    _id: string
    receiptNumber: string
    publicUrl: string
    printedAt: string | null
    emailedAt: string | null
  } | null
  timeline: {
    _id: string
    action: string
    user: string
    details: any
    createdAt: string
  }[]
  createdAt: string
  updatedAt: string
}

const statusConfig: Record<string, { variant: "success" | "warning" | "destructive" | "outline"; label: string; icon: any }> = {
  completed: { variant: "success", label: "Completed", icon: CheckCircle2 },
  draft: { variant: "outline", label: "Draft", icon: FileText },
  cancelled: { variant: "destructive", label: "Cancelled", icon: XCircle },
  refunded: { variant: "warning", label: "Refunded", icon: AlertTriangle },
}

const paymentLabels: Record<string, string> = {
  cash: "Cash",
  card: "Card",
  mobile_money: "Mobile Money",
  credit: "Credit",
  mixed: "Mixed",
}

export default function SaleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [sale, setSale] = React.useState<SaleDetail | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [actionLoading, setActionLoading] = React.useState<string | null>(null)

  const fetchSale = React.useCallback(async () => {
    setLoading(true)
    const res = await getSale(params.id as string)
    if (res.success) {
      setSale(res.data as SaleDetail)
    } else {
      toast.error(res.error)
    }
    setLoading(false)
  }, [params.id])

  React.useEffect(() => {
    fetchSale()
  }, [fetchSale])

  const handleCancel = async () => {
    if (!confirm("Cancel this sale? Stock will be restored.")) return
    setActionLoading("cancel")
    const res = await cancelSale(sale!._id)
    if (res.success) {
      toast.success("Sale cancelled")
      fetchSale()
    } else {
      toast.error(res.error)
    }
    setActionLoading(null)
  }

  const handleRefund = async () => {
    if (!confirm("Refund this entire sale? Stock will be restored.")) return
    setActionLoading("refund")
    const res = await refundSale(sale!._id, {})
    if (res.success) {
      toast.success("Sale refunded")
      fetchSale()
    } else {
      toast.error(res.error)
    }
    setActionLoading(null)
  }

  const handlePrint = () => {
    window.print()
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
            <Skeleton className="h-48 rounded-2xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!sale) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-white/60 text-lg">Sale not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/sales")}>
          Back to Sales
        </Button>
      </div>
    )
  }

  const statusCfg = statusConfig[sale.status] || statusConfig.draft
  const StatusIcon = statusCfg.icon

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/sales")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{sale.invoiceNumber}</h1>
              <Badge variant={statusCfg.variant} className="flex items-center gap-1.5">
                <StatusIcon className="h-3.5 w-3.5" />
                {statusCfg.label}
              </Badge>
            </div>
            <p className="text-sm text-white/50">
              {new Date(sale.createdAt).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 no-print">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Print
          </Button>
          {sale.receipt && (
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4" />
              Email
            </Button>
          )}
          {sale.status === "completed" && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                onClick={handleCancel}
                loading={actionLoading === "cancel"}
              >
                <Ban className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                onClick={handleRefund}
                loading={actionLoading === "refund"}
              >
                <RotateCcw className="h-4 w-4" />
                Refund
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card glass>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-white/50" />
                Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="pb-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Product</th>
                      <th className="pb-3 text-center text-xs font-medium text-white/50 uppercase tracking-wider">Qty</th>
                      <th className="pb-3 text-right text-xs font-medium text-white/50 uppercase tracking-wider">Price</th>
                      <th className="pb-3 text-right text-xs font-medium text-white/50 uppercase tracking-wider">Discount</th>
                      <th className="pb-3 text-right text-xs font-medium text-white/50 uppercase tracking-wider">Tax</th>
                      <th className="pb-3 text-right text-xs font-medium text-white/50 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sale.items.map((item, index) => (
                      <motion.tr
                        key={item.productId}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="border-b border-white/5"
                      >
                        <td className="py-3">
                          <div>
                            <p className="text-sm font-medium text-white">{item.name}</p>
                            {item.sku && (
                              <p className="text-xs text-white/40 font-mono">{item.sku}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-center text-sm text-white/80">{item.quantity}</td>
                        <td className="py-3 text-right text-sm text-white/80">${item.price.toFixed(2)}</td>
                        <td className="py-3 text-right text-sm text-white/60">
                          {item.discount > 0 ? `-$${item.discount.toFixed(2)}` : "—"}
                        </td>
                        <td className="py-3 text-right text-sm text-white/60">
                          {item.tax > 0 ? `$${item.tax.toFixed(2)}` : "—"}
                        </td>
                        <td className="py-3 text-right text-sm font-semibold text-white">
                          ${item.total.toFixed(2)}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Subtotal</span>
                  <span className="text-white/80">${sale.subtotal.toFixed(2)}</span>
                </div>
                {sale.discountTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Discount</span>
                    <span className="text-red-400">-${sale.discountTotal.toFixed(2)}</span>
                  </div>
                )}
                {sale.taxTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Tax</span>
                    <span className="text-white/80">${sale.taxTotal.toFixed(2)}</span>
                  </div>
                )}
                <Separator className="my-1" />
                <div className="flex justify-between">
                  <span className="text-base font-semibold text-white">Grand Total</span>
                  <span className="text-base font-bold text-white">${sale.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card glass>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-white/50" />
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sale.timeline.length === 0 ? (
                <p className="text-sm text-white/40">No activity recorded</p>
              ) : (
                <div className="space-y-4">
                  {sale.timeline.map((log, i) => (
                    <div key={log._id} className="flex gap-3">
                      <div className="relative flex flex-col items-center">
                        <div className="h-2 w-2 rounded-full bg-violet-500 mt-2" />
                        {i < sale.timeline.length - 1 && (
                          <div className="w-px flex-1 bg-white/10" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm text-white/80">
                          <span className="font-medium capitalize">
                            {log.action.replace(/\./g, " ")}
                          </span>
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-white/40">{log.user}</span>
                          <span className="text-white/20">•</span>
                          <span className="text-xs text-white/40">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 mt-2" />
                    <div>
                      <p className="text-sm text-white/80">
                        <span className="font-medium">Sale created</span>
                      </p>
                      <p className="text-xs text-white/40 mt-1">
                        {new Date(sale.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {sale.notes && (
            <Card glass>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-white/50" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/70 whitespace-pre-wrap">{sale.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {sale.customer && (
            <Card glass>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-white/50" />
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar>
                    <AvatarFallback>{getInitials(sale.customer.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-white">{sale.customer.name}</p>
                    <p className="text-xs text-white/40">{sale.customer.loyaltyPoints} points</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {sale.customer.email && (
                    <div className="flex items-center gap-2 text-white/60">
                      <Mail className="h-3.5 w-3.5" />
                      <span>{sale.customer.email}</span>
                    </div>
                  )}
                  {sale.customer.phone && (
                    <div className="flex items-center gap-2 text-white/60">
                      <User className="h-3.5 w-3.5" />
                      <span>{sale.customer.phone}</span>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4"
                  onClick={() => router.push(`/customers/${sale.customer!._id}`)}
                >
                  View Profile
                </Button>
              </CardContent>
            </Card>
          )}

          <Card glass>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-white/50" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Method</span>
                  <span className="text-white font-medium capitalize">
                    {paymentLabels[sale.paymentMethod] || sale.paymentMethod}
                  </span>
                </div>
                {(sale.paymentDetails?.cash ?? 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Cash</span>
                    <span className="text-white/80">${(sale.paymentDetails?.cash ?? 0).toFixed(2)}</span>
                  </div>
                )}
                {(sale.paymentDetails?.card ?? 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Card</span>
                    <span className="text-white/80">${(sale.paymentDetails?.card ?? 0).toFixed(2)}</span>
                  </div>
                )}
                {(sale.paymentDetails?.mobileMoney ?? 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Mobile Money</span>
                    <span className="text-white/80">${(sale.paymentDetails?.mobileMoney ?? 0).toFixed(2)}</span>
                  </div>
                )}
                {(sale.paymentDetails?.change ?? 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Change</span>
                    <span className="text-red-400">-${(sale.paymentDetails?.change ?? 0).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {sale.user && (
            <Card glass>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-white/50" />
                  Processed By
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials(sale.user.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-white">{sale.user.name}</p>
                    <p className="text-xs text-white/40">{sale.user.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {sale.receipt && (
            <Card glass>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-white/50" />
                  Receipt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-mono text-white/80">{sale.receipt.receiptNumber}</p>
                {sale.receipt.printedAt && (
                  <p className="text-xs text-white/40 mt-1">
                    Printed: {new Date(sale.receipt.printedAt).toLocaleString()}
                  </p>
                )}
                {sale.receipt.emailedAt && (
                  <p className="text-xs text-white/40">
                    Emailed: {new Date(sale.receipt.emailedAt).toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
