import * as React from "react"
import { cn } from "@/lib/utils/cn"
import { motion } from "framer-motion"

interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  title: string
  description?: string
  actions?: React.ReactNode
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, title, description, actions, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
          className
        )}
        {...props}
      >
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-white/50">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </motion.div>
    )
  }
)
PageHeader.displayName = "PageHeader"

export { PageHeader }
export default PageHeader
