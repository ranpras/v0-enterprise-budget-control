"use client"

import {
  MOCK_BUDGETS_PROJECT,
  MOCK_BUDGETS_ROUTINE,
  getBudgetTotal,
  formatCurrency,
  UNIT_OPTIONS,
} from "./budget-types"
import { MOCK_SPKS, getSpkTotal, type SpkStatus } from "./spk-types"
import { MOCK_ACTUALS, getActualTotal, type ActualStatus } from "./actual-types"

// ── Aggregation helpers ─────────────────────────────────────────

export interface MonitoringFilters {
  fiscalYear: number
  unit: string
  vendor: string
  spkStatus: SpkStatus | "all"
  budgetCategory: "all" | "project" | "routine"
}

export const DEFAULT_FILTERS: MonitoringFilters = {
  fiscalYear: 2026,
  unit: "All Units",
  vendor: "All Vendors",
  spkStatus: "all",
  budgetCategory: "all",
}

// ── KPI Summary ─────────────────────────────────────────────────

export interface KpiSummary {
  totalBudget: number
  totalCommitment: number
  totalActual: number
  remainingBudget: number
  overCommitCount: number
  nearLimitCount: number
}

export function computeKpis(filters: MonitoringFilters): KpiSummary {
  const allBudgets = [...MOCK_BUDGETS_PROJECT, ...MOCK_BUDGETS_ROUTINE]
  const budgets = allBudgets.filter((b) => {
    if (b.fiscalYear !== filters.fiscalYear) return false
    if (filters.unit !== "All Units" && b.unitKerja !== filters.unit) return false
    if (filters.budgetCategory !== "all" && b.budgetType !== filters.budgetCategory) return false
    return true
  })

  const spks = MOCK_SPKS.filter((s) => {
    if (s.fiscalYear !== filters.fiscalYear) return false
    if (filters.unit !== "All Units" && s.unitKerja !== filters.unit) return false
    if (filters.vendor !== "All Vendors" && s.vendor !== filters.vendor) return false
    if (filters.spkStatus !== "all" && s.status !== filters.spkStatus) return false
    return true
  })

  const actuals = MOCK_ACTUALS.filter((a) => {
    if (a.fiscalYear !== filters.fiscalYear) return false
    if (filters.unit !== "All Units" && a.unitKerja !== filters.unit) return false
    if (filters.vendor !== "All Vendors" && a.vendor !== filters.vendor) return false
    return true
  })

  const totalBudget = budgets.reduce((s, b) => s + getBudgetTotal(b), 0)
  const totalCommitment = spks
    .filter((s) => ["active", "admin_approved", "supervisor_approved", "submitted"].includes(s.status))
    .reduce((s, spk) => s + getSpkTotal(spk), 0)
  const totalActual = actuals
    .filter((a) => ["posted"].includes(a.status))
    .reduce((s, a) => s + getActualTotal(a), 0)
  const remainingBudget = totalBudget - totalCommitment

  // Alerts
  let overCommitCount = 0
  let nearLimitCount = 0
  const unitTotals = new Map<string, { budget: number; commitment: number }>()
  for (const b of budgets) {
    const cur = unitTotals.get(b.unitKerja) || { budget: 0, commitment: 0 }
    cur.budget += getBudgetTotal(b)
    unitTotals.set(b.unitKerja, cur)
  }
  for (const s of spks) {
    if (!["active", "admin_approved", "supervisor_approved", "submitted"].includes(s.status)) continue
    const cur = unitTotals.get(s.unitKerja) || { budget: 0, commitment: 0 }
    cur.commitment += getSpkTotal(s)
    unitTotals.set(s.unitKerja, cur)
  }
  for (const [, v] of unitTotals) {
    if (v.budget > 0) {
      const ratio = v.commitment / v.budget
      if (ratio > 1) overCommitCount++
      else if (ratio > 0.85) nearLimitCount++
    }
  }

  return { totalBudget, totalCommitment, totalActual, remainingBudget, overCommitCount, nearLimitCount }
}

// ── Monthly trend ───────────────────────────────────────────────

