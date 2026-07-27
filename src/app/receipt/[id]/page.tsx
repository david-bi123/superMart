"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Store,
  Printer,
  CheckCircle2,
  Receipt,
  CreditCard,
  ShieldCheck,
} from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/toast"
import { getPublicReceipt, verifyReceipt } from "@/actions/receipt.actions"

interface ReceiptData {
  _id: string
  receiptNumber: string
  businessName: string
  businessLogo: string
  address: string
  phone: string
  tin: string
  customerName: string
  cashier: string
  items: { name: string; quantity: number; price: number; total: number }[]
  subtotal: number
  tax: number
  discount: number
  grandTotal: number
  paymentMethod: string
  status: string
  verifiedAt: string | null
  createdAt: string
  footer: string
}

export default function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const resolved = React.use(params)
  const [receipt, setReceipt] = React.useState<ReceiptData | null>(null)
  const [verified, setVerified] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [verifying, setVerifying] = React.useState(false)

  React.useEffect(() => {
    getPublicReceipt(resolved.id).then((res) => {
      if (res.success && res.data) {
        setReceipt(res.data as ReceiptData)
        setVerified(!!(res.data as ReceiptData).verifiedAt)
      }
      setLoading(false)
    })
  }, [resolved.id])

  const handleVerify = async () => {
    if (verified) return
    setVerifying(true)
    const res = await verifyReceipt(resolved.id)
    if (res.success) {
      setVerified(true)
      toast.success("Receipt verified successfully")
    } else {
      toast.error(res.error || "Failed to verify")
    }
    setVerifying(false)
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!receipt) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center">
          <Receipt className="h-16 w-16 text-white/20 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Receipt Not Found</h1>
          <p className="text-white/50">This receipt does not exist or has been removed</p>
        </div>
      </div>
    )
  }

  const isPaid = receipt.status === "completed"

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Verification Badge */}
          <div className={`px-6 py-4 flex items-center justify-between ${verified ? "bg-emerald-50" : "bg-amber-50"}`}>
            <div className="flex items-center gap-2">
              {verified ? (
                <>
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-700">Verified Receipt</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-700">Unverified</span>
                </>
              )}
            </div>
            {!verified && (
              <Button
                size="sm"
                variant="outline"
                className="border-amber-300 text-amber-700 hover:bg-amber-100"
                onClick={handleVerify}
                loading={verifying}
              >
                <CheckCircle2 className="h-4 w-4" />
                Verify
              </Button>
            )}
          </div>

          {/* Header */}
          <div className="px-6 pt-6 pb-4 text-center border-b border-gray-100">
            {receipt.businessLogo && (
              <img
                src={receipt.businessLogo}
                alt="Logo"
                className="h-16 mx-auto mb-3 object-contain"
              />
            )}
            <h1 className="text-xl font-bold text-gray-900">{receipt.businessName}</h1>
            <p className="text-sm text-gray-500 mt-1">{receipt.address}</p>
            <p className="text-sm text-gray-500">{receipt.phone}</p>
            {receipt.tin && (
              <p className="text-sm text-gray-500">TIN: {receipt.tin}</p>
            )}
          </div>

          {/* Receipt Info */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500">Receipt #</p>
                <p className="text-sm font-bold text-gray-900 font-mono">{receipt.receiptNumber}</p>
              </div>
              <Badge variant={isPaid ? "success" : "warning"} className="text-xs">
                {isPaid ? "Paid" : receipt.status}
              </Badge>
            </div>
            <div className="flex justify-between mt-2">
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-sm text-gray-800">
                  {new Date(receipt.createdAt).toLocaleDateString("en-US", {
                    weekday: "short", year: "numeric", month: "short", day: "numeric",
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Time</p>
                <p className="text-sm text-gray-800">
                  {new Date(receipt.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
            <div className="flex justify-between mt-2">
              <div>
                <p className="text-xs text-gray-500">Customer</p>
                <p className="text-sm text-gray-800">{receipt.customerName}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Cashier</p>
                <p className="text-sm text-gray-800">{receipt.cashier}</p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex justify-between text-xs text-gray-500 font-semibold uppercase mb-2">
              <span className="flex-1">Item</span>
              <span className="w-12 text-center">Qty</span>
              <span className="w-16 text-right">Price</span>
              <span className="w-16 text-right">Total</span>
            </div>
            <div className="space-y-2">
              {receipt.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="flex-1 text-gray-800 truncate">{item.name}</span>
                  <span className="w-12 text-center text-gray-600">{item.quantity}</span>
                  <span className="w-16 text-right text-gray-600">${item.price.toFixed(2)}</span>
                  <span className="w-16 text-right text-gray-800 font-medium">${item.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-800">${receipt.subtotal.toFixed(2)}</span>
              </div>
              {receipt.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Discount</span>
                  <span className="text-red-600">-${receipt.discount.toFixed(2)}</span>
                </div>
              )}
              {receipt.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span className="text-gray-800">${receipt.tax.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">${receipt.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Payment: </span>
              <span className="text-sm font-medium text-gray-800">
                {receipt.paymentMethod.replace("_", " ").toUpperCase()}
              </span>
            </div>
          </div>

          {/* QR Code */}
          <div className="px-6 py-6 flex flex-col items-center border-b border-gray-100">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
              <QRCodeSVG
                value={`${typeof window !== "undefined" ? window.location.href : ""}`}
                size={120}
                level="M"
              />
            </div>
            <p className="text-xs text-gray-400 mt-3">Scan to verify this receipt</p>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 text-center">
            <p className="text-xs text-gray-400">{receipt.footer}</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <ShieldCheck className="h-3 w-3 text-emerald-500" />
              <span className="text-[10px] text-emerald-600 font-medium">
                This is a verified receipt from {receipt.businessName}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 justify-center no-print">
          <Button variant="outline" onClick={handlePrint} className="flex-1 max-w-[200px] bg-white/10 border-white/10 text-white hover:bg-white/20">
            <Printer className="h-4 w-4" />
            Print Receipt
          </Button>
        </div>

        <p className="text-xs text-white/20 text-center mt-8 no-print">
          RetailFlow - Secure Receipt Verification System
        </p>
      </div>
    </div>
  )
}
