"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2, GripVertical, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { PageHeader } from "@/components/ui/page-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, AnimatedTabsContent } from "@/components/ui/tabs"
import { FormField } from "@/components/ui/form"
import { toast } from "@/components/ui/toast"
import { ImageUpload } from "@/components/inventory/image-upload"
import { productSchema, type ProductInput } from "@/lib/validations/inventory"
import { createProduct, getCategories, getBrands, getSuppliers } from "@/actions/inventory.actions"

export default function NewProductPage() {
  const router = useRouter()
  const [categories, setCategories] = React.useState<any[]>([])
  const [brands, setBrands] = React.useState<any[]>([])
  const [suppliers, setSuppliers] = React.useState<any[]>([])
  const [submitting, setSubmitting] = React.useState(false)

  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: "",
      sku: "",
      barcode: "",
      categoryId: "",
      brandId: "",
      supplierId: "",
      description: "",
      purchasePrice: 0,
      sellingPrice: 0,
      wholesalePrice: undefined,
      discountPrice: undefined,
      minStock: 0,
      maxStock: undefined,
      currentStock: 0,
      warehouse: "",
      shelf: "",
      expiryDate: "",
      batchNumber: "",
      tax: 0,
      images: [],
      variants: [],
      weight: undefined,
      volume: undefined,
      unit: "",
      isActive: true,
      trackSerial: false,
      trackBatch: false,
      trackExpiry: false,
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "variants" })

  React.useEffect(() => {
    Promise.all([getCategories(), getBrands(), getSuppliers()]).then(([c, b, s]) => {
      if (c.success) setCategories(c.data as any)
      if (b.success) setBrands(b.data as any)
      if (s.success) setSuppliers(s.data as any)
    })
  }, [])

  const onSubmit = async (data: any) => {
    setSubmitting(true)
    const res = await createProduct(data)
    if (res.success) {
      toast.success("Product created successfully")
      router.push("/inventory/products")
    } else {
      toast.error(res.error || "Failed to create product")
    }
    setSubmitting(false)
  }

  const errors = form.formState.errors

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Product"
        description="Create a new product in your inventory"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button loading={submitting} onClick={form.handleSubmit(onSubmit)}>
              <Plus className="h-4 w-4" />
              Create Product
            </Button>
          </div>
        }
      />

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="variants">Variants</TabsTrigger>
          </TabsList>

          <AnimatedTabsContent value="general">
            <Card glass className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <FormField label="Product Name" error={errors.name} required>
                    <Input {...form.register("name")} placeholder="Enter product name" />
                  </FormField>
                </div>
                <FormField label="SKU" error={errors.sku}>
                  <Input {...form.register("sku")} placeholder="Auto-generated if empty" />
                </FormField>
                <FormField label="Barcode" error={errors.barcode}>
                  <Input {...form.register("barcode")} placeholder="UPC / EAN" />
                </FormField>
                <FormField label="Category" error={errors.categoryId}>
                  <Select
                    value={form.watch("categoryId")}
                    onValueChange={(v) => form.setValue("categoryId", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Brand" error={errors.brandId}>
                  <Select
                    value={form.watch("brandId")}
                    onValueChange={(v) => form.setValue("brandId", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((b) => (
                        <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Supplier" error={errors.supplierId}>
                  <Select
                    value={form.watch("supplierId")}
                    onValueChange={(v) => form.setValue("supplierId", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((s) => (
                        <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Unit">
                  <Input {...form.register("unit")} placeholder="pcs, kg, ltr..." />
                </FormField>
                <FormField label="Weight (kg)">
                  <Input type="number" step="0.01" {...form.register("weight", { valueAsNumber: true })} />
                </FormField>
                <FormField label="Volume (ltr)">
                  <Input type="number" step="0.01" {...form.register("volume", { valueAsNumber: true })} />
                </FormField>
                <div className="md:col-span-2">
                  <FormField label="Description" error={errors.description}>
                    <textarea
                      {...form.register("description")}
                      rows={3}
                      placeholder="Product description..."
                      className="flex w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/30 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
                    />
                  </FormField>
                </div>
                <div className="md:col-span-2">
                  <FormField label="Images">
                    <ImageUpload
                      images={form.watch("images")}
                      onChange={(images) => form.setValue("images", images)}
                    />
                  </FormField>
                </div>
              </div>
            </Card>
          </AnimatedTabsContent>

          <AnimatedTabsContent value="pricing">
            <Card glass className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField label="Purchase Price" error={errors.purchasePrice} required>
                  <Input
                    type="number"
                    step="0.01"
                    {...form.register("purchasePrice", { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </FormField>
                <FormField label="Selling Price" error={errors.sellingPrice} required>
                  <Input
                    type="number"
                    step="0.01"
                    {...form.register("sellingPrice", { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </FormField>
                <FormField label="Wholesale Price" error={errors.wholesalePrice}>
                  <Input
                    type="number"
                    step="0.01"
                    {...form.register("wholesalePrice", { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </FormField>
                <FormField label="Discount Price" error={errors.discountPrice}>
                  <Input
                    type="number"
                    step="0.01"
                    {...form.register("discountPrice", { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </FormField>
                <FormField label="Tax (%)" error={errors.tax}>
                  <Input
                    type="number"
                    step="0.1"
                    {...form.register("tax", { valueAsNumber: true })}
                    placeholder="0"
                  />
                </FormField>
                <FormField label=" " className="flex items-end">
                  <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                    <input
                      type="checkbox"
                      {...form.register("isActive")}
                      className="rounded border-white/20 bg-white/5"
                    />
                    Product is active
                  </label>
                </FormField>
              </div>
            </Card>
          </AnimatedTabsContent>

          <AnimatedTabsContent value="inventory">
            <Card glass className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField label="Current Stock" error={errors.currentStock}>
                  <Input
                    type="number"
                    {...form.register("currentStock", { valueAsNumber: true })}
                    placeholder="0"
                  />
                </FormField>
                <FormField label="Min Stock" error={errors.minStock}>
                  <Input
                    type="number"
                    {...form.register("minStock", { valueAsNumber: true })}
                    placeholder="0"
                  />
                </FormField>
                <FormField label="Max Stock" error={errors.maxStock}>
                  <Input
                    type="number"
                    {...form.register("maxStock", { valueAsNumber: true })}
                    placeholder="0"
                  />
                </FormField>
                <FormField label="Warehouse">
                  <Input {...form.register("warehouse")} placeholder="Warehouse location" />
                </FormField>
                <FormField label="Shelf / Bin">
                  <Input {...form.register("shelf")} placeholder="Aisle, shelf, bin" />
                </FormField>
                <FormField label="Batch Number">
                  <Input {...form.register("batchNumber")} placeholder="Batch #" />
                </FormField>
                <FormField label="Expiry Date">
                  <Input type="date" {...form.register("expiryDate")} />
                </FormField>
                <FormField label=" " className="flex items-end">
                  <div className="space-y-2">
                    {(["trackSerial", "trackBatch", "trackExpiry"] as const).map((field) => (
                      <label key={field} className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                        <input
                          type="checkbox"
                          {...form.register(field)}
                          className="rounded border-white/20 bg-white/5"
                        />
                        {field === "trackSerial" ? "Track Serial Numbers" :
                         field === "trackBatch" ? "Track Batches" : "Track Expiry"}
                      </label>
                    ))}
                  </div>
                </FormField>
              </div>
            </Card>
          </AnimatedTabsContent>

          <AnimatedTabsContent value="variants">
            <Card glass className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Product Variants</h3>
                  <p className="text-sm text-white/40">Add size, color, or other variations</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ name: "", value: "", price: 0, stock: 0, sku: "" })}
                >
                  <Plus className="h-4 w-4" />
                  Add Variant
                </Button>
              </div>

              <AnimatePresence mode="popLayout">
                {fields.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 text-white/30 text-sm border border-dashed border-white/10 rounded-xl"
                  >
                    No variants added yet. Click "Add Variant" to create variations.
                  </motion.div>
                )}

                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <motion.div
                      key={field.id}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-start gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.02]"
                    >
                      <div className="pt-2 text-white/20">
                        <GripVertical className="h-4 w-4" />
                      </div>
                      <div className="flex-1 grid gap-3 sm:grid-cols-5">
                        <Input
                          placeholder="Name (e.g. Size)"
                          {...form.register(`variants.${index}.name`)}
                        />
                        <Input
                          placeholder="Value (e.g. Large)"
                          {...form.register(`variants.${index}.value`)}
                        />
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Price"
                          {...form.register(`variants.${index}.price`, { valueAsNumber: true })}
                        />
                        <Input
                          type="number"
                          placeholder="Stock"
                          {...form.register(`variants.${index}.stock`, { valueAsNumber: true })}
                        />
                        <Input
                          placeholder="SKU"
                          {...form.register(`variants.${index}.sku`)}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-red-400 hover:text-red-300"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            </Card>
          </AnimatedTabsContent>
        </Tabs>
      </form>
    </div>
  )
}
