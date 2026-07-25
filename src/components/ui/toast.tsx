"use client";
import * as React from "react"
import { cn } from "@/lib/utils/cn"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"

type ToastType = "success" | "error" | "warning" | "info"

interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastState {
  toasts: Toast[]
}

type ToastAction =
  | { type: "ADD_TOAST"; payload: Toast }
  | { type: "REMOVE_TOAST"; payload: string }

function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case "ADD_TOAST":
      return { ...state, toasts: [...state.toasts, action.payload] }
    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.payload),
      }
    default:
      return state
  }
}

let toastCount = 0
let listeners: Array<(state: ToastState) => void> = []
let toastState: ToastState = { toasts: [] }

function dispatch(action: ToastAction) {
  toastState = toastReducer(toastState, action)
  listeners.forEach((listener) => listener(toastState))
}

function addToast(message: string, type: ToastType, duration: number = 4000) {
  const id = `toast-${++toastCount}`
  dispatch({ type: "ADD_TOAST", payload: { id, message, type, duration } })
  if (duration > 0) {
    setTimeout(() => removeToast(id), duration)
  }
  return id
}

function removeToast(id: string) {
  dispatch({ type: "REMOVE_TOAST", payload: id })
}

function toast(message: string) {
  addToast(message, "info")
}

toast.success = (message: string) => addToast(message, "success")
toast.error = (message: string) => addToast(message, "error")
toast.warning = (message: string) => addToast(message, "warning")
toast.info = (message: string) => addToast(message, "info")

function useToast() {
  const [state, setState] = React.useState<ToastState>(toastState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      listeners = listeners.filter((l) => l !== setState)
    }
  }, [])

  return {
    toasts: state.toasts,
    toast,
    dismiss: removeToast,
  }
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const colorMap = {
  success:
    "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400",
  error:
    "bg-destructive/10 border-destructive/20 text-destructive",
  warning:
    "bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800 text-amber-700 dark:text-amber-400",
  info:
    "bg-muted border-border text-foreground",
}

function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = iconMap[t.type]
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-xl bg-background/80",
                colorMap[t.type]
              )}
            >
              <Icon className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium flex-1">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="shrink-0 rounded-lg p-1 opacity-60 hover:opacity-100 transition-opacity hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

export { Toaster, toast, useToast }
export default Toaster
