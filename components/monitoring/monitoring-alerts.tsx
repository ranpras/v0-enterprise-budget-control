"use client"

import { AlertTriangle, AlertCircle, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { AlertItem } from "@/lib/monitoring-data"

interface MonitoringAlertsProps {
  alerts: AlertItem[]
  onDrillDown?: (budgetId: string) => void
}

export function MonitoringAlerts({ alerts, onDrillDown }: MonitoringAlertsProps) {
  if (alerts.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <AlertTriangle className="h-4 w-4 text-warning" />
          Alerts & Notifications
          <Badge variant="secondary" className="text-[10px]">
            {alerts.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 pt-0">
        {alerts.map((alert) => (
          <button
            key={alert.id}
            type="button"
            onClick={() => onDrillDown?.(alert.budgetId)}
            className={cn(
              "flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent/50",
              alert.type === "over-budget"
                ? "border-destructive/20 bg-destructive/5"
                : "border-warning/20 bg-warning/5",
            )}
          >
            {alert.type === "over-budget" ? (
              <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
            )}
            <div className="flex flex-1 flex-col gap-0.5">
              <span className="text-xs font-medium">
                {alert.unit} - {alert.budgetId}
              </span>
              <span className="text-xs text-muted-foreground">{alert.description}</span>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "shrink-0 text-[10px]",
                alert.type === "over-budget"
                  ? "border-destructive/30 text-destructive"
                  : "border-warning/30 text-warning",
              )}
            >
              {alert.usagePercent.toFixed(0)}% used
            </Badge>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </button>
        ))}
      </CardContent>
    </Card>
  )
}
