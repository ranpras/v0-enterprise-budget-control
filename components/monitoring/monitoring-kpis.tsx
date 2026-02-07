"use client"

import React from "react"

import { TrendingUp, TrendingDown, Minus, DollarSign, FileCheck2, Receipt, Wallet, AlertTriangle, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { KpiSummary } from "@/lib/monitoring-data"
import { formatCurrency } from "@/lib/monitoring-data"

interface KpiCardProps {
  title: string
  value: string
  subtitle: string
  icon: React.ElementType
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  accent: "primary" | "success" | "warning" | "destructive"
  onClick?: () => void
}

const accentColors = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
}

const barColors = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
}

function KpiCard({ title, value, subtitle, icon: Icon, trend = "neutral", trendValue, accent, onClick }: KpiCardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-shadow",
        onClick && "cursor-pointer hover:shadow-md",
      )}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg", accentColors[accent])}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{title}</span>
            </div>
            <span className="text-2xl font-semibold tracking-tight">{value}</span>
            <span className="text-xs text-muted-foreground">{subtitle}</span>
          </div>
          {trendValue && (
            <div
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                accentColors[accent],
              )}
            >
              <TrendIcon className="h-3 w-3" />
              {trendValue}
            </div>
          )}
        </div>
      </CardContent>
      <div className={cn("absolute bottom-0 left-0 h-0.5 w-full", barColors[accent])} />
    </Card>
  )
}

function AlertCard({ label, count, accent, icon: Icon }: { label: string; count: number; accent: "warning" | "destructive"; icon: React.ElementType }) {
  if (count === 0) return null
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="flex items-center gap-3 p-4">
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", accentColors[accent])}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-semibold">{count}</span>
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
      </CardContent>
      <div className={cn("absolute bottom-0 left-0 h-0.5 w-full", barColors[accent])} />
    </Card>
  )
}

export function MonitoringKpis({ kpis, onDrillDown }: { kpis: KpiSummary; onDrillDown?: (type: string) => void }) {
  const commitPct = kpis.totalBudget > 0 ? ((kpis.totalCommitment / kpis.totalBudget) * 100).toFixed(1) : "0"
  const actualPct = kpis.totalBudget > 0 ? ((kpis.totalActual / kpis.totalBudget) * 100).toFixed(1) : "0"
  const remainPct = kpis.totalBudget > 0 ? ((kpis.remainingBudget / kpis.totalBudget) * 100).toFixed(1) : "0"

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Budget"
          value={formatCurrency(kpis.totalBudget)}
          subtitle="FY 2026 - Baseline"
          icon={DollarSign}
          accent="primary"
          onClick={() => onDrillDown?.("budget")}
        />
        <KpiCard
          title="Total Commitment (SPK)"
          value={formatCurrency(kpis.totalCommitment)}
          subtitle={`${commitPct}% of budget`}
          icon={FileCheck2}
          trend="up"
          trendValue={`${commitPct}%`}
          accent="warning"
          onClick={() => onDrillDown?.("commitment")}
        />
        <KpiCard
          title="Total Actual"
          value={formatCurrency(kpis.totalActual)}
          subtitle={`${actualPct}% of budget`}
          icon={Receipt}
          trend="neutral"
          trendValue={`${actualPct}%`}
          accent="success"
          onClick={() => onDrillDown?.("actual")}
        />
        <KpiCard
          title="Remaining Budget"
          value={formatCurrency(kpis.remainingBudget)}
          subtitle={`${remainPct}% available`}
          icon={Wallet}
          trend={kpis.remainingBudget < 0 ? "down" : "neutral"}
          trendValue={`${remainPct}%`}
          accent={Number(remainPct) < 20 ? "destructive" : "primary"}
          onClick={() => onDrillDown?.("remaining")}
        />
      </div>
      {(kpis.overCommitCount > 0 || kpis.nearLimitCount > 0) && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <AlertCard
            label="Over-commitment Units"
            count={kpis.overCommitCount}
            accent="destructive"
            icon={AlertCircle}
          />
          <AlertCard
            label="Near Budget Limit"
            count={kpis.nearLimitCount}
            accent="warning"
            icon={AlertTriangle}
          />
        </div>
      )}
    </div>
  )
}
