"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSession } from "next-auth/react"
import Link from "next/link"
import {
  Play,
  CheckCircle2,
  Circle,
  ShoppingCart,
  Package,
  Truck,
  Receipt,
  Users,
  Wallet,
  BarChart3,
  UserCog,
  Settings,
  Search,
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  RotateCcw,
  ChevronRight,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils/cn"

type Role = string

interface TutorialStep {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  roles: Role[]
}

const modules: { key: string; label: string; icon: React.ReactNode; color: string; steps: TutorialStep[] }[] = [
  {
    key: "getting-started",
    label: "Getting Started",
    icon: <GraduationCap className="h-5 w-5" />,
    color: "from-emerald-500 to-teal-600",
    steps: [
      {
        title: "Explore your dashboard",
        description: "The Dashboard gives you a snapshot of today's sales, revenue, profit, expenses, and low-stock alerts. Use it to check how your store is doing at a glance.",
        href: "/dashboard",
        icon: <BarChart3 className="h-4 w-4" />,
        roles: ["business_owner", "manager", "cashier", "accountant", "inventory_officer"],
      },
      {
        title: "Understand your role",
        description: "Your access depends on your role. Owners and managers can manage users and settings. Cashiers focus on ringing up sales. Check Settings > Profile to see your role and permissions.",
        href: "/settings/profile",
        icon: <UserCog className="h-4 w-4" />,
        roles: ["business_owner", "manager", "cashier", "accountant", "inventory_officer"],
      },
    ],
  },
  {
    key: "pos",
    label: "Point of Sale",
    icon: <ShoppingCart className="h-5 w-5" />,
    color: "from-blue-500 to-indigo-600",
    steps: [
      {
        title: "Ring up a sale",
        description: "Click a product to add it to the cart. Search by name, SKU, or barcode. Adjust quantities, apply discounts, select a customer, then hit Pay.",
        href: "/pos",
        icon: <ShoppingCart className="h-4 w-4" />,
        roles: ["business_owner", "manager", "cashier"],
      },
      {
        title: "Choose a payment method",
        description: "Cash, Card, Mobile Money, or Split. When you confirm, stock is reduced automatically and a receipt is generated and printed.",
        href: "/pos",
        icon: <Wallet className="h-4 w-4" />,
        roles: ["business_owner", "manager", "cashier"],
      },
      {
        title: "Hold a sale for later",
        description: "Use the Hold button to pause a cart (e.g. a customer stepped away), then resume it anytime. Press F3 or / on your keyboard to jump to product search.",
        href: "/pos",
        icon: <Play className="h-4 w-4" />,
        roles: ["business_owner", "manager", "cashier"],
      },
    ],
  },
  {
    key: "inventory",
    label: "Inventory & Products",
    icon: <Package className="h-5 w-5" />,
    color: "from-purple-500 to-pink-600",
    steps: [
      {
        title: "Add a new product",
        description: "Go to Inventory > Products and click Add Product. Fill in name, SKU, price, cost, and stock. Set a minimum stock level to get low-stock alerts.",
        href: "/inventory/products/new",
        icon: <Package className="h-4 w-4" />,
        roles: ["business_owner", "manager", "inventory_officer"],
      },
      {
        title: "Organize with categories and brands",
        description: "Keep products tidy by grouping them under categories and brands. This makes search and reports more useful.",
        href: "/inventory/categories",
        icon: <Package className="h-4 w-4" />,
        roles: ["business_owner", "manager", "inventory_officer"],
      },
      {
        title: "Track suppliers",
        description: "Add your suppliers so you can create purchase orders and reorder stock quickly.",
        href: "/suppliers",
        icon: <Users className="h-4 w-4" />,
        roles: ["business_owner", "manager", "inventory_officer"],
      },
    ],
  },
  {
    key: "purchases",
    label: "Purchases",
    icon: <Truck className="h-5 w-5" />,
    color: "from-amber-500 to-orange-600",
    steps: [
      {
        title: "Create a purchase order",
        description: "Purchases > Orders > New Order. Pick a supplier, search and add products, set quantities and prices, then submit.",
        href: "/purchases/orders/new",
        icon: <Truck className="h-4 w-4" />,
        roles: ["business_owner", "manager", "inventory_officer"],
      },
      {
        title: "Receive stock",
        description: "When an order arrives, open it and click Receive. Stock levels update automatically once items are received.",
        href: "/purchases/orders",
        icon: <Truck className="h-4 w-4" />,
        roles: ["business_owner", "manager", "inventory_officer"],
      },
    ],
  },
  {
    key: "sales",
    label: "Sales & Customers",
    icon: <Receipt className="h-5 w-5" />,
    color: "from-emerald-500 to-teal-600",
    steps: [
      {
        title: "Review sales history",
        description: "Sales lists every transaction with its invoice number, customer, items, and totals. Filter by date, status, or search by invoice.",
        href: "/sales",
        icon: <Receipt className="h-4 w-4" />,
        roles: ["business_owner", "manager", "cashier", "accountant"],
      },
      {
        title: "Refund or cancel a sale",
        description: "Open a sale and use Refund or Cancel. Stock is returned to inventory and customer balances are adjusted.",
        href: "/sales",
        icon: <RotateCcw className="h-4 w-4" />,
        roles: ["business_owner", "manager"],
      },
      {
        title: "Manage customers",
        description: "Customers keeps a list of everyone who shops with you, including their balances and loyalty points.",
        href: "/customers",
        icon: <Users className="h-4 w-4" />,
        roles: ["business_owner", "manager", "cashier"],
      },
    ],
  },
  {
    key: "finance",
    label: "Expenses & Reports",
    icon: <BarChart3 className="h-5 w-5" />,
    color: "from-rose-500 to-red-600",
    steps: [
      {
        title: "Record expenses",
        description: "Expenses lets you log your operating costs so profit reports are accurate.",
        href: "/expenses",
        icon: <Wallet className="h-4 w-4" />,
        roles: ["business_owner", "manager", "accountant"],
      },
      {
        title: "Read financial reports",
        description: "Financial reports break down revenue, profit, and expenses by day, week, or month. Export to Excel anytime.",
        href: "/reports/financial",
        icon: <BarChart3 className="h-4 w-4" />,
        roles: ["business_owner", "manager", "accountant"],
      },
      {
        title: "Use sales & inventory reports",
        description: "See your top products, sales trends, low-stock items, and dead stock so you can buy and price smarter.",
        href: "/reports/sales",
        icon: <BarChart3 className="h-4 w-4" />,
        roles: ["business_owner", "manager", "accountant", "inventory_officer"],
      },
    ],
  },
  {
    key: "team",
    label: "Team & Settings",
    icon: <UserCog className="h-5 w-5" />,
    color: "from-cyan-500 to-sky-600",
    steps: [
      {
        title: "Invite employees",
        description: "Settings > Users > Add User. Assign a role — cashier, manager, accountant, or inventory officer — and they can sign in right away.",
        href: "/settings/users",
        icon: <UserCog className="h-4 w-4" />,
        roles: ["business_owner", "manager"],
      },
      {
        title: "Update your profile",
        description: "Keep your name, email, and password current in Settings > Profile.",
        href: "/settings/profile",
        icon: <Settings className="h-4 w-4" />,
        roles: ["business_owner", "manager", "cashier", "accountant", "inventory_officer"],
      },
      {
        title: "Manage branches",
        description: "If you run multiple locations, set them up under Branches so stock and sales stay organized per location.",
        href: "/branches",
        icon: <Settings className="h-4 w-4" />,
        roles: ["business_owner"],
      },
    ],
  },
]

const roleLabels: Record<string, string> = {
  business_owner: "Owner",
  manager: "Manager",
  cashier: "Cashier",
  accountant: "Accountant",
  inventory_officer: "Inventory Officer",
  super_admin: "Admin",
}

function getStepsForRole(role: string): TutorialStep[] {
  return modules.flatMap((m) => m.steps.filter((s) => s.roles.includes(role) || role === "super_admin"))
}

function TutorialCard({
  step,
  index,
  onStart,
}: {
  step: TutorialStep
  index: number
  onStart: (s: TutorialStep) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card glass className="p-5 h-full flex flex-col">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            {step.icon}
          </div>
          <h3 className="font-semibold text-foreground text-sm leading-tight">{step.title}</h3>
        </div>
        <p className="text-sm text-muted-foreground flex-1 mb-4 leading-relaxed">{step.description}</p>
        <Button
          size="sm"
          variant="outline"
          className="w-full gap-2"
          onClick={() => onStart(step)}
        >
          <Play className="h-3.5 w-3.5" />
          Open {step.href === "/pos" ? "POS" : "guide"}
        </Button>
      </Card>
    </motion.div>
  )
}

export default function TutorialPage() {
  const { data: session } = useSession()
  const role = (session?.user?.role ?? "") as Role
  const roleLabel = roleLabels[role] || "User"

  const allSteps = React.useMemo(() => getStepsForRole(role), [role])
  const [activeModule, setActiveModule] = React.useState<string>("all")
  const [query, setQuery] = React.useState("")
  const [showGuide, setShowGuide] = React.useState<TutorialStep | null>(null)
  const [completed, setCompleted] = React.useState<Record<string, boolean>>({})
  const [tourIndex, setTourIndex] = React.useState(0)
  const [tourOpen, setTourOpen] = React.useState(false)

  const filtered = allSteps.filter((step) => {
    const matchesModule = activeModule === "all" || modules.find((m) => m.steps.includes(step))?.key === activeModule
    const matchesQuery =
      !query ||
      step.title.toLowerCase().includes(query.toLowerCase()) ||
      step.description.toLowerCase().includes(query.toLowerCase())
    return matchesModule && matchesQuery
  })

  const startTour = () => {
    setTourIndex(0)
    setTourOpen(true)
  }

  const tourStep = filtered[tourIndex]

  const toggleComplete = (title: string) => {
    setCompleted((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Tutorial"
        description="Learn how to use RetailFlow step by step"
        actions={
          <Button onClick={startTour} disabled={filtered.length === 0}>
            <Play className="h-4 w-4" />
            Start guided tour
          </Button>
        }
      />

      <Card glass className="p-5 sm:p-6 bg-gradient-to-br from-emerald-600/10 to-teal-600/5 border-emerald-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground">Welcome{roleLabel ? `, ${roleLabel}` : ""}!</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              This walkthrough shows you everything you can do in RetailFlow. Pick a topic below, or start the guided tour.
              {allSteps.length > 0 && (
                <span className="mt-1 block">
                  You have access to{" "}
                  <span className="font-medium text-foreground">
                    {completed ? Object.values(completed).filter(Boolean).length : 0}/{allSteps.length}
                  </span>{" "}
                  guides.
                </span>
              )}
            </p>
          </div>
          <Badge variant="primary" className="shrink-0 capitalize">{roleLabel} view</Badge>
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveModule("all")}
          className={cn(
            "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
            activeModule === "all"
              ? "bg-primary/20 text-primary border-primary/30"
              : "text-muted-foreground border-border/50 hover:text-foreground hover:border-border"
          )}
        >
          All
        </button>
        {modules.map((m) => {
          const hasAccess = m.steps.some((s) => s.roles.includes(role) || role === "super_admin")
          if (!hasAccess) return null
          return (
            <button
              key={m.key}
              onClick={() => setActiveModule(m.key)}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border whitespace-nowrap",
                activeModule === m.key
                  ? "bg-primary/20 text-primary border-primary/30"
                  : "text-muted-foreground border-border/50 hover:text-foreground hover:border-border"
              )}
            >
              {m.label}
            </button>
          )
        })}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tutorials..."
          className="flex h-10 w-full rounded-xl border border-border/50 bg-muted/50 pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
        />
      </div>

      {filtered.length === 0 ? (
        <Card glass className="p-10 text-center">
          <Search className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No tutorials match your search</p>
          <p className="text-muted-foreground/50 text-xs mt-1">Try a different keyword or category</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((step, i) => (
            <TutorialCard key={step.title} step={step} index={i} onStart={setShowGuide} />
          ))}
        </div>
      )}

      <Card glass className="p-6 text-center">
        <RotateCcw className="h-8 w-8 text-primary mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-foreground">Finished the basics?</h2>
        <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-md mx-auto">
          Put it into practice — head to the POS and ring up a sale, or add your first product.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild>
            <Link href="/pos">
              <ShoppingCart className="h-4 w-4" />
              Open POS
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/inventory/products/new">
              <Package className="h-4 w-4" />
              Add a product
            </Link>
          </Button>
        </div>
      </Card>

      {/* Step guide dialog */}
      <AnimatePresence>
        {showGuide && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowGuide(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: "spring", damping: 28, stiffness: 350 }}
              className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-2xl border border-border/60 bg-background p-6 shadow-2xl max-h-[85vh] overflow-y-auto"
              role="dialog"
              aria-modal="true"
              aria-label="Tutorial guide"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                      {showGuide.icon}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">{showGuide.title}</h2>
                      <p className="text-xs text-muted-foreground capitalize">{roleLabel} guide</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowGuide(null)}
                    className="text-muted-foreground hover:text-foreground text-sm"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">{showGuide.description}</p>

                <div className="rounded-xl border border-border/40 bg-muted/40 p-4 space-y-2">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wider">How to do it</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{showGuide.description}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild className="flex-1">
                    <Link href={showGuide.href} onClick={() => setShowGuide(null)}>
                      Open {showGuide.href === "/pos" ? "POS" : "page"}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className={cn(completed[showGuide.title] && "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400")}
                    onClick={() => toggleComplete(showGuide.title)}
                  >
                    {completed[showGuide.title] ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                    {completed[showGuide.title] ? "Completed" : "Mark as done"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Guided tour overlay */}
      <AnimatePresence>
        {tourOpen && tourStep && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setTourOpen(false)}
            />
            <motion.div
              key={tourIndex}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
              className="fixed bottom-0 left-0 right-0 sm:left-[50%] sm:right-auto sm:bottom-6 sm:w-[520px] sm:-translate-x-1/2 z-50 mx-auto sm:mx-0 rounded-t-2xl sm:rounded-2xl border border-border/60 bg-background p-6 shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label={`Tour step ${tourIndex + 1} of ${filtered.length}`}
            >
              <div className="flex items-center justify-between mb-1">
                <Badge variant="primary" className="gap-1">
                  <Play className="h-3 w-3" />
                  Step {tourIndex + 1} of {filtered.length}
                </Badge>
                <button
                  onClick={() => setTourOpen(false)}
                  className="text-muted-foreground hover:text-foreground text-sm"
                  aria-label="Close tour"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                  {tourStep.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{tourStep.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {modules.find((m) => m.steps.includes(tourStep))?.label}
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-5">{tourStep.description}</p>

              <div className="flex items-center gap-1.5 mb-5">
                {filtered.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      i === tourIndex ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/25"
                    )}
                  />
                ))}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setTourIndex((i) => Math.max(0, i - 1))}
                  disabled={tourIndex === 0}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <div className="flex-1" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toggleComplete(tourStep.title)
                  }}
                >
                  {completed[tourStep.title] ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                  Done
                </Button>
                {tourIndex < filtered.length - 1 ? (
                  <Button onClick={() => setTourIndex((i) => i + 1)}>
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button asChild onClick={() => setTourOpen(false)}>
                    <Link href={tourStep.href}>
                      <CheckCircle2 className="h-4 w-4" />
                      Finish tour
                    </Link>
                  </Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
