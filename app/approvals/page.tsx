"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { Inbox } from "lucide-react"
import { toast } from "sonner"
import { useAuthenticatedRole } from "@/components/role-context"
import {
  ApprovalFiltersBar,
  type ApprovalFilters,
} from "@/components/approvals/approval-filters"
import { ApprovalTable } from "@/components/approvals/approval-table"
import { ApprovalDetailSheet } from "@/components/approvals/approval-detail-sheet"
import {
  ApproveDialog,
  RejectDialog,
} from "@/components/approvals/approval-confirm-dialog"
import { MOCK_APPROVALS, type ApprovalItem } from "@/lib/approval-types"
import { getApprovalsFromStorage, updateApprovalInStorage } from "@/lib/submission-utils"

// ── Initial filter state ────────────────────────────────────────
const DEFAULT_FILTERS: ApprovalFilters = {
  search: "",
  type: "all",
  unit: "All Units",
  status: "all",
  amountMin: "",
  amountMax: "",
  dateFrom: "",
  dateTo: "",
}

export default function ApprovalsPage() {
  const context = useAuthenticatedRole()
  
  if (!context.user) {
    return null
  }
  
  const { user } = context

  // ── State ───────────────────────────────────────────────────
  const [approvals, setApprovals] = useState<ApprovalItem[]>(MOCK_APPROVALS)
  const [filters, setFilters] = useState<ApprovalFilters>(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [detailItem, setDetailItem] = useState<ApprovalItem | null>(null)
  const [approveItem, setApproveItem] = useState<ApprovalItem | null>(null)
  const [rejectItem, setRejectItem] = useState<ApprovalItem | null>(null)
  const [processedIds, setProcessedIds] = useState<Set<string>>(new Set())

  // ── Load submitted items from localStorage ──────────────────
  useEffect(() => {
    const storedApprovals = getApprovalsFromStorage()

    if (storedApprovals.length > 0) {
      setApprovals((prev) => {
        // Check if items already exist to avoid duplicates
        const existingIds = new Set(prev.map((a) => a.id))
        const uniqueNewItems = storedApprovals.filter((item) => !existingIds.has(item.id))
        return [...uniqueNewItems, ...prev]
      })
    }
  }, [])

  // ── Role guard ──────────────────────────────────────────────
  const hasAccess = user.role === "supervisor" || user.role === "admin"

  // ── Filtering logic ─────────────────────────────────────────
  const filtered = useMemo(() => {
    return approvals.filter((item) => {
      // Role-based filter: only show items assigned to current user's approval role
      // Supervisor sees items where currentApproverRole is "supervisor"
      // Admin sees all items (no role filter)
      if (user.role === "supervisor" && item.currentApproverRole !== "supervisor") {
        return false
      }

      // Search across doc number, description, submitter
      if (filters.search) {
        const q = filters.search.toLowerCase()
        const matchesSearch =
          item.docNumber.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.submittedBy.toLowerCase().includes(q)
        if (!matchesSearch) return false
      }
      // Type filter
      if (filters.type !== "all" && item.type !== filters.type) return false
      // Unit filter
      if (filters.unit !== "All Units" && item.unit !== filters.unit)
        return false
      // Status filter (default shows pending)
      if (filters.status !== "all" && item.status !== filters.status)
        return false
      // Amount range
      if (filters.amountMin && item.amount < Number(filters.amountMin))
        return false
      if (filters.amountMax && item.amount > Number(filters.amountMax))
        return false
      // Date range
      if (filters.dateFrom) {
        const from = new Date(filters.dateFrom)
        const submitted = new Date(item.submittedDate)
        if (submitted < from) return false
      }
      if (filters.dateTo) {
        const to = new Date(filters.dateTo)
        to.setHours(23, 59, 59, 999)
        const submitted = new Date(item.submittedDate)
        if (submitted > to) return false
      }
      return true
    })
  }, [approvals, filters, user.role])

  // Reset page when filters change
  const handleFiltersChange = useCallback((newFilters: ApprovalFilters) => {
    setFilters(newFilters)
    setPage(1)
  }, [])

  // ── Handlers ────────────────────────────────────────────────
  const handleViewDetail = useCallback((item: ApprovalItem) => {
    setDetailItem(item)
  }, [])

  const handleApproveClick = useCallback((item: ApprovalItem) => {
    setApproveItem(item)
  }, [])

  const handleRejectClick = useCallback((item: ApprovalItem) => {
    setRejectItem(item)
  }, [])

  const handleApproveConfirm = useCallback(
    async (item: ApprovalItem, comment: string) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1200))

      const updatedItem: ApprovalItem = {
        ...item,
        status: "approved" as const,
        history: [
          ...item.history,
          {
            approver: user.name,
            action: "approved" as const,
            date: new Date().toISOString(),
            comment,
          },
        ],
      }

      setApprovals((prev) =>
        prev.map((a) => (a.id === item.id ? updatedItem : a)),
      )

      // Save to localStorage for persistence
      updateApprovalInStorage(updatedItem)

      setProcessedIds((prev) => new Set(prev).add(item.id))
      setDetailItem(null)
      toast.success("Document Approved", {
        description: `${item.docNumber} has been approved successfully.${comment ? ` Comment: "${comment}"` : ""}`,
      })
    },
    [user.name],
  )

  const handleRejectConfirm = useCallback(
    async (item: ApprovalItem, comment: string) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1200))

      const updatedItem: ApprovalItem = {
        ...item,
        status: "rejected" as const,
        history: [
          ...item.history,
          {
            approver: user.name,
            action: "rejected" as const,
            date: new Date().toISOString(),
            comment,
          },
        ],
      }

      setApprovals((prev) =>
        prev.map((a) => (a.id === item.id ? updatedItem : a)),
      )

      // Save to localStorage for persistence
      updateApprovalInStorage(updatedItem)

      setProcessedIds((prev) => new Set(prev).add(item.id))
      setDetailItem(null)
      toast.error("Document Rejected", {
        description: `${item.docNumber} has been rejected. Reason: "${comment}"`,
      })
    },
    [user.name],
  )

  // ── Access denied screen ────────────────────────────────────
  if (!hasAccess) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <div className="rounded-full bg-destructive/10 p-4">
          <Inbox className="h-8 w-8 text-destructive" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold">Access Denied</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The Approval Inbox is only available to Supervisor and Admin
            Budget roles.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
        {/* ── Page header ──────────────────────────────────── */}
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Inbox className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-none">
              Approval Inbox
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Pending approvals requiring your action
            </p>
          </div>
        </div>

        {/* ── Filters ──────────────────────────────────────── */}
        <ApprovalFiltersBar
          filters={filters}
          onChange={handleFiltersChange}
          resultCount={filtered.length}
          totalCount={approvals.length}
        />

        {/* ── Table ────────────────────────────────────────── */}
        <ApprovalTable
          items={filtered}
          processedIds={processedIds}
          onViewDetail={handleViewDetail}
          onApprove={handleApproveClick}
          onReject={handleRejectClick}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* ── Detail Sheet ─────────────────────────────────────── */}
      <ApprovalDetailSheet
        item={detailItem}
        open={!!detailItem}
        onOpenChange={(open) => {
          if (!open) setDetailItem(null)
        }}
        isProcessed={detailItem ? processedIds.has(detailItem.id) : false}
        onApprove={handleApproveClick}
        onReject={handleRejectClick}
      />

      {/* ── Confirmation Dialogs ─────────────────────────────── */}
      <ApproveDialog
        item={approveItem}
        open={!!approveItem}
        onOpenChange={(open) => {
          if (!open) setApproveItem(null)
        }}
        onConfirm={handleApproveConfirm}
      />
      <RejectDialog
        item={rejectItem}
        open={!!rejectItem}
        onOpenChange={(open) => {
          if (!open) setRejectItem(null)
        }}
        onConfirm={handleRejectConfirm}
      />
    </>
  )
}
