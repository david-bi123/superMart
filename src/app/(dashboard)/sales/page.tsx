"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Plus,
  Download,
  Search,
  Calendar,
  Filter,
  RefreshCw,
  FileText,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, AnimatedTabsContent } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SalesTable, type SaleRow } from "@/components/tables/sales-table"
import { getSales, cancelSale, refundSale, getSalesStats } from "@/actions/sales.actions"
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

export default function SalesPage() {
  const router = useRouter()
  const [sales, setSales] = React.useState<SaleRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [statusTab, setStatusTab] = React.useState("all")
  const [dateFrom, setDateFrom] = React.useState("")
  const [dateTo, setDateTo] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [stats, setStats] = React.useState<{
    totalSales: number
    totalRevenue: number
    totalProfit: number
    averageOrderValue: number
  } | null>(null)
  const limit = 15

  const fetchSales = React.useCallback(async () => {
    setLoading(true)
    const res = await getSales({
      search,
      status: statusTab === "all" ? "" : statusTab,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      page,
      limit,
    })
    if (res.success) {
      setSales(res.data as SaleRow[])
      setTotalPages(res.pagination.totalPages)
    }
    setLoading(false)
  }, [search, statusTab, dateFrom, dateTo, page])

  const fetchStats = React.useCallback(async () => {
    const res = await getSalesStats({
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    })
    if (res.success) {
      setStats(res.data as any)
    }
  }, [dateFrom, dateTo])

  React.useEffect(() => {
    fetchSales()
  }, [fetchSales])

  React.useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const handleExport = async () => {
    const res = await getSales({
      search,
      status: statusTab === "all" ? "" : statusTab,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      limit: 10000,
    })
    if (res.success) {
      const data = res.data as SaleRow[]
      const csv = [
        "Invoice#,Date,Customer,Items,Subtotal,Discount,Tax,Total,Payment Method,Status",
        ...data.map((s) =>
          [
            s.invoiceNumber,
            new Date(s.createdAt).toISOString(),
            `"${s.customerName}"`,
            s.itemsCount,
            s.subtotal.toFixed(2),
            s.discountTotal.toFixed(2),
            s.taxTotal.toFixed(2),
            s.grandTotal.toFixed(2),
            s.paymentMethod,
            s.status,
          ].join(",")
        ),
      ].join("\n")
      const blob = new Blob([csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `sales-export-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Sales exported")
    }
  }

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this sale? Stock will be restored.")) return
    const res = await cancelSale(id)
    if (res.success) {
      toast.success("Sale cancelled")
      fetchSales()
      fetchStats()
    } else {
      toast.error(res.error)
    }
  }

  const handleRefund = async (id: string) => {
    if (!confirm("Are you sure you want to refund this entire sale? Stock will be restored.")) return
    const res = await refundSale(id, {})
    if (res.success) {
      toast.success("Sale refunded")
      fetchSales()
      fetchStats()
    } else {
      toast.error(res.error)
    }
  }

  const handleStatusTabChange = (value: string) => {
    setStatusTab(value)
    setPage(1)
  }

  const statCards = [
    { label: "Total Sales", value: stats?.totalSales ?? 0, format: "number" as const },
    { label: "Revenue", value: stats?.totalRevenue ?? 0, format: "currency" as const },
    { label: "Profit", value: stats?.totalProfit ?? 0, format: "currency" as const },
    { label: "Avg Order Value", value: stats?.averageOrderValue ?? 0, format: "currency" as const },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-8"
    >
      <PageHeader
        title="Sales"
        description="Manage and track your sales transactions"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button size="sm" onClick={() => router.push("/pos")}>
              <Plus className="h-4 w-4" />
              New Sale
            </Button>
          </div>
        }
      />

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 gap-4 sm:grid-cols-4"
      >
        {statCards.map((stat) => (
          <Card key={stat.label} glass className="p-4">
            <p className="text-xs font-medium text-white/50 uppercase tracking-wider">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-white">
              {stat.format === "currency"
                ? `$${(stat.value as number).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : (stat.value as number).toLocaleString()}
            </p>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card glass className="p-5">
          <Tabs value={statusTab} onValueChange={handleStatusTabChange}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  value={search}
                  onChange={handleSearch}
                  placeholder="Search by invoice or customer..."
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
                    className="w-[150px] pl-10"
                  />
                </div>
                <span className="text-white/30">—</span>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
                    className="w-[150px] pl-10"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setDateFrom(""); setDateTo(""); setPage(1) }}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              <TabsTrigger value="refunded">Refunded</TabsTrigger>
            </TabsList>

            <AnimatedTabsContent value={statusTab}>
              <SalesTable
                data={sales}
                loading={loading}
                totalPages={totalPages}
                page={page}
                onPageChange={setPage}
                onCancel={handleCancel}
                onRefund={handleRefund}
                onView={(id) => router.push(`/sales/${id}`)}
              />
            </AnimatedTabsContent>
          </Tabs>
        </Card>
      </motion.div>
    </motion.div>
  )
}
