"use client"

import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

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
  const cards: SummaryCardProps[] = [
    {
      title: "Total Budget (Baseline)",
      value: "Rp 48.2B",
      subtitle: "FY 2026 - All Units",
      trend: "up",
      trendValue: "+12%",
      accent: "primary",
    },
    {
      title: "Approved Commitment",
      value: "Rp 18.7B",
      subtitle: "38.8% of baseline",
      trend: "up",
      trendValue: "38.8%",
      accent: "warning",
    },
    {
      title: "Actual Realization",
      value: "Rp 9.3B",
      subtitle: "19.3% of baseline",
      trend: "neutral",
      trendValue: "19.3%",
      accent: "success",
    },
    {
      title: "Available Budget",
      value: "Rp 20.2B",
      subtitle: "41.9% remaining",
      trend: "down",
      trendValue: "-8.1%",
      accent: "destructive",
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
