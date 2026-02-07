"use client"

import { useState, useMemo, useCallback } from "react"
import { Plus, Download } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useAuthenticatedRole } from "@/components/role-context"
import { AppHeader } from "@/components/app-header"
import {
  RevisionListFiltersBar,
  DEFAULT_REVISION_FILTERS,
  type RevisionListFilters,
} from "@/components/revision/revision-list-filters"
import { RevisionListTable } from "@/components/revision/revision-list-table"
import { RevisionForm } from "@/components/revision/revision-form"
import { RevisionDetail } from "@/components/revision/revision-detail"
import {
  type RevisionItem,
} from "@/lib/revision-types"

type View = "list" | "create" | "edit" | "detail"

interface RevisionPageShellProps {
  initialData: RevisionItem[]
}

export function RevisionPageShell({ initialData }: RevisionPageShellProps) {
  const { user } = useAuthenticatedRole()
  const role = user.role

  const [revisions, setRevisions] = useState<RevisionItem[]>(initialData)
  const [view, setView] = useState<View>("list")
  const [selectedItem, setSelectedItem] = useState<RevisionItem | null>(null)

  const [filters, setFilters] = useState<RevisionListFilters>(DEFAULT_REVISION_FILTERS)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Filter logic
  const filtered = useMemo(() => {
    let items = revisions

    // Operator sees own only; Supervisor sees own unit
    if (role === "operator") {
      items = items.filter((r) => r.createdBy === user.name)
    } else if (role === "supervisor") {
      items = items.filter((r) => r.unitKerja === user.unitName)
    }

    if (filters.search) {
      const q = filters.search.toLowerCase()
      items = items.filter(
        (r) =>
          r.revisionId.toLowerCase().includes(q) ||
          r.reason.toLowerCase().includes(q),
      )
    }

    if (filters.unit !== "All Units") {
      items = items.filter((r) => r.unitKerja === filters.unit)
    }

    if (filters.status !== "all") {
      items = items.filter((r) => r.status === filters.status)
    }

    if (filters.revisionType !== "all") {
      items = items.filter((r) => r.revisionType === filters.revisionType)
    }

    if (filters.fiscalYear !== "all") {
      items = items.filter((r) => r.fiscalYear === Number.parseInt(filters.fiscalYear, 10))
    }

    return items
  }, [revisions, filters, role, user.name, user.unitName])

  const handleFiltersChange = useCallback((f: RevisionListFilters) => {
    setFilters(f)
    setPage(1)
  }, [])

  const handleView = useCallback((item: RevisionItem) => {
    setSelectedItem(item)
    setView("detail")
  }, [])

  const handleEdit = useCallback((item: RevisionItem) => {
    setSelectedItem(item)
    setView("edit")
  }, [])

  const handleCreate = useCallback(() => {
    setSelectedItem(null)
    setView("create")
  }, [])

  const handleBack = useCallback(() => {
    setSelectedItem(null)
    setView("list")
  }, [])

  // Quick submit from list
  const handleSubmitFromList = useCallback(
    (item: RevisionItem) => {
      setRevisions((prev) =>
        prev.map((r) =>
          r.id === item.id
            ? {
                ...r,
                status: "submitted" as const,
                submittedDate: new Date().toISOString(),
                updatedDate: new Date().toISOString(),
                history: [
                  ...r.history,
                  { actor: user.name, action: "submitted" as const, date: new Date().toISOString() },
                ],
              }
            : r,
        ),
      )
      toast.success(`Revision ${item.revisionId} submitted for approval.`)
    },
    [user.name],
  )

  // Save draft
  const handleSave = useCallback(
    (data: Partial<RevisionItem>) => {
      if (selectedItem) {
        setRevisions((prev) =>
          prev.map((r) =>
            r.id === selectedItem.id
              ? {
                  ...r,
                  ...data,
                  status: "draft" as const,
                  updatedDate: new Date().toISOString(),
                  history: [
                    ...r.history,
                    { actor: user.name, action: "edited" as const, date: new Date().toISOString() },
                  ],
                }
              : r,
          ),
        )
        toast.success("Revision draft updated.")
      } else {
        const newId = `rev_${Date.now()}`
        const seq = String(revisions.length + 1).padStart(4, "0")
        const newRevision: RevisionItem = {
          id: newId,
          revisionId: `REV-${data.fiscalYear}-${seq}`,
          fiscalYear: data.fiscalYear || 2026,
          unitKerja: data.unitKerja || user.unitName,
          relatedBudgetId: data.relatedBudgetId || "",
          revisionType: data.revisionType || "increase",
          reason: data.reason || "",
          status: "draft",
          lineItems: data.lineItems || [],
          createdBy: user.name,
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
          submittedDate: null,
          history: [
            { actor: user.name, action: "created", date: new Date().toISOString() },
          ],
        }
        setRevisions((prev) => [newRevision, ...prev])
        toast.success(`Revision ${newRevision.revisionId} created as draft.`)
      }
      setView("list")
      setSelectedItem(null)
    },
    [selectedItem, revisions.length, user.name, user.unitName],
  )

  // Submit from form
  const handleSubmitFromForm = useCallback(
    (data: Partial<RevisionItem>) => {
      const now = new Date().toISOString()
      if (selectedItem) {
        setRevisions((prev) =>
          prev.map((r) =>
            r.id === selectedItem.id
              ? {
                  ...r,
                  ...data,
                  status: "submitted" as const,
                  submittedDate: now,
                  updatedDate: now,
                  history: [
                    ...r.history,
                    { actor: user.name, action: "submitted" as const, date: now },
                  ],
                }
              : r,
          ),
        )
        toast.success(`Revision ${selectedItem.revisionId} submitted.`)
      } else {
        const newId = `rev_${Date.now()}`
        const seq = String(revisions.length + 1).padStart(4, "0")
        const newRevision: RevisionItem = {
          id: newId,
          revisionId: `REV-${data.fiscalYear}-${seq}`,
          fiscalYear: data.fiscalYear || 2026,
          unitKerja: data.unitKerja || user.unitName,
          relatedBudgetId: data.relatedBudgetId || "",
          revisionType: data.revisionType || "increase",
          reason: data.reason || "",
          status: "submitted",
          lineItems: data.lineItems || [],
          createdBy: user.name,
          createdDate: now,
          updatedDate: now,
          submittedDate: now,
          history: [
            { actor: user.name, action: "created", date: now },
            { actor: user.name, action: "submitted", date: now },
          ],
        }
        setRevisions((prev) => [newRevision, ...prev])
        toast.success(`Revision ${newRevision.revisionId} submitted.`)
      }
      setView("list")
      setSelectedItem(null)
    },
    [selectedItem, revisions.length, user.name, user.unitName],
  )

  // Approval
  const handleApprove = useCallback(
    (item: RevisionItem, comment: string) => {
      const nextStatus = role === "supervisor" ? "supervisor_approved" : "admin_approved"
      setRevisions((prev) =>
        prev.map((r) =>
          r.id === item.id
            ? {
                ...r,
                status: nextStatus as RevisionItem["status"],
                updatedDate: new Date().toISOString(),
                history: [
                  ...r.history,
                  { actor: user.name, action: "approved" as const, date: new Date().toISOString(), comment: comment || undefined },
                ],
              }
            : r,
        ),
      )
      toast.success(`Revision ${item.revisionId} approved.`)
      setView("list")
      setSelectedItem(null)
    },
    [role, user.name],
  )

  const handleReject = useCallback(
    (item: RevisionItem, comment: string) => {
      setRevisions((prev) =>
        prev.map((r) =>
          r.id === item.id
            ? {
                ...r,
                status: "rejected" as const,
                updatedDate: new Date().toISOString(),
                history: [
                  ...r.history,
                  { actor: user.name, action: "rejected" as const, date: new Date().toISOString(), comment },
                ],
              }
            : r,
        ),
      )
      toast.warning(`Revision ${item.revisionId} rejected.`)
      setView("list")
      setSelectedItem(null)
    },
    [user.name],
  )

  // Apply revision (irreversible)
  const handleApplyRevision = useCallback(
    (item: RevisionItem) => {
      setRevisions((prev) =>
        prev.map((r) =>
          r.id === item.id
            ? {
                ...r,
                status: "applied" as const,
                updatedDate: new Date().toISOString(),
                history: [
                  ...r.history,
                  {
                    actor: user.name,
                    action: "applied" as const,
                    date: new Date().toISOString(),
                    comment: "Applied to budget baseline. Audit trail created.",
                  },
                ],
              }
            : r,
        ),
      )
      toast.success(`Revision ${item.revisionId} applied to budget baseline.`)
      setView("list")
      setSelectedItem(null)
    },
    [user.name],
  )

  // ── Render views ──────────────────────────────────────────────

  if (view === "create") {
    return (
      <>
        <AppHeader />
        <div className="flex flex-1 flex-col p-4 md:p-6">
          <RevisionForm
            unitKerja={user.unitName}
            onSave={handleSave}
            onSubmit={handleSubmitFromForm}
            onCancel={handleBack}
          />
        </div>
      </>
    )
  }

  if (view === "edit" && selectedItem) {
    return (
      <>
        <AppHeader />
        <div className="flex flex-1 flex-col p-4 md:p-6">
          <RevisionForm
            editItem={selectedItem}
            unitKerja={selectedItem.unitKerja}
            onSave={handleSave}
            onSubmit={handleSubmitFromForm}
            onCancel={handleBack}
          />
        </div>
      </>
    )
  }

  if (view === "detail" && selectedItem) {
    return (
      <>
        <AppHeader />
        <div className="flex flex-1 flex-col p-4 md:p-6">
          <RevisionDetail
            item={selectedItem}
            role={role}
            onBack={handleBack}
            onApprove={handleApprove}
            onReject={handleReject}
            onApplyRevision={handleApplyRevision}
          />
        </div>
      </>
    )
  }

  // ── List view ─────────────────────────────────────────────────
  return (
    <>
      <AppHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Budget Revision / Unbudget</h1>
            <p className="text-sm text-muted-foreground">
              Manage budget revisions, reallocations, and unbudget requests - FY {new Date().getFullYear()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 bg-transparent">
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            {role === "operator" && (
              <Button size="sm" className="gap-1.5" onClick={handleCreate}>
                <Plus className="h-3.5 w-3.5" />
                Create Revision
              </Button>
            )}
          </div>
        </div>

        <RevisionListFiltersBar filters={filters} onChange={handleFiltersChange} />

        <RevisionListTable
          items={filtered}
          role={role}
          onView={handleView}
          onEdit={handleEdit}
          onSubmit={handleSubmitFromList}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </>
  )
}