export interface MonthlyTrend {
  month: string
  budget: number
  commitment: number
  actual: number
}

export function computeMonthlyTrend(filters: MonitoringFilters): MonthlyTrend[] {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  // Budget monthly from line items
  const allBudgets = [...MOCK_BUDGETS_PROJECT, ...MOCK_BUDGETS_ROUTINE]
  const budgets = allBudgets.filter((b) => {
    if (b.fiscalYear !== filters.fiscalYear) return false
    if (filters.unit !== "All Units" && b.unitKerja !== filters.unit) return false
    if (filters.budgetCategory !== "all" && b.budgetType !== filters.budgetCategory) return false
    return true
  })

  const budgetByMonth = new Array(12).fill(0)
  for (const b of budgets) {
    for (const line of b.lineItems) {
      for (let i = 0; i < 12; i++) {
        budgetByMonth[i] += line.monthly[i]
      }
    }
  }

  // Simulate commitment and actual cumulative by month
  // Use the total values and distribute them across months for demo
  const spks = MOCK_SPKS.filter((s) => {
    if (s.fiscalYear !== filters.fiscalYear) return false
    if (filters.unit !== "All Units" && s.unitKerja !== filters.unit) return false
    if (filters.vendor !== "All Vendors" && s.vendor !== filters.vendor) return false
    return true
  })
  const totalCommitment = spks
    .filter((s) => ["active", "admin_approved", "supervisor_approved", "submitted"].includes(s.status))
    .reduce((s, spk) => s + getSpkTotal(spk), 0)

  const actuals = MOCK_ACTUALS.filter((a) => {
    if (a.fiscalYear !== filters.fiscalYear) return false
    if (filters.unit !== "All Units" && a.unitKerja !== filters.unit) return false
    return true
  })
  const totalActual = actuals
    .filter((a) => a.status === "posted")
    .reduce((s, a) => s + getActualTotal(a), 0)

  // Distribute commitment/actual across first 6 months with ramp-up
  const commitWeights = [0.08, 0.12, 0.16, 0.2, 0.22, 0.22, 0, 0, 0, 0, 0, 0]
  const actualWeights = [0.06, 0.1, 0.14, 0.2, 0.25, 0.25, 0, 0, 0, 0, 0, 0]

  return months.map((month, i) => ({
    month,
    budget: budgetByMonth[i],
    commitment: Math.round(totalCommitment * commitWeights[i]),
    actual: Math.round(totalActual * actualWeights[i]),
  }))
}

// ── Top vendors by actual ───────────────────────────────────────

export interface VendorActual {
  vendor: string
  amount: number
}

