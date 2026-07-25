"use client";

import { motion } from "framer-motion";
import {
  Area,
  AreaChart as RechartsAreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { cn } from "@/lib/utils/cn";

interface AreaChartProps {
  data: Record<string, any>[];
  xKey?: string;
  series: { key: string; name: string; color: string; gradientId?: string }[];
  height?: number;
  className?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  stacked?: boolean;
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

function CustomLegend({ series, valueFormatter, data }: any) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-4">
      {series.map((s: any) => {
        const lastValue = data?.[data.length - 1]?.[s.key] || 0;
        return (
          <div key={s.key} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-sm text-white/60">{s.name}</span>
            <span className="text-sm font-semibold text-white">
              {valueFormatter ? valueFormatter(lastValue) : lastValue.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function AreaChart({
  data,
  xKey = "date",
  series,
  height = 300,
  className,
  showGrid = true,
  showTooltip = true,
  showLegend = false,
  stacked = false,
  loading = false,
  valueFormatter,
}: AreaChartProps) {
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
        <RechartsAreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.gradientId || s.key} id={s.gradientId || `${s.key}Gradient`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
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
          {series.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={2}
              fill={`url(#${s.gradientId || `${s.key}Gradient`})`}
              dot={false}
              activeDot={{ r: 4, fill: s.color, stroke: "#1a1a2e", strokeWidth: 2 }}
              stackId={stacked ? "stack" : undefined}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
      {showLegend && <CustomLegend series={series} valueFormatter={valueFormatter} data={data} />}
    </motion.div>
  );
}
