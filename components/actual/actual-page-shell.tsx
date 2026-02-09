"use client"

import { useState, useMemo, useCallback } from "react"
import { Plus, Download } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useAuthenticatedRole } from "@/components/role-context"
import { AppHeader } from "@/components/app-header"
import {
  ActualListFiltersBar,
  DEFAULT_ACTUAL_FILTERS,
  type ActualListFilters,
} from "@/components/actual/actual-list-filters"
import { ActualListTable } from "@/components/actual/actual-list-table"
import { ActualForm } from "@/components/actual/actual-form"
import { ActualDetail } from "@/components/actual/actual-detail"
import {
  getActualTotal, formatCurrency,
  type ActualItem,
} from "@/lib/actual-types"

type View = "list" | "create" | "edit" | "detail"

interface ActualPageShellProps {
  initialData: ActualItem[]
}

export function ActualPageShell({ initialData }: ActualPageShellProps) {
  const context = useAuthenticatedRole()
  
  if (!context.user) {
    return null
  }
  
  const { user } = context
  const role = user.role

  const [actuals, setActuals] = useState<ActualItem[]>(initialData)
  const [view, setView] = useState<View>("list")
  const [selectedItem, setSelectedItem] = useState<ActualItem | null>(null)

  const [filters, setFilters] = useState<ActualListFilters>(DEFAULT_ACTUAL_FILTERS)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Filter logic
  const filtered = useMemo(() => {
    let items = actuals

    // Operator sees own only; Supervisor sees own unit
    if (role === "operator") {
      items = items.filter((a) => a.createdBy === user.name)
    } else if (role === "supervisor") {
      items = items.filter((a) => a.unitKerja === user.unitName)
    }

    if (filters.search) {
      const q = filters.search.toLowerCase()
      items = items.filter(
        (a) =>
          a.actualNumber.toLowerCase().includes(q) ||
          a.vendor.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.spkNumber.toLowerCase().includes(q),
      )
    }

    if (filters.unit !== "All Units") {
      items = items.filter((a) => a.unitKerja === filters.unit)
    }

    if (filters.status !== "all") {
      items = items.filter((a) => a.status === filters.status)
    }

    if (filters.fiscalYear !== "all") {
      items = items.filter((a) => a.fiscalYear === Number.parseInt(filters.fiscalYear, 10))
    }

    if (filters.spkNumber) {
      const sq = filters.spkNumber.toLowerCase()
      items = items.filter((a) => a.spkNumber.toLowerCase().includes(sq))
    }

    return items
  }, [actuals, filters, role, user.name, user.unitName])

  const handleFiltersChange = useCallback((f: ActualListFilters) => {
    setFilters(f)
    setPage(1)
  }, [])

  const handleView = useCallback((item: ActualItem) => {
    setSelectedItem(item)
    setView("detail")
  }, [])

  const handleEdit = useCallback((item: ActualItem) => {
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
    (item: ActualItem) => {
      setActuals((prev) =>
        prev.map((a) =>
          a.id === item.id
            ? {
                ...a,
                status: "submitted" as const,
                submittedDate: new Date().toISOString(),
                updatedDate: new Date().toISOString(),
                history: [
                  ...a.history,
                  { actor: user.name, action: "submitted" as const, date: new Date().toISOString() },
                ],
              }
            : a,
        ),
      )
      toast.success(`Actual ${item.actualNumber} submitted for approval.`)
    },
    [user.name],
  )

  // Save draft
  const handleSave = useCallback(
    (data: Partial<ActualItem>) => {
      if (selectedItem) {
        setActuals((prev) =>
          prev.map((a) =>
            a.id === selectedItem.id
              ? {
                  ...a,
                  ...data,
                  status: "draft" as const,
                  updatedDate: new Date().toISOString(),
                  history: [
                    ...a.history,
                    { actor: user.name, action: "edited" as const, date: new Date().toISOString() },
                  ],
                }
              : a,
          ),
        )
        toast.success("Actual draft updated.")
      } else {
        const newId = `act_${Date.now()}`
        const seq = String(actuals.length + 1).padStart(4, "0")
        const newItem: ActualItem = {
          id: newId,
          actualNumber: `ACT-${data.fiscalYear}-${seq}`,
          spkNumber: data.spkNumber || "",
          fiscalYear: data.fiscalYear || 2026,
          unitKerja: data.unitKerja || user.unitName,
          vendor: data.vendor || "",
          description: data.description || "",
          invoiceRef: data.invoiceRef || "",
          actualDate: data.actualDate || "",
          status: "draft",
          lineItems: data.lineItems || [],
          createdBy: user.name,
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
          submittedDate: null,
          postingDate: null,
          history: [
            { actor: user.name, action: "created", date: new Date().toISOString() },
          ],
        }
        setActuals((prev) => [newItem, ...prev])
        toast.success(`Actual ${newItem.actualNumber} created as draft.`)
      }
      setView("list")
      setSelectedItem(null)
    },
    [selectedItem, actuals.length, user.name, user.unitName],
  )

  // Submit from form
  const handleSubmitFromForm = useCallback(
    (data: Partial<ActualItem>) => {
      const now = new Date().toISOString()
      if (selectedItem) {
        setActuals((prev) =>
          prev.map((a) =>
            a.id === selectedItem.id
              ? {
                  ...a,
                  ...data,
                  status: "submitted" as const,
                  submittedDate: now,
                  updatedDate: now,
                  history: [
                    ...a.history,
                    { actor: user.name, action: "submitted" as const, date: now },
                  ],
                }
              : a,
          ),
        )
        toast.success(`Actual ${selectedItem.actualNumber} submitted.`)
      } else {
        const newId = `act_${Date.now()}`
        const seq = String(actuals.length + 1).padStart(4, "0")
        const newItem: ActualItem = {
          id: newId,
          actualNumber: `ACT-${data.fiscalYear}-${seq}`,
          spkNumber: data.spkNumber || "",
          fiscalYear: data.fiscalYear || 2026,
          unitKerja: data.unitKerja || user.unitName,
          vendor: data.vendor || "",
          description: data.description || "",
          invoiceRef: data.invoiceRef || "",
          actualDate: data.actualDate || "",
          status: "submitted",
          lineItems: data.lineItems || [],
          createdBy: user.name,
          createdDate: now,
          updatedDate: now,
          submittedDate: now,
          postingDate: null,
          history: [
            { actor: user.name, action: "created", date: now },
            { actor: user.name, action: "submitted", date: now },
          ],
        }
        setActuals((prev) => [newItem, ...prev])
        toast.success(`Actual ${newItem.actualNumber} submitted.`)
      }
      setView("list")
      setSelectedItem(null)
    },
    [selectedItem, actuals.length, user.name, user.unitName],
  )

  // Approval
  const handleApprove = useCallback(
    (item: ActualItem, comment: string) => {
      const nextStatus = role === "supervisor" ? "supervisor_approved" : "admin_approved"
      setActuals((prev) =>
        prev.map((a) =>
          a.id === item.id
            ? {
                ...a,
                status: nextStatus as ActualItem["status"],
                updatedDate: new Date().toISOString(),
                history: [
                  ...a.history,
                  { actor: user.name, action: "approved" as const, date: new Date().toISOString(), comment: comment || undefined },
                ],
              }
            : a,
        ),
      )
      toast.success(`Actual ${item.actualNumber} approved.`)
      setView("list")
      setSelectedItem(null)
    },
    [role, user.name],
  )

  const handleReject = useCallback(
    (item: ActualItem, comment: string) => {
      setActuals((prev) =>
        prev.map((a) =>
          a.id === item.id
            ? {
                ...a,
                status: "rejected" as const,
                updatedDate: new Date().toISOString(),
                history: [
                  ...a.history,
                  { actor: user.name, action: "rejected" as const, date: new Date().toISOString(), comment },
                ],
              }
            : a,
        ),
      )
      toast.warning(`Actual ${item.actualNumber} rejected.`)
      setView("list")
      setSelectedItem(null)
    },
    [user.name],
  )

  // Post actual (reduces commitment + budget)
  const handlePost = useCallback(
    (item: ActualItem) => {
      const now = new Date().toISOString()
      setActuals((prev) =>
        prev.map((a) =>
          a.id === item.id
            ? {
                ...a,
                status: "posted" as const,
                postingDate: now,
                updatedDate: now,
                history: [
                  ...a.history,
                  {
                    actor: user.name,
                    action: "posted" as const,
                    date: now,
                    comment: "Posted. Commitment reduced. Available budget decreased.",
                  },
                ],
              }
            : a,
        ),
      )
      toast.success(`Actual ${item.actualNumber} posted. Commitment reduced by ${formatCurrency(getActualTotal(item))}.`)
      setView("list")
      setSelectedItem(null)
    },
    [user.name],
  )

  // Reverse posted actual
  const handleReverse = useCallback(
    (item: ActualItem, reason: string) => {
      setActuals((prev) =>
        prev.map((a) =>
          a.id === item.id
            ? {
                ...a,
                status: "reversed" as const,
                updatedDate: new Date().toISOString(),
                history: [
                  ...a.history,
                  {
                    actor: user.name,
                    action: "reversed" as const,
                    date: new Date().toISOString(),
                    comment: reason,
                  },
                ],
              }
            : a,
        ),
      )
      toast.success(`Actual ${item.actualNumber} reversed. Commitment restored.`)
      setView("list")
      setSelectedItem(null)
    },
    [user.name],
  )

  // ── Render views ──────────────────────────────────────────────

  if (view === "create" && role === "operator") {
    return (
      <>
        <AppHeader />
        <div className="flex flex-1 flex-col p-4 md:p-6">
          <ActualForm
            unitKerja={user.unitName}
            onSave={handleSave}
            onSubmit={handleSubmitFromForm}
            onCancel={handleBack}
          />
        </div>
      </>
    )
  }

  if (view === "edit" && selectedItem && role === "operator") {
    return (
      <>
        <AppHeader />
        <div className="flex flex-1 flex-col p-4 md:p-6">
          <ActualForm
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
          <ActualDetail
            item={selectedItem}
            role={role}
            onBack={handleBack}
            onApprove={handleApprove}
            onReject={handleReject}
            onPost={handlePost}
            onReverse={handleReverse}
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
            <h1 className="text-lg font-semibold">Actual Realization</h1>
            <p className="text-sm text-muted-foreground">
              Record actual spending against approved SPK commitments - FY {new Date().getFullYear()}
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
                Create Actual
              </Button>
            )}
          </div>
        </div>

        <ActualListFiltersBar filters={filters} onChange={handleFiltersChange} />

        <ActualListTable
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
