"use client"

import React from "react"

import { Check, X, Clock, FileText, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
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
} from "@/lib/approval-types"
import { cn } from "@/lib/utils"

interface ApprovalDetailSheetProps {
  item: ApprovalItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  isProcessed: boolean
  onApprove: (item: ApprovalItem) => void
  onReject: (item: ApprovalItem) => void
}

const HISTORY_ACTION_STYLES: Record<string, { icon: React.ReactNode; style: string }> = {
  submitted: {
    icon: <FileText className="h-3 w-3" />,
    style: "bg-primary/10 text-primary",
  },
  reviewed: {
    icon: <ArrowRight className="h-3 w-3" />,
    style: "bg-muted text-muted-foreground",
  },
  approved: {
    icon: <Check className="h-3 w-3" />,
    style: "bg-success/10 text-success",
  },
  rejected: {
    icon: <X className="h-3 w-3" />,
    style: "bg-destructive/10 text-destructive",
  },
}

function formatDateTime(dateString: string): string {
  const d = new Date(dateString)
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function ApprovalDetailSheet({
  item,
  open,
  onOpenChange,
  isProcessed,
  onApprove,
  onReject,
}: ApprovalDetailSheetProps) {
  if (!item) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-medium",
                TRANSACTION_TYPE_COLORS[item.type],
              )}
            >
              {TRANSACTION_TYPE_LABELS[item.type]}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-medium capitalize",
                STATUS_STYLES[item.status],
              )}
            >
              {STATUS_LABELS[item.status]}
            </Badge>
          </div>
          <SheetTitle className="text-lg font-mono">
            {item.docNumber}
          </SheetTitle>
          <SheetDescription>{item.description}</SheetDescription>
        </SheetHeader>

        {/* ── Summary Section ──────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Unit Kerja
            </p>
            <p className="mt-0.5 text-sm font-medium">{item.unit}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Submitted By
            </p>
            <p className="mt-0.5 text-sm font-medium">{item.submittedBy}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Total Amount
            </p>
            <p className="mt-0.5 text-sm font-semibold">
              {formatCurrency(item.amount)}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Submitted Date
            </p>
            <p className="mt-0.5 text-sm font-medium">
              {formatDateTime(item.submittedDate)}
            </p>
          </div>
        </div>

        {/* ── Budget Impact ────────────────────────────────────── */}
        {item.budgetImpact && (
          <>
            <Separator className="my-4" />
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Budget Impact Summary
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md border p-3">
                  <p className="text-[11px] text-muted-foreground">Baseline</p>
                  <p className="text-sm font-medium tabular-nums">
                    {formatCurrency(item.budgetImpact.baseline)}
                  </p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-[11px] text-muted-foreground">
                    Current Commitment
                  </p>
                  <p className="text-sm font-medium tabular-nums">
                    {formatCurrency(item.budgetImpact.currentCommitment)}
                  </p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-[11px] text-muted-foreground">
                    After Approval
                  </p>
                  <p className="text-sm font-medium tabular-nums">
                    {formatCurrency(item.budgetImpact.afterApproval)}
                  </p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-[11px] text-muted-foreground">
                    Remaining
                  </p>
                  <p
                    className={cn(
                      "text-sm font-semibold tabular-nums",
                      item.budgetImpact.remaining <= 0
                        ? "text-destructive"
                        : "text-success",
                    )}
                  >
                    {formatCurrency(item.budgetImpact.remaining)}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Line Items ───────────────────────────────────────── */}
        <Separator className="my-4" />
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Line Items
          </h4>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-xs h-9">COA</TableHead>
                  <TableHead className="text-xs h-9">Description</TableHead>
                  <TableHead className="text-xs text-right h-9">
                    Amount
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {item.lineItems.map((li) => (
                  <TableRow key={li.id}>
                    <TableCell className="py-2 text-xs font-mono">
                      {li.coa}
                    </TableCell>
                    <TableCell className="py-2 text-xs">
                      {li.description}
                    </TableCell>
                    <TableCell className="py-2 text-xs text-right tabular-nums font-medium">
                      {formatCurrency(li.amount)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/30 font-semibold">
                  <TableCell className="py-2 text-xs" colSpan={2}>
                    Total
                  </TableCell>
                  <TableCell className="py-2 text-xs text-right tabular-nums">
                    {formatCurrency(item.amount)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        {/* ── Approval History ─────────────────────────────────── */}
        <Separator className="my-4" />
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Approval History
          </h4>
          <div className="flex flex-col gap-3">
            {item.history.map((entry, index) => {
              const style =
                HISTORY_ACTION_STYLES[entry.action] ||
                HISTORY_ACTION_STYLES.submitted
              return (
                <div
                  key={`${entry.approver}-${index}`}
                  className="flex gap-3"
                >
                  <div
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full mt-0.5",
                      style.style,
                    )}
                  >
                    {style.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium">
                        {entry.approver}
                      </span>
                      <span className="text-[11px] capitalize text-muted-foreground">
                        {entry.action}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDateTime(entry.date)}
                    </div>
                    {entry.comment && (
                      <p className="mt-1 text-xs text-muted-foreground bg-muted/50 rounded-md px-2.5 py-1.5 italic">
                        {entry.comment}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Footer Actions ───────────────────────────────────── */}
        <Separator className="my-4" />
        <div className="flex items-center justify-end gap-2 pb-4">
          <Button
            variant="outline"
            className="text-destructive border-destructive/30 hover:bg-destructive/10 bg-transparent"
            disabled={isProcessed}
            onClick={() => onReject(item)}
          >
            <X className="mr-1.5 h-4 w-4" />
            Reject
          </Button>
          <Button
            className="bg-success text-success-foreground hover:bg-success/90"
            disabled={isProcessed}
            onClick={() => onApprove(item)}
          >
            <Check className="mr-1.5 h-4 w-4" />
            Approve
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
