"use client"

import { Search, SlidersHorizontal, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  SPK_STATUS_LABELS,
  UNIT_OPTIONS,
  type SpkStatus,
} from "@/lib/spk-types"

export interface SpkListFilters {
  search: string
  unit: string
  status: SpkStatus | "all"
  fiscalYear: string
  vendor: string
}

export const DEFAULT_SPK_FILTERS: SpkListFilters = {
  search: "",
  unit: "All Units",
  status: "all",
  fiscalYear: "all",
  vendor: "",
}

interface SpkListFiltersBarProps {
  filters: SpkListFilters
  onChange: (f: SpkListFilters) => void
}

export function SpkListFiltersBar({ filters, onChange }: SpkListFiltersBarProps) {
  const activeFilterCount = [
    filters.unit !== "All Units",
    filters.status !== "all",
    filters.fiscalYear !== "all",
    filters.vendor !== "",
  ].filter(Boolean).length

  function resetFilters() {
    onChange({
      search: filters.search,
      unit: "All Units",
      status: "all",
      fiscalYear: "all",
      vendor: "",
    })
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Search + filter toggle */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search SPK number, vendor, description..."
            className="h-9 pl-8 text-sm"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
          />
          {filters.search && (
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 hover:bg-muted"
              onClick={() => onChange({ ...filters, search: "" })}
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="sr-only">Clear search</span>
            </button>
          )}
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 bg-transparent">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-1 h-4 w-4 rounded-full p-0 text-[10px] font-semibold flex items-center justify-center">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Advanced Filters</span>
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary" onClick={resetFilters}>
                    Reset all
                  </Button>
                )}
              </div>

              {/* Status */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(v) => onChange({ ...filters, status: v as SpkStatus | "all" })}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {(Object.entries(SPK_STATUS_LABELS) as [SpkStatus, string][]).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ),
                    )}
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
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fiscal Year */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Fiscal Year</Label>
                <Select
                  value={filters.fiscalYear}
                  onValueChange={(v) => onChange({ ...filters, fiscalYear: v })}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Vendor search */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Vendor</Label>
                <Input
                  className="h-8 text-sm"
                  placeholder="Filter by vendor name..."
                  value={filters.vendor}
                  onChange={(e) => onChange({ ...filters, vendor: e.target.value })}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active filter pills */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Active filters:</span>
          {filters.unit !== "All Units" && (
            <Badge variant="secondary" className="gap-1 pr-1 text-xs font-normal">
              Unit: {filters.unit}
              <button
                type="button"
                className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
                onClick={() => onChange({ ...filters, unit: "All Units" })}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove filter</span>
              </button>
            </Badge>
          )}
          {filters.status !== "all" && (
            <Badge variant="secondary" className="gap-1 pr-1 text-xs font-normal">
              Status: {SPK_STATUS_LABELS[filters.status]}
              <button
                type="button"
                className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
                onClick={() => onChange({ ...filters, status: "all" })}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove filter</span>
              </button>
            </Badge>
          )}
          {filters.fiscalYear !== "all" && (
            <Badge variant="secondary" className="gap-1 pr-1 text-xs font-normal">
              FY: {filters.fiscalYear}
              <button
                type="button"
                className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
                onClick={() => onChange({ ...filters, fiscalYear: "all" })}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove filter</span>
              </button>
            </Badge>
          )}
          {filters.vendor !== "" && (
            <Badge variant="secondary" className="gap-1 pr-1 text-xs font-normal">
              Vendor: {filters.vendor}
              <button
                type="button"
                className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
                onClick={() => onChange({ ...filters, vendor: "" })}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove filter</span>
              </button>
            </Badge>
          )}
          <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary" onClick={resetFilters}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
