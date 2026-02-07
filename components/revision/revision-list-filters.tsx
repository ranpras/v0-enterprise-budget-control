"use client"

import { Search, SlidersHorizontal, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  REVISION_STATUS_LABELS,
  REVISION_TYPE_LABELS,
  UNIT_OPTIONS,
  type RevisionStatus,
  type RevisionType,
} from "@/lib/revision-types"

export interface RevisionListFilters {
  search: string
  unit: string
  status: RevisionStatus | "all"
  revisionType: RevisionType | "all"
  fiscalYear: string
}

export const DEFAULT_REVISION_FILTERS: RevisionListFilters = {
  search: "",
  unit: "All Units",
  status: "all",
  revisionType: "all",
  fiscalYear: "all",
}

interface RevisionListFiltersBarProps {
  filters: RevisionListFilters
  onChange: (filters: RevisionListFilters) => void
}

const FISCAL_YEARS = ["2024", "2025", "2026"] as const

export function RevisionListFiltersBar({
  filters,
  onChange,
}: RevisionListFiltersBarProps) {
  const activeFilterCount = [
    filters.unit !== "All Units",
    filters.status !== "all",
    filters.revisionType !== "all",
    filters.fiscalYear !== "all",
  ].filter(Boolean).length

  function resetFilters() {
    onChange({
      search: filters.search,
      unit: "All Units",
      status: "all",
      revisionType: "all",
      fiscalYear: "all",
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search revision ID or reason..."
            className="h-9 pl-9 text-sm"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
          />
          {filters.search && (
            <button
              type="button"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted"
              onClick={() => onChange({ ...filters, search: "" })}
            >
              <X className="h-3 w-3 text-muted-foreground" />
              <span className="sr-only">Clear search</span>
            </button>
          )}
        </div>

        {/* Filter popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 bg-transparent">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <Badge className="h-5 min-w-5 rounded-full px-1.5 text-[10px]">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Filters</h4>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground"
                    onClick={resetFilters}
                  >
                    Reset all
                  </Button>
                )}
              </div>

              {/* Fiscal Year */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Fiscal Year</Label>
                <Select
                  value={filters.fiscalYear}
                  onValueChange={(v) => onChange({ ...filters, fiscalYear: v })}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {FISCAL_YEARS.map((fy) => (
                      <SelectItem key={fy} value={fy}>{fy}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Revision Type */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Revision Type</Label>
                <Select
                  value={filters.revisionType}
                  onValueChange={(v) => onChange({ ...filters, revisionType: v as RevisionType | "all" })}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {(Object.entries(REVISION_TYPE_LABELS) as [RevisionType, string][]).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Unit */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Unit Kerja</Label>
                <Select
                  value={filters.unit}
                  onValueChange={(v) => onChange({ ...filters, unit: v })}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIT_OPTIONS.map((u) => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(v) => onChange({ ...filters, status: v as RevisionStatus | "all" })}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {(Object.entries(REVISION_STATUS_LABELS) as [RevisionStatus, string][]).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active filter pills */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {filters.fiscalYear !== "all" && (
            <Badge variant="secondary" className="gap-1 pr-1 text-xs font-normal">
              FY: {filters.fiscalYear}
              <button type="button" className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20" onClick={() => onChange({ ...filters, fiscalYear: "all" })}>
                <X className="h-3 w-3" /><span className="sr-only">Remove filter</span>
              </button>
            </Badge>
          )}
          {filters.revisionType !== "all" && (
            <Badge variant="secondary" className="gap-1 pr-1 text-xs font-normal">
              Type: {REVISION_TYPE_LABELS[filters.revisionType]}
              <button type="button" className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20" onClick={() => onChange({ ...filters, revisionType: "all" })}>
                <X className="h-3 w-3" /><span className="sr-only">Remove filter</span>
              </button>
            </Badge>
          )}
          {filters.unit !== "All Units" && (
            <Badge variant="secondary" className="gap-1 pr-1 text-xs font-normal">
              Unit: {filters.unit}
              <button type="button" className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20" onClick={() => onChange({ ...filters, unit: "All Units" })}>
                <X className="h-3 w-3" /><span className="sr-only">Remove filter</span>
              </button>
            </Badge>
          )}
          {filters.status !== "all" && (
            <Badge variant="secondary" className="gap-1 pr-1 text-xs font-normal">
              Status: {REVISION_STATUS_LABELS[filters.status]}
              <button type="button" className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20" onClick={() => onChange({ ...filters, status: "all" })}>
                <X className="h-3 w-3" /><span className="sr-only">Remove filter</span>
              </button>
            </Badge>
          )}
          <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground" onClick={resetFilters}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
