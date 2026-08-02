"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/lib/format";

interface ProfitChartProps {
  data?: { date: string; revenue: number; profit: number }[];
  loading?: boolean;
}

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
            {formatMoney(entry.value, 0)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ProfitChart({ data, loading }: ProfitChartProps) {
  const last14Days = data?.slice(-14) || [];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold text-foreground">
          Profit vs Revenue
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[280px] w-full rounded-xl" />
        ) : !last14Days.length ? (
          <div className="flex h-[280px] items-center justify-center">
            <p className="text-sm text-muted-foreground/50">No profit data available</p>
          </div>
        ) : (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last14Days} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
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
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, opacity: 0.5 }}
                  tickFormatter={(val) => `₵${val}`}
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                  formatter={(value) =>
                    value === "revenue" ? "Revenue" : "Profit"
                  }
                />
                <Bar
                  dataKey="revenue"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                  opacity={0.8}
                />
                <Bar
                  dataKey="profit"
                  fill="hsl(160 60% 45%)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                  opacity={0.8}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
