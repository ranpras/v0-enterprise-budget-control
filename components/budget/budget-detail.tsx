"use client"

import { useState } from "react"
import {
  ArrowLeft,
  Check,
  X,
  Lock,
  Clock,
  User,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  BUDGET_STATUS_LABELS,
  BUDGET_STATUS_STYLES,
  BUDGET_TYPE_LABELS,
  MONTHS,
  formatCurrency,
  formatDate,
  getLineTotal,
  getBudgetTotal,
  type BudgetItem,
} from "@/lib/budget-types"
import type { Role } from "@/lib/rbac"
import { cn } from "@/lib/utils"

interface BudgetDetailProps {
  item: BudgetItem
  role: Role
  onBack: () => void
  onApprove?: (item: BudgetItem, comment: string) => void
  onReject?: (item: BudgetItem, comment: string) => void
  onLock?: (item: BudgetItem) => void
}

export function BudgetDetail({
  item,
  role,
  onBack,
  onApprove,
  onReject,
  onLock,
}: BudgetDetailProps) {
  const [actionType, setActionType] = useState<
    "approve" | "reject" | "lock" | null
  >(null)
  const [comment, setComment] = useState("")
  const total = getBudgetTotal(item)

  // Determine which actions to show
  const canApprove =
    (role === "supervisor" && item.status === "submitted") ||
    (role === "admin" && item.status === "supervisor_approved")
  const canReject =
    (role === "supervisor" && item.status === "submitted") ||
    (role === "admin" && item.status === "supervisor_approved")
  const canLock = role === "admin" && item.status === "admin_approved"

  function handleConfirm() {
    if (actionType === "approve" && onApprove) {
      onApprove(item, comment)
    } else if (actionType === "reject" && onReject) {
      onReject(item, comment)
    } else if (actionType === "lock" && onLock) {
      onLock(item)
    }
    setActionType(null)
    setComment("")
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to List
        </Button>
        <div className="flex items-center gap-2">
          {canReject && (
            <Button
              variant="outline"
              size="sm"
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
          {canLock && (
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => setActionType("lock")}
            >
              <Lock className="h-3.5 w-3.5" />
              Lock Budget
            </Button>
          )}
        </div>
      </div>

      {/* Header summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs text-muted-foreground font-mono">
                {item.budgetId}
              </span>
              <CardTitle className="text-lg mt-0.5">
                {item.description}
              </CardTitle>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-medium",
                BUDGET_STATUS_STYLES[item.status],
              )}
            >
              {BUDGET_STATUS_LABELS[item.status]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <span className="text-xs text-muted-foreground">Budget Type</span>
              <p className="text-sm font-medium">
                {BUDGET_TYPE_LABELS[item.budgetType]}
              </p>
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
              <span className="text-xs text-muted-foreground">Created By</span>
              <p className="text-sm font-medium">{item.createdBy}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Total Budget
              </span>
              <p className="text-sm font-bold text-primary">
                {formatCurrency(total)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget detail table (read-only) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Budget Detail</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <table className="w-full text-sm border-collapse min-w-[1200px]">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="sticky left-0 z-20 bg-muted/40 px-3 py-2 text-left text-xs font-medium w-[40px]">
                    #
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium w-[120px]">
                    COA
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium w-[120px]">
                    Cost Center
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium w-[200px]">
                    Description
                  </th>
                  {MONTHS.map((m) => (
                    <th
                      key={m}
                      className="px-2 py-2 text-right text-xs font-medium w-[100px]"
                    >
                      {m}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-right text-xs font-medium w-[120px] bg-muted/60">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {item.lineItems.map((line, idx) => {
                  const lineTotal = getLineTotal(line)
                  return (
                    <tr
                      key={line.id}
                      className={cn(
                        "border-b",
                        idx % 2 === 1 && "bg-muted/10",
                      )}
                    >
                      <td className="sticky left-0 z-20 bg-card px-3 py-2 text-xs text-muted-foreground tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-2 text-xs font-mono">
                        {line.coa}
                      </td>
                      <td className="px-3 py-2 text-xs font-mono">
                        {line.costCenter}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {line.description}
                      </td>
                      {MONTHS.map((m, monthIdx) => (
                        <td
                          key={m}
                          className="px-2 py-2 text-right text-xs tabular-nums"
                        >
                          {line.monthly[monthIdx] > 0
                            ? formatCurrency(line.monthly[monthIdx])
                            : "-"}
                        </td>
                      ))}
                      <td className="px-3 py-2 text-right bg-muted/20">
                        <span className="text-xs font-semibold tabular-nums">
                          {formatCurrency(lineTotal)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 bg-muted/40">
                  <td
                    colSpan={4}
                    className="sticky left-0 z-20 bg-muted/40 px-3 py-2 text-xs font-semibold"
                  >
                    TOTAL
                  </td>
                  {MONTHS.map((m, monthIdx) => {
                    const colTotal = item.lineItems.reduce(
                      (s, l) => s + l.monthly[monthIdx],
                      0,
                    )
                    return (
                      <td
                        key={m}
                        className="px-2 py-2 text-right text-xs font-semibold tabular-nums"
                      >
                        {formatCurrency(colTotal)}
                      </td>
                    )
                  })}
                  <td className="px-3 py-2 text-right bg-primary/10">
                    <span className="text-sm font-bold tabular-nums text-primary">
                      {formatCurrency(total)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
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
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      entry.action === "approved" &&
                        "bg-success/10 text-success",
                      entry.action === "rejected" &&
                        "bg-destructive/10 text-destructive",
                      entry.action === "submitted" &&
                        "bg-primary/10 text-primary",
                      entry.action === "locked" &&
                        "bg-foreground/10 text-foreground",
                      (entry.action === "created" ||
                        entry.action === "edited") &&
                        "bg-muted text-muted-foreground",
                    )}
                  >
                    <User className="h-3.5 w-3.5" />
                  </div>
                  {idx < item.history.length - 1 && (
                    <div className="mt-1 w-px flex-1 bg-border" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{entry.actor}</span>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-medium capitalize"
                    >
                      {entry.action}
                    </Badge>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDate(entry.date)}
                  </div>
                  {entry.comment && (
                    <div className="mt-2 flex gap-1.5 rounded-md bg-muted/50 p-2.5">
                      <MessageSquare className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        {entry.comment}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action dialog */}
      <AlertDialog
        open={actionType !== null}
        onOpenChange={(open) => {
          if (!open) {
            setActionType(null)
            setComment("")
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "approve" && "Approve Budget"}
              {actionType === "reject" && "Reject Budget"}
              {actionType === "lock" && "Lock Budget"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "approve" &&
                `Approve budget ${item.budgetId} with total ${formatCurrency(total)}?`}
              {actionType === "reject" &&
                "This budget will be returned to the operator for revision. A comment is required."}
              {actionType === "lock" &&
                "Once locked, this budget cannot be modified. Proceed?"}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {(actionType === "approve" || actionType === "reject") && (
            <div className="flex flex-col gap-1.5 py-2">
              <Label className="text-xs">
                Comment{actionType === "reject" && " (required)"}
              </Label>
              <Textarea
                className="text-sm"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  actionType === "reject"
                    ? "Provide reason for rejection..."
                    : "Optional comment..."
                }
              />
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={actionType === "reject" && !comment.trim()}
              onClick={handleConfirm}
              className={cn(
                actionType === "reject" &&
                  "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                actionType === "approve" &&
                  "bg-success text-success-foreground hover:bg-success/90",
              )}
            >
              {actionType === "approve" && "Approve"}
              {actionType === "reject" && "Reject"}
              {actionType === "lock" && "Lock Budget"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
