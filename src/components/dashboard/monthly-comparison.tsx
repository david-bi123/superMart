"use client";

import { motion } from "framer-motion";
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
    <div className="rounded-xl border border-white/10 bg-gray-900/95 px-4 py-3 shadow-2xl backdrop-blur-2xl">
      <p className="mb-2 text-sm font-medium text-white/60">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-white/80">{entry.name}</span>
          <span className="ml-auto font-medium text-white">
            ${entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

export function MonthlyComparison({ data, loading }: MonthlyComparisonProps) {
  return (
    <Card glass className="overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-white">
          Monthly Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton variant="rectangular" className="h-[350px] w-full" />
          </div>
        ) : !data?.length ? (
          <div className="flex h-[350px] items-center justify-center">
            <p className="text-sm text-white/40">No monthly data available</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="h-[350px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
                  tickFormatter={(val) => `$${val}`}
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}
                />
                <Bar
                  name="Sales"
                  dataKey="sales"
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={20}
                  opacity={0.8}
                />
                <Bar
                  name="Profit"
                  dataKey="profit"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={20}
                  opacity={0.8}
                />
                <Bar
                  name="Expenses"
                  dataKey="expenses"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={20}
                  opacity={0.8}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
