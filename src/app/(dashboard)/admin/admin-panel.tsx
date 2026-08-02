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
import { getTenants, getAdminStats, setTenantActive } from "@/actions/superadmin.actions"
import { formatMoney } from "@/lib/format"

interface TenantRow {
  _id: string
  name: string
  slug: string
  email: string
  isActive: boolean
  isSuspended: boolean
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

export function AdminPanel() {
  const [tenants, setTenants] = React.useState<TenantRow[]>([])
  const [stats, setStats] = React.useState<{
    tenants: number
    activeTenants: number
    trialingTenants: number
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
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <RefreshCw className="h-4 w-4" />
            Reset Filters
          </Button>
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="trialing">Trialing</SelectItem>
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
                  <TableHead className="text-right">Suspend</TableHead>
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
                      {tenant.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="destructive">Suspended</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Switch
                        checked={tenant.isActive}
                        disabled={toggling === tenant._id}
                        onCheckedChange={() => handleToggle(tenant)}
                      />
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
    </div>
  )
}