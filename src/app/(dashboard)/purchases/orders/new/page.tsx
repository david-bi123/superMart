"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Trash2,
  Search,
  ArrowLeft,
  Package,
  Building2,
  DollarSign,
  Hash,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import { createPurchaseOrder, getPOSuppliers, getPOProducts } from "@/actions/purchases.actions"
import { formatMoney } from "@/lib/format"

interface LineItem {
  productId: string
  name: string
  sku: string
  quantity: number
  price: number
  total: number
}

export default function NewPurchaseOrderPage() {
  const router = useRouter()
  const [suppliers, setSuppliers] = React.useState<{ _id: string; name: string; company?: string }[]>([])
  const [products, setProducts] = React.useState<{ _id: string; name: string; sku?: string; purchasePrice: number }[]>([])
  const [supplierId, setSupplierId] = React.useState("")
  const [items, setItems] = React.useState<LineItem[]>([])
  const [notes, setNotes] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  const [productSearch, setProductSearch] = React.useState("")
  const [showProductDropdown, setShowProductDropdown] = React.useState(false)
  const [loadingProducts, setLoadingProducts] = React.useState(false)

  React.useEffect(() => {
    async function load() {
      const [suppliersRes, productsRes] = await Promise.all([
        getPOSuppliers(),
        getPOProducts(),
      ])
      if (suppliersRes.success) setSuppliers(suppliersRes.data)
      if (productsRes.success) setProducts(productsRes.data)
    }
    load()
  }, [])

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()))
  )

  const addItem = (product: { _id: string; name: string; sku?: string; purchasePrice: number }) => {
    if (items.some((i) => i.productId === product._id)) {
      toast.warning("Product already added")
      return
    }
    setItems((prev) => [
      ...prev,
      {
        productId: product._id,
        name: product.name,
        sku: product.sku || "",
        quantity: 1,
        price: product.purchasePrice,
        total: product.purchasePrice,
      },
    ])
    setProductSearch("")
    setShowProductDropdown(false)
  }

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    setItems((prev) => {
      const updated = [...prev]
      const item = { ...updated[index], [field]: value }
      if (field === "quantity" || field === "price") {
        item.total = item.quantity * item.price
      }
      updated[index] = item
      return updated
    })
  }

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const grandTotal = subtotal

  const handleSubmit = async () => {
    if (!supplierId) { toast.error("Please select a supplier"); return }
    if (items.length === 0) { toast.error("Please add at least one item"); return }
    if (items.some((i) => i.quantity <= 0)) { toast.error("All quantities must be positive"); return }

    setSaving(true)
    const res = await createPurchaseOrder({
      supplierId,
      items: items.map((i) => ({
        productId: i.productId,
        name: i.name,
        sku: i.sku,
        quantity: i.quantity,
        price: i.price,
        total: i.total,
      })),
      subtotal,
      taxTotal: 0,
      grandTotal,
      notes,
    })
    if (res.success) {
      toast.success(`Purchase order ${res.data.poNumber} created`)
      router.push("/purchases/orders")
    } else {
      toast.error(res.error || "Failed to create purchase order")
    }
    setSaving(false)
  }

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="New Purchase Order"
        description="Create a purchase order for a supplier"
        actions={
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5 text-primary" />
                Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  value={productSearch}
                  onChange={(e) => { setProductSearch(e.target.value); setShowProductDropdown(true) }}
                  onFocus={() => setShowProductDropdown(true)}
                  placeholder="Search products to add..."
                  className="pl-10"
                />
                <AnimatePresence>
                  {showProductDropdown && productSearch && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute z-20 mt-1 w-full rounded-xl border border-border/50 bg-background/95 backdrop-blur-2xl shadow-2xl max-h-60 overflow-y-auto"
                    >
                      {filteredProducts.length === 0 ? (
                        <div className="p-4 text-sm text-muted-foreground text-center">No products found</div>
                      ) : (
                        filteredProducts.map((p) => (
                          <button
                            key={p._id}
                            type="button"
                            onClick={() => addItem(p)}
                            className="w-full flex items-center justify-between px-4 py-3 text-sm text-foreground/80 hover:bg-muted transition-colors"
                          >
                            <span>{p.name}</span>
                            <span className="text-muted-foreground text-xs">{formatMoney(p.purchasePrice)}</span>
                          </button>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-end gap-3 p-3 rounded-xl bg-muted/30 border border-border/30"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                    {item.sku && <p className="text-xs text-muted-foreground">{item.sku}</p>}
                  </div>
                  <div className="w-20">
                    <Label className="text-[10px] text-muted-foreground">Qty</Label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 0)}
                      className="mt-1 flex h-9 w-full rounded-lg border border-border/50 bg-muted px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div className="w-24">
                    <Label className="text-[10px] text-muted-foreground">Price</Label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => updateItem(index, "price", parseFloat(e.target.value) || 0)}
                      className="mt-1 flex h-9 w-full rounded-lg border border-border/50 bg-muted px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div className="w-24 text-right">
                    <Label className="text-[10px] text-muted-foreground">Total</Label>
                    <p className="mt-1 text-sm font-semibold text-foreground">{formatMoney(item.total)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-destructive hover:bg-destructive/10"
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}

              {items.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Search and add products above
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-primary" />
                Supplier
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label>Supplier</Label>
                <Select value={supplierId} onValueChange={setSupplierId}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s) => (
                      <SelectItem key={s._id} value={s._id}>
                        {s.name}{s.company ? ` (${s.company})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5 text-primary" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="text-foreground">{formatMoney(0)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-border/50">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">{formatMoney(grandTotal)}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {items.length} item{items.length !== 1 ? "s" : ""}
              </div>
            </CardContent>
          </Card>

          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Hash className="h-5 w-5 text-primary" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
                rows={3}
                className="w-full rounded-xl border border-border/50 bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </CardContent>
          </Card>

          <Button
            className="w-full h-12 text-base"
            onClick={handleSubmit}
            loading={saving}
            disabled={items.length === 0 || !supplierId}
          >
            <Plus className="h-5 w-5" />
            Create Purchase Order
          </Button>
        </div>
      </div>
    </div>
  )
}
