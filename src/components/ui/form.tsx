import * as React from "react"
import type {
  FieldError,
  FieldValues,
  Path,
  UseFormRegister,
} from "react-hook-form"
import { cn } from "@/lib/utils/cn"
import { motion } from "framer-motion"

interface FormFieldProps<TFieldValues extends FieldValues> {
  name?: Path<TFieldValues>
  label?: string
  error?: FieldError
  helpText?: string
  children: React.ReactNode
  className?: string
  required?: boolean
}

function FormField<TFieldValues extends FieldValues>({
  label,
  error,
  helpText,
  children,
  className,
  required,
}: FormFieldProps<TFieldValues>) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="block text-sm font-medium text-white/80">
          {label}
          {required && <span className="ml-1 text-red-400">*</span>}
        </label>
      )}
      {children}
      {helpText && !error && (
        <p className="text-xs text-white/40">{helpText}</p>
      )}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-400"
        >
          {error.message}
        </motion.p>
      )}
    </div>
  )
}

interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {
  error?: FieldError
}

const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("space-y-2", error && "text-red-400", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "block text-sm font-medium text-white/80",
      className
    )}
    {...props}
  />
))
FormLabel.displayName = "FormLabel"

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  Omit<React.HTMLAttributes<HTMLParagraphElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'>
>(({ className, children, ...props }, ref) => {
  if (!children) return null
  return (
    <motion.p
      ref={ref}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("text-xs text-red-400", className)}
      {...props}
    >
      {children}
    </motion.p>
  )
})
FormMessage.displayName = "FormMessage"

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs text-white/40", className)}
    {...props}
  />
))
FormDescription.displayName = "FormDescription"

export { FormField, FormItem, FormLabel, FormMessage, FormDescription }
export default FormField
