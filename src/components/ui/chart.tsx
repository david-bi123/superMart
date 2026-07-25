import * as React from "react"
import { cn } from "@/lib/utils/cn"

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config?: Record<string, { label: string; color: string }>
}

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ className, config, children, ...props }, ref) => {
    const cssVars = React.useMemo(() => {
      if (!config) return {}
      return Object.entries(config).reduce(
        (acc, [key, val]) => ({
          ...acc,
          [`--color-${key}`]: val.color,
        }),
        {} as Record<string, string>
      )
    }, [config])

    return (
      <div
        ref={ref}
        style={cssVars as React.CSSProperties}
        className={cn("w-full", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ChartContainer.displayName = "ChartContainer"

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; fill: string }>
  label?: string
  config?: Record<string, { label: string; color: string }>
}

const ChartTooltip = ({
  active,
  payload,
  label,
  config,
}: ChartTooltipProps) => {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-xl border border-white/10 bg-gray-900/95 backdrop-blur-2xl px-4 py-3 shadow-2xl">
      {label && (
        <p className="mb-2 text-sm font-medium text-white/60">{label}</p>
      )}
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: config?.[entry.name]?.color || entry.fill }}
            />
            <span className="text-white/80">
              {config?.[entry.name]?.label || entry.name}
            </span>
            <span className="ml-auto font-medium text-white">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface ChartLegendProps {
  payload?: Array<{ value: string; color: string }>
  config?: Record<string, { label: string; color: string }>
}

const ChartLegend = ({ payload, config }: ChartLegendProps) => {
  if (!payload?.length) return null

  return (
    <div className="flex flex-wrap items-center gap-4 pt-4">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{
              backgroundColor: config?.[entry.value]?.color || entry.color,
            }}
          />
          <span className="text-white/60">
            {config?.[entry.value]?.label || entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export { ChartContainer, ChartTooltip, ChartLegend }
export default ChartContainer
