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

interface NotificationPref {
  id: string
  title: string
  description: string
  icon: React.ElementType
  email: boolean
  inApp: boolean
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

  const handleSave = () => {
    toast.success("Notification preferences saved")
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
              <Bell className="h-5 w-5 text-violet-400" />
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
                className="flex items-start gap-4 rounded-xl p-4 transition-colors hover:bg-white/[0.03]"
              >
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center shrink-0">
                  <pref.icon className="h-4 w-4 text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{pref.title}</p>
                  <p className="text-xs text-white/40 mt-0.5">{pref.description}</p>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="h-5 w-5 text-violet-400" />
                Email Notifications
              </CardTitle>
              <CardDescription>Receive email alerts for important events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {prefs.filter((p) => p.email !== undefined).map((pref, index) => (
                <motion.div
                  key={pref.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center justify-between"
                >
                  <div>
                    <Label className="text-sm text-white/80">{pref.title}</Label>
                    <p className="text-xs text-white/40">{pref.description}</p>
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
                <Bell className="h-5 w-5 text-violet-400" />
                In-App Notifications
              </CardTitle>
              <CardDescription>Show notifications within the dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {prefs.filter((p) => p.inApp !== undefined).map((pref, index) => (
                <motion.div
                  key={pref.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center justify-between"
                >
                  <div>
                    <Label className="text-sm text-white/80">{pref.title}</Label>
                    <p className="text-xs text-white/40">{pref.description}</p>
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
