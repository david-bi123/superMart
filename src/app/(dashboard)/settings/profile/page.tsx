"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Save,
  Store,
  Upload,
  Building2,
  Globe,
  Clock,
  Hash,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"
import { getBusinessSettings, updateBusinessProfile } from "@/actions/settings.actions"

const TIMEZONES = [
  "UTC", "America/New_York", "America/Chicago", "America/Denver",
  "America/Los_Angeles", "Europe/London", "Europe/Paris", "Europe/Berlin",
  "Asia/Tokyo", "Asia/Shanghai", "Asia/Dubai", "Asia/Kolkata",
  "Australia/Sydney", "Pacific/Auckland",
]

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "GHS", symbol: "₵", name: "Ghanaian Cedi" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
]

export default function ProfileSettingsPage() {
  const [form, setForm] = React.useState({
    name: "", email: "", phone: "", logo: "", tin: "", currency: "USD", timezone: "UTC",
    address: { street: "", city: "", state: "", zip: "", country: "US" },
  })
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    getBusinessSettings().then((res) => {
      if (res.success && res.data) {
        const d = res.data
        setForm({
          name: d.name,
          email: d.email,
          phone: d.phone,
          logo: d.logo || "",
          tin: d.tin || "",
          currency: d.currency,
          timezone: d.timezone,
          address: d.address || { street: "", city: "", state: "", zip: "", country: "US" },
        })
      }
      setLoading(false)
    })
  }, [])

  const update = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const updateAddress = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, address: { ...prev.address, [field]: value } }))
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) { toast.error("Only image files are allowed"); return }
    if (file.size > 2 * 1024 * 1024) { toast.error("File must be less than 2MB"); return }
    const reader = new FileReader()
    reader.onload = () => update("logo", reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setSaving(true)
    const res = await updateBusinessProfile(form)
    if (res.success) {
      toast.success("Business profile updated")
    } else {
      toast.error(res.error || "Failed to update")
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Business Profile" description="Manage your business information" />
        <Card glass className="p-8">
          <div className="space-y-4 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 rounded-xl bg-muted" />
            ))}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Business Profile"
        description="Manage your business information"
        actions={
          <Button onClick={handleSave} loading={saving}>
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card glass className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-primary" />
              Business Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Business Name" value={form.name} onChange={(e) => update("name", e.target.value)} />
              <Input label="Email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
              <Input label="TIN / Tax ID" value={form.tin} onChange={(e) => update("tin", e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Street" value={form.address.street} onChange={(e) => updateAddress("street", e.target.value)} />
              <Input label="City" value={form.address.city} onChange={(e) => updateAddress("city", e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input label="State" value={form.address.state} onChange={(e) => updateAddress("state", e.target.value)} />
              <Input label="ZIP Code" value={form.address.zip} onChange={(e) => updateAddress("zip", e.target.value)} />
              <Input label="Country" value={form.address.country} onChange={(e) => updateAddress("country", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Upload className="h-5 w-5 text-primary" />
                Logo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <div className="h-32 w-32 rounded-2xl overflow-hidden border-2 border-dashed border-border/50 bg-muted flex items-center justify-center">
                  {form.logo ? (
                    <img src={form.logo} alt="Logo" className="h-full w-full object-contain" />
                  ) : (
                    <Store className="h-12 w-12 text-muted-foreground/30" />
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4" />
                  Upload Logo
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="h-5 w-5 text-primary" />
                Regional Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Currency</Label>
                <select
                  value={form.currency}
                  onChange={(e) => update("currency", e.target.value)}
                  className="mt-1.5 flex h-10 w-full rounded-xl border border-border/50 bg-muted px-4 py-2 text-sm text-foreground backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.symbol} - {c.name} ({c.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Timezone</Label>
                <select
                  value={form.timezone}
                  onChange={(e) => update("timezone", e.target.value)}
                  className="mt-1.5 flex h-10 w-full rounded-xl border border-border/50 bg-muted px-4 py-2 text-sm text-foreground backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>{tz.replace("_", " ")}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
