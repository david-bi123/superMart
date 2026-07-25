"use client"

import { motion } from "framer-motion"
import { Edit3, Copy, Archive, ImageOff } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { Button } from "@/components/ui/button"
import { StockBadge } from "@/components/inventory/stock-badge"

interface ProductCardProps {
  product: {
    _id: string
    name: string
    sku?: string
    sellingPrice: number
    currentStock: number
    minStock?: number
    maxStock?: number
    images?: string[]
    category?: string
  }
  onEdit?: (id: string) => void
  onDuplicate?: (id: string) => void
  onArchive?: (id: string) => void
  className?: string
}

export function ProductCard({ product, onEdit, onDuplicate, onArchive, className }: ProductCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative rounded-2xl border border-border/50 bg-muted/50 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:border-border hover:bg-muted hover:shadow-xl hover:shadow-primary/5",
        className
      )}
    >
      <div className="aspect-square relative overflow-hidden bg-muted/50">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground/50">
            <ImageOff className="h-10 w-10" />
          </div>
        )}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
              onClick={() => onEdit(product._id)}
            >
              <Edit3 className="h-3.5 w-3.5" />
            </Button>
          )}
          {onDuplicate && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
              onClick={() => onDuplicate(product._id)}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          )}
          {onArchive && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
              onClick={() => onArchive(product._id)}
            >
              <Archive className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
          <p className="text-xs text-muted-foreground/50 mt-0.5">SKU: {product.sku || "—"}</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-foreground">
            ${product.sellingPrice.toFixed(2)}
          </span>
          <StockBadge
            currentStock={product.currentStock}
            minStock={product.minStock}
            maxStock={product.maxStock}
          />
        </div>
        {product.category && (
          <p className="text-xs text-muted-foreground/30">{product.category}</p>
        )}
      </div>
    </motion.div>
  )
}
