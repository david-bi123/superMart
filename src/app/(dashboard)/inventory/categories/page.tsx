"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Edit3,
  Trash2,
  FolderTree,
  ImageOff,
  ChevronRight,
  ChevronDown,
} from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { toast } from "@/components/ui/toast"
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/actions/inventory.actions"

interface CategoryNode {
  _id: string
  name: string
  slug: string
  parentId: string | null
  description: string
  image: string
  isActive: boolean
  sortOrder: number
  children?: CategoryNode[]
}

function buildTree(categories: CategoryNode[]): CategoryNode[] {
  const map = new Map<string, CategoryNode>()
  const roots: CategoryNode[] = []
  categories.forEach((c) => map.set(c._id, { ...c, children: [] }))
  categories.forEach((c) => {
    const node = map.get(c._id)!
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.children!.push(node)
    } else {
      roots.push(node)
    }
  })
  return roots
}

function CategoryRow({
  category,
  depth = 0,
  onEdit,
  onDelete,
}: {
  category: CategoryNode
  depth?: number
  onEdit: (cat: CategoryNode) => void
  onDelete: (id: string) => void
}) {
  const [expanded, setExpanded] = React.useState(true)
  const hasChildren = (category.children?.length ?? 0) > 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-white/[0.03] group",
          depth > 0 && "ml-8"
        )}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn("text-white/30 hover:text-white/60 transition-colors", !hasChildren && "invisible")}
        >
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        <div className="h-10 w-10 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
          {category.image ? (
            <img src={category.image} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <FolderTree className="h-4 w-4 text-white/20" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{category.name}</p>
          <p className="text-xs text-white/40 truncate">
            {category.description || category.slug}
          </p>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(category)}>
            <Edit3 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-400 hover:text-red-300"
            onClick={() => onDelete(category._id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <AnimatePresence>
        {expanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {category.children!.map((child) => (
              <CategoryRow
                key={child._id}
                category={child}
                depth={depth + 1}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function CategoriesPage() {
  const [categories, setCategories] = React.useState<CategoryNode[]>([])
  const [flatCategories, setFlatCategories] = React.useState<CategoryNode[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<CategoryNode | null>(null)
  const [formData, setFormData] = React.useState({ name: "", description: "", parentId: "", image: "" })

  const fetchCategories = async () => {
    setLoading(true)
    const res = await getCategories()
    if (res.success) {
      const data = res.data as CategoryNode[]
      setFlatCategories(data)
      setCategories(buildTree(data))
    }
    setLoading(false)
  }

  React.useEffect(() => { fetchCategories() }, [])

  const openCreate = () => {
    setEditing(null)
    setFormData({ name: "", description: "", parentId: "", image: "" })
    setDialogOpen(true)
  }

  const openEdit = (cat: CategoryNode) => {
    setEditing(cat)
    setFormData({
      name: cat.name,
      description: cat.description,
      parentId: cat.parentId || "",
      image: cat.image || "",
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Category name is required")
      return
    }
    const res = editing
      ? await updateCategory(editing._id, formData)
      : await createCategory(formData)
    if (res.success) {
      toast.success(editing ? "Category updated" : "Category created")
      setDialogOpen(false)
      fetchCategories()
    } else {
      toast.error(res.error || "Failed to save category")
    }
  }

  const handleDelete = async (id: string) => {
    const res = await deleteCategory(id)
    if (res.success) {
      toast.success("Category deleted")
      fetchCategories()
    } else {
      toast.error(res.error || "Failed to delete category")
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Organize your products into categories"
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        }
      />

      <Card glass className="p-5">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton variant="circular" className="h-10 w-10" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <EmptyState
            icon={<FolderTree className="h-8 w-8" />}
            title="No categories yet"
            description="Create categories to organize your products"
            action={
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            }
          />
        ) : (
          <div className="divide-y divide-white/5">
            {categories.map((cat) => (
              <CategoryRow
                key={cat._id}
                category={cat}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Category" : "Create Category"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update the category details" : "Add a new category to organize your products"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">
                Name <span className="text-red-400">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="Category name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                rows={2}
                placeholder="Brief description..."
                className="flex w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/30 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">Parent Category</label>
              <Select
                value={formData.parentId}
                onValueChange={(v) => setFormData((p) => ({ ...p, parentId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="None (top level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (Top Level)</SelectItem>
                  {flatCategories
                    .filter((c) => c._id !== editing?._id)
                    .map((c) => (
                      <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">Image URL</label>
              <Input
                value={formData.image}
                onChange={(e) => setFormData((p) => ({ ...p, image: e.target.value }))}
                placeholder="https://..."
              />
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
