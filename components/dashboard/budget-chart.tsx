"use client"

import { useMemo } from "react"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { computeMonthlyTrend, DEFAULT_FILTERS, formatCurrency } from "@/lib/monitoring-data"

export function BudgetChart() {
  const data = useMemo(() => computeMonthlyTrend(DEFAULT_FILTERS), [])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Budget vs Commitment vs Actual</CardTitle>
        <CardDescription className="text-xs">
          Monthly breakdown for FY 2026
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "hsl(220 10% 46%)" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "hsl(220 10% 46%)" }}
                tickFormatter={(v) => {
                  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`
                  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}M`
                  return String(v)
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0 0% 100%)",
                  border: "1px solid hsl(220 13% 91%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                }}
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
              />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "12px" }}
              />
              <Bar dataKey="budget" name="Budget" fill="hsl(220 72% 50%)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="commitment" name="Commitment" fill="hsl(38 92% 50%)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="actual" name="Actual" fill="hsl(160 60% 42%)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
