"use client"

import { useState } from "react"
import { Check, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import type { ApprovalItem } from "@/lib/approval-types"

// ── Approve Dialog ──────────────────────────────────────────────
interface ApproveDialogProps {
  item: ApprovalItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (item: ApprovalItem, comment: string) => Promise<void>
}

export function ApproveDialog({
  item,
  open,
  onOpenChange,
  onConfirm,
}: ApproveDialogProps) {
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    if (!item) return
    setLoading(true)
    try {
      await onConfirm(item, comment)
      setComment("")
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  function handleOpenChange(v: boolean) {
    if (!loading) {
      onOpenChange(v)
      if (!v) setComment("")
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Approve Document</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to approve{" "}
            <span className="font-semibold text-foreground">
              {item?.docNumber}
            </span>
            . This action will advance the document through the approval
            workflow.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-2 py-2">
          <Label htmlFor="approve-comment" className="text-sm">
            Comment{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </Label>
          <Textarea
            id="approve-comment"
            placeholder="Add a comment for the audit trail..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            disabled={loading}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <Button
            className="bg-success text-success-foreground hover:bg-success/90"
            disabled={loading}
            onClick={handleConfirm}
          >
            {loading ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-1.5 h-4 w-4" />
            )}
            Confirm Approval
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ── Reject Dialog ───────────────────────────────────────────────
interface RejectDialogProps {
  item: ApprovalItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (item: ApprovalItem, comment: string) => Promise<void>
}

export function RejectDialog({
  item,
  open,
  onOpenChange,
  onConfirm,
}: RejectDialogProps) {
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleConfirm() {
    if (!item) return
    if (!comment.trim()) {
      setError("A reason is required when rejecting a document.")
      return
    }
    setError("")
    setLoading(true)
    try {
      await onConfirm(item, comment)
      setComment("")
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  function handleOpenChange(v: boolean) {
    if (!loading) {
      onOpenChange(v)
      if (!v) {
        setComment("")
        setError("")
      }
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reject Document</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to reject{" "}
            <span className="font-semibold text-foreground">
              {item?.docNumber}
            </span>
            . The document will be returned to the submitter.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-2 py-2">
          <Label htmlFor="reject-comment" className="text-sm">
            Reason for rejection{" "}
            <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="reject-comment"
            placeholder="Provide a reason for the rejection..."
            value={comment}
            onChange={(e) => {
              setComment(e.target.value)
              if (e.target.value.trim()) setError("")
            }}
            rows={3}
            disabled={loading}
            className={error ? "border-destructive" : ""}
          />
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={loading}
            onClick={handleConfirm}
          >
            {loading ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <X className="mr-1.5 h-4 w-4" />
            )}
            Confirm Rejection
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
