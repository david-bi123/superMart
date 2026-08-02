"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Plus,
  Search,
  Users,
  UserCheck,
  UserX,
  Shield,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { getUsers, createUser, updateUser, deleteUser } from "@/actions/settings.actions"
import { cn } from "@/lib/utils/cn"
import { PermissionGuard } from "@/components/auth/permission-guard"

interface EmployeeRow {
  _id: string
  name: string
  email: string
  role: string
  phone: string
  avatar: string
  isActive: boolean
  isVerified: boolean
  lastLogin: string | null
  createdAt: string
}

const ROLE_COLORS: Record<string, "default" | "primary" | "secondary" | "destructive" | "success" | "warning"> = {
  super_admin: "destructive",
  business_owner: "warning",
  manager: "primary",
  cashier: "default",
  inventory_officer: "secondary",
  accountant: "success",
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  business_owner: "Owner",
  manager: "Manager",
  cashier: "Cashier",
  inventory_officer: "Inventory Officer",
  accountant: "Accountant",
}

export default function EmployeesPage() {
  const [employees, setEmployees] = React.useState<EmployeeRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [roleFilter, setRoleFilter] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [showAddDialog, setShowAddDialog] = React.useState(false)
  const [addForm, setAddForm] = React.useState({ name: "", email: "", password: "", role: "cashier", phone: "" })
  const [addLoading, setAddLoading] = React.useState(false)

  const fetchEmployees = React.useCallback(async () => {
    setLoading(true)
    const res = await getUsers({
      search,
      role: roleFilter || undefined,
      page,
      limit: 20,
    })
    if (res.success) {
      setEmployees(res.data as EmployeeRow[])
      setTotalPages(res.pagination.totalPages)
    }
    setLoading(false)
  }, [search, roleFilter, page])

  React.useEffect(() => { fetchEmployees() }, [fetchEmployees])

  const handleAdd = async () => {
    if (!addForm.name || !addForm.email || !addForm.password) {
      toast.error("Name, email, and password are required")
      return
    }
    setAddLoading(true)
    const res = await createUser(addForm)
    if (res.success) {
      toast.success("Employee created")
      setShowAddDialog(false)
      setAddForm({ name: "", email: "", password: "", role: "cashier", phone: "" })
      fetchEmployees()
    } else {
      toast.error(res.error)
    }
    setAddLoading(false)
  }

  const handleToggleActive = async (id: string, current: boolean) => {
    if (current) {
      const res = await deleteUser(id)
      if (res.success) {
        toast.success("Employee deactivated")
        fetchEmployees()
      } else {
        toast.error(res.error)
      }
    } else {
      const res = await updateUser(id, { isActive: true })
      if (res.success) {
        toast.success("Employee reactivated")
        fetchEmployees()
      } else {
        toast.error(res.error)
      }
    }
  }

  const total = employees.length
  const active = employees.filter((e) => e.isActive).length
  const managers = employees.filter((e) => e.role === "manager").length

  const statCards = [
    { label: "Total Employees", value: total, icon: Users, color: "text-primary" },
    { label: "Active", value: active, icon: UserCheck, color: "text-emerald-600 dark:text-emerald-400" },
    { label: "Managers", value: managers, icon: Shield, color: "text-amber-600 dark:text-amber-400" },
  ]

  return (
    <PermissionGuard permission="users:manage">
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Employees"
        description="Manage your team members and their roles"
        actions={
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4" />
            Add Employee
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
              placeholder="Search employees..."
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v === "all" ? "" : v); setPage(1) }}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="cashier">Cashier</SelectItem>
                <SelectItem value="inventory_officer">Inventory Officer</SelectItem>
                <SelectItem value="accountant">Accountant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-6 w-28 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : employees.length === 0 ? (
          <EmptyState
            icon={<Users className="h-8 w-8" />}
            title="No employees found"
            description={search || roleFilter ? "Try adjusting your filters" : "Add your first team member"}
          />
        ) : (
          <div className="rounded-xl border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Last Login</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp, index) => (
                  <motion.tr
                    key={emp._id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.015 }}
                    className="border-b border-border/20 transition-colors hover:bg-muted/30"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground text-sm font-semibold shrink-0">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-foreground">{emp.name}</span>
                      </div>
                    </TableCell>
                    <TableCell><span className="text-sm text-muted-foreground">{emp.email}</span></TableCell>
                    <TableCell>
                      <Badge variant={ROLE_COLORS[emp.role] || "default"}>
                        {ROLE_LABELS[emp.role] || emp.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "h-2 w-2 rounded-full",
                          emp.isActive ? "bg-emerald-500" : "bg-muted-foreground/30"
                        )} />
                        <span className="text-xs text-muted-foreground">
                          {emp.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {emp.lastLogin ? new Date(emp.lastLogin).toLocaleDateString() : "Never"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(emp._id, emp.isActive)}
                      >
                        {emp.isActive ? <UserX className="h-4 w-4 text-destructive" /> : <UserCheck className="h-4 w-4 text-emerald-500" />}
                      </Button>
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

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Employee</DialogTitle>
            <DialogDescription>Create a new team member account</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              label="Name *"
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              placeholder="Full name"
            />
            <Input
              label="Email *"
              type="email"
              value={addForm.email}
              onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
              placeholder="email@example.com"
            />
            <Input
              label="Password *"
              type="password"
              value={addForm.password}
              onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
              placeholder="Min 8 characters"
            />
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Role *</label>
              <Select value={addForm.role} onValueChange={(v) => setAddForm({ ...addForm, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="cashier">Cashier</SelectItem>
                  <SelectItem value="inventory_officer">Inventory Officer</SelectItem>
                  <SelectItem value="accountant">Accountant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              label="Phone"
              value={addForm.phone}
              onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
              placeholder="+1 234 567 890"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAdd} loading={addLoading}>Create Employee</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </PermissionGuard>
  )
}
