"use client"

import { useState } from "react"
import {
  ArrowLeft, Check, X, Zap, Ban,
  Clock, User, MessageSquare, AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  SPK_STATUS_LABELS, SPK_STATUS_STYLES,
  formatCurrency, formatDate, getSpkTotal, getRemainingBudget, getBudgetUsagePercent,
  type SpkItem,
} from "@/lib/spk-types"
import type { Role } from "@/lib/rbac"
import { cn } from "@/lib/utils"

interface SpkDetailProps {
  item: SpkItem
  role: Role
  onBack: () => void
  onApprove?: (item: SpkItem, comment: string) => void
  onReject?: (item: SpkItem, comment: string) => void
  onActivate?: (item: SpkItem) => void
  onCancel?: (item: SpkItem, reason: string) => void
}

export function SpkDetail({
  item, role, onBack, onApprove, onReject, onActivate, onCancel,
}: SpkDetailProps) {
  const [actionType, setActionType] = useState<"approve" | "reject" | "activate" | "cancel" | null>(null)
  const [comment, setComment] = useState("")
  const total = getSpkTotal(item)

  const canApprove =
    (role === "supervisor" && item.status === "submitted") ||
    (role === "admin" && item.status === "supervisor_approved")
  const canReject =
    (role === "supervisor" && item.status === "submitted") ||
    (role === "admin" && item.status === "supervisor_approved")
  const canActivate = role === "admin" && item.status === "admin_approved"
  const canCancelSpk = role === "admin" && item.status === "active"

  function handleConfirm() {
    if (actionType === "approve" && onApprove) {
      onApprove(item, comment)
    } else if (actionType === "reject" && onReject) {
      onReject(item, comment)
    } else if (actionType === "activate" && onActivate) {
      onActivate(item)
    } else if (actionType === "cancel" && onCancel) {
      onCancel(item, comment)
    }
    setActionType(null)
    setComment("")
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Back to List
        </Button>
        <div className="flex items-center gap-2">
          {canReject && (
            <Button
              variant="outline" size="sm"
              className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 bg-transparent"
              onClick={() => setActionType("reject")}
            >
              <X className="h-3.5 w-3.5" />
              Reject
            </Button>
          )}
          {canApprove && (
            <Button
              size="sm"
              className="gap-1.5 bg-success text-success-foreground hover:bg-success/90"
              onClick={() => setActionType("approve")}
            >
              <Check className="h-3.5 w-3.5" />
              {role === "admin" ? "Final Approve" : "Approve"}
            </Button>
          )}
          {canActivate && (
            <Button
              size="sm"
              className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setActionType("activate")}
            >
              <Zap className="h-3.5 w-3.5" />
              Activate SPK
            </Button>
          )}
          {canCancelSpk && (
            <Button
              variant="outline" size="sm"
              className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 bg-transparent"
              onClick={() => setActionType("cancel")}
            >
              <Ban className="h-3.5 w-3.5" />
              Cancel SPK
            </Button>
          )}
        </div>
      </div>

      {/* Header summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <span className="text-xs text-muted-foreground font-mono">{item.spkNumber}</span>
              <CardTitle className="text-lg mt-0.5">{item.description}</CardTitle>
            </div>
            <Badge
              variant="outline"
              className={cn("text-xs font-medium", SPK_STATUS_STYLES[item.status])}
            >
              {SPK_STATUS_LABELS[item.status]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <span className="text-xs text-muted-foreground">Fiscal Year</span>
              <p className="text-sm font-medium">{item.fiscalYear}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Unit Kerja</span>
              <p className="text-sm font-medium">{item.unitKerja}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Vendor</span>
              <p className="text-sm font-medium">{item.vendor}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Contract / Ref</span>
              <p className="text-sm font-medium font-mono">{item.contractRef || "-"}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Created By</span>
              <p className="text-sm font-medium">{item.createdBy}</p>
            </div>
          </div>

          {/* Total commitment card */}
          <div className="mt-4 flex items-center justify-between rounded-md bg-primary/5 border border-primary/10 p-3">
            <span className="text-sm font-medium">Total Commitment</span>
            <span className="text-lg font-bold tabular-nums text-primary">{formatCurrency(total)}</span>
          </div>
        </CardContent>
      </Card>

      {/* SPK detail table (read-only) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">SPK Detail Lines</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[40px] text-xs">#</TableHead>
                  <TableHead className="text-xs w-[120px]">COA</TableHead>
                  <TableHead className="text-xs w-[120px]">Cost Center</TableHead>
                  <TableHead className="text-xs">Description</TableHead>
                  <TableHead className="text-xs text-right w-[140px]">Budget Available</TableHead>
                  <TableHead className="text-xs text-right w-[140px]">SPK Amount</TableHead>
                  <TableHead className="text-xs text-right w-[140px] bg-muted/60">Remaining</TableHead>
                  <TableHead className="text-xs text-right w-[70px]">Usage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {item.lineItems.map((line, idx) => {
                  const remaining = getRemainingBudget(line)
                  const usagePct = getBudgetUsagePercent(line)
                  return (
                    <TableRow key={line.id} className={cn(idx % 2 === 1 && "bg-muted/10")}>
                      <TableCell className="text-xs text-muted-foreground tabular-nums">{idx + 1}</TableCell>
                      <TableCell className="text-xs font-mono">{line.coa}</TableCell>
                      <TableCell className="text-xs font-mono">{line.costCenter}</TableCell>
                      <TableCell className="text-xs">{line.description}</TableCell>
                      <TableCell className="text-right text-xs tabular-nums">{formatCurrency(line.budgetAvailable)}</TableCell>
                      <TableCell className="text-right text-xs font-semibold tabular-nums text-primary">
                        {formatCurrency(line.spkAmount)}
                      </TableCell>
                      <TableCell className="text-right bg-muted/20">
                        <span className={cn(
                          "text-xs font-semibold tabular-nums",
                          remaining < 0 && "text-destructive",
                          remaining >= 0 && remaining < line.budgetAvailable * 0.1 && "text-warning",
                          remaining >= line.budgetAvailable * 0.1 && "text-success",
                        )}>
                          {formatCurrency(remaining)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {usagePct >= 90 && (
                            <AlertTriangle className="h-3 w-3 text-warning" />
                          )}
                          <span className={cn(
                            "text-xs tabular-nums",
                            usagePct >= 100 && "text-destructive font-semibold",
                            usagePct >= 90 && usagePct < 100 && "text-warning font-medium",
                            usagePct < 90 && "text-muted-foreground",
                          )}>
                            {usagePct.toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
              <tfoot>
                <tr className="border-t-2 bg-muted/40">
                  <td colSpan={4} className="px-4 py-2 text-xs font-semibold">TOTAL</td>
                  <td className="px-4 py-2 text-right text-xs font-semibold tabular-nums">
                    {formatCurrency(item.lineItems.reduce((s, l) => s + l.budgetAvailable, 0))}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <span className="text-sm font-bold tabular-nums text-primary">{formatCurrency(total)}</span>
                  </td>
                  <td className="px-4 py-2 text-right bg-muted/30">
                    <span className={cn(
                      "text-xs font-bold tabular-nums",
                      item.lineItems.reduce((s, l) => s + getRemainingBudget(l), 0) < 0
                        ? "text-destructive"
                        : "text-success",
                    )}>
                      {formatCurrency(item.lineItems.reduce((s, l) => s + getRemainingBudget(l), 0))}
                    </span>
                  </td>
                  <td />
                </tr>
              </tfoot>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Approval history timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Approval History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {item.history.map((entry, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    entry.action === "approved" && "bg-success/10 text-success",
                    entry.action === "rejected" && "bg-destructive/10 text-destructive",
                    entry.action === "submitted" && "bg-primary/10 text-primary",
                    entry.action === "activated" && "bg-primary/15 text-primary",
                    entry.action === "cancelled" && "bg-muted text-muted-foreground",
                    (entry.action === "created" || entry.action === "edited") && "bg-muted text-muted-foreground",
                  )}>
                    <User className="h-3.5 w-3.5" />
                  </div>
                  {idx < item.history.length - 1 && <div className="mt-1 w-px flex-1 bg-border" />}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{entry.actor}</span>
                    <Badge variant="outline" className="text-[10px] font-medium capitalize">{entry.action}</Badge>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDate(entry.date)}
                  </div>
                  {entry.comment && (
                    <div className="mt-2 flex gap-1.5 rounded-md bg-muted/50 p-2.5">
                      <MessageSquare className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{entry.comment}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action dialog */}
      <AlertDialog open={actionType !== null} onOpenChange={(open) => { if (!open) { setActionType(null); setComment("") } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "approve" && "Approve SPK"}
              {actionType === "reject" && "Reject SPK"}
              {actionType === "activate" && "Activate SPK - Commit Budget"}
              {actionType === "cancel" && "Cancel Active SPK"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "approve" && (
                <>Approve SPK {item.spkNumber} with total commitment of <strong className="text-primary">{formatCurrency(total)}</strong>?</>
              )}
              {actionType === "reject" && "This SPK will be returned to the operator for revision. A comment is required."}
              {actionType === "activate" && (
                <>
                  Activating this SPK will reserve{" "}
                  <strong className="text-primary">{formatCurrency(total)}</strong>{" "}
                  against the budget. The SPK cannot be edited afterwards.
                </>
              )}
              {actionType === "cancel" && (
                <>
                  Cancelling this SPK will release the remaining commitment of{" "}
                  <strong className="text-primary">{formatCurrency(total)}</strong>.
                  A reason is required.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {actionType === "activate" && (
            <div className="flex items-center gap-2 rounded-md border border-warning/30 bg-warning/5 p-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
              <p className="text-xs text-warning">
                Budget will be committed immediately. This SPK will become active and locked for editing.
              </p>
            </div>
          )}

          {actionType === "cancel" && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
              <p className="text-xs text-destructive">
                This will release all remaining commitment back to the available budget pool.
              </p>
            </div>
          )}

          {(actionType === "approve" || actionType === "reject" || actionType === "cancel") && (
            <div className="flex flex-col gap-1.5 py-2">
              <Label className="text-xs">
                {actionType === "approve" ? "Comment (optional)" : "Reason (required)"}
              </Label>
              <Textarea
                className="text-sm"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  actionType === "reject"
                    ? "Provide reason for rejection..."
                    : actionType === "cancel"
                      ? "Provide reason for cancellation..."
                      : "Optional comment..."
                }
              />
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={(actionType === "reject" || actionType === "cancel") && !comment.trim()}
              onClick={handleConfirm}
              className={cn(
                actionType === "reject" && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                actionType === "approve" && "bg-success text-success-foreground hover:bg-success/90",
                actionType === "activate" && "bg-primary text-primary-foreground hover:bg-primary/90",
                actionType === "cancel" && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
              )}
            >
              {actionType === "approve" && "Approve"}
              {actionType === "reject" && "Reject"}
              {actionType === "activate" && "Activate SPK"}
              {actionType === "cancel" && "Cancel SPK"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
