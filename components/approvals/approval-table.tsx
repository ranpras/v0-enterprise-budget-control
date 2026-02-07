"use client"

import { useState } from "react"
import {
  Check,
  X,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_TYPE_COLORS,
  STATUS_STYLES,
  STATUS_LABELS,
  formatCurrency,
  type ApprovalItem,
  type SortField,
  type SortDirection,
} from "@/lib/approval-types"
import { cn } from "@/lib/utils"

const PAGE_SIZES = [10, 20, 50] as const

interface ApprovalTableProps {
  items: ApprovalItem[]
  processedIds: Set<string>
  onViewDetail: (item: ApprovalItem) => void
  onApprove: (item: ApprovalItem) => void
  onReject: (item: ApprovalItem) => void
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

function formatDate(dateString: string): string {
  const d = new Date(dateString)
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function formatTime(dateString: string): string {
  const d = new Date(dateString)
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function ApprovalTable({
  items,
  processedIds,
  onViewDetail,
  onApprove,
  onReject,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: ApprovalTableProps) {
  const [sortField, setSortField] = useState<SortField>("submittedDate")
  const [sortDir, setSortDir] = useState<SortDirection>("desc")

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  const sorted = [...items].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1
    switch (sortField) {
      case "docNumber":
        return dir * a.docNumber.localeCompare(b.docNumber)
      case "type":
        return dir * a.type.localeCompare(b.type)
      case "unit":
        return dir * a.unit.localeCompare(b.unit)
      case "amount":
        return dir * (a.amount - b.amount)
      case "submittedBy":
        return dir * a.submittedBy.localeCompare(b.submittedBy)
      case "submittedDate":
        return (
          dir *
          (new Date(a.submittedDate).getTime() -
            new Date(b.submittedDate).getTime())
        )
      default:
        return 0
    }
  })

  // Pagination
  const totalItems = sorted.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safeCurrentPage = Math.min(page, totalPages)
  const startIndex = (safeCurrentPage - 1) * pageSize
  const paginatedItems = sorted.slice(startIndex, startIndex + pageSize)
  const startItem = totalItems === 0 ? 0 : startIndex + 1
  const endItem = Math.min(startIndex + pageSize, totalItems)

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field)
      return <ArrowUpDown className="ml-1 h-3 w-3 text-muted-foreground/50" />
    return sortDir === "asc" ? (
      <ArrowUp className="ml-1 h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3" />
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <div className="rounded-full bg-muted p-3 mb-3">
          <Check className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-medium">No pending approvals</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          All items have been processed or no items match your filters.
        </p>
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col gap-0 rounded-lg border bg-card">
        {/* Scrollable table area with sticky header */}
        <div className="max-h-[calc(100vh-340px)] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-[100px]">
                  <button
                    type="button"
                    className="flex items-center text-xs font-medium"
                    onClick={() => handleSort("type")}
                  >
                    Type
                    <SortIcon field="type" />
                  </button>
                </TableHead>
                <TableHead className="w-[150px]">
                  <button
                    type="button"
                    className="flex items-center text-xs font-medium"
                    onClick={() => handleSort("docNumber")}
                  >
                    Document
                    <SortIcon field="docNumber" />
                  </button>
                </TableHead>
                <TableHead className="hidden xl:table-cell min-w-[200px]">
                  <span className="text-xs font-medium">Description</span>
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  <button
                    type="button"
                    className="flex items-center text-xs font-medium"
                    onClick={() => handleSort("unit")}
                  >
                    Unit Kerja
                    <SortIcon field="unit" />
                  </button>
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  <button
                    type="button"
                    className="flex items-center text-xs font-medium"
                    onClick={() => handleSort("submittedBy")}
                  >
                    Submitted By
                    <SortIcon field="submittedBy" />
                  </button>
                </TableHead>
                <TableHead className="text-right">
                  <button
                    type="button"
                    className="ml-auto flex items-center text-xs font-medium"
                    onClick={() => handleSort("amount")}
                  >
                    Amount
                    <SortIcon field="amount" />
                  </button>
                </TableHead>
                <TableHead className="hidden sm:table-cell">
                  <button
                    type="button"
                    className="flex items-center text-xs font-medium"
                    onClick={() => handleSort("submittedDate")}
                  >
                    Date
                    <SortIcon field="submittedDate" />
                  </button>
                </TableHead>
                <TableHead className="text-center w-[80px]">Status</TableHead>
                <TableHead className="text-right w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.map((item, index) => {
                const isProcessed = processedIds.has(item.id)
                return (
                  <TableRow
                    key={item.id}
                    className={cn(
                      "cursor-pointer transition-colors",
                      index % 2 === 1 && "bg-muted/20",
                      isProcessed && "opacity-50",
                    )}
                    onClick={() => onViewDetail(item)}
                  >
                    <TableCell className="py-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-medium whitespace-nowrap",
                          TRANSACTION_TYPE_COLORS[item.type],
                        )}
                      >
                        {TRANSACTION_TYPE_LABELS[item.type]}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="font-medium text-sm font-mono">
                        {item.docNumber}
                      </span>
                      {/* Show description below doc number on smaller screens */}
                      <span className="block text-xs text-muted-foreground line-clamp-1 xl:hidden">
                        {item.description}
                      </span>
                    </TableCell>
                    <TableCell className="hidden py-3 xl:table-cell">
                      <span className="text-sm text-muted-foreground line-clamp-1">
                        {item.description}
                      </span>
                    </TableCell>
                    <TableCell className="hidden py-3 text-sm text-muted-foreground lg:table-cell">
                      {item.unit}
                    </TableCell>
                    <TableCell className="hidden py-3 md:table-cell">
                      <span className="text-sm">{item.submittedBy}</span>
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <span className="text-sm font-medium tabular-nums">
                        {formatCurrency(item.amount)}
                      </span>
                    </TableCell>
                    <TableCell className="hidden py-3 sm:table-cell">
                      <div className="flex flex-col">
                        <span className="text-sm">
                          {formatDate(item.submittedDate)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(item.submittedDate)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-medium capitalize",
                          STATUS_STYLES[item.status],
                        )}
                      >
                        {STATUS_LABELS[item.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3">
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              onClick={() => onViewDetail(item)}
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span className="sr-only">View detail</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>View Detail</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-success hover:text-success hover:bg-success/10"
                              disabled={isProcessed}
                              onClick={() => onApprove(item)}
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span className="sr-only">Approve</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>Approve</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                              disabled={isProcessed}
                              onClick={() => onReject(item)}
                            >
                              <X className="h-3.5 w-3.5" />
                              <span className="sr-only">Reject</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>Reject</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination footer */}
        <div className="flex items-center justify-between border-t px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {startItem}-{endItem} of {totalItems}
            </span>
            <span className="hidden sm:inline">|</span>
            <div className="hidden items-center gap-1.5 sm:flex">
              <span className="text-xs">Rows</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  onPageSizeChange(Number(v))
                  onPageChange(1)
                }}
              >
                <SelectTrigger className="h-7 w-16 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 bg-transparent"
              disabled={safeCurrentPage <= 1}
              onClick={() => onPageChange(1)}
              aria-label="First page"
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 bg-transparent"
              disabled={safeCurrentPage <= 1}
              onClick={() => onPageChange(safeCurrentPage - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="px-2 text-sm tabular-nums">
              {safeCurrentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 bg-transparent"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => onPageChange(safeCurrentPage + 1)}
              aria-label="Next page"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 bg-transparent"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => onPageChange(totalPages)}
              aria-label="Last page"
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
