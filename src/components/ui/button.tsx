"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "@radix-ui/react-slot"
import { motion, type HTMLMotionProps } from "framer-motion"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils/cn"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 shadow-primary/10 hover:shadow-primary/20",
        primary:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 shadow-primary/10 hover:shadow-primary/20",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 shadow-destructive/10 hover:shadow-destructive/20",
        outline:
          "border border-border bg-background hover:bg-accent hover:text-accent-foreground shadow-sm",
        ghost:
          "hover:bg-accent hover:text-accent-foreground",
        link:
          "text-primary underline-offset-4 hover:underline",
        gradient:
          "gradient-primary text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 hover:brightness-110",
      },
      size: {
        default: "h-10 px-4 py-2 gap-2",
        sm: "h-9 rounded-lg px-3.5 py-1.5 gap-1.5 text-xs",
        lg: "h-12 rounded-xl px-6 py-3 gap-2.5 text-base",
        xl: "h-14 rounded-xl px-8 py-4 gap-3 text-lg",
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
  loadingText?: string
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
      loadingText,
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
          disabled={disabled || loading}
          {...(props as any)}
        >
          {children}
        </Slot>
      )
    }

    return (
      <motion.button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        {...(props as any)}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading && loadingText ? loadingText : children}
      </motion.button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
export default Button
