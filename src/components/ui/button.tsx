import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "@radix-ui/react-slot"
import { motion, type HTMLMotionProps } from "framer-motion"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils/cn"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:from-violet-500 hover:to-indigo-500",
        primary:
          "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:from-blue-500 hover:to-cyan-500",
        secondary:
          "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:from-emerald-500 hover:to-teal-500",
        destructive:
          "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:from-red-500 hover:to-rose-500",
        outline:
          "border border-white/20 bg-white/5 text-foreground backdrop-blur-sm hover:bg-white/10 hover:border-white/30",
        ghost:
          "text-foreground/80 hover:text-foreground hover:bg-white/10",
        link:
          "text-violet-400 underline-offset-4 hover:underline hover:text-violet-300",
      },
      size: {
        default: "h-10 px-5 py-2 gap-2",
        sm: "h-9 rounded-lg px-3 py-1.5 gap-1.5 text-xs",
        lg: "h-12 rounded-xl px-8 py-3 gap-2.5 text-base",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "size">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  children?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={cn(buttonVariants({ variant, size, className }))}
          {...({ disabled: disabled || loading } as any)}
          {...(props as any)}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {children}
        </Slot>
      )
    }

    return (
      <motion.button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...(props as any)}
      >
        {loading && (
          <motion.span
            initial={{ opacity: 0, rotate: -180 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 180 }}
          >
            <Loader2 className="h-4 w-4 animate-spin" />
          </motion.span>
        )}
        {children}
      </motion.button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
export default Button
