import * as React from "react"
import { type DialogProps } from "@radix-ui/react-dialog"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface CommandContextValue {
  search: string
  setSearch: (value: string) => void
  selectedIndex: number
  setSelectedIndex: (index: number) => void
}

const CommandContext = React.createContext<CommandContextValue>({
  search: "",
  setSearch: () => {},
  selectedIndex: 0,
  setSelectedIndex: () => {},
})

interface CommandProps extends React.HTMLAttributes<HTMLDivElement> {
  shouldFilter?: boolean
}

const Command = React.forwardRef<HTMLDivElement, CommandProps>(
  ({ className, children, ...props }, ref) => {
    const [search, setSearch] = React.useState("")
    const [selectedIndex, setSelectedIndex] = React.useState(0)

    return (
      <CommandContext.Provider
        value={{ search, setSearch, selectedIndex, setSelectedIndex }}
      >
        <div
          ref={ref}
          className={cn(
            "flex h-full w-full flex-col overflow-hidden rounded-xl bg-background/95 text-foreground",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </CommandContext.Provider>
    )
  }
)
Command.displayName = "Command"

interface CommandDialogProps extends DialogProps {}

const CommandDialog = ({ children, ...props }: CommandDialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl sm:max-w-[500px]">
        <Command className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground/50">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

const CommandInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  const { search, setSearch } = React.useContext(CommandContext)

  return (
    <div className="flex items-center border-b border-border/50 px-4">
      <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground/50" />
      <input
        ref={ref}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={cn(
          "flex h-12 w-full rounded-xl bg-transparent py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  )
})
CommandInput.displayName = "CommandInput"

const CommandList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "max-h-[300px] overflow-y-auto overflow-x-hidden p-1",
      className
    )}
    {...props}
  />
))
CommandList.displayName = "CommandList"

const CommandEmpty = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("py-6 text-center text-sm text-muted-foreground/50", className)}
    {...props}
  />
))
CommandEmpty.displayName = "CommandEmpty"

interface CommandGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  heading?: string
}

const CommandGroup = React.forwardRef<HTMLDivElement, CommandGroupProps>(
  ({ className, heading, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden text-foreground [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground/50",
        className
      )}
      {...props}
    >
      {heading && (
        <div className="px-3 py-2 text-xs font-medium text-muted-foreground/50">
          {heading}
        </div>
      )}
      {children}
    </div>
  )
)
CommandGroup.displayName = "CommandGroup"

const CommandSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 h-px bg-border/50", className)}
    {...props}
  />
))
CommandSeparator.displayName = "CommandSeparator"

const CommandItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { disabled?: boolean; onSelect?: () => void }
>(({ className, disabled, onSelect, children, ...props }, ref) => {
  const { search } = React.useContext(CommandContext)
  const textContent = typeof children === "string" ? children : ""
  const matches = textContent
    ? textContent.toLowerCase().includes(search.toLowerCase())
    : true

  if (search && !matches) return null

  return (
    <div
      ref={ref}
      role="option"
      tabIndex={disabled ? -1 : 0}
      onClick={disabled ? undefined : onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !disabled && onSelect) {
          onSelect()
        }
      }}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-colors",
        "hover:bg-muted hover:text-foreground",
        "focus:bg-muted focus:text-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
CommandItem.displayName = "CommandItem"

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground/50",
        className
      )}
      {...props}
    />
  )
}
CommandShortcut.displayName = "CommandShortcut"

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
export default Command
