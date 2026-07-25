"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Plus,
  Search,
  Users,
  UserCheck,
  CreditCard,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CustomersTable, type CustomerRow } from "@/components/tables/customers-table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input as FormInput } from "@/components/ui/input"
import { getCustomers, createCustomer } from "@/actions/customers.actions"
import { toast } from "@/components/ui/toast"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
}

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = React.useState<CustomerRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [showAddDialog, setShowAddDialog] = React.useState(false)
  const [addForm, setAddForm] = React.useState({ name: "", email: "", phone: "", address: "", creditLimit: 0 })
  const [addLoading, setAddLoading] = React.useState(false)
  const limit = 15

  const fetchCustomers = React.useCallback(async () => {
    setLoading(true)
    const res = await getCustomers({ search, page, limit })
    if (res.success) {
      setCustomers(res.data as CustomerRow[])
      setTotalPages(res.pagination.totalPages)
    }
    setLoading(false)
  }, [search, page])

  React.useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const handleAdd = async () => {
    if (!addForm.name) {
      toast.error("Name is required")
      return
    }
    setAddLoading(true)
    const res = await createCustomer(addForm)
    if (res.success) {
      toast.success("Customer created")
      setShowAddDialog(false)
      setAddForm({ name: "", email: "", phone: "", address: "", creditLimit: 0 })
      fetchCustomers()
    } else {
      toast.error(res.error)
    }
    setAddLoading(false)
  }

  const totalCustomers = customers.length
  const activeCustomers = customers.filter((c) => c.isActive).length
  const creditCustomers = customers.filter((c) => c.balance > 0).length

  const statCards = [
    { label: "Total Customers", value: totalCustomers, icon: Users, color: "text-blue-400" },
    { label: "Active", value: activeCustomers, icon: UserCheck, color: "text-emerald-400" },
    { label: "With Balance", value: creditCustomers, icon: CreditCard, color: "text-amber-400" },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-8"
    >
      <PageHeader
        title="Customers"
        description="Manage your customer relationships"
        actions={
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        }
      />

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-3 gap-4"
      >
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} glass className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-white/50 uppercase tracking-wider">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <Icon className={`h-8 w-8 ${stat.color} opacity-50`} />
              </div>
            </Card>
          )
        })}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card glass className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                value={search}
                onChange={handleSearch}
                placeholder="Search customers..."
                className="pl-10"
              />
            </div>
          </div>

          <CustomersTable
            data={customers}
            loading={loading}
            totalPages={totalPages}
            page={page}
            onPageChange={setPage}
            onView={(id) => router.push(`/customers/${id}`)}
          />
        </Card>
      </motion.div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
            <DialogDescription>
              Create a new customer record
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <FormInput
              label="Name *"
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              placeholder="Customer name"
            />
            <FormInput
              label="Email"
              type="email"
              value={addForm.email}
              onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
              placeholder="email@example.com"
            />
            <FormInput
              label="Phone"
              value={addForm.phone}
              onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
              placeholder="+1 234 567 890"
            />
            <FormInput
              label="Address"
              value={addForm.address}
              onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
              placeholder="123 Main St"
            />
            <FormInput
              label="Credit Limit"
              type="number"
              value={addForm.creditLimit}
              onChange={(e) => setAddForm({ ...addForm, creditLimit: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} loading={addLoading}>
              Create Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
