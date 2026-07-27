"use client";

import { useState, useEffect } from "react";
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
    <div className="rounded-xl border border-border/60 bg-background/95 px-4 py-3 shadow-xl backdrop-blur-2xl">
      <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">
            {entry.name === "revenue" ? "Revenue" : "Profit"}
          </span>
          <span className="ml-auto font-semibold text-foreground">
            ${entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

export function RevenueChart({ data, loading }: RevenueChartProps) {
  const [range, setRange] = useState(30);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const filtered =
    data?.filter((_, i) => {
      if (range === 7) return i >= data.length - 7;
      if (range === 30) return i >= data.length - 30;
      return true;
    }) || [];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base font-semibold text-foreground">
          Revenue Overview
        </CardTitle>
        <div className="flex gap-0.5 rounded-lg border border-border/50 bg-muted/50 p-0.5">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-200",
                range === r.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground/60 hover:text-foreground",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[280px] w-full rounded-xl" />
        ) : !filtered.length ? (
          <div className="flex h-[280px] items-center justify-center">
            <p className="text-sm text-muted-foreground/50">No revenue data available</p>
          </div>
        ) : (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filtered} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(142 76% 36%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(142 76% 36%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(160 60% 45%)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(160 60% 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border) / 0.5)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, opacity: 0.5 }}
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                  minTickGap={30}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, opacity: 0.5 }}
                  tickFormatter={(val) => `$${val}`}
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: "hsl(var(--primary))", stroke: "hsl(var(--background))", strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="hsl(160 60% 45%)"
                  strokeWidth={2}
                  fill="url(#profitGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: "hsl(160 60% 45%)", stroke: "hsl(var(--background))", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
