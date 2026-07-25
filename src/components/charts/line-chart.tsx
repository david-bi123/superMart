"use client";

import { motion } from "framer-motion";
import {
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils/cn";

interface LineChartProps {
  data: Record<string, any>[];
  xKey?: string;
  series: { key: string; name: string; color: string; dashed?: boolean }[];
  height?: number;
  className?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  showDots?: boolean;
  loading?: boolean;
  valueFormatter?: (value: number) => string;
}

function CustomTooltip({ active, payload, label, series, valueFormatter }: any) {
  if (!active || !payload?.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="rounded-xl border border-white/10 bg-gray-900/95 px-4 py-3 shadow-2xl backdrop-blur-2xl"
    >
      <p className="mb-2 text-sm font-medium text-white/60">{label}</p>
      <div className="space-y-1.5">
        {payload.map((entry: any, index: number) => {
          const s = series?.find((ser: any) => ser.key === entry.dataKey || ser.name === entry.name);
          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: s?.color || entry.color }}
              />
              <span className="text-white/80">{s?.name || entry.name}</span>
              <span className="ml-auto font-semibold text-white">
                {valueFormatter ? valueFormatter(entry.value) : entry.value.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export function LineChart({
  data,
  xKey = "date",
  series,
  height = 300,
  className,
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  showDots = false,
  loading = false,
  valueFormatter,
}: LineChartProps) {
  if (loading) {
    return (
      <div className={cn("flex items-center justify-center", className)} style={{ height }}>
        <div className="h-full w-full animate-pulse rounded-xl bg-white/5" />
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className={cn("flex items-center justify-center", className)} style={{ height }}>
        <p className="text-sm text-white/40">No data available</p>
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
        <RechartsLineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
          )}
          <XAxis
            dataKey={xKey}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
            minTickGap={30}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
            tickFormatter={(val) => valueFormatter ? valueFormatter(val) : `$${val}`}
            width={60}
          />
          {showTooltip && (
            <Tooltip content={<CustomTooltip series={series} valueFormatter={valueFormatter} />} />
          )}
          {showLegend && (
            <Legend
              wrapperStyle={{ paddingTop: 10 }}
              formatter={(value: string) => (
                <span className="text-sm text-white/60">{value}</span>
              )}
            />
          )}
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={2}
              strokeDasharray={s.dashed ? "5 5" : undefined}
              dot={showDots ? { r: 3, fill: s.color, strokeWidth: 0 } : false}
              activeDot={{ r: 5, fill: s.color, stroke: "#1a1a2e", strokeWidth: 2 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
