"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { FormField } from "@/components/ui/form"
import { Skeleton } from "@/components/ui/skeleton"
import { getCustomer, updateCustomer } from "@/actions/customers.actions"
import { toast } from "@/components/ui/toast"

interface CustomerData {
  _id: string
  name: string
  email: string
  phone: string
  address: string
  creditLimit: number
  notes: string
  isActive: boolean
  loyaltyPoints: number
}

export default function EditCustomerPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    creditLimit: "",
    notes: "",
    isActive: true,
  })

  React.useEffect(() => {
    let mounted = true
    async function loadCustomer() {
      setLoading(true)
      const res = await getCustomer(id)
      if (!mounted) return
      if (res.success) {
        const c = res.data as CustomerData
        setForm({
          name: c.name,
          email: c.email || "",
          phone: c.phone || "",
          address: c.address || "",
          creditLimit: String(c.creditLimit),
          notes: c.notes || "",
          isActive: c.isActive,
        })
      } else {
        toast.error(res.error)
      }
      setLoading(false)
    }
    loadCustomer()
    return () => {
      mounted = false
    }
  }, [id])

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required")
      return
    }
    setSaving(true)
    const res = await updateCustomer(id, {
      name: form.name,
      email: form.email || "",
      phone: form.phone || "",
      address: form.address || "",
      creditLimit: parseFloat(form.creditLimit) || 0,
      notes: form.notes || "",
      isActive: form.isActive,
    })
    if (res.success) {
      toast.success("Customer updated")
      router.push(`/customers/${id}`)
    } else {
      toast.error(res.error)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="space-y-6 pb-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Card glass>
          <CardContent className="p-6 space-y-5">
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Edit Customer"
        description="Update customer details"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push(`/customers/${id}`)}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button onClick={handleSave} loading={saving}>
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        }
      />

      <Card glass className="max-w-2xl">
        <CardContent className="p-6 space-y-5">
          <FormField label="Name" required>
            <Input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Customer name"
            />
          </FormField>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField label="Email">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="email@example.com"
              />
            </FormField>
            <FormField label="Phone">
              <Input
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+1 234 567 890"
              />
            </FormField>
          </div>
          <FormField label="Address">
            <Input
              value={form.address}
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
              placeholder="123 Main St"
            />
          </FormField>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField label="Credit Limit">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.creditLimit}
                onChange={(e) => setForm((p) => ({ ...p, creditLimit: e.target.value }))}
                placeholder="0.00"
              />
            </FormField>
            <FormField label="Active">
              <div className="flex items-center gap-3 pt-1">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(checked) => setForm((p) => ({ ...p, isActive: checked }))}
                />
                <span className="text-sm text-muted-foreground">
                  {form.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </FormField>
          </div>
          <FormField label="Notes">
            <textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              rows={4}
              placeholder="Additional notes..."
              className="flex w-full rounded-xl border border-border/50 bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </FormField>
        </CardContent>
      </Card>
    </div>
  )
}
