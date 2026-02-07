"use client"

import { Search, SlidersHorizontal, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  TRANSACTION_TYPE_LABELS,
  UNIT_OPTIONS,
  type TransactionType,
  type ApprovalStatus,
} from "@/lib/approval-types"

export interface ApprovalFilters {
  search: string
  type: TransactionType | "all"
  unit: string
  status: ApprovalStatus | "all"
  amountMin: string
  amountMax: string
  dateFrom: string
  dateTo: string
}

interface ApprovalFiltersBarProps {
  filters: ApprovalFilters
  onChange: (filters: ApprovalFilters) => void
  resultCount: number
  totalCount: number
}

export function ApprovalFiltersBar({
  filters,
  onChange,
  resultCount,
  totalCount,
}: ApprovalFiltersBarProps) {
  const activeFilterCount = [
    filters.type !== "all",
    filters.unit !== "All Units",
    filters.status !== "all",
    filters.amountMin !== "",
    filters.amountMax !== "",
    filters.dateFrom !== "",
    filters.dateTo !== "",
  ].filter(Boolean).length

  function resetFilters() {
    onChange({
      search: filters.search,
      type: "all",
      unit: "All Units",
      status: "all",
      amountMin: "",
      amountMax: "",
      dateFrom: "",
      dateTo: "",
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search doc number, description, requester..."
              className="h-9 w-72 pl-8 text-sm"
              value={filters.search}
              onChange={(e) =>
                onChange({ ...filters, search: e.target.value })
              }
            />
            {filters.search && (
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => onChange({ ...filters, search: "" })}
              >
                <X className="h-3.5 w-3.5" />
                <span className="sr-only">Clear search</span>
              </button>
            )}
          </div>

          {/* Transaction type quick filter */}
          <Select
            value={filters.type}
            onValueChange={(v) =>
              onChange({ ...filters, type: v as TransactionType | "all" })
            }
          >
            <SelectTrigger className="h-9 w-44 text-sm">
              <SelectValue placeholder="Transaction type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {(
                Object.entries(TRANSACTION_TYPE_LABELS) as [
                  TransactionType,
                  string,
                ][]
              ).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Advanced filters popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 bg-transparent">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <Badge className="ml-0.5 h-5 w-5 rounded-full p-0 text-[10px]">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Advanced Filters</h4>
                  {activeFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={resetFilters}
                    >
                      Reset all
                    </Button>
                  )}
                </div>
                <Separator />
                {/* Unit Kerja */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Unit Kerja</Label>
                  <Select
                    value={filters.unit}
                    onValueChange={(v) =>
                      onChange({ ...filters, unit: v })
                    }
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIT_OPTIONS.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Status */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(v) =>
                      onChange({
                        ...filters,
                        status: v as ApprovalStatus | "all",
                      })
                    }
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Amount Range */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Amount Range (IDR)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      className="h-8 text-sm"
                      value={filters.amountMin}
                      onChange={(e) =>
                        onChange({ ...filters, amountMin: e.target.value })
                      }
                    />
                    <span className="text-xs text-muted-foreground">-</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      className="h-8 text-sm"
                      value={filters.amountMax}
                      onChange={(e) =>
                        onChange({ ...filters, amountMax: e.target.value })
                      }
                    />
                  </div>
                </div>
                {/* Date Submitted */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Date Submitted</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      className="h-8 text-sm"
                      value={filters.dateFrom}
                      onChange={(e) =>
                        onChange({ ...filters, dateFrom: e.target.value })
                      }
                    />
                    <span className="text-xs text-muted-foreground">-</span>
                    <Input
                      type="date"
                      className="h-8 text-sm"
                      value={filters.dateTo}
                      onChange={(e) =>
                        onChange({ ...filters, dateTo: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Result count */}
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">{resultCount}</span> of{" "}
          {totalCount} items
        </p>
      </div>

      {/* Active filter pills */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground mr-1">
            Active filters:
          </span>
          {filters.type !== "all" && (
            <Badge
              variant="secondary"
              className="gap-1 pr-1 text-xs font-normal"
            >
              Type: {TRANSACTION_TYPE_LABELS[filters.type]}
              <button
                type="button"
                className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
                onClick={() => onChange({ ...filters, type: "all" })}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove filter</span>
              </button>
            </Badge>
          )}
          {filters.unit !== "All Units" && (
            <Badge
              variant="secondary"
              className="gap-1 pr-1 text-xs font-normal"
            >
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
            <Badge
              variant="secondary"
              className="gap-1 pr-1 text-xs font-normal"
            >
              Status: {filters.status}
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
          {(filters.amountMin || filters.amountMax) && (
            <Badge
              variant="secondary"
              className="gap-1 pr-1 text-xs font-normal"
            >
              Amount: {filters.amountMin || "0"} - {filters.amountMax || "..."}
              <button
                type="button"
                className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
                onClick={() =>
                  onChange({ ...filters, amountMin: "", amountMax: "" })
                }
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove filter</span>
              </button>
            </Badge>
          )}
          {(filters.dateFrom || filters.dateTo) && (
            <Badge
              variant="secondary"
              className="gap-1 pr-1 text-xs font-normal"
            >
              Date: {filters.dateFrom || "..."} - {filters.dateTo || "..."}
              <button
                type="button"
                className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
                onClick={() =>
                  onChange({ ...filters, dateFrom: "", dateTo: "" })
                }
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove filter</span>
              </button>
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs text-muted-foreground"
            onClick={resetFilters}
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