export function computeTopVendors(filters: MonitoringFilters, limit = 6): VendorActual[] {
  const actuals = MOCK_ACTUALS.filter((a) => {
    if (a.fiscalYear !== filters.fiscalYear) return false
    if (filters.unit !== "All Units" && a.unitKerja !== filters.unit) return false
    if (a.status !== "posted") return false
    return true
  })

  const vendorMap = new Map<string, number>()
  for (const a of actuals) {
    vendorMap.set(a.vendor, (vendorMap.get(a.vendor) || 0) + getActualTotal(a))
  }

  return Array.from(vendorMap.entries())
    .map(([vendor, amount]) => ({ vendor, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit)
}

// ── SPK status distribution ─────────────────────────────────────

export interface StatusCount {
  status: string
  label: string
  count: number
  color: string
}

export function computeSpkStatusDistribution(filters: MonitoringFilters): StatusCount[] {
  const spks = MOCK_SPKS.filter((s) => {
    if (s.fiscalYear !== filters.fiscalYear) return false
    if (filters.unit !== "All Units" && s.unitKerja !== filters.unit) return false
    if (filters.vendor !== "All Vendors" && s.vendor !== filters.vendor) return false
    return true
  })

  const statusMap = new Map<SpkStatus, number>()
  for (const s of spks) {
    statusMap.set(s.status, (statusMap.get(s.status) || 0) + 1)
  }

  const colorMap: Record<SpkStatus, string> = {
    draft: "hsl(220 10% 46%)",
    submitted: "hsl(220 72% 50%)",
    supervisor_approved: "hsl(38 92% 50%)",
    admin_approved: "hsl(160 60% 42%)",
    active: "hsl(220 72% 60%)",
    rejected: "hsl(0 72% 51%)",
    cancelled: "hsl(220 14% 75%)",
  }

  const labelMap: Record<SpkStatus, string> = {
    draft: "Draft",
    submitted: "Submitted",
    supervisor_approved: "Spv Approved",
    admin_approved: "Adm Approved",
    active: "Active",
    rejected: "Rejected",
    cancelled: "Cancelled",
  }

  return Array.from(statusMap.entries())
    .map(([status, count]) => ({
      status,
      label: labelMap[status] || status,
      count,
      color: colorMap[status] || "hsl(220 14% 75%)",
    }))
    .sort((a, b) => b.count - a.count)
}

// ── Budget detail rows for table ────────────────────────────────

export interface BudgetDetailRow {
  id: string
  unit: string
  budgetId: string
  fiscalYear: number
  budgetType: string
  description: string
  budgetAmount: number
  commitmentAmount: number
  actualAmount: number
  remainingBudget: number
  status: string
  usagePercent: number
  alert: "over" | "near" | "normal"
}

export function computeBudgetDetailRows(filters: MonitoringFilters): BudgetDetailRow[] {
  const allBudgets = [...MOCK_BUDGETS_PROJECT, ...MOCK_BUDGETS_ROUTINE]
  const budgets = allBudgets.filter((b) => {
    if (b.fiscalYear !== filters.fiscalYear) return false
    if (filters.unit !== "All Units" && b.unitKerja !== filters.unit) return false
    if (filters.budgetCategory !== "all" && b.budgetType !== filters.budgetCategory) return false
    return true
  })

  return budgets.map((b) => {
    const budgetAmount = getBudgetTotal(b)

    // Find SPKs for this unit
    const unitSpks = MOCK_SPKS.filter(
      (s) =>
        s.unitKerja === b.unitKerja &&
        s.fiscalYear === b.fiscalYear &&
        ["active", "admin_approved", "supervisor_approved", "submitted"].includes(s.status),
    )
    const commitmentAmount = unitSpks.reduce((s, spk) => s + getSpkTotal(spk), 0)

    // Find actuals for this unit
    const unitActuals = MOCK_ACTUALS.filter(
      (a) => a.unitKerja === b.unitKerja && a.fiscalYear === b.fiscalYear && a.status === "posted",
    )
    const actualAmount = unitActuals.reduce((s, a) => s + getActualTotal(a), 0)

    const remainingBudget = budgetAmount - commitmentAmount
    const usagePercent = budgetAmount > 0 ? (commitmentAmount / budgetAmount) * 100 : 0
    const alert: "over" | "near" | "normal" = usagePercent > 100 ? "over" : usagePercent > 85 ? "near" : "normal"

    return {
      id: b.id,
      unit: b.unitKerja,
      budgetId: b.budgetId,
      fiscalYear: b.fiscalYear,
      budgetType: b.budgetType === "project" ? "CAPEX" : "OPEX",
      description: b.description,
      budgetAmount,
      commitmentAmount,
      actualAmount,
      remainingBudget,
      status: b.status,
      usagePercent,
      alert,
    }
  })
}

// ── Alert rows ──────────────────────────────────────────────────

export interface AlertItem {
  id: string
  type: "over-budget" | "near-limit"
  unit: string
  description: string
  budgetId: string
  usagePercent: number
}

export function computeAlerts(filters: MonitoringFilters): AlertItem[] {
  const rows = computeBudgetDetailRows(filters)
  return rows
    .filter((r) => r.alert !== "normal")
    .map((r) => ({
      id: r.id,
      type: r.alert === "over" ? ("over-budget" as const) : ("near-limit" as const),
      unit: r.unit,
      description: r.description,
      budgetId: r.budgetId,
      usagePercent: r.usagePercent,
    }))
    .sort((a, b) => b.usagePercent - a.usagePercent)
}

export { formatCurrency, UNIT_OPTIONS }
export { VENDOR_OPTIONS } from "./spk-types"
