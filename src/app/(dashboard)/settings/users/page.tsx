"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Plus,
  Search,
  Shield,
  MoreHorizontal,
  UserX,
  UserCheck,
  Pencil,
  Mail,
  Phone,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/toast"
import { getUsers, createUser, updateUser, deleteUser } from "@/actions/settings.actions"
import { cn } from "@/lib/utils/cn"
import { PermissionGuard } from "@/components/auth/permission-guard"

const ROLE_CONFIG: Record<string, { label: string; color: "default" | "primary" | "secondary" | "destructive" | "warning" }> = {
  super_admin: { label: "Super Admin", color: "destructive" },
  business_owner: { label: "Owner", color: "destructive" },
  manager: { label: "Manager", color: "primary" },
  cashier: { label: "Cashier", color: "secondary" },
  inventory_officer: { label: "Inventory Officer", color: "warning" },
  accountant: { label: "Accountant", color: "default" },
}

const AVATAR_GRADIENTS = [
  "from-primary to-primary/80",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-indigo-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-cyan-500 to-blue-600",
]

function getAvatarGradient(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length]
}

interface UserRow {
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

export default function UsersPage() {
  const [users, setUsers] = React.useState<UserRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [showDialog, setShowDialog] = React.useState(false)
  const [editing, setEditing] = React.useState<UserRow | null>(null)
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [saving, setSaving] = React.useState(false)

  const [form, setForm] = React.useState({
    name: "", email: "", password: "", role: "cashier", phone: "",
  })

  const fetchUsers = React.useCallback(async () => {
    setLoading(true)
    const res = await getUsers({ search, page, limit: 15 })
    if (res.success) {
      setUsers(res.data as UserRow[])
      setTotalPages(res.pagination.totalPages)
    }
    setLoading(false)
  }, [search, page])

  React.useEffect(() => { fetchUsers() }, [fetchUsers])

  const resetForm = () => {
    setForm({ name: "", email: "", password: "", role: "cashier", phone: "" })
    setEditing(null)
  }

  const handleOpenAdd = () => {
    resetForm()
    setShowDialog(true)
  }

  const handleOpenEdit = (user: UserRow) => {
    setForm({ name: user.name, email: user.email, password: "", role: user.role, phone: user.phone })
    setEditing(user)
    setShowDialog(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const res = editing
      ? await updateUser(editing._id, { name: form.name, email: form.email, role: form.role, phone: form.phone })
      : await createUser(form)
    if (res.success) {
      toast.success(editing ? "User updated" : "User created")
      setShowDialog(false)
      resetForm()
      fetchUsers()
    } else {
      toast.error(res.error || "Failed to save")
    }
    setSaving(false)
  }

  const handleDeactivate = async (id: string) => {
    const res = await deleteUser(id)
    if (res.success) {
      toast.success("User deactivated")
      fetchUsers()
    } else {
      toast.error(res.error)
    }
  }

  const roleBadge = (role: string) => {
    const config = ROLE_CONFIG[role] || { label: role, color: "default" as const }
    return <Badge variant={config.color}>{config.label}</Badge>
  }

  return (
    <PermissionGuard permission="users:manage">
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Users"
        description="Manage employees and their roles"
        actions={
          <Button size="sm" onClick={handleOpenAdd}>
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        }
      />

      <Card glass className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search users..."
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3">
                <Skeleton variant="circular" className="h-10 w-10" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={<Shield className="h-8 w-8" />}
            title="No users found"
            description={search ? "Try adjusting your search" : "Add your first team member"}
            action={!search ? <Button size="sm" onClick={handleOpenAdd}><Plus className="h-4 w-4" />Add User</Button> : undefined}
          />
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 rounded-xl border border-border/30 bg-card/50 backdrop-blur-sm p-4 transition-colors hover:bg-muted/40"
              >
                <div className={cn(
                  "h-10 w-10 rounded-full bg-gradient-to-br flex items-center justify-center text-primary-foreground text-sm font-semibold shrink-0",
                  getAvatarGradient(user.name)
                )}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                    {!user.isActive && (
                      <Badge variant="outline" className="text-[10px]">Inactive</Badge>
                    )}
                    {user.isVerified && (
                      <Badge variant="secondary" className="text-[10px]">Verified</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </span>
                    {user.phone && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {user.phone}
                      </span>
                    )}
                  </div>
                </div>
                <div className="hidden sm:block">{roleBadge(user.role)}</div>
                <div className="text-xs text-muted-foreground hidden md:block">
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleDateString()
                    : "Never"}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => handleOpenEdit(user)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    {user.isActive && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeactivate(user._id)}
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          Deactivate
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/30">
            <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit User" : "Add User"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update user details and role" : "Create a new employee account"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input label="Full Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            {!editing && (
              <Input label="Password" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
            )}
            <Input label="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Role</label>
              <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_CONFIG)
                    .filter(([key]) => key !== "super_admin")
                    .map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>
              {editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </PermissionGuard>
  )
}
