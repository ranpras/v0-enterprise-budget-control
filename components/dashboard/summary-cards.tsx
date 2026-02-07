"use client"

import { useMemo } from "react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { computeKpis, DEFAULT_FILTERS, formatCurrency } from "@/lib/monitoring-data"

interface SummaryCardProps {
  title: string
  value: string
  subtitle: string
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  accent?: "primary" | "success" | "warning" | "destructive"
}

function SummaryCard({
  title,
  value,
  subtitle,
  trend = "neutral",
  trendValue,
  accent = "primary",
}: SummaryCardProps) {
  const accentColors = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    destructive: "bg-destructive/10 text-destructive",
  }

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">{title}</span>
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
      <div
        className={cn(
          "absolute bottom-0 left-0 h-0.5 w-full",
          accent === "primary" && "bg-primary",
          accent === "success" && "bg-success",
          accent === "warning" && "bg-warning",
          accent === "destructive" && "bg-destructive",
        )}
      />
    </Card>
  )
}

export function SummaryCards() {
  const kpis = useMemo(() => computeKpis(DEFAULT_FILTERS), [])

  const commitPct = kpis.totalBudget > 0 ? ((kpis.totalCommitment / kpis.totalBudget) * 100).toFixed(1) : "0"
  const actualPct = kpis.totalBudget > 0 ? ((kpis.totalActual / kpis.totalBudget) * 100).toFixed(1) : "0"
  const remainPct = kpis.totalBudget > 0 ? ((kpis.remainingBudget / kpis.totalBudget) * 100).toFixed(1) : "0"

  const cards: SummaryCardProps[] = [
    {
      title: "Total Budget (Baseline)",
      value: formatCurrency(kpis.totalBudget),
      subtitle: "FY 2026 - All Units",
      trend: "up" as const,
      trendValue: "Baseline",
      accent: "primary" as const,
    },
    {
      title: "Approved Commitment",
      value: formatCurrency(kpis.totalCommitment),
      subtitle: `${commitPct}% of baseline`,
      trend: "up" as const,
      trendValue: `${commitPct}%`,
      accent: "warning" as const,
    },
    {
      title: "Actual Realization",
      value: formatCurrency(kpis.totalActual),
      subtitle: `${actualPct}% of baseline`,
      trend: "neutral" as const,
      trendValue: `${actualPct}%`,
      accent: "success" as const,
    },
    {
      title: "Available Budget",
      value: formatCurrency(kpis.remainingBudget),
      subtitle: `${remainPct}% remaining`,
      trend: kpis.remainingBudget < 0 ? "down" as const : "neutral" as const,
      trendValue: `${remainPct}%`,
      accent: Number(remainPct) < 20 ? "destructive" as const : "primary" as const,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <SummaryCard key={card.title} {...card} />
      ))}
    </div>
  )
}
