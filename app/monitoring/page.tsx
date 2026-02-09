"use client"

import { useState, useMemo, useCallback } from "react"
import { MonitoringKpis } from "@/components/monitoring/monitoring-kpis"
import { MonitoringFilterPanel } from "@/components/monitoring/monitoring-filters"
import { MonitoringAlerts } from "@/components/monitoring/monitoring-alerts"
import { BudgetVsActualChart, SpendingTrendChart, TopVendorsChart, SpkStatusPieChart } from "@/components/monitoring/monitoring-charts"
import { MonitoringTable } from "@/components/monitoring/monitoring-table"
import {
  computeKpis,
  computeMonthlyTrend,
  computeTopVendors,
  computeSpkStatusDistribution,
  computeBudgetDetailRows,
  computeAlerts,
  DEFAULT_FILTERS,
} from "@/lib/monitoring-data"
import type { MonitoringFilters } from "@/lib/monitoring-data"

export default function MonitoringPage() {
  const [filters, setFilters] = useState<MonitoringFilters>({ ...DEFAULT_FILTERS })

  const kpis = useMemo(() => computeKpis(filters), [filters])
  const monthlyTrend = useMemo(() => computeMonthlyTrend(filters), [filters])
  const topVendors = useMemo(() => computeTopVendors(filters), [filters])
  const statusDist = useMemo(() => computeSpkStatusDistribution(filters), [filters])
  const detailRows = useMemo(() => computeBudgetDetailRows(filters), [filters])
  const alerts = useMemo(() => computeAlerts(filters), [filters])

  const handleDrillDown = useCallback((type: string) => {
    // Scroll to table when clicking KPI cards
    const el = document.getElementById("monitoring-table")
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }, [])

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      {/* Filter Panel */}
      <MonitoringFilterPanel filters={filters} onChange={setFilters} />

      {/* KPI Summary */}
      <MonitoringKpis kpis={kpis} onDrillDown={handleDrillDown} />

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <BudgetVsActualChart data={monthlyTrend} />
        <SpendingTrendChart data={monthlyTrend} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TopVendorsChart data={topVendors} />
        <SpkStatusPieChart data={statusDist} />
      </div>

      {/* Alerts */}
      <MonitoringAlerts alerts={alerts} />

      {/* Detail Table */}
      <div id="monitoring-table">
        <MonitoringTable rows={detailRows} />
      </div>
    </div>
  )
}
