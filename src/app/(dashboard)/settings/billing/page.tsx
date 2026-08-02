"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Check,
  X,
  CreditCard,
  Zap,
  Star,
  Crown,
  Building2,
  ChevronRight,
  Download,
  Calendar,
  ArrowUpCircle,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/toast"
import { getSubscription, getPlans, upgradePlan, cancelSubscription, getInvoices } from "@/actions/subscriptions.actions"
import { cn } from "@/lib/utils/cn"
import { PermissionGuard } from "@/components/auth/permission-guard"

const TIER_ORDER = ["free", "starter", "professional", "enterprise"]
const TIER_ICONS: Record<string, React.ElementType> = {
  free: Zap,
  starter: Star,
  professional: Crown,
  enterprise: Building2,
}
const TIER_COLORS: Record<string, string> = {
  free: "from-muted-foreground/60 to-muted-foreground/40",
  starter: "from-blue-500 to-cyan-600",
  professional: "from-violet-500 to-indigo-600",
  enterprise: "from-amber-500 to-orange-600",
}

interface Plan {
  tier: string
  name: string
  price: number
  currency: string
  interval: string
  features: Record<string, boolean | number | string>
}

interface InvoiceRow {
  _id: string
  invoiceNumber: string
  plan: string
  amount: number
  currency: string
  status: string
  periodStart: string
  periodEnd: string
  paidAt: string
  createdAt: string
}

