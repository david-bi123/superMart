"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  ShoppingCart,
  Plus,
  Mail,
  Phone,
  MapPin,
  Award,
  DollarSign,
  FileText,
  Star,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, getInitials } from "@/components/ui/avatar"
import { EmptyState } from "@/components/ui/empty-state"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { getCustomer, addLoyaltyPoints } from "@/actions/customers.actions"
import { toast } from "@/components/ui/toast"

interface CustomerDetail {
  _id: string
  name: string
  email: string
  phone: string
  address: string
  loyaltyPoints: number
  totalPurchases: number
  balance: number
  creditLimit: number
  notes: string
  isActive: boolean
  totalSpent: number
  salesCount: number
  sales: {
    _id: string
    invoiceNumber: string
    grandTotal: number
    status: string
    itemsCount: number
    createdAt: string
  }[]
  createdAt: string
  updatedAt: string
}

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [customer, setCustomer] = React.useState<CustomerDetail | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [showPointsDialog, setShowPointsDialog] = React.useState(false)
  const [pointsAmount, setPointsAmount] = React.useState(100)
  const [pointsLoading, setPointsLoading] = React.useState(false)

  const fetchCustomer = React.useCallback(async () => {
    setLoading(true)
    const res = await getCustomer(params.id as string)
    if (res.success) {
      setCustomer(res.data as CustomerDetail)
    } else {
      toast.error(res.error)
    }
    setLoading(false)
  }, [params.id])

  React.useEffect(() => {
    fetchCustomer()
  }, [fetchCustomer])

  const handleAddPoints = async () => {
    if (!pointsAmount || pointsAmount <= 0) {
      toast.error("Enter a valid points amount")
      return
    }
    setPointsLoading(true)
    const res = await addLoyaltyPoints(customer!._id, pointsAmount, "Manual adjustment")
    if (res.success) {
      toast.success(`${pointsAmount} points added`)
      setShowPointsDialog(false)
      fetchCustomer()
    } else {
      toast.error(res.error)
    }
    setPointsLoading(false)
  }

  if (loading) {
    return (
      <div className="space-y-6 pb-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 rounded-2xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground text-lg">Customer not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/customers")}>
          Back to Customers
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/customers")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-14 w-14">
            <AvatarFallback className="text-lg">{getInitials(customer.name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{customer.name}</h1>
              {customer.isActive ? (
                <Badge variant="success">Active</Badge>
              ) : (
                <Badge variant="destructive">Inactive</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Customer since {new Date(customer.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/pos?customer=${customer._id}`)}
          >
            <ShoppingCart className="h-4 w-4" />
            New Sale
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPointsDialog(true)}
          >
            <Star className="h-4 w-4" />
            Add Points
          </Button>
          {customer.email && (
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4" />
              Email
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card glass>
            <CardHeader>
              <CardTitle className="text-lg">Purchase History</CardTitle>
            </CardHeader>
            <CardContent>
              {customer.sales.length === 0 ? (
                <EmptyState
                  icon={<ShoppingCart className="h-8 w-8" />}
                  title="No purchases yet"
                  description="This customer hasn't made any purchases"
                  action={
                    <Button onClick={() => router.push(`/pos?customer=${customer._id}`)}>
                      <ShoppingCart className="h-4 w-4" />
                      Create Sale
                    </Button>
                  }
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="pb-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Invoice</th>
                        <th className="pb-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                        <th className="pb-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Items</th>
                        <th className="pb-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</th>
                        <th className="pb-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customer.sales.map((sale, index) => (
                        <motion.tr
                          key={sale._id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="border-b border-border/20 cursor-pointer hover:bg-muted/30"
                          onClick={() => router.push(`/sales/${sale._id}`)}
                        >
                          <td className="py-3">
                            <span className="text-sm font-mono font-medium text-foreground">{sale.invoiceNumber}</span>
                          </td>
                          <td className="py-3">
                            <span className="text-sm text-muted-foreground">
                              {new Date(sale.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </td>
                          <td className="py-3 text-right text-sm text-muted-foreground">{sale.itemsCount}</td>
                          <td className="py-3 text-right text-sm font-semibold text-foreground">
                            ${sale.grandTotal.toFixed(2)}
                          </td>
                          <td className="py-3">
                            <Badge
                              variant={
                                sale.status === "completed" ? "success" :
                                sale.status === "cancelled" ? "destructive" :
                                sale.status === "refunded" ? "warning" : "outline"
                              }
                            >
                              {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                            </Badge>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {customer.notes && (
            <Card glass>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{customer.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card glass>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-400" />
                Loyalty Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-2">
                <p className="text-4xl font-bold text-amber-400">{customer.loyaltyPoints}</p>
                <p className="text-sm text-muted-foreground mt-1">Points</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3"
                onClick={() => setShowPointsDialog(true)}
              >
                <Plus className="h-4 w-4" />
                Add Points
              </Button>
            </CardContent>
          </Card>

          <Card glass>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Spent</span>
                  <span className="text-foreground font-semibold">${customer.totalSpent.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Purchases</span>
                  <span className="text-foreground">{customer.salesCount}</span>
                </div>
                <Separator className="my-1" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Balance</span>
                  <span className={`font-semibold ${customer.balance > 0 ? "text-red-400" : "text-muted-foreground"}`}>
                    ${customer.balance.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Credit Limit</span>
                  <span className="text-foreground">${customer.creditLimit.toFixed(2)}</span>
                </div>
                {customer.creditLimit > 0 && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-muted-foreground/50 mb-1">
                      <span>Credit Used</span>
                      <span>{customer.creditLimit > 0 ? Math.round((customer.balance / customer.creditLimit) * 100) : 0}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-500"
                        style={{ width: `${customer.creditLimit > 0 ? Math.min((customer.balance / customer.creditLimit) * 100, 100) : 0}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card glass>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              Contact Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {customer.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground/80">{customer.email}</span>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground/80">{customer.phone}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground/80">{customer.address}</span>
                  </div>
                )}
                {!customer.email && !customer.phone && !customer.address && (
                  <p className="text-sm text-muted-foreground">No contact information</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showPointsDialog} onOpenChange={setShowPointsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Loyalty Points</DialogTitle>
            <DialogDescription>
              Add loyalty points to {customer.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              label="Points"
              type="number"
              value={pointsAmount}
              onChange={(e) => setPointsAmount(parseInt(e.target.value) || 0)}
              min={1}
            />
            <p className="text-sm text-muted-foreground">
              Current balance: <span className="text-amber-400 font-semibold">{customer.loyaltyPoints}</span> points
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPointsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPoints} loading={pointsLoading}>
              Add Points
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
