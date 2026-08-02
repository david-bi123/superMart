"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Plus,
  Search,
  Store,
  MapPin,
  Phone,
  Mail,
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
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch,
} from "@/actions/branches.actions"
import { cn } from "@/lib/utils/cn"
import { PermissionGuard } from "@/components/auth/permission-guard"

interface BranchRow {
  _id: string
  name: string
  code: string
  address: { street?: string; city?: string; state?: string; zip?: string; country?: string }
  phone: string
  email: string
  manager: string
  isActive: boolean
  createdAt: string
}

export default function BranchesPage() {
  const [branches, setBranches] = React.useState<BranchRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [showDialog, setShowDialog] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [form, setForm] = React.useState<{
    name: string; code: string; phone: string; email: string;
    address: { street: string; city: string; state: string; zip: string; country: string };
  }>({
    name: "", code: "", phone: "", email: "",
    address: { street: "", city: "", state: "", zip: "", country: "US" },
  })
  const [formLoading, setFormLoading] = React.useState(false)

  const fetchBranches = React.useCallback(async () => {
    setLoading(true)
    const res = await getBranches({ search, page, limit: 20 })
    if (res.success) {
      setBranches(res.data as BranchRow[])
      setTotalPages(res.pagination.totalPages)
    }
    setLoading(false)
  }, [search, page])

  React.useEffect(() => { fetchBranches() }, [fetchBranches])

  const resetForm = () => {
    setForm({ name: "", code: "", phone: "", email: "", address: { street: "", city: "", state: "", zip: "", country: "US" } })
    setEditingId(null)
  }

  const openEdit = (b: BranchRow) => {
    setForm({
      name: b.name,
      code: b.code,
      phone: b.phone,
      email: b.email,
      address: {
        street: b.address?.street ?? "",
        city: b.address?.city ?? "",
        state: b.address?.state ?? "",
        zip: b.address?.zip ?? "",
        country: b.address?.country ?? "US",
      },
    })
    setEditingId(b._id)
    setShowDialog(true)
  }

  const handleSubmit = async () => {
    if (!form.name || !form.code) {
      toast.error("Name and code are required")
      return
    }
    setFormLoading(true)
    const res = editingId
      ? await updateBranch(editingId, form)
      : await createBranch(form)
    if (res.success) {
      toast.success(editingId ? "Branch updated" : "Branch created")
      setShowDialog(false)
      resetForm()
      fetchBranches()
    } else {
      toast.error(res.error)
    }
    setFormLoading(false)
  }

  const handleToggleActive = async (id: string, current: boolean) => {
    if (current) {
      const res = await deleteBranch(id)
      if (res.success) {
        toast.success("Branch deactivated")
        fetchBranches()
      } else {
        toast.error(res.error)
      }
    } else {
      const res = await updateBranch(id, { isActive: true })
      if (res.success) {
        toast.success("Branch reactivated")
        fetchBranches()
      } else {
        toast.error(res.error)
      }
    }
  }

  const total = branches.length
  const active = branches.filter((b) => b.isActive).length

  const statCards = [
    { label: "Total Branches", value: total, icon: Store, color: "text-primary" },
    { label: "Active", value: active, icon: MapPin, color: "text-emerald-600 dark:text-emerald-400" },
  ]

  return (
    <PermissionGuard permission="settings:manage">
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Branches"
        description="Manage your business locations"
        actions={
          <Button size="sm" onClick={() => { resetForm(); setShowDialog(true) }}>
            <Plus className="h-4 w-4" />
            Add Branch
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              placeholder="Search branches..."
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : branches.length === 0 ? (
          <EmptyState
            icon={<Store className="h-8 w-8" />}
            title="No branches found"
            description={search ? "Try adjusting your search" : "Add your first branch location"}
          />
        ) : (
          <div className="rounded-xl border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches.map((b, index) => (
                  <motion.tr
                    key={b._id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.015 }}
                    className="border-b border-border/20 transition-colors hover:bg-muted/30"
                  >
                    <TableCell><span className="text-sm font-medium text-foreground">{b.name}</span></TableCell>
                    <TableCell><Badge variant="secondary">{b.code}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground/50" />
                        <span className="text-xs text-muted-foreground">
                          {[b.address?.city, b.address?.state].filter(Boolean).join(", ") || "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        {b.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground/50" />
                            <span className="text-xs text-muted-foreground">{b.email}</span>
                          </div>
                        )}
                        {b.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground/50" />
                            <span className="text-xs text-muted-foreground">{b.phone}</span>
                          </div>
                        )}
                        {!b.email && !b.phone && <span className="text-xs text-muted-foreground">—</span>}
                      </div>
                    </TableCell>
                    <TableCell><span className="text-xs text-muted-foreground">{b.manager || "—"}</span></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={cn("h-2 w-2 rounded-full", b.isActive ? "bg-emerald-500" : "bg-muted-foreground/30")} />
                        <span className="text-xs text-muted-foreground">{b.isActive ? "Active" : "Inactive"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(b)}>Edit</Button>
                        <Button variant="ghost" size="sm" onClick={() => handleToggleActive(b._id, b.isActive)}>
                          {b.isActive ? "Deactivate" : "Reactivate"}
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

      <Dialog open={showDialog} onOpenChange={(v) => { if (!v) resetForm(); setShowDialog(v) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Branch" : "Add Branch"}</DialogTitle>
            <DialogDescription>{editingId ? "Update branch information" : "Create a new branch location"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input label="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Branch name" />
            <Input label="Code *" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="BRN-001" />
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 234 567 890" />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="branch@example.com" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Street" value={form.address.street} onChange={(e) => setForm({ ...form, address: { ...form.address, street: e.target.value } })} placeholder="123 Main St" />
              <Input label="City" value={form.address.city} onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })} placeholder="New York" />
              <Input label="State" value={form.address.state} onChange={(e) => setForm({ ...form, address: { ...form.address, state: e.target.value } })} placeholder="NY" />
              <Input label="ZIP" value={form.address.zip} onChange={(e) => setForm({ ...form, address: { ...form.address, zip: e.target.value } })} placeholder="10001" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setShowDialog(false) }}>Cancel</Button>
            <Button onClick={handleSubmit} loading={formLoading}>{editingId ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </PermissionGuard>
  )
}
