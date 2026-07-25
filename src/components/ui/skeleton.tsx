import * as React from "react"
import { cn } from "@/lib/utils/cn"
import { motion } from "framer-motion"

interface SkeletonProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  variant?: "text" | "circular" | "rectangular"
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "text", ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          "relative overflow-hidden bg-white/10",
          variant === "text" && "h-4 w-full rounded-md",
          variant === "circular" && "h-10 w-10 rounded-full",
          variant === "rectangular" && "h-24 w-full rounded-xl",
          className
        )}
        {...props}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "linear",
          }}
        />
      </motion.div>
    )
  }
)
Skeleton.displayName = "Skeleton"

export { Skeleton }
export default Skeleton
