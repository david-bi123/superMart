"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Plus,
  Download,
  Archive,
  Search,
  ImageOff,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  RotateCcw,
} from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { PageHeader } from "@/components/ui/page-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { toast } from "@/components/ui/toast"
import { StockBadge } from "@/components/inventory/stock-badge"
import { getProducts, getCategories, getBrands, deleteProduct, restoreProduct } from "@/actions/inventory.actions"

interface ProductRow {
  _id: string
  name: string
  sku: string
  barcode: string
  sellingPrice: number
  purchasePrice: number
  currentStock: number
  minStock: number
  maxStock: number
  images: string[]
  category: string
  categoryId: string
  brand: string
  brandId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = React.useState<ProductRow[]>([])
  const [categories, setCategories] = React.useState<{ _id: string; name: string }[]>([])
  const [brands, setBrands] = React.useState<{ _id: string; name: string }[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState("")
  const [brandFilter, setBrandFilter] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("")
  const [selected, setSelected] = React.useState<string[]>([])
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const limit = 15

  const fetchProducts = React.useCallback(async () => {
    setLoading(true)
    const res = await getProducts({
      search,
      category: categoryFilter === "all" ? "" : categoryFilter,
      brand: brandFilter === "all" ? "" : brandFilter,
      status: statusFilter === "all" ? "" : statusFilter,
      page,
      limit,
      sort: "createdAt",
      order: "desc",
    })
    if (res.success) {
      setProducts(res.data as ProductRow[])
      setTotalPages(res.pagination.totalPages)
    }
    setLoading(false)
  }, [search, categoryFilter, brandFilter, statusFilter, page])

  React.useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  React.useEffect(() => {
    Promise.all([getCategories(), getBrands()]).then(([catRes, brandRes]) => {
      if (catRes.success) setCategories(catRes.data as any)
      if (brandRes.success) setBrands(brandRes.data as any)
    })
  }, [])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const handleArchive = async (id: string) => {
    const res = await deleteProduct(id)
    if (res.success) {
      toast.success("Product archived")
      fetchProducts()
    } else {
      toast.error(res.error)
    }
  }

  const handleRestore = async (id: string) => {
    const res = await restoreProduct(id)
    if (res.success) {
      toast.success("Product restored")
      fetchProducts()
    } else {
      toast.error(res.error)
    }
  }

  const handleBulkArchive = async () => {
    for (const id of selected) {
      await deleteProduct(id)
    }
    toast.success(`${selected.length} products archived`)
    setSelected([])
    fetchProducts()
  }

  const handleExport = async () => {
    const res = await getProducts({
      search,
      category: categoryFilter === "all" ? "" : categoryFilter,
      brand: brandFilter === "all" ? "" : brandFilter,
      status: statusFilter === "all" ? "" : statusFilter,
      limit: 10000,
    })
    if (res.success) {
      const data = res.data as ProductRow[]
      const csv = [
        "Name,SKU,Barcode,Category,Brand,Price,Stock,Min Stock",
        ...data.map((p) =>
          `"${p.name}",${p.sku},${p.barcode},"${p.category}","${p.brand}",${p.sellingPrice},${p.currentStock},${p.minStock}`
        ),
      ].join("\n")
      const blob = new Blob([csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "products-export.csv"
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Products exported")
    }
  }

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selected.length === products.length) {
      setSelected([])
    } else {
      setSelected(products.map((p) => p._id))
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage your product inventory"
        actions={
          <div className="flex items-center gap-2">
            {selected.length > 0 && (
              <Button variant="destructive" size="sm" onClick={handleBulkArchive}>
                <Archive className="h-4 w-4" />
                Archive ({selected.length})
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button size="sm" onClick={() => router.push("/inventory/products/new")}>
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </div>
        }
      />

      <Card glass className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={handleSearch}
              placeholder="Search products..."
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1) }}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={brandFilter} onValueChange={(v) => { setBrandFilter(v); setPage(1) }}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands.map((b) => (
                  <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="low_stock">Low Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3">
                <Skeleton variant="rectangular" className="h-12 w-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={<Search className="h-8 w-8" />}
            title="No products found"
            description={search || categoryFilter || brandFilter ? "Try adjusting your filters" : "Get started by adding your first product"}
            action={
              !search && !categoryFilter && !brandFilter ? (
                <Button onClick={() => router.push("/inventory/products/new")}>
                  <Plus className="h-4 w-4" />
                  Add Product
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="w-10 p-3 text-left">
                      <input
                        type="checkbox"
                        checked={selected.length === products.length && products.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-border/20 bg-muted/50"
                      />
                    </th>
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Product</th>
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">SKU</th>
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                    <th className="p-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Price</th>
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Stock</th>
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="w-16 p-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <motion.tr
                      key={product._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-border/20 transition-colors hover:bg-muted/30 cursor-pointer"
                      onClick={() => router.push(`/inventory/products/${product._id}`)}
                    >
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selected.includes(product._id)}
                          onChange={() => toggleSelect(product._id)}
                          className="rounded border-border/20 bg-muted/50"
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl overflow-hidden bg-muted/50 flex-shrink-0">
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <ImageOff className="h-4 w-4 text-muted-foreground/50" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{product.name}</p>
                            {product.barcode && (
                              <p className="text-xs text-muted-foreground/30">{product.barcode}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-muted-foreground font-mono">{product.sku || "—"}</span>
                      </td>
                      <td className="p-3">
                        {product.category ? (
                          <Badge variant="outline" className="text-xs">{product.category}</Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <span className="text-sm font-semibold text-foreground">
                          ${product.sellingPrice.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-foreground/80">{product.currentStock}</span>
                        {product.minStock > 0 && (
                          <span className="text-xs text-muted-foreground ml-1">/ {product.minStock} min</span>
                        )}
                      </td>
                      <td className="p-3">
                        <StockBadge
                          currentStock={product.currentStock}
                          minStock={product.minStock}
                          maxStock={product.maxStock}
                        />
                      </td>
                      <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => router.push(`/inventory/products/${product._id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/inventory/products/${product._id}/edit`)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-400"
                              onClick={() => handleArchive(product._id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Showing {Math.min((page - 1) * limit + 1, products.length)}–{Math.min(page * limit, products.length)} of {totalPages > 0 ? "many" : "0"}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                    if (pageNum > totalPages) return null
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === page ? "default" : "ghost"}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
