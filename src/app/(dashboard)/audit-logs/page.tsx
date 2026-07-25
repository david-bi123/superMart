"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Search,
  Filter,
  RefreshCw,
  Calendar,
  History,
  Monitor,
  Globe,
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
  Tabs,
  TabsList,
  TabsTrigger,
  AnimatedTabsContent,
} from "@/components/ui/tabs"
import { toast } from "@/components/ui/toast"
import { getAuditLogs } from "@/actions/settings.actions"

interface AuditLogRow {
  _id: string
  userId: string
  userName: string
  userEmail: string
  action: string
  resource: string
  resourceId: string
  details: any
  ip: string
  userAgent: string
  createdAt: string
}

const ACTION_COLORS: Record<string, "default" | "primary" | "secondary" | "destructive" | "success" | "warning"> = {
  created: "success",
  updated: "primary",
  deleted: "destructive",
  deactivated: "destructive",
  cancelled: "destructive",
  upgraded: "warning",
  approved: "success",
  received: "secondary",
}

export default function AuditLogsPage() {
  const [logs, setLogs] = React.useState<AuditLogRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [actionFilter, setActionFilter] = React.useState("")
  const [resourceFilter, setResourceFilter] = React.useState("")
  const [dateFrom, setDateFrom] = React.useState("")
  const [dateTo, setDateTo] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)

  const fetchLogs = React.useCallback(async () => {
    setLoading(true)
    const res = await getAuditLogs({
      search,
      action: actionFilter || undefined,
      resource: resourceFilter || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      page,
      limit: 50,
    })
    if (res.success) {
      setLogs(res.data as AuditLogRow[])
      setTotalPages(res.pagination.totalPages)
    }
    setLoading(false)
  }, [search, actionFilter, resourceFilter, dateFrom, dateTo, page])

  React.useEffect(() => { fetchLogs() }, [fetchLogs])

  const getActionBadge = (action: string) => {
    const key = action.split(".")[1] || action
    const color = ACTION_COLORS[key] || "default"
    return <Badge variant={color}>{action}</Badge>
  }

  const formatUA = (ua: string) => {
    if (!ua) return "—"
    if (ua.length > 40) return ua.slice(0, 40) + "..."
    return ua
  }

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Audit Logs"
        description="Track all activities and changes in your business"
        actions={
          <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setActionFilter(""); setResourceFilter(""); setDateFrom(""); setDateTo(""); setPage(1) }}>
            <RefreshCw className="h-4 w-4" />
            Reset Filters
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
              placeholder="Search actions or resources..."
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1) }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="updated">Updated</SelectItem>
                <SelectItem value="deactivated">Deactivated</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="received">Received</SelectItem>
              </SelectContent>
            </Select>
            <Select value={resourceFilter} onValueChange={(v) => { setResourceFilter(v); setPage(1) }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Resource" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                <SelectItem value="Sale">Sales</SelectItem>
                <SelectItem value="PurchaseOrder">Purchase Orders</SelectItem>
                <SelectItem value="Product">Products</SelectItem>
                <SelectItem value="Customer">Customers</SelectItem>
                <SelectItem value="User">Users</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="Tax">Taxes</SelectItem>
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
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-28 rounded-full flex-1" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <EmptyState
            icon={<History className="h-8 w-8" />}
            title="No audit logs found"
            description={search || actionFilter || resourceFilter ? "Try adjusting your filters" : "No activity recorded yet"}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="p-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Timestamp</th>
                  <th className="p-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">User</th>
                  <th className="p-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Action</th>
                  <th className="p-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Resource</th>
                  <th className="p-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider hidden lg:table-cell">IP</th>
                  <th className="p-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider hidden xl:table-cell">User Agent</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <motion.tr
                    key={log._id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.015 }}
                    className="border-b border-white/5 transition-colors hover:bg-white/[0.03]"
                  >
                    <td className="p-3">
                      <span className="text-sm text-white/70 whitespace-nowrap font-mono">
                        {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-semibold shrink-0">
                          {log.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm text-white truncate max-w-[120px]">{log.userName}</p>
                          <p className="text-[10px] text-white/30 truncate max-w-[120px]">{log.userEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">{getActionBadge(log.action)}</td>
                    <td className="p-3">
                      <div>
                        <span className="text-sm text-white">{log.resource}</span>
                        {log.resourceId && (
                          <p className="text-[10px] text-white/30 font-mono truncate max-w-[100px]">ID: {log.resourceId}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      <span className="text-xs text-white/40 font-mono">{log.ip || "—"}</span>
                    </td>
                    <td className="p-3 hidden xl:table-cell">
                      <span className="text-xs text-white/30 font-mono" title={log.userAgent}>
                        {formatUA(log.userAgent)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/5">
            <p className="text-sm text-white/40">Page {page} of {totalPages} ({logs.length} results)</p>
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
