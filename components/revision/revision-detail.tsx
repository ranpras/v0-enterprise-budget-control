"use client"

import { useState } from "react"
import {
  ArrowLeft, Check, X, PlayCircle,
  Clock, User, MessageSquare,
  TrendingUp, TrendingDown, Minus, AlertTriangle,
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
  REVISION_STATUS_LABELS, REVISION_STATUS_STYLES,
  REVISION_TYPE_LABELS, REVISION_TYPE_STYLES,
  formatCurrency, formatDate, getNetImpact, getNewBudget,
  type RevisionItem,
} from "@/lib/revision-types"
import type { Role } from "@/lib/rbac"
import { cn } from "@/lib/utils"

interface RevisionDetailProps {
  item: RevisionItem
  role: Role
  onBack: () => void
  onApprove?: (item: RevisionItem, comment: string) => void
  onReject?: (item: RevisionItem, comment: string) => void
  onApplyRevision?: (item: RevisionItem) => void
}

export function RevisionDetail({
  item, role, onBack, onApprove, onReject, onApplyRevision,
}: RevisionDetailProps) {
  const [actionType, setActionType] = useState<"approve" | "reject" | "apply" | null>(null)
  const [comment, setComment] = useState("")
  const netImpact = getNetImpact(item)

  const canApprove =
    (role === "supervisor" && item.status === "submitted") ||
    (role === "admin" && item.status === "supervisor_approved")
  const canReject =
    (role === "supervisor" && item.status === "submitted") ||
    (role === "admin" && item.status === "supervisor_approved")
  const canApply = role === "admin" && item.status === "admin_approved"

  function handleConfirm() {
    if (actionType === "approve" && onApprove) {
      onApprove(item, comment)
    } else if (actionType === "reject" && onReject) {
      onReject(item, comment)
    } else if (actionType === "apply" && onApplyRevision) {
      onApplyRevision(item)
    }
    setActionType(null)
    setComment("")
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
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
          {canApply && (
            <Button
              size="sm"
              className="gap-1.5 bg-warning text-warning-foreground hover:bg-warning/90"
              onClick={() => setActionType("apply")}
            >
              <PlayCircle className="h-3.5 w-3.5" />
              Apply Revision
            </Button>
          )}
        </div>
      </div>

      {/* Header summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs text-muted-foreground font-mono">{item.revisionId}</span>
              <CardTitle className="text-lg mt-0.5">Budget Revision</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn("text-xs font-medium", REVISION_TYPE_STYLES[item.revisionType])}>
                {REVISION_TYPE_LABELS[item.revisionType]}
              </Badge>
              <Badge variant="outline" className={cn("text-xs font-medium", REVISION_STATUS_STYLES[item.status])}>
                {REVISION_STATUS_LABELS[item.status]}
              </Badge>
            </div>
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
              <span className="text-xs text-muted-foreground">Related Budget</span>
              <p className="text-sm font-medium font-mono">{item.relatedBudgetId}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Created By</span>
              <p className="text-sm font-medium">{item.createdBy}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Net Impact</span>
              <div className="flex items-center gap-1.5">
                {netImpact > 0 && <TrendingUp className="h-4 w-4 text-success" />}
                {netImpact < 0 && <TrendingDown className="h-4 w-4 text-destructive" />}
                {netImpact === 0 && <Minus className="h-4 w-4 text-muted-foreground" />}
                <span className={cn(
                  "text-sm font-bold tabular-nums",
                  netImpact > 0 && "text-success",
                  netImpact < 0 && "text-destructive",
                  netImpact === 0 && "text-muted-foreground",
                )}>
                  {netImpact > 0 ? "+" : ""}{formatCurrency(netImpact)}
                </span>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="mt-4 rounded-md bg-muted/50 p-3">
            <span className="text-xs font-medium text-muted-foreground">Reason</span>
            <p className="mt-1 text-sm">{item.reason}</p>
          </div>
        </CardContent>
      </Card>

      {/* Revision detail table (read-only) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Revision Detail</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[40px] text-xs">#</TableHead>
                  <TableHead className="text-xs w-[120px]">COA</TableHead>
                  <TableHead className="text-xs w-[120px]">Cost Center</TableHead>
                  <TableHead className="text-xs text-right w-[140px]">Original Budget</TableHead>
                  <TableHead className="text-xs text-right w-[140px]">Revision Amount</TableHead>
                  <TableHead className="text-xs text-right w-[140px] bg-muted/60">New Budget</TableHead>
                  <TableHead className="text-xs">Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {item.lineItems.map((line, idx) => {
                  const newBudget = getNewBudget(line)
                  return (
                    <TableRow key={line.id} className={cn(idx % 2 === 1 && "bg-muted/10")}>
                      <TableCell className="text-xs text-muted-foreground tabular-nums">{idx + 1}</TableCell>
                      <TableCell className="text-xs font-mono">{line.coa}</TableCell>
                      <TableCell className="text-xs font-mono">{line.costCenter}</TableCell>
                      <TableCell className="text-right text-xs tabular-nums">{formatCurrency(line.originalBudget)}</TableCell>
                      <TableCell className="text-right">
                        <span className={cn(
                          "text-xs font-medium tabular-nums",
                          line.revisionAmount > 0 && "text-success",
                          line.revisionAmount < 0 && "text-destructive",
                        )}>
                          {line.revisionAmount > 0 ? "+" : ""}{formatCurrency(line.revisionAmount)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right bg-muted/20">
                        <span className={cn(
                          "text-xs font-semibold tabular-nums",
                          newBudget > line.originalBudget && "text-success",
                          newBudget < line.originalBudget && "text-destructive",
                        )}>
                          {formatCurrency(newBudget)}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">{line.description}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
              <tfoot>
                <tr className="border-t-2 bg-muted/40">
                  <td colSpan={3} className="px-4 py-2 text-xs font-semibold">TOTAL</td>
                  <td className="px-4 py-2 text-right text-xs font-semibold tabular-nums">
                    {formatCurrency(item.lineItems.reduce((s, l) => s + l.originalBudget, 0))}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <span className={cn(
                      "text-xs font-bold tabular-nums",
                      netImpact > 0 && "text-success",
                      netImpact < 0 && "text-destructive",
                    )}>
                      {netImpact > 0 ? "+" : ""}{formatCurrency(netImpact)}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right bg-primary/10">
                    <span className="text-sm font-bold tabular-nums text-primary">
                      {formatCurrency(item.lineItems.reduce((s, l) => s + getNewBudget(l), 0))}
                    </span>
                  </td>
                  <td />
                </tr>
              </tfoot>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* History timeline */}
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
                    entry.action === "applied" && "bg-warning/10 text-warning",
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
              {actionType === "approve" && "Approve Revision"}
              {actionType === "reject" && "Reject Revision"}
              {actionType === "apply" && "Apply Revision to Budget Baseline"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "approve" && `Approve revision ${item.revisionId} with net impact of ${netImpact > 0 ? "+" : ""}${formatCurrency(netImpact)}?`}
              {actionType === "reject" && "This revision will be returned to the operator for editing. A comment is required."}
              {actionType === "apply" && (
                <>
                  This will permanently modify the budget baseline by{" "}
                  <strong className={cn(netImpact > 0 ? "text-success" : "text-destructive")}>
                    {netImpact > 0 ? "+" : ""}{formatCurrency(netImpact)}
                  </strong>
                  . This action is <strong>irreversible</strong> and will create an audit record.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {actionType === "apply" && (
            <div className="flex items-center gap-2 rounded-md border border-warning/30 bg-warning/5 p-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
              <p className="text-xs text-warning">
                Once applied, this revision cannot be undone. Budget baseline will be updated immediately.
              </p>
            </div>
          )}

          {(actionType === "approve" || actionType === "reject") && (
            <div className="flex flex-col gap-1.5 py-2">
              <Label className="text-xs">Comment{actionType === "reject" && " (required)"}</Label>
              <Textarea
                className="text-sm"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={actionType === "reject" ? "Provide reason for rejection..." : "Optional comment..."}
              />
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={actionType === "reject" && !comment.trim()}
              onClick={handleConfirm}
              className={cn(
                actionType === "reject" && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                actionType === "approve" && "bg-success text-success-foreground hover:bg-success/90",
                actionType === "apply" && "bg-warning text-warning-foreground hover:bg-warning/90",
              )}
            >
              {actionType === "approve" && "Approve"}
              {actionType === "reject" && "Reject"}
              {actionType === "apply" && "Apply Revision"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
