import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils/cn"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-violet-600/20 to-indigo-600/20 text-violet-300 border-violet-500/20",
        primary:
          "border-transparent bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-blue-300 border-blue-500/20",
        secondary:
          "border-transparent bg-gradient-to-r from-emerald-600/20 to-teal-600/20 text-emerald-300 border-emerald-500/20",
        destructive:
          "border-transparent bg-gradient-to-r from-red-600/20 to-rose-600/20 text-red-300 border-red-500/20",
        outline:
          "border-white/20 text-white/70",
        success:
          "border-transparent bg-gradient-to-r from-green-600/20 to-emerald-600/20 text-green-300 border-green-500/20",
        warning:
          "border-transparent bg-gradient-to-r from-amber-600/20 to-yellow-600/20 text-amber-300 border-amber-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge, badgeVariants }
export default Badge
