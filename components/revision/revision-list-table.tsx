"use client"

import React, { useState } from "react"
import {
  ArrowUpDown, ArrowUp, ArrowDown,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  FilePen, SendHorizontal, Eye, FileSearch, FileCheck, PlayCircle,
  FolderOpen, TrendingUp, TrendingDown, Minus,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  REVISION_STATUS_LABELS, REVISION_STATUS_STYLES,
  REVISION_TYPE_LABELS, REVISION_TYPE_STYLES,
  formatCurrency, formatDate, getNetImpact,
  type RevisionItem, type RevisionSortField, type SortDirection,
} from "@/lib/revision-types"
import type { Role } from "@/lib/rbac"
import { cn } from "@/lib/utils"

const PAGE_SIZES = [10, 20, 50] as const

interface RevisionListTableProps {
  items: RevisionItem[]
  role: Role
  onView: (item: RevisionItem) => void
  onEdit: (item: RevisionItem) => void
  onSubmit: (item: RevisionItem) => void
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function RevisionListTable({
  items, role, onView, onEdit, onSubmit,
  page, pageSize, onPageChange, onPageSizeChange,
}: RevisionListTableProps) {
  const [sortField, setSortField] = useState<RevisionSortField>("submittedDate")
  const [sortDir, setSortDir] = useState<SortDirection>("desc")

  function handleSort(field: RevisionSortField) {
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
      case "revisionId": return dir * a.revisionId.localeCompare(b.revisionId)
      case "fiscalYear": return dir * (a.fiscalYear - b.fiscalYear)
      case "unitKerja": return dir * a.unitKerja.localeCompare(b.unitKerja)
      case "revisionType": return dir * a.revisionType.localeCompare(b.revisionType)
      case "netImpact": return dir * (getNetImpact(a) - getNetImpact(b))
      case "status": return dir * a.status.localeCompare(b.status)
      case "submittedDate": {
        const da = a.submittedDate ? new Date(a.submittedDate).getTime() : 0
        const db = b.submittedDate ? new Date(b.submittedDate).getTime() : 0
        return dir * (da - db)
      }
      default: return 0
    }
  })

  const totalItems = sorted.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safeCurrentPage = Math.min(page, totalPages)
  const startIndex = (safeCurrentPage - 1) * pageSize
  const paginatedItems = sorted.slice(startIndex, startIndex + pageSize)
  const startItem = totalItems === 0 ? 0 : startIndex + 1
  const endItem = Math.min(startIndex + pageSize, totalItems)

  function SortIcon({ field }: { field: RevisionSortField }) {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-3 w-3 text-muted-foreground/50" />
    return sortDir === "asc" ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
  }

  function NetImpactDisplay({ value }: { value: number }) {
    if (value > 0) return (
      <span className="flex items-center justify-end gap-1 text-success font-medium text-sm tabular-nums">
        <TrendingUp className="h-3.5 w-3.5" />
        +{formatCurrency(value).replace("Rp", "").trim()}
      </span>
    )
    if (value < 0) return (
      <span className="flex items-center justify-end gap-1 text-destructive font-medium text-sm tabular-nums">
        <TrendingDown className="h-3.5 w-3.5" />
        {formatCurrency(value).replace("Rp", "").trim()}
      </span>
    )
    return (
      <span className="flex items-center justify-end gap-1 text-muted-foreground text-sm tabular-nums">
        <Minus className="h-3.5 w-3.5" />
        0
      </span>
    )
  }

  function getActions(item: RevisionItem) {
    const actions: { key: string; label: string; icon: React.ReactNode; onClick: () => void; variant?: string }[] = []

    actions.push({ key: "view", label: "View Detail", icon: <Eye className="h-3.5 w-3.5" />, onClick: () => onView(item) })

    if (role === "operator") {
      if (item.status === "draft" || item.status === "rejected") {
        actions.push({ key: "edit", label: "Edit", icon: <FilePen className="h-3.5 w-3.5" />, onClick: () => onEdit(item) })
        actions.push({ key: "submit", label: "Submit", icon: <SendHorizontal className="h-3.5 w-3.5" />, onClick: () => onSubmit(item), variant: "primary" })
      }
    }

    if (role === "supervisor" && item.status === "submitted") {
      actions.push({ key: "review", label: "Review", icon: <FileSearch className="h-3.5 w-3.5" />, onClick: () => onView(item), variant: "primary" })
    }

    if (role === "admin") {
      if (item.status === "supervisor_approved") {
        actions.push({ key: "approve", label: "Final Approve", icon: <FileCheck className="h-3.5 w-3.5" />, onClick: () => onView(item), variant: "primary" })
      }
      if (item.status === "admin_approved") {
        actions.push({ key: "apply", label: "Apply Revision", icon: <PlayCircle className="h-3.5 w-3.5" />, onClick: () => onView(item), variant: "warning" })
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
        <h3 className="text-sm font-medium">No revisions found</h3>
        <p className="mt-1 text-xs text-muted-foreground">No revision items match the current filters.</p>
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col gap-0 rounded-lg border bg-card">
        <div className="max-h-[calc(100vh-340px)] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-[150px]">
                  <button type="button" className="flex items-center text-xs font-medium" onClick={() => handleSort("revisionId")}>
                    Revision ID<SortIcon field="revisionId" />
                  </button>
                </TableHead>
                <TableHead className="w-[50px]">
                  <button type="button" className="flex items-center text-xs font-medium" onClick={() => handleSort("fiscalYear")}>
                    FY<SortIcon field="fiscalYear" />
                  </button>
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  <button type="button" className="flex items-center text-xs font-medium" onClick={() => handleSort("unitKerja")}>
                    Unit Kerja<SortIcon field="unitKerja" />
                  </button>
                </TableHead>
                <TableHead className="w-[120px] text-center">
                  <button type="button" className="flex items-center text-xs font-medium mx-auto" onClick={() => handleSort("revisionType")}>
                    Type<SortIcon field="revisionType" />
                  </button>
                </TableHead>
                <TableHead className="text-right">
                  <button type="button" className="ml-auto flex items-center text-xs font-medium" onClick={() => handleSort("netImpact")}>
                    Net Impact<SortIcon field="netImpact" />
                  </button>
                </TableHead>
                <TableHead className="text-center w-[140px]">
                  <button type="button" className="flex items-center text-xs font-medium mx-auto" onClick={() => handleSort("status")}>
                    Status<SortIcon field="status" />
                  </button>
                </TableHead>
                <TableHead className="hidden sm:table-cell">
                  <button type="button" className="flex items-center text-xs font-medium" onClick={() => handleSort("submittedDate")}>
                    Submitted<SortIcon field="submittedDate" />
                  </button>
                </TableHead>
                <TableHead className="text-right w-[140px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.map((item, index) => {
                const actions = getActions(item)
                const netImpact = getNetImpact(item)
                return (
                  <TableRow
                    key={item.id}
                    className={cn("cursor-pointer transition-colors", index % 2 === 1 && "bg-muted/20")}
                    onClick={() => onView(item)}
                  >
                    <TableCell className="py-3">
                      <span className="font-medium text-sm font-mono">{item.revisionId}</span>
                      <span className="block text-xs text-muted-foreground line-clamp-1 lg:hidden">{item.unitKerja}</span>
                    </TableCell>
                    <TableCell className="py-3 text-sm tabular-nums">{item.fiscalYear}</TableCell>
                    <TableCell className="hidden py-3 text-sm text-muted-foreground lg:table-cell">{item.unitKerja}</TableCell>
                    <TableCell className="py-3 text-center">
                      <Badge variant="outline" className={cn("text-[10px] font-medium whitespace-nowrap", REVISION_TYPE_STYLES[item.revisionType])}>
                        {REVISION_TYPE_LABELS[item.revisionType]}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <NetImpactDisplay value={netImpact} />
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <Badge variant="outline" className={cn("text-[10px] font-medium whitespace-nowrap", REVISION_STATUS_STYLES[item.status])}>
                        {REVISION_STATUS_LABELS[item.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden py-3 sm:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {item.submittedDate ? formatDate(item.submittedDate) : "-"}
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        {actions.map((action) => (
                          <Tooltip key={action.key}>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost" size="icon"
                                className={cn(
                                  "h-7 w-7",
                                  action.variant === "primary" && "text-primary hover:text-primary hover:bg-primary/10",
                                  action.variant === "warning" && "text-warning hover:text-warning hover:bg-warning/10",
                                  !action.variant && "text-muted-foreground hover:text-foreground",
                                )}
                                onClick={action.onClick}
                              >
                                {action.icon}
                                <span className="sr-only">{action.label}</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom"><p>{action.label}</p></TooltipContent>
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
            <span>{startItem}-{endItem} of {totalItems}</span>
            <span className="hidden sm:inline">|</span>
            <div className="hidden items-center gap-1.5 sm:flex">
              <span className="text-xs">Rows</span>
              <Select value={String(pageSize)} onValueChange={(v) => { onPageSizeChange(Number(v)); onPageChange(1) }}>
                <SelectTrigger className="h-7 w-16 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((size) => (<SelectItem key={size} value={String(size)}>{size}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-7 w-7 bg-transparent" disabled={safeCurrentPage <= 1} onClick={() => onPageChange(1)} aria-label="First page"><ChevronsLeft className="h-3.5 w-3.5" /></Button>
            <Button variant="outline" size="icon" className="h-7 w-7 bg-transparent" disabled={safeCurrentPage <= 1} onClick={() => onPageChange(safeCurrentPage - 1)} aria-label="Previous page"><ChevronLeft className="h-3.5 w-3.5" /></Button>
            <span className="px-2 text-sm tabular-nums">{safeCurrentPage} / {totalPages}</span>
            <Button variant="outline" size="icon" className="h-7 w-7 bg-transparent" disabled={safeCurrentPage >= totalPages} onClick={() => onPageChange(safeCurrentPage + 1)} aria-label="Next page"><ChevronRight className="h-3.5 w-3.5" /></Button>
            <Button variant="outline" size="icon" className="h-7 w-7 bg-transparent" disabled={safeCurrentPage >= totalPages} onClick={() => onPageChange(totalPages)} aria-label="Last page"><ChevronsRight className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
