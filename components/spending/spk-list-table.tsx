"use client"

import { useMemo, useState, useCallback } from "react"
import {
  ArrowUpDown, ArrowUp, ArrowDown,
  Eye, Pencil, SendHorizontal,
  ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  SPK_STATUS_LABELS, SPK_STATUS_STYLES,
  formatCurrency, formatDate, getSpkTotal, getBudgetUsagePercent,
  type SpkItem, type SpkSortField, type SortDirection,
} from "@/lib/spk-types"
import type { Role } from "@/lib/rbac"
import { cn } from "@/lib/utils"

interface SpkListTableProps {
  items: SpkItem[]
  role: Role
  onView: (item: SpkItem) => void
  onEdit: (item: SpkItem) => void
  onSubmit: (item: SpkItem) => void
  page: number
  pageSize: number
  onPageChange: (p: number) => void
  onPageSizeChange: (s: number) => void
}

export function SpkListTable({
  items, role, onView, onEdit, onSubmit,
  page, pageSize, onPageChange, onPageSizeChange,
}: SpkListTableProps) {
  const [sortField, setSortField] = useState<SpkSortField>("submittedDate")
  const [sortDir, setSortDir] = useState<SortDirection>("desc")

  const toggleSort = useCallback(
    (field: SpkSortField) => {
      if (sortField === field) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"))
      } else {
        setSortField(field)
        setSortDir("asc")
      }
    },
    [sortField],
  )

  const sorted = useMemo(() => {
    const arr = [...items]
    arr.sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case "spkNumber":
          cmp = a.spkNumber.localeCompare(b.spkNumber)
          break
        case "fiscalYear":
          cmp = a.fiscalYear - b.fiscalYear
          break
        case "unitKerja":
          cmp = a.unitKerja.localeCompare(b.unitKerja)
          break
        case "vendor":
          cmp = a.vendor.localeCompare(b.vendor)
          break
        case "description":
          cmp = a.description.localeCompare(b.description)
          break
        case "totalAmount":
          cmp = getSpkTotal(a) - getSpkTotal(b)
          break
        case "status":
          cmp = a.status.localeCompare(b.status)
          break
        case "submittedDate":
          cmp = (a.submittedDate || a.createdDate).localeCompare(b.submittedDate || b.createdDate)
          break
      }
      return sortDir === "asc" ? cmp : -cmp
    })
    return arr
  }, [items, sortField, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize)

  function SortButton({ field, label, className }: { field: SpkSortField; label: string; className?: string }) {
    const isActive = sortField === field
    return (
      <button
        type="button"
        className={cn("flex items-center gap-1 text-xs font-medium hover:text-foreground transition-colors", className)}
        onClick={() => toggleSort(field)}
      >
        {label}
        {isActive ? (
          sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-40" />
        )}
      </button>
    )
  }

  // Check if any SPK line uses >= 90% of available budget
  function hasHighUsage(item: SpkItem): boolean {
    return item.lineItems.some((l) => getBudgetUsagePercent(l) >= 90)
  }

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
        <p className="text-sm text-muted-foreground">No spending requests found.</p>
        <p className="mt-1 text-xs text-muted-foreground">Try adjusting filters or create a new SPK.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0 rounded-lg border overflow-hidden">
      {/* Table */}
      <div className="overflow-auto max-h-[calc(100vh-320px)]">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
            <TableRow className="hover:bg-muted/80">
              <TableHead className="w-[140px]">
                <SortButton field="spkNumber" label="SPK Number" />
              </TableHead>
              <TableHead className="w-[60px]">
                <SortButton field="fiscalYear" label="FY" />
              </TableHead>
              <TableHead className="w-[120px]">
                <SortButton field="unitKerja" label="Unit Kerja" />
              </TableHead>
              <TableHead className="w-[160px]">
                <SortButton field="vendor" label="Vendor" />
              </TableHead>
              <TableHead className="hidden xl:table-cell w-[200px]">
                <SortButton field="description" label="Description" />
              </TableHead>
              <TableHead className="w-[140px] text-right">
                <SortButton field="totalAmount" label="Total Amount" className="justify-end" />
              </TableHead>
              <TableHead className="w-[120px]">
                <SortButton field="status" label="Status" />
              </TableHead>
              <TableHead className="w-[100px]">
                <SortButton field="submittedDate" label="Submitted" />
              </TableHead>
              <TableHead className="w-[110px] text-center">
                <span className="text-xs font-medium">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((item, idx) => {
              const total = getSpkTotal(item)
              const highUsage = hasHighUsage(item)
              return (
                <TableRow
                  key={item.id}
                  className={cn(
                    "cursor-pointer transition-colors",
                    idx % 2 === 1 && "bg-muted/10",
                    item.status === "cancelled" && "opacity-60",
                  )}
                  onClick={() => onView(item)}
                >
                  <TableCell className="text-xs font-mono font-medium">{item.spkNumber}</TableCell>
                  <TableCell className="text-xs tabular-nums">{item.fiscalYear}</TableCell>
                  <TableCell className="text-xs">{item.unitKerja}</TableCell>
                  <TableCell className="text-xs max-w-[160px] truncate">{item.vendor}</TableCell>
                  <TableCell className="hidden xl:table-cell text-xs max-w-[200px] truncate text-muted-foreground">
                    {item.description}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {highUsage && item.status !== "cancelled" && (
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" />
                            </TooltipTrigger>
                            <TooltipContent side="left">
                              <p className="text-xs">One or more lines use 90%+ of available budget</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      <span className="text-xs font-semibold tabular-nums">{formatCurrency(total)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] font-medium whitespace-nowrap", SPK_STATUS_STYLES[item.status])}
                    >
                      {SPK_STATUS_LABELS[item.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground tabular-nums">
                    {item.submittedDate ? formatDate(item.submittedDate) : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onView(item)}>
                              <Eye className="h-3.5 w-3.5" />
                              <span className="sr-only">View</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p className="text-xs">View Detail</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {role === "operator" && item.status === "draft" && (
                        <>
                          <TooltipProvider delayDuration={200}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(item)}>
                                  <Pencil className="h-3.5 w-3.5" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p className="text-xs">Edit Draft</p></TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider delayDuration={200}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={() => onSubmit(item)}>
                                  <SendHorizontal className="h-3.5 w-3.5" />
                                  <span className="sr-only">Submit</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p className="text-xs">Submit SPK</p></TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t px-4 py-2.5 bg-muted/30">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            {sorted.length === 0 ? "0" : `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, sorted.length)}`} of{" "}
            {sorted.length} records
          </span>
          <Select value={String(pageSize)} onValueChange={(v) => { onPageSizeChange(Number(v)); onPageChange(1) }}>
            <SelectTrigger className="h-7 w-[70px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-7 w-7 bg-transparent" disabled={page <= 1} onClick={() => onPageChange(1)}>
            <ChevronsLeft className="h-3.5 w-3.5" />
            <span className="sr-only">First page</span>
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7 bg-transparent" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="sr-only">Previous page</span>
          </Button>
          <span className="px-2 text-xs tabular-nums">
            {page} / {totalPages}
          </span>
          <Button variant="outline" size="icon" className="h-7 w-7 bg-transparent" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="sr-only">Next page</span>
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7 bg-transparent" disabled={page >= totalPages} onClick={() => onPageChange(totalPages)}>
            <ChevronsRight className="h-3.5 w-3.5" />
            <span className="sr-only">Last page</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
