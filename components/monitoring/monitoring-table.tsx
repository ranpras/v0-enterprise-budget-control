"use client"

import { useState, useMemo } from "react"
import { ArrowUpDown, ArrowUp, ArrowDown, AlertTriangle, AlertCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import type { BudgetDetailRow } from "@/lib/monitoring-data"
import { formatCurrency } from "@/lib/monitoring-data"

type SortField = "unit" | "budgetId" | "budgetAmount" | "commitmentAmount" | "actualAmount" | "remainingBudget" | "usagePercent" | "status"
type SortDir = "asc" | "desc"

interface MonitoringTableProps {
  rows: BudgetDetailRow[]
  onRowClick?: (row: BudgetDetailRow) => void
}

export function MonitoringTable({ rows, onRowClick }: MonitoringTableProps) {
  const [sortField, setSortField] = useState<SortField>("usagePercent")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("desc")
    }
    setPage(1)
  }

  const sorted = useMemo(() => {
    const copy = [...rows]
    copy.sort((a, b) => {
      let cmp = 0
      const av = a[sortField]
      const bv = b[sortField]
      if (typeof av === "number" && typeof bv === "number") cmp = av - bv
      else cmp = String(av).localeCompare(String(bv))
      return sortDir === "asc" ? cmp : -cmp
    })
    return copy
  }, [rows, sortField, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize)

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ArrowUpDown className="ml-1 inline h-3 w-3 text-muted-foreground/50" />
    return sortDir === "asc" ? (
      <ArrowUp className="ml-1 inline h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 inline h-3 w-3" />
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Budget Detail Table</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted/80 backdrop-blur">
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>
                  <button type="button" className="flex items-center text-xs font-medium" onClick={() => toggleSort("unit")}>
                    Unit <SortIcon field="unit" />
                  </button>
                </TableHead>
                <TableHead>
                  <button type="button" className="flex items-center text-xs font-medium" onClick={() => toggleSort("budgetId")}>
                    Budget ID <SortIcon field="budgetId" />
                  </button>
                </TableHead>
                <TableHead className="hidden xl:table-cell text-xs font-medium">Type</TableHead>
                <TableHead className="hidden lg:table-cell text-xs font-medium">Description</TableHead>
                <TableHead className="text-right">
                  <button type="button" className="ml-auto flex items-center text-xs font-medium" onClick={() => toggleSort("budgetAmount")}>
                    Budget <SortIcon field="budgetAmount" />
                  </button>
                </TableHead>
                <TableHead className="text-right">
                  <button type="button" className="ml-auto flex items-center text-xs font-medium" onClick={() => toggleSort("commitmentAmount")}>
                    Commitment <SortIcon field="commitmentAmount" />
                  </button>
                </TableHead>
                <TableHead className="text-right">
                  <button type="button" className="ml-auto flex items-center text-xs font-medium" onClick={() => toggleSort("actualAmount")}>
                    Actual <SortIcon field="actualAmount" />
                  </button>
                </TableHead>
                <TableHead className="text-right">
                  <button type="button" className="ml-auto flex items-center text-xs font-medium" onClick={() => toggleSort("remainingBudget")}>
                    Remaining <SortIcon field="remainingBudget" />
                  </button>
                </TableHead>
                <TableHead className="w-40">
                  <button type="button" className="flex items-center text-xs font-medium" onClick={() => toggleSort("usagePercent")}>
                    Usage <SortIcon field="usagePercent" />
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center text-sm text-muted-foreground">
                    No data for the selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((row, idx) => (
                  <TableRow
                    key={row.id}
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-accent/50",
                      idx % 2 === 1 && "bg-muted/30",
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    <TableCell className="w-8 px-2">
                      {row.alert === "over" && <AlertCircle className="h-3.5 w-3.5 text-destructive" />}
                      {row.alert === "near" && <AlertTriangle className="h-3.5 w-3.5 text-warning" />}
                    </TableCell>
                    <TableCell className="text-xs font-medium">{row.unit}</TableCell>
                    <TableCell className="font-mono text-xs">{row.budgetId}</TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <Badge variant="outline" className="text-[10px]">{row.budgetType}</Badge>
                    </TableCell>
                    <TableCell className="hidden max-w-[200px] truncate lg:table-cell text-xs text-muted-foreground">{row.description}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{formatCurrency(row.budgetAmount)}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{formatCurrency(row.commitmentAmount)}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{formatCurrency(row.actualAmount)}</TableCell>
                    <TableCell className={cn(
                      "text-right font-mono text-xs",
                      row.remainingBudget < 0 && "text-destructive font-semibold",
                    )}>
                      {formatCurrency(row.remainingBudget)}
                    </TableCell>
                    <TableCell className="w-40">
                      <div className="flex items-center gap-2">
                        <Progress
                          value={Math.min(row.usagePercent, 100)}
                          className={cn(
                            "h-2 w-20",
                            row.alert === "over" && "[&>div]:bg-destructive",
                            row.alert === "near" && "[&>div]:bg-warning",
                          )}
                        />
                        <span className={cn(
                          "text-xs font-medium",
                          row.alert === "over" && "text-destructive",
                          row.alert === "near" && "text-warning",
                        )}>
                          {row.usagePercent.toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Rows per page</span>
            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1) }}>
              <SelectTrigger className="h-7 w-16 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">
              {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, sorted.length)} of {sorted.length}
            </span>
            <Button variant="outline" size="icon" className="h-7 w-7 bg-transparent" disabled={page <= 1} onClick={() => setPage(1)}>
              <ChevronsLeft className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7 bg-transparent" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7 bg-transparent" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7 bg-transparent" disabled={page >= totalPages} onClick={() => setPage(totalPages)}>
              <ChevronsRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
