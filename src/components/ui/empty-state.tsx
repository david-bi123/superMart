import * as React from "react"
import { cn } from "@/lib/utils/cn"
import { motion } from "framer-motion"
import { Inbox } from "lucide-react"

interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon, title, description, action, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={cn(
          "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-muted/30 px-6 py-12 text-center backdrop-blur-sm",
          className
        )}
        {...props}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", damping: 15 }}
          className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary"
        >
          {icon || <Inbox className="h-8 w-8" />}
        </motion.div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
        )}
        {action && <div className="mt-6">{action}</div>}
      </motion.div>
    )
  }
)
EmptyState.displayName = "EmptyState"

export { EmptyState }
export default EmptyState