export default function BillingPage() {
  const [currentTier, setCurrentTier] = React.useState("free")
  const [currentStatus, setCurrentStatus] = React.useState("")
  const [subscriptionEndsAt, setSubscriptionEndsAt] = React.useState<string | null>(null)
  const [plans, setPlans] = React.useState<Plan[]>([])
  const [invoices, setInvoices] = React.useState<InvoiceRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [upgrading, setUpgrading] = React.useState<string | null>(null)
  const [cancelling, setCancelling] = React.useState(false)

  React.useEffect(() => {
    async function load() {
      const [subRes, plansRes, invRes] = await Promise.all([
        getSubscription(),
        getPlans(),
        getInvoices(),
      ])
      if (subRes.success && subRes.data) {
        setCurrentTier(subRes.data.tier)
        setCurrentStatus(subRes.data.status)
        setSubscriptionEndsAt(subRes.data.subscriptionEndsAt)
      }
      if (plansRes.success) setPlans(plansRes.data as Plan[])
      if (invRes.success) setInvoices(invRes.data as InvoiceRow[])
      setLoading(false)
    }
    load()
  }, [])

  const handleUpgrade = async (tier: string) => {
    setUpgrading(tier)
    const res = await upgradePlan(tier)
    if (res.success) {
      toast.success(`Upgraded to ${res.data.name} plan`)
      setCurrentTier(tier)
      const subRes = await getSubscription()
      if (subRes.success && subRes.data) {
        setCurrentStatus(subRes.data.status)
        setSubscriptionEndsAt(subRes.data.subscriptionEndsAt)
      }
    } else {
      toast.error(res.error || "Failed to upgrade")
    }
    setUpgrading(null)
  }

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You will lose access to premium features.")) return
    setCancelling(true)
    const res = await cancelSubscription()
    if (res.success) {
      toast.success("Subscription cancelled")
      setCurrentStatus("cancelled")
    } else {
      toast.error(res.error)
    }
    setCancelling(false)
  }

  const currentPlan = plans.find((p) => p.tier === currentTier)

  return (
    <PermissionGuard permission="settings:manage">
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Billing & Plan"
        description="Manage your subscription and billing"
      />

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-48 rounded-2xl" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        </div>
      ) : (
        <>
          <Card
            glass
            className="ring-2 ring-emerald-500/30 border-emerald-500/20 shadow-[0_0_30px_-8px_rgba(16,185,129,0.15)]"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5 text-primary" />
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={cn("h-14 w-14 rounded-2xl bg-gradient-to-br flex items-center justify-center", TIER_COLORS[currentTier] || TIER_COLORS.free)}>
                    {React.createElement(TIER_ICONS[currentTier] || TIER_ICONS.free, { className: "h-7 w-7 text-primary-foreground" })}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-foreground capitalize">{currentPlan?.name || currentTier}</h3>
                      <Badge variant={currentStatus === "active" ? "success" : currentStatus === "cancelled" ? "destructive" : "warning"}>
                        {currentStatus}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {currentPlan?.price === 0 ? "Free" : `$${currentPlan?.price}/${currentPlan?.interval}`}
                      {subscriptionEndsAt && (
                        <> &middot; Renews {new Date(subscriptionEndsAt).toLocaleDateString()}</>
                      )}
                    </p>
                  </div>
                </div>
                {currentTier !== "free" && currentStatus !== "cancelled" && (
                  <Button variant="destructive" onClick={handleCancel} loading={cancelling}>
                    Cancel Subscription
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan, index) => {
              const isCurrent = plan.tier === currentTier
              const isUpgrade = TIER_ORDER.indexOf(plan.tier) > TIER_ORDER.indexOf(currentTier)
              const isDowngrade = TIER_ORDER.indexOf(plan.tier) < TIER_ORDER.indexOf(currentTier)

              return (
                <motion.div
                  key={plan.tier}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    glass
                    className={cn(
                      "relative overflow-hidden h-full flex flex-col",
                      isCurrent
                        ? "ring-2 ring-emerald-500/40 border-emerald-500/20"
                        : "hover:border-muted-foreground/20"
                    )}
                  >
                    {isCurrent && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-400" />
                    )}
                    <CardHeader>
                      <div className={cn("h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-2", TIER_COLORS[plan.tier])}>
                        {React.createElement(TIER_ICONS[plan.tier], { className: "h-5 w-5 text-primary-foreground" })}
                      </div>
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <CardDescription>
                        <span className="text-3xl font-bold text-foreground">
                          {plan.price === 0 ? "Free" : `$${plan.price}`}
                        </span>
                        {plan.price > 0 && <span className="text-sm text-muted-foreground">/{plan.interval}</span>}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <ul className="space-y-2.5">
                        {Object.entries(plan.features).map(([key, value]) => {
                          const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())
                          const isEnabled = value !== false && value !== 0
                          return (
                            <li key={key} className="flex items-center gap-2 text-sm">
                              {isEnabled ? (
                                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              ) : (
                                <X className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                              )}
                              <span className={isEnabled ? "text-foreground/80" : "text-muted-foreground/50"}>
                                {typeof value === "number" && value === -1 ? "Unlimited" : typeof value === "number" ? `${value} ` : ""}
                                {label}
                              </span>
                            </li>
                          )
                        })}
                      </ul>
                    </CardContent>
                    <CardFooter className="mt-auto">
                      {isCurrent ? (
                        <Button variant="outline" className="w-full" disabled>
                          Current Plan
                        </Button>
                      ) : isUpgrade ? (
                        <Button
                          className="w-full"
                          onClick={() => handleUpgrade(plan.tier)}
                          loading={upgrading === plan.tier}
                        >
                          <ArrowUpCircle className="h-4 w-4" />
                          Upgrade
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleUpgrade(plan.tier)}
                          loading={upgrading === plan.tier}
                        >
                          Downgrade
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-primary" />
                Invoice History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">No invoices yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase">Invoice</th>
                        <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase">Plan</th>
                        <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase">Period</th>
                        <th className="p-3 text-right text-xs font-medium text-muted-foreground uppercase">Amount</th>
                        <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                        <th className="w-16 p-3 text-right text-xs font-medium text-muted-foreground uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv, index) => (
                        <motion.tr
                          key={inv._id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="border-b border-border/30"
                        >
                          <td className="p-3">
                            <span className="text-sm font-mono text-foreground">{inv.invoiceNumber}</span>
                          </td>
                          <td className="p-3">
                            <span className="text-sm text-foreground capitalize">{inv.plan}</span>
                          </td>
                          <td className="p-3">
                            <span className="text-sm text-muted-foreground">
                              {new Date(inv.periodStart).toLocaleDateString()} - {new Date(inv.periodEnd).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <span className="text-sm font-semibold text-foreground">
                              ${inv.amount.toFixed(2)}
                            </span>
                          </td>
                          <td className="p-3">
                            <Badge variant={inv.status === "paid" ? "success" : "warning"}>
                              {inv.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Download className="h-4 w-4" />
                            </Button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5 text-primary" />
                Payment Method
              </CardTitle>
              <CardDescription>Manage your payment information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-14 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-xs font-bold text-muted-foreground">
                    ****
                  </div>
                  <div>
                    <p className="text-sm text-foreground/80">No card on file</p>
                    <p className="text-xs text-muted-foreground">Add a payment method to upgrade</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Add Card</Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
    </PermissionGuard>
  )
}
