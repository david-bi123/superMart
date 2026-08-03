"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Edit3, Trash2, Building2 } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { PageHeader } from "@/components/ui/page-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { ImageWithFallback } from "@/components/ui/image-with-fallback"
import { toast } from "@/components/ui/toast"
import { getBrands, createBrand, updateBrand, deleteBrand } from "@/actions/inventory.actions"

interface BrandItem {
  _id: string
  name: string
  slug: string
  description: string
  logo: string
  isActive: boolean
}

export default function BrandsPage() {
  const [brands, setBrands] = React.useState<BrandItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<BrandItem | null>(null)
  const [formData, setFormData] = React.useState({ name: "", description: "", logo: "" })

  const fetchBrands = async () => {
    setLoading(true)
    const res = await getBrands()
    if (res.success) {
      setBrands(res.data as BrandItem[])
    }
    setLoading(false)
  }

  React.useEffect(() => { fetchBrands() }, [])

  const openCreate = () => {
    setEditing(null)
    setFormData({ name: "", description: "", logo: "" })
    setDialogOpen(true)
  }

  const openEdit = (brand: BrandItem) => {
    setEditing(brand)
    setFormData({
      name: brand.name,
      description: brand.description,
      logo: brand.logo || "",
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Brand name is required")
      return
    }
    const res = editing
      ? await updateBrand(editing._id, formData)
      : await createBrand(formData)
    if (res.success) {
      toast.success(editing ? "Brand updated" : "Brand created")
      setDialogOpen(false)
      fetchBrands()
    } else {
      toast.error(res.error || "Failed to save brand")
    }
  }

  const handleDelete = async (id: string) => {
    const res = await deleteBrand(id)
    if (res.success) {
      toast.success("Brand deleted")
      fetchBrands()
    } else {
      toast.error(res.error || "Failed to delete brand")
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Brands"
        description="Manage product brands"
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add Brand
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} glass className="p-6">
              <div className="flex flex-col items-center text-center gap-3">
                <Skeleton variant="circular" className="h-16 w-16" />
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-3 w-40" />
              </div>
            </Card>
          ))}
        </div>
      ) : brands.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-8 w-8" />}
          title="No brands yet"
          description="Add brands to categorize your products"
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add Brand
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {brands.map((brand, index) => (
              <motion.div
                key={brand._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card glass hover className="p-6 group relative">
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg"
                      onClick={() => openEdit(brand)}
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-destructive hover:text-destructive/80"
                      onClick={() => handleDelete(brand._id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="h-16 w-16 rounded-2xl overflow-hidden bg-muted flex items-center justify-center">
                      <ImageWithFallback
                        src={brand.logo}
                        alt={brand.name}
                        imgClassName="object-contain p-2"
                        fallback={<Building2 className="h-7 w-7 text-muted-foreground/40" />}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{brand.name}</h3>
                      {brand.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{brand.description}</p>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Brand" : "Add Brand"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update the brand details" : "Add a new brand to your catalog"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                Name <span className="text-destructive">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="Brand name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1.5">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                rows={2}
                placeholder="Brief description..."
                className="flex w-full rounded-xl border border-border/50 bg-muted px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1.5">Logo URL</label>
              <Input
                value={formData.logo}
                onChange={(e) => setFormData((p) => ({ ...p, logo: e.target.value }))}
                placeholder="https://..."
              />
              {formData.logo && (
                <div className="mt-2 h-16 w-16 rounded-xl overflow-hidden border border-border/50">
                  <ImageWithFallback
                    src={formData.logo}
                    alt="Preview"
                    imgClassName="object-contain"
                    fallback={<Building2 className="h-6 w-6 text-muted-foreground/40" />}
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>
              {editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
