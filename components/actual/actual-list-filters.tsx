"use client"

import { Search, SlidersHorizontal, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover"
import { ACTUAL_STATUS_LABELS, UNIT_OPTIONS, type ActualStatus } from "@/lib/actual-types"

export interface ActualListFilters {
  search: string
  unit: string
  status: ActualStatus | "all"
  fiscalYear: string
  spkNumber: string
}

export const DEFAULT_ACTUAL_FILTERS: ActualListFilters = {
  search: "",
  unit: "All Units",
  status: "all",
  fiscalYear: "all",
  spkNumber: "",
}

interface Props {
  filters: ActualListFilters
  onChange: (f: ActualListFilters) => void
}

export function ActualListFiltersBar({ filters, onChange }: Props) {
  const activeFilterCount = [
    filters.unit !== "All Units",
    filters.status !== "all",
    filters.fiscalYear !== "all",
    filters.spkNumber !== "",
  ].filter(Boolean).length

  function resetFilters() {
    onChange({
      search: filters.search,
      unit: "All Units",
      status: "all",
      fiscalYear: "all",
      spkNumber: "",
    })
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Search + advanced */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            className="h-9 pl-8 text-sm"
            placeholder="Search actual number, vendor, description..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 bg-transparent">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="h-4 min-w-[16px] px-1 text-[10px]">{activeFilterCount}</Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Filters</span>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={resetFilters}>
                  Reset
                </Button>
              </div>

              {/* Fiscal Year */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Fiscal Year</Label>
                <Select value={filters.fiscalYear} onValueChange={(v) => onChange({ ...filters, fiscalYear: v })}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Unit */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Unit Kerja</Label>
                <Select value={filters.unit} onValueChange={(v) => onChange({ ...filters, unit: v })}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Units">All Units</SelectItem>
                    {UNIT_OPTIONS.map((u) => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Status</Label>
                <Select value={filters.status} onValueChange={(v) => onChange({ ...filters, status: v as ActualListFilters["status"] })}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {Object.entries(ACTUAL_STATUS_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* SPK Number */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">SPK Number</Label>
                <Input
                  className="h-8 text-sm"
                  placeholder="e.g. SPK-2026-0001"
                  value={filters.spkNumber}
                  onChange={(e) => onChange({ ...filters, spkNumber: e.target.value })}
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
              <button type="button" className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20" onClick={() => onChange({ ...filters, unit: "All Units" })}>
                <X className="h-3 w-3" /><span className="sr-only">Remove filter</span>
              </button>
            </Badge>
          )}
          {filters.status !== "all" && (
            <Badge variant="secondary" className="gap-1 pr-1 text-xs font-normal">
              Status: {ACTUAL_STATUS_LABELS[filters.status as ActualStatus]}
              <button type="button" className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20" onClick={() => onChange({ ...filters, status: "all" })}>
                <X className="h-3 w-3" /><span className="sr-only">Remove filter</span>
              </button>
            </Badge>
          )}
          {filters.fiscalYear !== "all" && (
            <Badge variant="secondary" className="gap-1 pr-1 text-xs font-normal">
              FY: {filters.fiscalYear}
              <button type="button" className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20" onClick={() => onChange({ ...filters, fiscalYear: "all" })}>
                <X className="h-3 w-3" /><span className="sr-only">Remove filter</span>
              </button>
            </Badge>
          )}
          {filters.spkNumber && (
            <Badge variant="secondary" className="gap-1 pr-1 text-xs font-normal">
              SPK: {filters.spkNumber}
              <button type="button" className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20" onClick={() => onChange({ ...filters, spkNumber: "" })}>
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
