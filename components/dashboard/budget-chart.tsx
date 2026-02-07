"use client"

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const data = [
  { month: "Jan", budget: 4200, commitment: 1800, actual: 1200 },
  { month: "Feb", budget: 4200, commitment: 2400, actual: 1500 },
  { month: "Mar", budget: 4200, commitment: 3100, actual: 1800 },
  { month: "Apr", budget: 4200, commitment: 3600, actual: 2200 },
  { month: "May", budget: 4200, commitment: 4000, actual: 2800 },
  { month: "Jun", budget: 4200, commitment: 4100, actual: 3200 },
  { month: "Jul", budget: 3800, commitment: 0, actual: 0 },
  { month: "Aug", budget: 3800, commitment: 0, actual: 0 },
  { month: "Sep", budget: 3800, commitment: 0, actual: 0 },
  { month: "Oct", budget: 3800, commitment: 0, actual: 0 },
  { month: "Nov", budget: 3800, commitment: 0, actual: 0 },
  { month: "Dec", budget: 3800, commitment: 0, actual: 0 },
]

export function BudgetChart() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Budget vs Commitment vs Actual</CardTitle>
        <CardDescription className="text-xs">
          Monthly breakdown for FY 2026 (in millions Rp)
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={2}>
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
                tickFormatter={(v) => `${v / 1000}B`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0 0% 100%)",
                  border: "1px solid hsl(220 13% 91%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                }}
                formatter={(value: number) => [`Rp ${value}M`, undefined]}
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
