"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Bell,
  Mail,
  ShoppingCart,
  Package,
  TrendingUp,
  AlertTriangle,
  Settings2,
  FileText,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"
import { getNotificationPreferences, updateNotificationPreferences } from "@/actions/settings.actions"
import { cn } from "@/lib/utils/cn"

interface NotificationPref {
  id: string
  title: string
  description: string
  icon: React.ElementType
  email: boolean
  inApp: boolean
}

const PREF_ICONS: Record<string, React.ElementType> = {
  new_sale: ShoppingCart,
  low_stock: AlertTriangle,
  out_of_stock: Package,
  daily_report: TrendingUp,
  purchase_order: FileText,
  expiry_alert: AlertTriangle,
  system_update: Settings2,
  invoice_reminder: Mail,
}

const PREF_COLORS: Record<string, string> = {
  new_sale: "text-emerald-600 dark:text-emerald-400",
  low_stock: "text-amber-600 dark:text-amber-400",
  out_of_stock: "text-red-600 dark:text-red-400",
  daily_report: "text-primary",
  purchase_order: "text-primary",
  expiry_alert: "text-orange-600 dark:text-orange-400",
  system_update: "text-muted-foreground",
  invoice_reminder: "text-primary",
}

export default function NotificationSettingsPage() {
  const [prefs, setPrefs] = React.useState<NotificationPref[]>([
    { id: "new_sale", title: "New Sale", description: "When a sale is completed", icon: ShoppingCart, email: true, inApp: true },
    { id: "low_stock", title: "Low Stock Alert", description: "When a product runs low", icon: AlertTriangle, email: true, inApp: true },
    { id: "out_of_stock", title: "Out of Stock", description: "When a product is out of stock", icon: Package, email: true, inApp: true },
    { id: "daily_report", title: "Daily Report", description: "End-of-day sales summary", icon: TrendingUp, email: true, inApp: false },
    { id: "purchase_order", title: "Purchase Orders", description: "PO approvals and receipts", icon: FileText, email: true, inApp: true },
    { id: "expiry_alert", title: "Expiry Alert", description: "Products nearing expiration", icon: AlertTriangle, email: true, inApp: true },
    { id: "system_update", title: "System Updates", description: "Feature releases and maintenance", icon: Settings2, email: false, inApp: true },
    { id: "invoice_reminder", title: "Invoice Reminders", description: "Overdue payment reminders", icon: Mail, email: true, inApp: true },
  ])

  const toggle = (id: string, field: "email" | "inApp") => {
    setPrefs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: !p[field] } : p))
    )
  }

  React.useEffect(() => {
    getNotificationPreferences().then((res) => {
      if (res.success && res.data) {
        setPrefs((prev) =>
          prev.map((p) => {
            const saved = res.data[p.id]
            if (!saved) return p
            return { ...p, email: saved.email, inApp: saved.inApp }
          })
        )
      }
    })
  }, [])

  const handleSave = async () => {
    const payload: Record<string, { email: boolean; inApp: boolean }> = {}
    prefs.forEach((p) => {
      payload[p.id] = { email: p.email, inApp: p.inApp }
    })
    const res = await updateNotificationPreferences(payload)
    if (res.success) {
      toast.success("Notification preferences saved")
    } else {
      toast.error(res.error || "Failed to save preferences")
    }
  }

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Notification Preferences"
        description="Configure how you receive notifications"
        actions={
          <Button onClick={handleSave}>
            Save Preferences
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card glass>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5 text-primary" />
              Notification Types
            </CardTitle>
            <CardDescription>Choose which notifications you want to receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {prefs.map((pref, index) => (
              <motion.div
                key={pref.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center gap-4 rounded-xl border border-border/30 bg-card/50 backdrop-blur-sm p-4 transition-colors hover:bg-muted/30"
              >
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <pref.icon className={cn("h-4 w-4", PREF_COLORS[pref.id] || "text-primary")} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{pref.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{pref.description}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground whitespace-nowrap">Email</Label>
                    <Switch
                      checked={pref.email}
                      onCheckedChange={() => toggle(pref.id, "email")}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground whitespace-nowrap">In-App</Label>
                    <Switch
                      checked={pref.inApp}
                      onCheckedChange={() => toggle(pref.id, "inApp")}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="h-5 w-5 text-primary" />
                Email Notifications
              </CardTitle>
              <CardDescription>Receive email alerts for important events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {prefs.map((pref, index) => (
                <motion.div
                  key={pref.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center justify-between"
                >
                  <div>
                    <Label className="text-sm text-foreground">{pref.title}</Label>
                    <p className="text-xs text-muted-foreground">{pref.description}</p>
                  </div>
                  <Switch
                    checked={pref.email}
                    onCheckedChange={() => toggle(pref.id, "email")}
                  />
                </motion.div>
              ))}
            </CardContent>
          </Card>

          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="h-5 w-5 text-primary" />
                In-App Notifications
              </CardTitle>
              <CardDescription>Show notifications within the dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {prefs.map((pref, index) => (
                <motion.div
                  key={pref.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center justify-between"
                >
                  <div>
                    <Label className="text-sm text-foreground">{pref.title}</Label>
                    <p className="text-xs text-muted-foreground">{pref.description}</p>
                  </div>
                  <Switch
                    checked={pref.inApp}
                    onCheckedChange={() => toggle(pref.id, "inApp")}
                  />
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
