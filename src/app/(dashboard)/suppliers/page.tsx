"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Plus,
  Search,
  Building2,
  Truck,
  DollarSign,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/toast"
import {
  getSuppliersList,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  reactivateSupplier,
} from "@/actions/suppliers.actions"
import { cn } from "@/lib/utils/cn"
import { formatMoney } from "@/lib/format"

interface SupplierRow {
  _id: string
  name: string
  company: string
  email: string
  phone: string
  address: string
  taxId: string
  paymentTerms: string
  outstandingBalance: number
  notes: string
  isActive: boolean
  createdAt: string
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = React.useState<SupplierRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [showAddDialog, setShowAddDialog] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [form, setForm] = React.useState({ name: "", company: "", email: "", phone: "", address: "", taxId: "", paymentTerms: "" })
  const [formLoading, setFormLoading] = React.useState(false)

  const fetchSuppliers = React.useCallback(async () => {
    setLoading(true)
    const res = await getSuppliersList({ search, page, limit: 20 })
    if (res.success) {
      setSuppliers(res.data as SupplierRow[])
      setTotalPages(res.pagination.totalPages)
    }
    setLoading(false)
  }, [search, page])

  React.useEffect(() => { fetchSuppliers() }, [fetchSuppliers])

  const resetForm = () => {
    setForm({ name: "", company: "", email: "", phone: "", address: "", taxId: "", paymentTerms: "" })
    setEditingId(null)
  }

  const openEdit = (s: SupplierRow) => {
    setForm({
      name: s.name,
      company: s.company,
      email: s.email,
      phone: s.phone,
      address: s.address,
      taxId: s.taxId,
      paymentTerms: s.paymentTerms,
    })
    setEditingId(s._id)
    setShowAddDialog(true)
  }

  const handleSubmit = async () => {
    if (!form.name) {
      toast.error("Name is required")
      return
    }
    setFormLoading(true)
    const res = editingId
      ? await updateSupplier(editingId, form)
      : await createSupplier(form)
    if (res.success) {
      toast.success(editingId ? "Supplier updated" : "Supplier created")
      setShowAddDialog(false)
      resetForm()
      fetchSuppliers()
    } else {
      toast.error(res.error)
    }
    setFormLoading(false)
  }

  const handleToggleActive = async (id: string, current: boolean) => {
    const res = current ? await deleteSupplier(id) : await reactivateSupplier(id)
    if (res.success) {
      toast.success(current ? "Supplier deactivated" : "Supplier reactivated")
      fetchSuppliers()
    } else {
      toast.error(res.error)
    }
  }

  const total = suppliers.length
  const active = suppliers.filter((s) => s.isActive).length
  const withBalance = suppliers.filter((s) => s.outstandingBalance > 0).length

  const statCards = [
    { label: "Total Suppliers", value: total, icon: Building2, color: "text-primary" },
    { label: "Active", value: active, icon: Truck, color: "text-emerald-600 dark:text-emerald-400" },
    { label: "With Balance", value: withBalance, icon: DollarSign, color: "text-amber-600 dark:text-amber-400" },
  ]

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Suppliers"
        description="Manage your suppliers and vendors"
        actions={
          <Button size="sm" onClick={() => { resetForm(); setShowAddDialog(true) }}>
            <Plus className="h-4 w-4" />
            Add Supplier
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} glass className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <Icon className={`h-8 w-8 ${stat.color} opacity-50`} />
              </div>
            </Card>
          )
        })}
      </div>

      <Card glass className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search suppliers..."
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : suppliers.length === 0 ? (
          <EmptyState
            icon={<Building2 className="h-8 w-8" />}
            title="No suppliers found"
            description={search ? "Try adjusting your search" : "Add your first supplier"}
          />
        ) : (
          <div className="rounded-xl border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Payment Terms</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((s, index) => (
                  <motion.tr
                    key={s._id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.015 }}
                    className="border-b border-border/20 transition-colors hover:bg-muted/30"
                  >
                    <TableCell><span className="text-sm font-medium text-foreground">{s.name}</span></TableCell>
                    <TableCell><span className="text-sm text-muted-foreground">{s.company || "—"}</span></TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs text-foreground">{s.email || "—"}</span>
                        <span className="text-xs text-muted-foreground">{s.phone || "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell><span className="text-xs text-muted-foreground">{s.paymentTerms || "—"}</span></TableCell>
                    <TableCell>
                      <span className={cn(
                        "text-sm font-medium",
                        s.outstandingBalance > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
                      )}>
                        {formatMoney(s.outstandingBalance)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "h-2 w-2 rounded-full",
                          s.isActive ? "bg-emerald-500" : "bg-muted-foreground/30"
                        )} />
                        <span className="text-xs text-muted-foreground">{s.isActive ? "Active" : "Inactive"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(s)}>Edit</Button>
                        <Button variant="ghost" size="sm" onClick={() => handleToggleActive(s._id, s.isActive)}>
                          {s.isActive ? "Deactivate" : "Reactivate"}
                        </Button>
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
            <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      <Dialog open={showAddDialog} onOpenChange={(v) => { if (!v) resetForm(); setShowAddDialog(v) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Supplier" : "Add Supplier"}</DialogTitle>
            <DialogDescription>{editingId ? "Update supplier information" : "Create a new supplier record"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input label="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Supplier name" />
            <Input label="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company name" />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 234 567 890" />
            <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Main St" />
            <Input label="Tax ID" value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} placeholder="Tax ID" />
            <Input label="Payment Terms" value={form.paymentTerms} onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })} placeholder="Net 30" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setShowAddDialog(false) }}>Cancel</Button>
            <Button onClick={handleSubmit} loading={formLoading}>{editingId ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
