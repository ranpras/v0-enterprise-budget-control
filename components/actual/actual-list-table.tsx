"use client"

import { useState, useMemo } from "react"
import {
  ArrowUpDown, ArrowUp, ArrowDown,
  Eye, Pencil, SendHorizontal, MoreHorizontal,
  ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  ACTUAL_STATUS_LABELS, ACTUAL_STATUS_STYLES,
  formatCurrency, formatDate, getActualTotal,
  type ActualItem, type ActualSortField, type SortDirection,
} from "@/lib/actual-types"
import type { Role } from "@/lib/rbac"
import { cn } from "@/lib/utils"

interface Props {
  items: ActualItem[]
  role: Role
  onView: (item: ActualItem) => void
  onEdit: (item: ActualItem) => void
  onSubmit: (item: ActualItem) => void
  page: number
  pageSize: number
  onPageChange: (p: number) => void
  onPageSizeChange: (s: number) => void
}

export function ActualListTable({
  items, role, onView, onEdit, onSubmit,
  page, pageSize, onPageChange, onPageSizeChange,
}: Props) {
  const [sortField, setSortField] = useState<ActualSortField>("actualNumber")
  const [sortDir, setSortDir] = useState<SortDirection>("desc")

  function toggleSort(field: ActualSortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  const sorted = useMemo(() => {
    const copy = [...items]
    copy.sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case "actualNumber": cmp = a.actualNumber.localeCompare(b.actualNumber); break
        case "spkNumber": cmp = a.spkNumber.localeCompare(b.spkNumber); break
        case "fiscalYear": cmp = a.fiscalYear - b.fiscalYear; break
        case "unitKerja": cmp = a.unitKerja.localeCompare(b.unitKerja); break
        case "vendor": cmp = a.vendor.localeCompare(b.vendor); break
        case "totalAmount": cmp = getActualTotal(a) - getActualTotal(b); break
        case "status": cmp = a.status.localeCompare(b.status); break
        case "postingDate": cmp = (a.postingDate || "").localeCompare(b.postingDate || ""); break
      }
      return sortDir === "asc" ? cmp : -cmp
    })
    return copy
  }, [items, sortField, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize)

  function SortIcon({ field }: { field: ActualSortField }) {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-3 w-3 text-muted-foreground/50" />
    return sortDir === "asc"
      ? <ArrowUp className="ml-1 h-3 w-3" />
      : <ArrowDown className="ml-1 h-3 w-3" />
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-auto max-h-[calc(100vh-340px)]">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
              <TableRow className="hover:bg-muted/80">
                <TableHead className="w-[140px]">
                  <button type="button" className="flex items-center text-xs font-medium" onClick={() => toggleSort("actualNumber")}>
                    Actual No. <SortIcon field="actualNumber" />
                  </button>
                </TableHead>
                <TableHead className="w-[130px]">
                  <button type="button" className="flex items-center text-xs font-medium" onClick={() => toggleSort("spkNumber")}>
                    SPK No. <SortIcon field="spkNumber" />
                  </button>
                </TableHead>
                <TableHead className="w-[60px]">
                  <button type="button" className="flex items-center text-xs font-medium" onClick={() => toggleSort("fiscalYear")}>
                    FY <SortIcon field="fiscalYear" />
                  </button>
                </TableHead>
                <TableHead className="w-[120px] hidden lg:table-cell">
                  <button type="button" className="flex items-center text-xs font-medium" onClick={() => toggleSort("unitKerja")}>
                    Unit <SortIcon field="unitKerja" />
                  </button>
                </TableHead>
                <TableHead className="w-[160px] hidden xl:table-cell">
                  <button type="button" className="flex items-center text-xs font-medium" onClick={() => toggleSort("vendor")}>
                    Vendor <SortIcon field="vendor" />
                  </button>
                </TableHead>
                <TableHead className="w-[140px] text-right">
                  <button type="button" className="flex items-center justify-end text-xs font-medium w-full" onClick={() => toggleSort("totalAmount")}>
                    Actual Amount <SortIcon field="totalAmount" />
                  </button>
                </TableHead>
                <TableHead className="w-[120px]">
                  <button type="button" className="flex items-center text-xs font-medium" onClick={() => toggleSort("status")}>
                    Status <SortIcon field="status" />
                  </button>
                </TableHead>
                <TableHead className="w-[100px] hidden md:table-cell">
                  <button type="button" className="flex items-center text-xs font-medium" onClick={() => toggleSort("postingDate")}>
                    Posting Date <SortIcon field="postingDate" />
                  </button>
                </TableHead>
                <TableHead className="w-[60px] text-center">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center text-sm text-muted-foreground">
                    No actual records found.
                  </TableCell>
                </TableRow>
              )}
              {paginated.map((item, idx) => {
                const total = getActualTotal(item)
                return (
                  <TableRow
                    key={item.id}
                    className={cn(
                      "cursor-pointer transition-colors",
                      idx % 2 === 1 && "bg-muted/10",
                    )}
                    onClick={() => onView(item)}
                  >
                    <TableCell className="text-xs font-mono font-medium">{item.actualNumber}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{item.spkNumber}</TableCell>
                    <TableCell className="text-xs tabular-nums">{item.fiscalYear}</TableCell>
                    <TableCell className="text-xs hidden lg:table-cell">{item.unitKerja}</TableCell>
                    <TableCell className="text-xs hidden xl:table-cell max-w-[160px] truncate">{item.vendor}</TableCell>
                    <TableCell className="text-right text-xs font-semibold tabular-nums text-primary">
                      {formatCurrency(total)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-[10px] font-medium", ACTUAL_STATUS_STYLES[item.status])}>
                        {ACTUAL_STATUS_LABELS[item.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                      {item.postingDate ? formatDate(item.postingDate) : "-"}
                    </TableCell>
                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem className="gap-2 text-xs" onClick={() => onView(item)}>
                            <Eye className="h-3.5 w-3.5" /> View Detail
                          </DropdownMenuItem>
                          {role === "operator" && item.status === "draft" && (
                            <>
                              <DropdownMenuItem className="gap-2 text-xs" onClick={() => onEdit(item)}>
                                <Pencil className="h-3.5 w-3.5" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 text-xs" onClick={() => onSubmit(item)}>
                                <SendHorizontal className="h-3.5 w-3.5" /> Submit
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Showing {Math.min((page - 1) * pageSize + 1, sorted.length)}-{Math.min(page * pageSize, sorted.length)} of {sorted.length}</span>
          <Select value={pageSize.toString()} onValueChange={(v) => { onPageSizeChange(Number(v)); onPageChange(1) }}>
            <SelectTrigger className="h-7 w-[70px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span>per page</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-7 w-7 bg-transparent" disabled={page <= 1} onClick={() => onPageChange(1)}>
            <ChevronsLeft className="h-3.5 w-3.5" /><span className="sr-only">First</span>
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7 bg-transparent" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            <ChevronLeft className="h-3.5 w-3.5" /><span className="sr-only">Previous</span>
          </Button>
          <span className="px-2 text-xs tabular-nums">{page} / {totalPages}</span>
          <Button variant="outline" size="icon" className="h-7 w-7 bg-transparent" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
            <ChevronRight className="h-3.5 w-3.5" /><span className="sr-only">Next</span>
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7 bg-transparent" disabled={page >= totalPages} onClick={() => onPageChange(totalPages)}>
            <ChevronsRight className="h-3.5 w-3.5" /><span className="sr-only">Last</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
