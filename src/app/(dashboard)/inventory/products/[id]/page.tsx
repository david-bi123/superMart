"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Pencil,
  PackagePlus,
  Archive,
  RotateCcw,
  ImageOff,
  Layers,
  Boxes,
  Barcode,
  FileText,
  History,
  Tag,
  Building2,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { ImageWithFallback } from "@/components/ui/image-with-fallback"
import { toast } from "@/components/ui/toast"
import { StockBadge } from "@/components/inventory/stock-badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  getProduct,
  getCategories,
  getBrands,
  getSuppliers,
  getInventoryMovements,
  adjustStock,
  deleteProduct,
  restoreProduct,
} from "@/actions/inventory.actions"
import { formatMoney } from "@/lib/format"

interface ProductDetail {
  _id: string
  name: string
  sku?: string
  barcode?: string
  description?: string
  purchasePrice: number
  sellingPrice: number
  wholesalePrice?: number
  discountPrice?: number
  tax?: number
  currentStock: number
  minStock: number
  maxStock?: number
  warehouse?: string
  shelf?: string
  batchNumber?: string
  expiryDate?: string
  unit?: string
  isActive: boolean
  isArchived?: boolean
  images: string[]
  variants: {
    name: string
    value: string
    price: number
    stock: number
    sku?: string
  }[]
  categoryId: string
  brandId: string
  supplierId: string
  createdAt: string
  updatedAt: string
}

interface InventoryMovement {
  _id: string
  type: string
  quantity: number
  reference?: string
  notes?: string
  batchNumber?: string
  user?: string
  createdAt?: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [product, setProduct] = React.useState<ProductDetail | null>(null)
  const [movements, setMovements] = React.useState<InventoryMovement[]>([])
  const [categories, setCategories] = React.useState<{ _id: string; name: string }[]>([])
  const [brands, setBrands] = React.useState<{ _id: string; name: string }[]>([])
  const [suppliers, setSuppliers] = React.useState<{ _id: string; name: string }[]>([])
  const [loading, setLoading] = React.useState(true)
  const [actionLoading, setActionLoading] = React.useState(false)
  const [showAdjustDialog, setShowAdjustDialog] = React.useState(false)
  const [quantity, setQuantity] = React.useState<number>(0)
  const [reason, setReason] = React.useState("")
  const [adjustLoading, setAdjustLoading] = React.useState(false)

  const fetchProduct = React.useCallback(async () => {
    setLoading(true)
    const res = await getProduct(id)
    if (res.success) {
      setProduct(res.data as ProductDetail)
    } else {
      toast.error(res.error)
    }
    setLoading(false)
  }, [id])

  const fetchMovements = React.useCallback(async () => {
    const res = await getInventoryMovements(id)
    if (res.success) {
      setMovements(res.data as InventoryMovement[])
    }
  }, [id])

  React.useEffect(() => {
    fetchProduct()
    fetchMovements()
  }, [fetchProduct, fetchMovements])

  React.useEffect(() => {
    Promise.all([getCategories(), getBrands(), getSuppliers()]).then(([c, b, s]) => {
      if (c.success) setCategories(c.data as any)
      if (b.success) setBrands(b.data as any)
      if (s.success) setSuppliers(s.data as any)
    })
  }, [])

  const handleAdjustStock = async () => {
    if (!quantity) {
      toast.error("Enter a quantity")
      return
    }
    setAdjustLoading(true)
    const res = await adjustStock(id, quantity, reason)
    if (res.success) {
      toast.success("Stock adjusted")
      setShowAdjustDialog(false)
      setQuantity(0)
      setReason("")
      fetchProduct()
      fetchMovements()
    } else {
      toast.error(res.error)
    }
    setAdjustLoading(false)
  }

  const handleArchive = async () => {
    if (!confirm("Archive this product? It will be hidden from the products list.")) return
    setActionLoading(true)
    const res = await deleteProduct(id)
    if (res.success) {
      toast.success("Product archived")
      fetchProduct()
    } else {
      toast.error(res.error)
    }
    setActionLoading(false)
  }

