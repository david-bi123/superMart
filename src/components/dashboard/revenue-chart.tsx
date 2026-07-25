"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";

interface RevenueChartProps {
  data?: { date: string; revenue: number; profit: number }[];
  loading?: boolean;
}

const ranges = [
  { label: "7d", value: 7 },
  { label: "30d", value: 30 },
  { label: "90d", value: 90 },
] as const;

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-gray-900/95 px-4 py-3 shadow-2xl backdrop-blur-2xl">
      <p className="mb-2 text-sm font-medium text-white/60">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-white/80">
            {entry.name === "revenue" ? "Revenue" : "Profit"}
          </span>
          <span className="ml-auto font-medium text-white">
            ${entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

export function RevenueChart({ data, loading }: RevenueChartProps) {
  const [range, setRange] = useState(30);

  const filtered =
    data?.filter((_, i) => {
      if (range === 7) return i >= data.length - 7;
      if (range === 30) return i >= data.length - 30;
      return true;
    }) || [];

  return (
    <Card glass className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-semibold text-white">
          Revenue Overview
        </CardTitle>
        <div className="flex gap-1 rounded-lg border border-white/10 bg-white/5 p-0.5">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-all duration-200",
                range === r.value
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-white/40 hover:text-white/70",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton variant="rectangular" className="h-[300px] w-full" />
          </div>
        ) : !filtered.length ? (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-sm text-white/40">No revenue data available</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filtered} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                  minTickGap={30}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
                  tickFormatter={(val) => `$${val}`}
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#8b5cf6", stroke: "#1a1a2e", strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#profitGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#10b981", stroke: "#1a1a2e", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
