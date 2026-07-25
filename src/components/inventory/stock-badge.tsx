import { cn } from "@/lib/utils/cn"
import { Badge } from "@/components/ui/badge"

interface StockBadgeProps {
  currentStock: number
  minStock?: number
  maxStock?: number
  className?: string
}

export function StockBadge({ currentStock, minStock = 0, maxStock, className }: StockBadgeProps) {
  if (currentStock <= 0) {
    return (
      <Badge variant="destructive" className={cn("whitespace-nowrap", className)}>
        Out of Stock
      </Badge>
    )
  }

  if (maxStock && currentStock > maxStock) {
    return (
      <Badge variant="primary" className={cn("whitespace-nowrap", className)}>
        Overstock
      </Badge>
    )
  }

  if (minStock > 0 && currentStock <= minStock) {
    return (
      <Badge variant="warning" className={cn("whitespace-nowrap", className)}>
        Low Stock
      </Badge>
    )
  }

  return (
    <Badge variant="success" className={cn("whitespace-nowrap", className)}>
      In Stock
    </Badge>
  )
}
