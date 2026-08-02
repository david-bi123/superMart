"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Building2,
  Users,
  Globe,
  Clock,
  Search,
  ShieldAlert,
  Coins,
  RefreshCw,
  Plus,
  Check,
  X,
  Store,
  Mail,
  Phone,
  User,
  KeyRound,
  Copy,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "@/components/ui/toast"
import {
  getTenants,
  getAdminStats,
  setTenantActive,
  createTenant,
  approveTenant,
  rejectTenant,
} from "@/actions/superadmin.actions"
import { formatMoney } from "@/lib/format"

interface TenantRow {
  _id: string
  name: string
  slug: string
  email: string
  isActive: boolean
  isSuspended: boolean
  approvalStatus: string
  subscriptionTier: string
  subscriptionStatus: string
  storageUsed: number
  storageLimit: number
  users: number
  createdAt: string
}

const TIER_COLORS: Record<string, "default" | "primary" | "secondary" | "warning"> = {
  free: "default",
  starter: "secondary",
  professional: "primary",
  enterprise: "warning",
}

interface CreateTenantResult {
  email: string
  temporaryPassword: string
}

export function AdminPanel() {
  const [tenants, setTenants] = React.useState<TenantRow[]>([])
  const [stats, setStats] = React.useState<{
    tenants: number
    activeTenants: number
    trialingTenants: number
    pendingTenants: number
    users: number
    revenue: number
  } | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState("")
  const [tier, setTier] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [toggling, setToggling] = React.useState<string | null>(null)
  const [acting, setActing] = React.useState<string | null>(null)

  const [createOpen, setCreateOpen] = React.useState(false)
  const [createLoading, setCreateLoading] = React.useState(false)
  const [createResult, setCreateResult] = React.useState<CreateTenantResult | null>(null)
  const [form, setForm] = React.useState({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
  })

  const fetchStats = React.useCallback(async () => {
    const res = await getAdminStats()
    if (res.success) setStats(res.data)
  }, [])

  const fetchTenants = React.useCallback(async () => {
    setLoading(true)
    const res = await getTenants({
      search,
      status: status || undefined,
      tier: tier || undefined,
      page,
      limit: 20,
    })
    if (res.success) {
      setTenants(res.data as TenantRow[])
      setTotalPages(res.pagination.totalPages)
    }
    setLoading(false)
  }, [search, status, tier, page])

  React.useEffect(() => {
    fetchStats()
  }, [fetchStats])

  React.useEffect(() => {
    fetchTenants()
  }, [fetchTenants])

  const handleToggle = async (tenant: TenantRow) => {
    setToggling(tenant._id)
    const res = await setTenantActive(tenant._id, !tenant.isActive)
    if (res.success) {
      toast.success(`${tenant.name} ${res.data.isActive ? "activated" : "suspended"}`)
      fetchTenants()
      fetchStats()
    } else {
      toast.error(res.error)
    }
    setToggling(null)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.businessName.trim() || !form.ownerName.trim() || !form.email.trim()) {
      toast.error("Please fill in all required fields")
      return
    }
    setCreateLoading(true)
    const res = await createTenant(form)
    if (res.success && res.data) {
      setCreateResult({ email: res.data.email, temporaryPassword: res.data.temporaryPassword })
      toast.success("Shop created successfully")
      setForm({ businessName: "", ownerName: "", email: "", phone: "" })
      fetchTenants()
      fetchStats()
    } else {
      toast.error(res.error || "Failed to create shop")
    }
    setCreateLoading(false)
  }

  const handleApprove = async (tenant: TenantRow) => {
    setActing(tenant._id)
    const res = await approveTenant(tenant._id)
    if (res.success) {
      toast.success(`${tenant.name} approved`)
      fetchTenants()
      fetchStats()
    } else {
      toast.error(res.error)
    }
    setActing(null)
  }

  const handleReject = async (tenant: TenantRow) => {
    setActing(tenant._id)
    const res = await rejectTenant(tenant._id)
    if (res.success) {
      toast.success(`${tenant.name} rejected`)
      fetchTenants()
      fetchStats()
    } else {
      toast.error(res.error)
    }
    setActing(null)
  }

  const copyPassword = () => {
    if (createResult) {
      navigator.clipboard?.writeText(createResult.temporaryPassword)
      toast.success("Password copied")
    }
  }

  const closeCreate = () => {
    setCreateOpen(false)
    setCreateResult(null)
    setForm({ businessName: "", ownerName: "", email: "", phone: "" })
  }

  const resetFilters = () => {
    setSearch("")
    setStatus("")
    setTier("")
    setPage(1)
  }

  const statCards = [
    {
      title: "Total Tenants",
      value: stats?.tenants ?? 0,
      icon: Building2,
      variant: "primary" as const,
    },
    {
      title: "Active Tenants",
      value: stats?.activeTenants ?? 0,
      icon: Globe,
      variant: "success" as const,
    },
    {
      title: "Pending Approval",
      value: stats?.pendingTenants ?? 0,
      icon: Clock,
      variant: "warning" as const,
    },
    {
      title: "Platform Users",
      value: stats?.users ?? 0,
      icon: Users,
      variant: "primary" as const,
    },
    {
      title: "Suspended/Off-Track",
      value: (stats?.tenants ?? 0) - (stats?.activeTenants ?? 0),
      icon: ShieldAlert,
      variant: "danger" as const,
    },
    {
      title: "MRR (Subscription)",
      value: formatMoney(stats?.revenue ?? 0, 0),
      icon: Coins,
      variant: "success" as const,
    },
    {
      title: "Trialing",
      value: stats?.trialingTenants ?? 0,
      icon: Clock,
      variant: "warning" as const,
    },
  ]

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Platform Admin"
        description="Manage shops and tenants on the RetailFlow platform"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <RefreshCw className="h-4 w-4" />
              Reset Filters
            </Button>
            <Button variant="gradient" size="sm" onClick={() => { setCreateResult(null); setCreateOpen(true) }}>
              <Plus className="h-4 w-4" />
              Create Shop
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, index) => (
          <StatsCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            variant={card.variant}
            loading={loading && index === 0}
          />
        ))}
      </div>

      <Card glass className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search tenants..."
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={status} onValueChange={(v) => { setStatus(v === "all" ? "" : v); setPage(1) }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending Approval</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="trialing">Trialing</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tier} onValueChange={(v) => { setTier(v === "all" ? "" : v); setPage(1) }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-20 rounded-full flex-1" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : tenants.length === 0 ? (
          <EmptyState
            icon={<Building2 className="h-8 w-8" />}
            title="No tenants found"
            description={search || status || tier ? "Try adjusting your filters" : "No businesses have registered yet"}
          />
        ) : (
          <div className="rounded-xl border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="hidden sm:table-cell">Users</TableHead>
                  <TableHead className="hidden md:table-cell">Storage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((tenant, index) => (
                  <motion.tr
                    key={tenant._id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.015 }}
                    className="border-b border-border/20 transition-colors hover:bg-muted/30"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{tenant.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate max-w-[160px]">{tenant.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{tenant.subscriptionTier}</Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-sm text-foreground">{tenant.users}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div>
                        <span className="text-xs text-muted-foreground">
                          {((tenant.storageLimit ? (tenant.storageUsed / tenant.storageLimit) * 100 : 0).toFixed(0))}%
                        </span>
                        <div className="h-1.5 w-20 rounded-full bg-muted/50 mt-1 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${Math.min(100, tenant.storageLimit ? (tenant.storageUsed / tenant.storageLimit) * 100 : 0)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {tenant.approvalStatus === "pending" ? (
                        <Badge variant="warning">Pending</Badge>
                      ) : tenant.approvalStatus === "rejected" ? (
                        <Badge variant="destructive">Rejected</Badge>
                      ) : tenant.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="destructive">Suspended</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {tenant.approvalStatus === "pending" ? (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              disabled={acting === tenant._id}
                              onClick={() => handleApprove(tenant)}
                            >
                              <Check className="h-3.5 w-3.5" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={acting === tenant._id}
                              onClick={() => handleReject(tenant)}
                              className="text-destructive hover:text-destructive"
                            >
                              <X className="h-3.5 w-3.5" />
                              Reject
                            </Button>
                          </>
                        ) : tenant.approvalStatus === "rejected" ? (
                          <Button
                            size="sm"
                            variant="default"
                            disabled={acting === tenant._id}
                            onClick={() => handleApprove(tenant)}
                          >
                            <Check className="h-3.5 w-3.5" />
                            Approve
                          </Button>
                        ) : (
                          <Switch
                            checked={tenant.isActive}
                            disabled={toggling === tenant._id}
                            onCheckedChange={() => handleToggle(tenant)}
                          />
                        )}
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/20">
            <p className="text-sm text-muted-foreground">Page {page} of {totalPages} ({tenants.length} results)</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      <Dialog open={createOpen} onOpenChange={(open) => { if (!open) closeCreate() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Shop</DialogTitle>
            <DialogDescription>
              Creates a new tenant and a default owner account. The owner can reset their password later.
            </DialogDescription>
          </DialogHeader>

          {createResult ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 p-4 space-y-2">
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  Shop created successfully
                </p>
                <p className="text-xs text-muted-foreground">
                  Share these credentials with the owner. They can reset the password from the login page.
                </p>
              </div>
              <div className="rounded-xl border border-border/60 p-4 space-y-2 bg-muted/20">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium text-foreground">{createResult.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <KeyRound className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Password:</span>
                  <span className="font-mono font-medium text-foreground">{createResult.temporaryPassword}</span>
                  <Button size="sm" variant="ghost" onClick={copyPassword} className="ml-auto">
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={closeCreate} className="w-full sm:w-auto">
                  Done
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                label="Business Name"
                required
                placeholder="My Store Inc."
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                icon={<Store className="h-4 w-4" />}
              />
              <Input
                label="Owner Name"
                required
                placeholder="John Doe"
                value={form.ownerName}
                onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                icon={<User className="h-4 w-4" />}
              />
              <Input
                label="Owner Email"
                required
                type="email"
                placeholder="owner@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                icon={<Mail className="h-4 w-4" />}
              />
              <Input
                label="Phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                icon={<Phone className="h-4 w-4" />}
              />
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={closeCreate}>
                  Cancel
                </Button>
                <Button type="submit" loading={createLoading} variant="gradient">
                  Create Shop
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
