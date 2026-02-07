"use client"

import { useState, useMemo, useCallback } from "react"
import { Plus, Download } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useAuthenticatedRole } from "@/components/role-context"
import { AppHeader } from "@/components/app-header"
import {
  SpkListFiltersBar,
  DEFAULT_SPK_FILTERS,
  type SpkListFilters,
} from "@/components/spending/spk-list-filters"
import { SpkListTable } from "@/components/spending/spk-list-table"
import { SpkForm } from "@/components/spending/spk-form"
import { SpkDetail } from "@/components/spending/spk-detail"
import {
  type SpkItem,
} from "@/lib/spk-types"

type View = "list" | "create" | "edit" | "detail"

interface SpkPageShellProps {
  initialData: SpkItem[]
}

export function SpkPageShell({ initialData }: SpkPageShellProps) {
  const { user } = useAuthenticatedRole()
  const role = user.role

  const [spks, setSpks] = useState<SpkItem[]>(initialData)
  const [view, setView] = useState<View>("list")
  const [selectedItem, setSelectedItem] = useState<SpkItem | null>(null)

  const [filters, setFilters] = useState<SpkListFilters>(DEFAULT_SPK_FILTERS)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Filter logic
  const filtered = useMemo(() => {
    let items = spks

    // Operator sees own only; Supervisor sees own unit
    if (role === "operator") {
      items = items.filter((s) => s.createdBy === user.name)
    } else if (role === "supervisor") {
      items = items.filter((s) => s.unitKerja === user.unitName)
    }

    if (filters.search) {
      const q = filters.search.toLowerCase()
      items = items.filter(
        (s) =>
          s.spkNumber.toLowerCase().includes(q) ||
          s.vendor.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q),
      )
    }

    if (filters.unit !== "All Units") {
      items = items.filter((s) => s.unitKerja === filters.unit)
    }

    if (filters.status !== "all") {
      items = items.filter((s) => s.status === filters.status)
    }

    if (filters.fiscalYear !== "all") {
      items = items.filter((s) => s.fiscalYear === Number.parseInt(filters.fiscalYear, 10))
    }

    if (filters.vendor) {
      const vq = filters.vendor.toLowerCase()
      items = items.filter((s) => s.vendor.toLowerCase().includes(vq))
    }

    return items
  }, [spks, filters, role, user.name, user.unitName])

  const handleFiltersChange = useCallback((f: SpkListFilters) => {
    setFilters(f)
    setPage(1)
  }, [])

  const handleView = useCallback((item: SpkItem) => {
    setSelectedItem(item)
    setView("detail")
  }, [])

  const handleEdit = useCallback((item: SpkItem) => {
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
    (item: SpkItem) => {
      setSpks((prev) =>
        prev.map((s) =>
          s.id === item.id
            ? {
                ...s,
                status: "submitted" as const,
                submittedDate: new Date().toISOString(),
                updatedDate: new Date().toISOString(),
                history: [
                  ...s.history,
                  { actor: user.name, action: "submitted" as const, date: new Date().toISOString() },
                ],
              }
            : s,
        ),
      )
      toast.success(`SPK ${item.spkNumber} submitted for approval.`)
    },
    [user.name],
  )

  // Save draft
  const handleSave = useCallback(
    (data: Partial<SpkItem>) => {
      if (selectedItem) {
        setSpks((prev) =>
          prev.map((s) =>
            s.id === selectedItem.id
              ? {
                  ...s,
                  ...data,
                  status: "draft" as const,
                  updatedDate: new Date().toISOString(),
                  history: [
                    ...s.history,
                    { actor: user.name, action: "edited" as const, date: new Date().toISOString() },
                  ],
                }
              : s,
          ),
        )
        toast.success("SPK draft updated.")
      } else {
        const newId = `spk_${Date.now()}`
        const seq = String(spks.length + 1).padStart(4, "0")
        const newSpk: SpkItem = {
          id: newId,
          spkNumber: `SPK-${data.fiscalYear}-${seq}`,
          fiscalYear: data.fiscalYear || 2026,
          unitKerja: data.unitKerja || user.unitName,
          vendor: data.vendor || "",
          description: data.description || "",
          contractRef: data.contractRef || "",
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
        setSpks((prev) => [newSpk, ...prev])
        toast.success(`SPK ${newSpk.spkNumber} created as draft.`)
      }
      setView("list")
      setSelectedItem(null)
    },
    [selectedItem, spks.length, user.name, user.unitName],
  )

  // Submit from form
  const handleSubmitFromForm = useCallback(
    (data: Partial<SpkItem>) => {
      const now = new Date().toISOString()
      if (selectedItem) {
        setSpks((prev) =>
          prev.map((s) =>
            s.id === selectedItem.id
              ? {
                  ...s,
                  ...data,
                  status: "submitted" as const,
                  submittedDate: now,
                  updatedDate: now,
                  history: [
                    ...s.history,
                    { actor: user.name, action: "submitted" as const, date: now },
                  ],
                }
              : s,
          ),
        )
        toast.success(`SPK ${selectedItem.spkNumber} submitted.`)
      } else {
        const newId = `spk_${Date.now()}`
        const seq = String(spks.length + 1).padStart(4, "0")
        const newSpk: SpkItem = {
          id: newId,
          spkNumber: `SPK-${data.fiscalYear}-${seq}`,
          fiscalYear: data.fiscalYear || 2026,
          unitKerja: data.unitKerja || user.unitName,
          vendor: data.vendor || "",
          description: data.description || "",
          contractRef: data.contractRef || "",
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
        setSpks((prev) => [newSpk, ...prev])
        toast.success(`SPK ${newSpk.spkNumber} submitted.`)
      }
      setView("list")
      setSelectedItem(null)
    },
    [selectedItem, spks.length, user.name, user.unitName],
  )

  // Approval
  const handleApprove = useCallback(
    (item: SpkItem, comment: string) => {
      const nextStatus = role === "supervisor" ? "supervisor_approved" : "admin_approved"
      setSpks((prev) =>
        prev.map((s) =>
          s.id === item.id
            ? {
                ...s,
                status: nextStatus as SpkItem["status"],
                updatedDate: new Date().toISOString(),
                history: [
                  ...s.history,
                  { actor: user.name, action: "approved" as const, date: new Date().toISOString(), comment: comment || undefined },
                ],
              }
            : s,
        ),
      )
      toast.success(`SPK ${item.spkNumber} approved.`)
      setView("list")
      setSelectedItem(null)
    },
    [role, user.name],
  )

  const handleReject = useCallback(
    (item: SpkItem, comment: string) => {
      setSpks((prev) =>
        prev.map((s) =>
          s.id === item.id
            ? {
                ...s,
                status: "rejected" as const,
                updatedDate: new Date().toISOString(),
                history: [
                  ...s.history,
                  { actor: user.name, action: "rejected" as const, date: new Date().toISOString(), comment },
                ],
              }
            : s,
        ),
      )
      toast.warning(`SPK ${item.spkNumber} rejected.`)
      setView("list")
      setSelectedItem(null)
    },
    [user.name],
  )

  // Activate SPK (commit budget)
  const handleActivate = useCallback(
    (item: SpkItem) => {
      setSpks((prev) =>
        prev.map((s) =>
          s.id === item.id
            ? {
                ...s,
                status: "active" as const,
                updatedDate: new Date().toISOString(),
                history: [
                  ...s.history,
                  {
                    actor: user.name,
                    action: "activated" as const,
                    date: new Date().toISOString(),
                    comment: "Budget committed. SPK activated.",
                  },
                ],
              }
            : s,
        ),
      )
      toast.success(`SPK ${item.spkNumber} activated. Budget committed.`)
      setView("list")
      setSelectedItem(null)
    },
    [user.name],
  )

  // Cancel SPK (release commitment)
  const handleCancel = useCallback(
    (item: SpkItem, reason: string) => {
      setSpks((prev) =>
        prev.map((s) =>
          s.id === item.id
            ? {
                ...s,
                status: "cancelled" as const,
                updatedDate: new Date().toISOString(),
                history: [
                  ...s.history,
                  {
                    actor: user.name,
                    action: "cancelled" as const,
                    date: new Date().toISOString(),
                    comment: reason,
                  },
                ],
              }
            : s,
        ),
      )
      toast.success(`SPK ${item.spkNumber} cancelled. Commitment released.`)
      setView("list")
      setSelectedItem(null)
    },
    [user.name],
  )

  // Management: read-only gate
  if (role === "management") {
    // Show list but no create/edit actions
  }

  // ── Render views ──────────────────────────────────────────────

  if (view === "create" && role === "operator") {
    return (
      <>
        <AppHeader />
        <div className="flex flex-1 flex-col p-4 md:p-6">
          <SpkForm
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
          <SpkForm
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
          <SpkDetail
            item={selectedItem}
            role={role}
            onBack={handleBack}
            onApprove={handleApprove}
            onReject={handleReject}
            onActivate={handleActivate}
            onCancel={handleCancel}
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
            <h1 className="text-lg font-semibold">Spending Request (SPK)</h1>
            <p className="text-sm text-muted-foreground">
              Manage spending requests and budget commitments - FY {new Date().getFullYear()}
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
                Create SPK
              </Button>
            )}
          </div>
        </div>

        <SpkListFiltersBar filters={filters} onChange={handleFiltersChange} />

        <SpkListTable
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
