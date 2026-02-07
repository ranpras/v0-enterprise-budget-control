"use client"

import { useState } from "react"
import {
  ArrowLeft, Check, X, BookCheck, RotateCcw,
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
  ACTUAL_STATUS_LABELS, ACTUAL_STATUS_STYLES,
  formatCurrency, formatDate, getActualTotal, getRemainingAfterActual, getCommitmentUsagePercent,
  type ActualItem,
} from "@/lib/actual-types"
import type { Role } from "@/lib/rbac"
import { cn } from "@/lib/utils"

interface ActualDetailProps {
  item: ActualItem
  role: Role
  onBack: () => void
  onApprove?: (item: ActualItem, comment: string) => void
  onReject?: (item: ActualItem, comment: string) => void
  onPost?: (item: ActualItem) => void
  onReverse?: (item: ActualItem, reason: string) => void
}

export function ActualDetail({
  item, role, onBack, onApprove, onReject, onPost, onReverse,
}: ActualDetailProps) {
  const [actionType, setActionType] = useState<"approve" | "reject" | "post" | "reverse" | null>(null)
  const [comment, setComment] = useState("")
  const total = getActualTotal(item)

  const canApprove =
    (role === "supervisor" && item.status === "submitted") ||
    (role === "admin" && item.status === "supervisor_approved")
  const canReject =
    (role === "supervisor" && item.status === "submitted") ||
    (role === "admin" && item.status === "supervisor_approved")
  const canPost = role === "admin" && item.status === "admin_approved"
  const canReverse = role === "admin" && item.status === "posted"

  function handleConfirm() {
    if (actionType === "approve" && onApprove) {
      onApprove(item, comment)
    } else if (actionType === "reject" && onReject) {
      onReject(item, comment)
    } else if (actionType === "post" && onPost) {
      onPost(item)
    } else if (actionType === "reverse" && onReverse) {
      onReverse(item, comment)
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
          {canPost && (
            <Button
              size="sm"
              className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setActionType("post")}
            >
              <BookCheck className="h-3.5 w-3.5" />
              Post Actual
            </Button>
          )}
          {canReverse && (
            <Button
              variant="outline" size="sm"
              className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 bg-transparent"
              onClick={() => setActionType("reverse")}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reverse
            </Button>
          )}
        </div>
      </div>

      {/* Header summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <span className="text-xs text-muted-foreground font-mono">{item.actualNumber}</span>
              <CardTitle className="text-lg mt-0.5">{item.description}</CardTitle>
            </div>
            <Badge
              variant="outline"
              className={cn("text-xs font-medium", ACTUAL_STATUS_STYLES[item.status])}
            >
              {ACTUAL_STATUS_LABELS[item.status]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <span className="text-xs text-muted-foreground">SPK Reference</span>
              <p className="text-sm font-medium font-mono">{item.spkNumber}</p>
            </div>
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
              <span className="text-xs text-muted-foreground">Invoice / Ref</span>
              <p className="text-sm font-medium font-mono">{item.invoiceRef || "-"}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Actual Date</span>
              <p className="text-sm font-medium">{item.actualDate}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Created By</span>
              <p className="text-sm font-medium">{item.createdBy}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Posting Date</span>
              <p className="text-sm font-medium">{item.postingDate ? formatDate(item.postingDate) : "-"}</p>
            </div>
          </div>

          {/* Total payment card */}
          <div className="mt-4 flex items-center justify-between rounded-md bg-primary/5 border border-primary/10 p-3">
            <span className="text-sm font-medium">Total Actual Payment</span>
            <span className="text-lg font-bold tabular-nums text-primary">{formatCurrency(total)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Actual detail table (read-only) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Actual Detail Lines</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[40px] text-xs">#</TableHead>
                  <TableHead className="text-xs w-[120px]">COA</TableHead>
                  <TableHead className="text-xs w-[120px]">Cost Center</TableHead>
                  <TableHead className="text-xs text-right w-[150px]">Remaining Commitment</TableHead>
                  <TableHead className="text-xs text-right w-[150px]">Actual Amount</TableHead>
                  <TableHead className="text-xs text-right w-[150px] bg-muted/60">Remaining After</TableHead>
                  <TableHead className="text-xs text-right w-[70px]">Usage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {item.lineItems.map((line, idx) => {
                  const remaining = getRemainingAfterActual(line)
                  const usagePct = getCommitmentUsagePercent(line)
                  const isFullPayment = line.actualAmount === line.remainingCommitment && line.remainingCommitment > 0
                  return (
                    <TableRow key={line.id} className={cn(idx % 2 === 1 && "bg-muted/10")}>
                      <TableCell className="text-xs text-muted-foreground tabular-nums">{idx + 1}</TableCell>
                      <TableCell className="text-xs font-mono">{line.coa}</TableCell>
                      <TableCell className="text-xs font-mono">{line.costCenter}</TableCell>
                      <TableCell className="text-right text-xs tabular-nums">{formatCurrency(line.remainingCommitment)}</TableCell>
                      <TableCell className="text-right text-xs font-semibold tabular-nums text-primary">
                        <div className="flex items-center justify-end gap-1.5">
                          {isFullPayment && (
                            <span className="text-[9px] font-bold text-success bg-success/10 px-1 rounded">FULL</span>
                          )}
                          {formatCurrency(line.actualAmount)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right bg-muted/20">
                        <span className={cn(
                          "text-xs font-semibold tabular-nums",
                          remaining < 0 && "text-destructive",
                          remaining === 0 && "text-muted-foreground",
                          remaining > 0 && remaining < line.remainingCommitment * 0.1 && "text-warning",
                          remaining >= line.remainingCommitment * 0.1 && "text-success",
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
                  <td colSpan={3} className="px-4 py-2 text-xs font-semibold">TOTAL</td>
                  <td className="px-4 py-2 text-right text-xs font-semibold tabular-nums">
                    {formatCurrency(item.lineItems.reduce((s, l) => s + l.remainingCommitment, 0))}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <span className="text-sm font-bold tabular-nums text-primary">{formatCurrency(total)}</span>
                  </td>
                  <td className="px-4 py-2 text-right bg-muted/30">
                    <span className={cn(
                      "text-xs font-bold tabular-nums",
                      item.lineItems.reduce((s, l) => s + getRemainingAfterActual(l), 0) < 0
                        ? "text-destructive"
                        : "text-success",
                    )}>
                      {formatCurrency(item.lineItems.reduce((s, l) => s + getRemainingAfterActual(l), 0))}
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
                    entry.action === "posted" && "bg-foreground/10 text-foreground",
                    entry.action === "reversed" && "bg-destructive/10 text-destructive",
                    (entry.action === "created" || entry.action === "edited") && "bg-muted text-muted-foreground",
                  )}>
                    <User className="h-3.5 w-3.5" />
                  </div>
                  {idx < item.history.length - 1 && <div className="mt-1 w-px flex-1 bg-border" />}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{entry.actor}</span>
                    <Badge variant="outline" className={cn(
                      "text-[10px] font-medium capitalize",
                      entry.action === "reversed" && "text-destructive border-destructive/20",
                      entry.action === "posted" && "text-foreground border-foreground/20",
                    )}>{entry.action}</Badge>
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
              {actionType === "approve" && "Approve Actual"}
              {actionType === "reject" && "Reject Actual"}
              {actionType === "post" && "Post Actual - Record Payment"}
              {actionType === "reverse" && "Reverse Posted Actual"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "approve" && (
                <>Approve actual {item.actualNumber} with total payment of <strong className="text-primary">{formatCurrency(total)}</strong>?</>
              )}
              {actionType === "reject" && "This actual will be returned to the operator for revision. A comment is required."}
              {actionType === "post" && (
                <>
                  Posting this actual will reduce commitment by{" "}
                  <strong className="text-primary">{formatCurrency(total)}</strong>{" "}
                  and reduce available budget accordingly. The record will be locked.
                </>
              )}
              {actionType === "reverse" && (
                <>
                  Reversing actual {item.actualNumber} will restore{" "}
                  <strong className="text-primary">{formatCurrency(total)}</strong>{" "}
                  back to commitment. The original record will be preserved for audit.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {actionType === "post" && (
            <div className="flex items-center gap-2 rounded-md border border-warning/30 bg-warning/5 p-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
              <p className="text-xs text-warning">
                Commitment will be reduced and available budget will decrease. This record will be locked after posting.
              </p>
            </div>
          )}

          {actionType === "reverse" && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
              <p className="text-xs text-destructive">
                This will create an audit trail entry. The original posted record will not be deleted.
                Commitment and available budget will be restored.
              </p>
            </div>
          )}

          {(actionType === "approve" || actionType === "reject" || actionType === "reverse") && (
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
                    : actionType === "reverse"
                      ? "Provide reason for reversal (e.g. duplicate payment, wrong amount)..."
                      : "Optional comment..."
                }
              />
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={(actionType === "reject" || actionType === "reverse") && !comment.trim()}
              onClick={handleConfirm}
              className={cn(
                actionType === "reject" && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                actionType === "approve" && "bg-success text-success-foreground hover:bg-success/90",
                actionType === "post" && "bg-primary text-primary-foreground hover:bg-primary/90",
                actionType === "reverse" && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
              )}
            >
              {actionType === "approve" && "Approve"}
              {actionType === "reject" && "Reject"}
              {actionType === "post" && "Post Actual"}
              {actionType === "reverse" && "Reverse Actual"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
