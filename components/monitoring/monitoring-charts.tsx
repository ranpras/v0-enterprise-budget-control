"use client"

import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { MonthlyTrend, VendorActual, StatusCount } from "@/lib/monitoring-data"
import { formatCurrency } from "@/lib/monitoring-data"

// ── Shared tooltip style ────────────────────────────────────────
const tooltipStyle = {
  backgroundColor: "hsl(0 0% 100%)",
  border: "1px solid hsl(220 13% 91%)",
  borderRadius: "8px",
  fontSize: "12px",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
}

const axisTickStyle = { fontSize: 11, fill: "hsl(220 10% 46%)" }

// ── 1) Budget vs Actual Bar Chart ───────────────────────────────
export function BudgetVsActualChart({ data }: { data: MonthlyTrend[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Budget vs Commitment vs Actual</CardTitle>
        <CardDescription className="text-xs">Monthly breakdown for FY 2026</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={axisTickStyle} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={axisTickStyle}
                tickFormatter={(v) => {
                  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`
                  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}M`
                  return String(v)
                }}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
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

// ── 2) Spending Trend Line Chart ────────────────────────────────
export function SpendingTrendChart({ data }: { data: MonthlyTrend[] }) {
  // Cumulative data
  let cumCommitment = 0
  let cumActual = 0
  const cumData = data.map((d) => {
    cumCommitment += d.commitment
    cumActual += d.actual
    return {
      month: d.month,
      commitment: cumCommitment,
      actual: cumActual,
    }
  })

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Cumulative Spending Trend</CardTitle>
        <CardDescription className="text-xs">Commitment and actual realization over time</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cumData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={axisTickStyle} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={axisTickStyle}
                tickFormatter={(v) => {
                  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`
                  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}M`
                  return String(v)
                }}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
              <Line
                type="monotone"
                dataKey="commitment"
                name="Commitment"
                stroke="hsl(38 92% 50%)"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "hsl(38 92% 50%)" }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="actual"
                name="Actual"
                stroke="hsl(160 60% 42%)"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "hsl(160 60% 42%)" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

// ── 3) Top Vendors Horizontal Bar Chart ─────────────────────────
export function TopVendorsChart({ data }: { data: VendorActual[] }) {
  // Shorten vendor names for chart
  const chartData = data.map((d) => ({
    ...d,
    shortName: d.vendor.length > 22 ? `${d.vendor.slice(0, 22)}...` : d.vendor,
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Top Vendors by Actual Amount</CardTitle>
        <CardDescription className="text-xs">Based on posted actual realization</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" horizontal={false} />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={axisTickStyle}
                tickFormatter={(v) => {
                  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`
                  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}M`
                  return String(v)
                }}
              />
              <YAxis
                type="category"
                dataKey="shortName"
                axisLine={false}
                tickLine={false}
                tick={axisTickStyle}
                width={150}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number) => [formatCurrency(value), "Actual"]}
                labelFormatter={(label) => {
                  const item = chartData.find((d) => d.shortName === label)
                  return item?.vendor || label
                }}
              />
              <Bar dataKey="amount" fill="hsl(220 72% 50%)" radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

// ── 4) SPK Status Distribution Pie Chart ────────────────────────
export function SpkStatusPieChart({ data }: { data: StatusCount[] }) {
  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">SPK Status Distribution</CardTitle>
        <CardDescription className="text-xs">Current status of all spending requests</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col items-center gap-4 lg:flex-row">
          <div className="h-[250px] w-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={55}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number, name: string) => [`${value} SPK (${total > 0 ? ((value / total) * 100).toFixed(0) : 0}%)`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex flex-col gap-2">
            {data.map((entry) => (
              <div key={entry.status} className="flex items-center gap-2.5">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-xs text-muted-foreground">{entry.label}</span>
                <span className="text-xs font-medium">{entry.count}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
