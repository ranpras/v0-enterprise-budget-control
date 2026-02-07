"use client"

import { Filter, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import type { MonitoringFilters } from "@/lib/monitoring-data"
import { DEFAULT_FILTERS, UNIT_OPTIONS, VENDOR_OPTIONS } from "@/lib/monitoring-data"
import type { SpkStatus } from "@/lib/spk-types"
import { SPK_STATUS_LABELS } from "@/lib/spk-types"

interface MonitoringFilterPanelProps {
  filters: MonitoringFilters
  onChange: (filters: MonitoringFilters) => void
}

const spkStatuses: SpkStatus[] = ["draft", "submitted", "supervisor_approved", "admin_approved", "active", "rejected", "cancelled"]

export function MonitoringFilterPanel({ filters, onChange }: MonitoringFilterPanelProps) {
  const hasActiveFilters =
    filters.unit !== DEFAULT_FILTERS.unit ||
    filters.vendor !== DEFAULT_FILTERS.vendor ||
    filters.spkStatus !== DEFAULT_FILTERS.spkStatus ||
    filters.budgetCategory !== DEFAULT_FILTERS.budgetCategory

  function reset() {
    onChange({ ...DEFAULT_FILTERS })
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-end gap-4">
          {/* Fiscal Year */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Fiscal Year</Label>
            <Select
              value={String(filters.fiscalYear)}
              onValueChange={(v) => onChange({ ...filters, fiscalYear: Number(v) })}
            >
              <SelectTrigger className="h-8 w-28 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2027">2027</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Unit */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Unit</Label>
            <Select
              value={filters.unit}
              onValueChange={(v) => onChange({ ...filters, unit: v })}
            >
              <SelectTrigger className="h-8 w-40 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UNIT_OPTIONS.map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Vendor */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Vendor</Label>
            <Select
              value={filters.vendor}
              onValueChange={(v) => onChange({ ...filters, vendor: v })}
            >
              <SelectTrigger className="h-8 w-48 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Vendors">All Vendors</SelectItem>
                {VENDOR_OPTIONS.map((v) => (
                  <SelectItem key={v.value} value={v.label}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* SPK Status */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">SPK Status</Label>
            <Select
              value={filters.spkStatus}
              onValueChange={(v) => onChange({ ...filters, spkStatus: v as SpkStatus | "all" })}
            >
              <SelectTrigger className="h-8 w-40 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {spkStatuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {SPK_STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Budget Category */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Budget Category</Label>
            <Select
              value={filters.budgetCategory}
              onValueChange={(v) => onChange({ ...filters, budgetCategory: v as "all" | "project" | "routine" })}
            >
              <SelectTrigger className="h-8 w-36 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="project">CAPEX (Project)</SelectItem>
                <SelectItem value="routine">OPEX (Routine)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={reset}>
                <RotateCcw className="h-3 w-3" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
