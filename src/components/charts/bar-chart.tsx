"use client";

import { motion } from "framer-motion";
import {
  Bar,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils/cn";

interface BarChartProps {
  data: Record<string, any>[];
  xKey?: string;
  series: { key: string; name: string; color: string }[];
  height?: number;
  className?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  stacked?: boolean;
  layout?: "horizontal" | "vertical";
  loading?: boolean;
  valueFormatter?: (value: number) => string;
}

function CustomTooltip({ active, payload, label, series, valueFormatter }: any) {
  if (!active || !payload?.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="rounded-xl border border-border/50 bg-background/95 px-4 py-3 shadow-2xl backdrop-blur-2xl"
    >
      <p className="mb-2 text-sm font-medium text-muted-foreground">{label}</p>
      <div className="space-y-1.5">
        {payload.map((entry: any, index: number) => {
          const s = series?.find((ser: any) => ser.key === entry.dataKey || ser.name === entry.name);
          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: s?.color || entry.color }}
              />
              <span className="text-muted-foreground">{s?.name || entry.name}</span>
              <span className="ml-auto font-semibold text-foreground">
                {valueFormatter ? valueFormatter(entry.value) : entry.value.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export function BarChart({
  data,
  xKey = "name",
  series,
  height = 300,
  className,
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  stacked = false,
  layout = "horizontal",
  loading = false,
  valueFormatter,
}: BarChartProps) {
  if (loading) {
    return (
      <div className={cn("flex items-center justify-center", className)} style={{ height }}>
        <div className="h-full w-full animate-pulse rounded-xl bg-muted/50" />
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className={cn("flex items-center justify-center", className)} style={{ height }}>
        <p className="text-sm text-muted-foreground/50">No data available</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn("w-full", className)}
    >
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
          barCategoryGap="20%"
          barGap={2}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
          )}
          {layout === "horizontal" ? (
            <>
              <XAxis
                dataKey={xKey}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
                tickFormatter={(val) => valueFormatter ? valueFormatter(val) : `₵${val}`}
                width={60}
              />
            </>
          ) : (
            <>
              <YAxis
                dataKey={xKey}
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
                width={100}
              />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
                tickFormatter={(val) => valueFormatter ? valueFormatter(val) : `₵${val}`}
              />
            </>
          )}
          {showTooltip && (
            <Tooltip content={<CustomTooltip series={series} valueFormatter={valueFormatter} />} />
          )}
          {showLegend && (
            <Legend
              wrapperStyle={{ paddingTop: 10 }}
              formatter={(value: string) => (
                <span className="text-sm text-muted-foreground">{value}</span>
              )}
            />
          )}
          {series.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.name}
              fill={s.color}
              radius={[4, 4, 0, 0]}
              stackId={stacked ? "stack" : undefined}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
