"use client"

import * as React from "react"
import { cn } from "@/lib/utils/cn"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

interface LoadingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  fullScreen?: boolean
  size?: "sm" | "default" | "lg"
  text?: string
}

const sizeMap = {
  sm: "h-5 w-5",
  default: "h-8 w-8",
  lg: "h-12 w-12",
}

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ className, fullScreen = false, size = "default", text, ...props }, ref) => {
    const content = (
      <motion.div
        ref={ref}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          "flex flex-col items-center justify-center gap-3",
          className
        )}
        {...props}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Loader2
            className={cn(
              "text-primary",
              sizeMap[size]
            )}
          />
        </motion.div>
        {text && (
          <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
        )}
      </motion.div>
    )

    if (fullScreen) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          {content}
        </div>
      )
    }

    return content
  }
)
Loading.displayName = "Loading"

export { Loading }
export default Loading
