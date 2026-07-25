"use client";

import { motion } from "framer-motion";
import {
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  Cell,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils/cn";

interface PieChartProps {
  data: { name: string; value: number; color?: string }[];
  height?: number;
  className?: string;
  showTooltip?: boolean;
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  donut?: boolean;
  loading?: boolean;
  valueFormatter?: (value: number) => string;
  colors?: string[];
}

const DEFAULT_COLORS = [
  "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16",
  "#06b6d4", "#d946ef", "#64748b", "#22c55e", "#eab308",
];

function CustomTooltip({ active, payload, valueFormatter }: any) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="rounded-xl border border-border/50 bg-background/95 px-4 py-3 shadow-2xl backdrop-blur-2xl"
    >
      <div className="flex items-center gap-2 text-sm">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: entry.payload.fill || entry.color }}
        />
        <span className="text-muted-foreground">{entry.name}</span>
        <span className="ml-auto font-semibold text-foreground">
          {valueFormatter ? valueFormatter(entry.value) : entry.value.toLocaleString()}
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground/50">
        {(entry.payload.percent || entry.payload.percentage || 0).toFixed(1)}% of total
      </p>
    </motion.div>
  );
}

export function PieChart({
  data,
  height = 300,
  className,
  showTooltip = true,
  showLegend = true,
  innerRadius = 0,
  outerRadius = 120,
  donut = false,
  loading = false,
  valueFormatter,
  colors = DEFAULT_COLORS,
}: PieChartProps) {
  if (loading) {
    return (
      <div className={cn("flex items-center justify-center", className)} style={{ height }}>
        <div className="h-full w-full animate-pulse rounded-full bg-muted/50" />
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

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const enrichedData = data.map((d) => ({
    ...d,
    percentage: total > 0 ? (d.value / total) * 100 : 0,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={cn("w-full", className)}
    >
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={enrichedData}
            cx="50%"
            cy="50%"
            innerRadius={donut ? innerRadius || 60 : innerRadius || 0}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
          >
            {enrichedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || colors[index % colors.length]}
                stroke="transparent"
              />
            ))}
          </Pie>
          {showTooltip && (
            <Tooltip content={<CustomTooltip valueFormatter={valueFormatter} />} />
          )}
          {showLegend && (
            <Legend
              wrapperStyle={{ paddingTop: 10 }}
              formatter={(value: string) => (
                <span className="text-sm text-muted-foreground">{value}</span>
              )}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
