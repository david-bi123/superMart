"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bell,
  CheckCheck,
  Trash2,
  ShoppingCart,
  Package,
  AlertTriangle,
  TrendingUp,
  FileText,
  Settings2,
  Info,
  Mail,
  CheckCircle2,
  Clock,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Card } from "@/components/ui/card"
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
import { toast } from "@/components/ui/toast"
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/actions/settings.actions"

interface NotificationRow {
  _id: string
  type: string
  title: string
  message: string
  read: boolean
  link: string
  sentAt: string
  createdAt: string
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  new_sale: ShoppingCart,
  low_stock: AlertTriangle,
  out_of_stock: Package,
  daily_report: TrendingUp,
  purchase_order: FileText,
  expiry_alert: AlertTriangle,
  system_update: Settings2,
  invoice_reminder: Mail,
}

const TYPE_COLORS: Record<string, string> = {
  new_sale: "from-emerald-500/10 to-teal-500/10 text-emerald-400",
  low_stock: "from-amber-500/10 to-yellow-500/10 text-amber-400",
  out_of_stock: "from-red-500/10 to-rose-500/10 text-red-400",
  daily_report: "from-blue-500/10 to-cyan-500/10 text-blue-400",
  purchase_order: "from-violet-500/10 to-indigo-500/10 text-violet-400",
  expiry_alert: "from-orange-500/10 to-red-500/10 text-orange-400",
  system_update: "from-gray-500/10 to-slate-500/10 text-gray-400",
  invoice_reminder: "from-purple-500/10 to-pink-500/10 text-purple-400",
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = React.useState<NotificationRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [typeFilter, setTypeFilter] = React.useState("")
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)

  const fetchNotifications = React.useCallback(async () => {
    setLoading(true)
    const res = await getNotifications({
      type: typeFilter || undefined,
      page,
      limit: 20,
    })
    if (res.success) {
      setNotifications(res.data as NotificationRow[])
      setUnreadCount(res.unreadCount)
      setTotalPages(res.pagination.totalPages)
    }
    setLoading(false)
  }, [typeFilter, page])

  React.useEffect(() => { fetchNotifications() }, [fetchNotifications])

  const handleMarkRead = async (id: string) => {
    const res = await markNotificationRead(id)
    if (res.success) {
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      )
      setUnreadCount((c) => Math.max(0, c - 1))
    }
  }

  const handleMarkAllRead = async () => {
    const res = await markAllNotificationsRead()
    if (res.success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
      toast.success("All notifications marked as read")
    }
  }

  const getIcon = (type: string) => {
    const Icon = TYPE_ICONS[type] || Info
    return Icon
  }

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Notifications"
        description={`${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead} disabled={unreadCount === 0}>
              <CheckCheck className="h-4 w-4" />
              Mark All Read
            </Button>
          </div>
        }
      />

      <Card glass className="p-5">
        <div className="flex items-center gap-4 mb-4">
          <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1) }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="new_sale">Sales</SelectItem>
              <SelectItem value="low_stock">Low Stock</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              <SelectItem value="purchase_order">Purchase Orders</SelectItem>
              <SelectItem value="expiry_alert">Expiry Alerts</SelectItem>
              <SelectItem value="daily_report">Daily Reports</SelectItem>
              <SelectItem value="system_update">System Updates</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4 p-4">
                <Skeleton variant="circular" className="h-10 w-10" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-64" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={<Bell className="h-8 w-8" />}
            title="No notifications"
            description={typeFilter ? "No notifications for this type" : "You're all caught up!"}
          />
        ) : (
          <div className="space-y-1">
            <AnimatePresence mode="popLayout">
              {notifications.map((n) => {
                const Icon = getIcon(n.type)
                return (
                  <motion.div
                    key={n._id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`relative flex items-start gap-4 rounded-xl p-4 transition-colors cursor-pointer ${
                      n.read
                        ? "hover:bg-white/[0.02]"
                        : "bg-gradient-to-r from-violet-500/5 to-indigo-500/5 border border-violet-500/10 hover:from-violet-500/10 hover:to-indigo-500/10"
                    }`}
                    onClick={() => !n.read && handleMarkRead(n._id)}
                  >
                    {!n.read && (
                      <span className="absolute top-4 left-2 w-2 h-2 rounded-full bg-violet-500" />
                    )}
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 ${TYPE_COLORS[n.type] || "from-white/5 to-white/10 text-white/40"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0 pl-2">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm ${n.read ? "text-white/60" : "text-white font-medium"}`}>
                          {n.title}
                        </p>
                        {n.read && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
                      </div>
                      <p className={`text-xs mt-0.5 ${n.read ? "text-white/30" : "text-white/50"}`}>
                        {n.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Clock className="h-3 w-3 text-white/20" />
                        <span className="text-[10px] text-white/20">
                          {new Date(n.sentAt).toLocaleDateString()} at {new Date(n.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <Badge variant="outline" className="text-[10px]">{n.type.replace(/_/g, " ")}</Badge>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/5">
            <p className="text-sm text-white/40">Page {page} of {totalPages}</p>
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
