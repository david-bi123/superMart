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

interface MonthlyData {
  month: string;
  sales: number;
  profit: number;
  expenses: number;
}

interface MonthlyComparisonProps {
  data?: MonthlyData[];
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
          <span className="text-muted-foreground">{entry.name}</span>
          <span className="ml-auto font-semibold text-foreground">
            {formatMoney(entry.value, 0)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function MonthlyComparison({ data, loading }: MonthlyComparisonProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold text-foreground">
          Monthly Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[320px] w-full rounded-xl" />
        ) : !data?.length ? (
          <div className="flex h-[320px] items-center justify-center">
            <p className="text-sm text-muted-foreground/50">No monthly data available</p>
          </div>
        ) : (
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border) / 0.5)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, opacity: 0.5 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
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
                />
                <Bar
                  name="Sales"
                  dataKey="sales"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={20}
                  opacity={0.8}
                />
                <Bar
                  name="Profit"
                  dataKey="profit"
                  fill="hsl(160 60% 45%)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={20}
                  opacity={0.8}
                />
                <Bar
                  name="Expenses"
                  dataKey="expenses"
                  fill="hsl(0 72% 51%)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={20}
                  opacity={0.7}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
