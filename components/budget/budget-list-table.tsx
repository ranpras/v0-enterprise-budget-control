"use client"

import React from "react"

import { useState } from "react"
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FilePen,
  SendHorizontal,
  Eye,
  FileSearch,
  FileCheck,
  Lock,
  FolderOpen,
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
  BUDGET_STATUS_LABELS,
  BUDGET_STATUS_STYLES,
  formatCurrency,
  formatDate,
  getBudgetTotal,
  type BudgetItem,
  type BudgetSortField,
  type SortDirection,
} from "@/lib/budget-types"
import type { Role } from "@/lib/rbac"
import { cn } from "@/lib/utils"

const PAGE_SIZES = [10, 20, 50] as const

interface BudgetListTableProps {
  items: BudgetItem[]
  role: Role
  onView: (item: BudgetItem) => void
  onEdit: (item: BudgetItem) => void
  onSubmit: (item: BudgetItem) => void
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function BudgetListTable({
  items,
  role,
  onView,
  onEdit,
  onSubmit,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: BudgetListTableProps) {
  const [sortField, setSortField] = useState<BudgetSortField>("updatedDate")
  const [sortDir, setSortDir] = useState<SortDirection>("desc")

  function handleSort(field: BudgetSortField) {
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
      case "budgetId":
        return dir * a.budgetId.localeCompare(b.budgetId)
      case "fiscalYear":
        return dir * (a.fiscalYear - b.fiscalYear)
      case "unitKerja":
        return dir * a.unitKerja.localeCompare(b.unitKerja)
      case "description":
        return dir * a.description.localeCompare(b.description)
      case "totalBudget":
        return dir * (getBudgetTotal(a) - getBudgetTotal(b))
      case "status":
        return dir * a.status.localeCompare(b.status)
      case "updatedDate":
        return (
          dir *
          (new Date(a.updatedDate).getTime() -
            new Date(b.updatedDate).getTime())
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

  function SortIcon({ field }: { field: BudgetSortField }) {
    if (sortField !== field)
      return <ArrowUpDown className="ml-1 h-3 w-3 text-muted-foreground/50" />
    return sortDir === "asc" ? (
      <ArrowUp className="ml-1 h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3" />
    )
  }

  // Determine available actions per role & status
  function getActions(item: BudgetItem) {
    const actions: {
      key: string
      label: string
      icon: React.ReactNode
      onClick: () => void
      variant?: string
    }[] = []

    // View always available
    actions.push({
      key: "view",
      label: "View Detail",
      icon: <Eye className="h-3.5 w-3.5" />,
      onClick: () => onView(item),
    })

    if (role === "operator") {
      if (item.status === "draft" || item.status === "rejected") {
        actions.push({
          key: "edit",
          label: "Edit",
          icon: <FilePen className="h-3.5 w-3.5" />,
          onClick: () => onEdit(item),
        })
        actions.push({
          key: "submit",
          label: "Submit",
          icon: <SendHorizontal className="h-3.5 w-3.5" />,
          onClick: () => onSubmit(item),
          variant: "primary",
        })
      }
    }

    if (role === "supervisor" && item.status === "submitted") {
      actions.push({
        key: "review",
        label: "Review",
        icon: <FileSearch className="h-3.5 w-3.5" />,
        onClick: () => onView(item),
        variant: "primary",
      })
    }

    if (role === "admin") {
      if (item.status === "supervisor_approved") {
        actions.push({
          key: "approve",
          label: "Final Approve",
          icon: <FileCheck className="h-3.5 w-3.5" />,
          onClick: () => onView(item),
          variant: "primary",
        })
      }
      if (item.status === "admin_approved") {
        actions.push({
          key: "lock",
          label: "Lock Budget",
          icon: <Lock className="h-3.5 w-3.5" />,
          onClick: () => onView(item),
          variant: "warning",
        })
      }
    }

    return actions
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <div className="rounded-full bg-muted p-3 mb-3">
          <FolderOpen className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-medium">No budgets found</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          No budget items match the current filters.
        </p>
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col gap-0 rounded-lg border bg-card">
        {/* Scrollable table */}
        <div className="max-h-[calc(100vh-340px)] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-[170px]">
                  <button
                    type="button"
                    className="flex items-center text-xs font-medium"
                    onClick={() => handleSort("budgetId")}
                  >
                    Budget ID
                    <SortIcon field="budgetId" />
                  </button>
                </TableHead>
                <TableHead className="w-[60px]">
                  <button
                    type="button"
                    className="flex items-center text-xs font-medium"
                    onClick={() => handleSort("fiscalYear")}
                  >
                    FY
                    <SortIcon field="fiscalYear" />
                  </button>
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  <button
                    type="button"
                    className="flex items-center text-xs font-medium"
                    onClick={() => handleSort("unitKerja")}
                  >
                    Unit Kerja
                    <SortIcon field="unitKerja" />
                  </button>
                </TableHead>
                <TableHead className="hidden xl:table-cell min-w-[200px]">
                  <button
                    type="button"
                    className="flex items-center text-xs font-medium"
                    onClick={() => handleSort("description")}
                  >
                    Description
                    <SortIcon field="description" />
                  </button>
                </TableHead>
                <TableHead className="text-right">
                  <button
                    type="button"
                    className="ml-auto flex items-center text-xs font-medium"
                    onClick={() => handleSort("totalBudget")}
                  >
                    Total Budget
                    <SortIcon field="totalBudget" />
                  </button>
                </TableHead>
                <TableHead className="text-center w-[140px]">
                  <button
                    type="button"
                    className="flex items-center text-xs font-medium mx-auto"
                    onClick={() => handleSort("status")}
                  >
                    Status
                    <SortIcon field="status" />
                  </button>
                </TableHead>
                <TableHead className="hidden sm:table-cell">
                  <button
                    type="button"
                    className="flex items-center text-xs font-medium"
                    onClick={() => handleSort("updatedDate")}
                  >
                    Last Updated
                    <SortIcon field="updatedDate" />
                  </button>
                </TableHead>
                <TableHead className="text-right w-[140px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.map((item, index) => {
                const actions = getActions(item)
                return (
                  <TableRow
                    key={item.id}
                    className={cn(
                      "cursor-pointer transition-colors",
                      index % 2 === 1 && "bg-muted/20",
                    )}
                    onClick={() => onView(item)}
                  >
                    <TableCell className="py-3">
                      <span className="font-medium text-sm font-mono">
                        {item.budgetId}
                      </span>
                      <span className="block text-xs text-muted-foreground line-clamp-1 xl:hidden">
                        {item.description}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 text-sm tabular-nums">
                      {item.fiscalYear}
                    </TableCell>
                    <TableCell className="hidden py-3 text-sm text-muted-foreground lg:table-cell">
                      {item.unitKerja}
                    </TableCell>
                    <TableCell className="hidden py-3 xl:table-cell">
                      <span className="text-sm text-muted-foreground line-clamp-1">
                        {item.description}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <span className="text-sm font-medium tabular-nums">
                        {formatCurrency(getBudgetTotal(item))}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-medium whitespace-nowrap",
                          BUDGET_STATUS_STYLES[item.status],
                        )}
                      >
                        {BUDGET_STATUS_LABELS[item.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden py-3 sm:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(item.updatedDate)}
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {actions.map((action) => (
                          <Tooltip key={action.key}>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                  "h-7 w-7",
                                  action.variant === "primary" &&
                                    "text-primary hover:text-primary hover:bg-primary/10",
                                  action.variant === "warning" &&
                                    "text-warning hover:text-warning hover:bg-warning/10",
                                  !action.variant &&
                                    "text-muted-foreground hover:text-foreground",
                                )}
                                onClick={action.onClick}
                              >
                                {action.icon}
                                <span className="sr-only">{action.label}</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <p>{action.label}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
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