  const handleRestore = async () => {
    setActionLoading(true)
    const res = await restoreProduct(id)
    if (res.success) {
      toast.success("Product restored")
      fetchProduct()
    } else {
      toast.error(res.error)
    }
    setActionLoading(false)
  }

  if (loading) {
    return (
      <div className="space-y-6 pb-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton variant="rectangular" className="h-64 rounded-2xl" />
            <Skeleton variant="rectangular" className="h-48 rounded-2xl" />
          </div>
          <div className="space-y-6">
            <Skeleton variant="rectangular" className="h-40 rounded-2xl" />
            <Skeleton variant="rectangular" className="h-40 rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg text-muted-foreground">Product not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/inventory/products")}>
          Back to Products
        </Button>
      </div>
    )
  }

  const categoryName = categories.find((c) => c._id === product.categoryId)?.name || ""
  const brandName = brands.find((b) => b._id === product.brandId)?.name || ""
  const supplierName = suppliers.find((s) => s._id === product.supplierId)?.name || ""
  const isArchived = product.isArchived === true || !product.isActive
  const margin = product.sellingPrice - product.purchasePrice

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" className="mt-1" onClick={() => router.push("/inventory/products")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader
          className="flex-1"
          icon={
            <div className="h-10 w-10 shrink-0">
              <ImageWithFallback
                src={product.images?.[0]}
                alt={product.name}
                imgClassName="rounded-xl"
                fallback={<ImageOff className="h-5 w-5" />}
              />
            </div>
          }
          title={product.name}
          description={[product.sku, product.barcode].filter(Boolean).join(" · ")}
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/inventory/products/${id}/edit`)}
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowAdjustDialog(true)}>
                <PackagePlus className="h-4 w-4" />
                Adjust Stock
              </Button>
              {isArchived ? (
                <Button variant="outline" size="sm" onClick={handleRestore} loading={actionLoading}>
                  <RotateCcw className="h-4 w-4" />
                  Restore
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10"
                  onClick={handleArchive}
                  loading={actionLoading}
                >
                  <Archive className="h-4 w-4" />
                  Archive
                </Button>
              )}
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card glass>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              {product.description ? (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{product.description}</p>
              ) : (
                <p className="text-sm text-muted-foreground">No description provided</p>
              )}
            </CardContent>
          </Card>

          <Card glass>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Layers className="h-5 w-5 text-muted-foreground" />
                Variants
              </CardTitle>
            </CardHeader>
            <CardContent>
              {product.variants?.length === 0 ? (
                <EmptyState
                  icon={<Layers className="h-8 w-8" />}
                  title="No variants"
                  description="This product has no variants configured"
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="pb-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                        <th className="pb-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Value</th>
                        <th className="pb-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Price</th>
                        <th className="pb-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Stock</th>
                        <th className="pb-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">SKU</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.variants.map((variant, index) => (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="border-b border-border/20"
                        >
                          <td className="py-3">
                            <span className="text-sm font-medium text-foreground">{variant.name}</span>
                          </td>
                          <td className="py-3">
                            <span className="text-sm text-muted-foreground">{variant.value}</span>
                          </td>
                          <td className="py-3 text-right">
                            <span className="text-sm text-foreground">{formatMoney(variant.price)}</span>
                          </td>
                          <td className="py-3 text-right">
                            <span className="text-sm text-muted-foreground">{variant.stock}</span>
                          </td>
                          <td className="py-3">
                            <span className="text-sm font-mono text-muted-foreground">{variant.sku || "—"}</span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card glass>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5 text-muted-foreground" />
                Stock Movements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {movements.length === 0 ? (
                <EmptyState
                  icon={<History className="h-8 w-8" />}
                  title="No movements yet"
                  description="Stock adjustments will appear here"
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="pb-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                        <th className="pb-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                        <th className="pb-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Qty</th>
                        <th className="pb-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Notes</th>
                        <th className="pb-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movements.map((movement, index) => (
                        <motion.tr
                          key={movement._id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="border-b border-border/20"
                        >
                          <td className="py-3">
                            <span className="text-sm text-muted-foreground">
                              {movement.createdAt
                                ? new Date(movement.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "—"}
                            </span>
                          </td>
                          <td className="py-3">
                            <Badge variant={movement.type === "stock_in" ? "success" : "destructive"}>
                              {movement.type === "stock_in" ? "Stock In" : "Stock Out"}
                            </Badge>
                          </td>
                          <td
                            className={`py-3 text-right text-sm font-semibold ${
                              movement.type === "stock_in"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-destructive"
                            }`}
                          >
                            {movement.type === "stock_in" ? "+" : "-"}
                            {movement.quantity}
                          </td>
                          <td className="py-3">
                            <span className="text-sm text-foreground">{movement.notes || movement.reference || "—"}</span>
                          </td>
                          <td className="py-3">
                            <span className="text-sm text-muted-foreground">{movement.user || "—"}</span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card glass>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Tag className="h-5 w-5 text-muted-foreground" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Selling Price</span>
                  <span className="text-foreground font-semibold">{formatMoney(product.sellingPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Purchase Price</span>
                  <span className="text-muted-foreground">{formatMoney(product.purchasePrice)}</span>
                </div>
                {product.wholesalePrice != null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Wholesale Price</span>
                    <span className="text-muted-foreground">{formatMoney(product.wholesalePrice)}</span>
                  </div>
                )}
                {product.discountPrice != null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount Price</span>
                    <span className="text-muted-foreground">{formatMoney(product.discountPrice)}</span>
                  </div>
                )}
                {product.tax != null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="text-muted-foreground">{product.tax}%</span>
                  </div>
                )}
                <Separator className="my-1" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Profit Margin</span>
                  <span className={`font-semibold ${margin >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
                    {formatMoney(margin)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card glass>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Boxes className="h-5 w-5 text-muted-foreground" />
                Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-foreground">{product.currentStock}</p>
                  {product.unit && <p className="text-sm text-muted-foreground mt-1">{product.unit}</p>}
                </div>
                <StockBadge
                  currentStock={product.currentStock}
                  minStock={product.minStock}
                  maxStock={product.maxStock}
                />
              </div>
              <Separator className="my-4" />
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Min Stock</span>
                  <span className="text-foreground">{product.minStock}</span>
                </div>
                {product.maxStock != null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Max Stock</span>
                    <span className="text-foreground">{product.maxStock}</span>
                  </div>
                )}
                {product.warehouse && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Warehouse</span>
                    <span className="text-foreground">{product.warehouse}</span>
                  </div>
                )}
                {product.shelf && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shelf</span>
                    <span className="text-foreground">{product.shelf}</span>
                  </div>
                )}
                {product.batchNumber && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Batch</span>
                    <span className="text-foreground font-mono">{product.batchNumber}</span>
                  </div>
                )}
                {product.expiryDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Expiry</span>
                    <span className="text-foreground">
                      {new Date(product.expiryDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card glass>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Category</span>
                  <span className="text-foreground">{categoryName || "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Brand</span>
                  <span className="text-foreground">{brandName || "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Supplier</span>
                  <span className="text-foreground">{supplierName || "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span className="text-foreground">
                    {new Date(product.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="text-foreground">
                    {new Date(product.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showAdjustDialog} onOpenChange={setShowAdjustDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              Add or remove stock for {product.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              label="Quantity"
              type="number"
              value={quantity === 0 ? "" : quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              placeholder="Positive to add, negative to remove"
            />
            <Input
              label="Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Damaged goods, restock, cycle count"
            />
            <p className="text-sm text-muted-foreground">
              Current stock: <span className="text-foreground font-semibold">{product.currentStock}</span>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdjustDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdjustStock} loading={adjustLoading}>
              Apply Adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
