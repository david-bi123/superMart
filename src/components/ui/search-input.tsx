import * as React from "react"
import { cn } from "@/lib/utils/cn"
import { Search } from "lucide-react"

interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value?: string
  onChange?: (value: string) => void
  debounceMs?: number
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value: externalValue, onChange, debounceMs = 300, placeholder = "Search...", ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(
      externalValue || ""
    )
    const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

    React.useEffect(() => {
      setInternalValue(externalValue || "")
    }, [externalValue])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInternalValue(newValue)

      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      timerRef.current = setTimeout(() => {
        onChange?.(newValue)
      }, debounceMs)
    }

    React.useEffect(() => {
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current)
        }
      }
    }, [])

    return (
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
        <input
          ref={ref}
          value={internalValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={cn(
            "flex h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/30 backdrop-blur-sm transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
SearchInput.displayName = "SearchInput"

export { SearchInput }
export default SearchInput
