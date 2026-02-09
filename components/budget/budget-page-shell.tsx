"use client"

import { useState, useMemo, useCallback } from "react"
import { Plus, Download } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useAuthenticatedRole } from "@/components/role-context"
import { AppHeader } from "@/components/app-header"
import {
  BudgetListFiltersBar,
  DEFAULT_BUDGET_FILTERS,
  type BudgetListFilters,
} from "@/components/budget/budget-list-filters"
import { BudgetListTable } from "@/components/budget/budget-list-table"
import { BudgetForm } from "@/components/budget/budget-form"
import { BudgetDetail } from "@/components/budget/budget-detail"
import {
  BUDGET_TYPE_LABELS,
  type BudgetItem,
  type BudgetType,
} from "@/lib/budget-types"

type View = "list" | "create" | "edit" | "detail"

interface BudgetPageShellProps {
  budgetType: BudgetType
  initialData: BudgetItem[]
}

export function BudgetPageShell({
  budgetType,
  initialData,
}: BudgetPageShellProps) {
  const context = useAuthenticatedRole()
  
  // Guard against null user during edge cases
  if (!context.user) {
    return null
  }
  
  const { user } = context
  const role = user.role

  // Data state (local mock)
  const [budgets, setBudgets] = useState<BudgetItem[]>(initialData)

  // View state
  const [view, setView] = useState<View>("list")
  const [selectedItem, setSelectedItem] = useState<BudgetItem | null>(null)

  // Filter + pagination state
  const [filters, setFilters] = useState<BudgetListFilters>(
    DEFAULT_BUDGET_FILTERS,
  )
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Filter logic
  const filtered = useMemo(() => {
    let items = budgets

    // Operator only sees their own + unit budgets; Supervisor sees own unit
    if (role === "operator") {
      items = items.filter((b) => b.createdBy === user.name)
    } else if (role === "supervisor") {
      items = items.filter((b) => b.unitKerja === user.unitName)
    }
    // admin and management see all

    if (filters.search) {
      const q = filters.search.toLowerCase()
      items = items.filter(
        (b) =>
          b.budgetId.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q),
      )
    }

    if (filters.unit !== "All Units") {
      items = items.filter((b) => b.unitKerja === filters.unit)
    }

    if (filters.status !== "all") {
      items = items.filter((b) => b.status === filters.status)
    }

    if (filters.fiscalYear !== "all") {
      items = items.filter(
        (b) => b.fiscalYear === Number.parseInt(filters.fiscalYear, 10),
      )
    }

    return items
  }, [budgets, filters, role, user.name, user.unitName])

  // Handler: reset page on filter change
  const handleFiltersChange = useCallback((f: BudgetListFilters) => {
    setFilters(f)
    setPage(1)
  }, [])

  // Navigation handlers
  const handleView = useCallback((item: BudgetItem) => {
    setSelectedItem(item)
    setView("detail")
  }, [])

  const handleEdit = useCallback((item: BudgetItem) => {
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

  // Submit from list (quick submit on draft)
  const handleSubmitFromList = useCallback(
    (item: BudgetItem) => {
      setBudgets((prev) =>
        prev.map((b) =>
          b.id === item.id
            ? {
                ...b,
                status: "submitted" as const,
                updatedDate: new Date().toISOString(),
                history: [
                  ...b.history,
                  {
                    actor: user.name,
                    action: "submitted" as const,
                    date: new Date().toISOString(),
                  },
                ],
              }
            : b,
        ),
      )
      toast.success(`Budget ${item.budgetId} submitted for approval.`)
    },
    [user.name],
  )

  // Save draft from form
  const handleSave = useCallback(
    (data: Partial<BudgetItem>) => {
      if (selectedItem) {
        // Update existing
        setBudgets((prev) =>
          prev.map((b) =>
            b.id === selectedItem.id
              ? {
                  ...b,
                  ...data,
                  status: "draft",
                  updatedDate: new Date().toISOString(),
                  history: [
                    ...b.history,
                    {
                      actor: user.name,
                      action: "edited" as const,
                      date: new Date().toISOString(),
                    },
                  ],
                }
              : b,
          ),
        )
        toast.success("Budget draft updated.")
      } else {
        // Create new
        const newId = `${budgetType === "project" ? "bp" : "br"}_${Date.now()}`
        const prefix = budgetType === "project" ? "BDG-PRJ" : "BDG-OPX"
        const seq = String(budgets.length + 1).padStart(4, "0")
        const newBudget: BudgetItem = {
          id: newId,
          budgetId: `${prefix}-${data.fiscalYear}-${seq}`,
          fiscalYear: data.fiscalYear || 2026,
          unitKerja: data.unitKerja || user.unitName,
          budgetType,
          description: data.description || "",
          status: "draft",
          lineItems: data.lineItems || [],
          createdBy: user.name,
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
          history: [
            {
              actor: user.name,
              action: "created",
              date: new Date().toISOString(),
            },
          ],
        }
        setBudgets((prev) => [newBudget, ...prev])
        toast.success(`Budget ${newBudget.budgetId} created as draft.`)
      }
      setView("list")
      setSelectedItem(null)
    },
    [selectedItem, budgets.length, budgetType, user.name, user.unitName],
  )

  // Submit from form
  const handleSubmitFromForm = useCallback(
    (data: Partial<BudgetItem>) => {
      if (selectedItem) {
        setBudgets((prev) =>
          prev.map((b) =>
            b.id === selectedItem.id
              ? {
                  ...b,
                  ...data,
                  status: "submitted" as const,
                  updatedDate: new Date().toISOString(),
                  history: [
                    ...b.history,
                    {
                      actor: user.name,
                      action: "submitted" as const,
                      date: new Date().toISOString(),
                    },
                  ],
                }
              : b,
          ),
        )
        toast.success(`Budget ${selectedItem.budgetId} submitted.`)
      } else {
        const newId = `${budgetType === "project" ? "bp" : "br"}_${Date.now()}`
        const prefix = budgetType === "project" ? "BDG-PRJ" : "BDG-OPX"
        const seq = String(budgets.length + 1).padStart(4, "0")
        const newBudget: BudgetItem = {
          id: newId,
          budgetId: `${prefix}-${data.fiscalYear}-${seq}`,
          fiscalYear: data.fiscalYear || 2026,
          unitKerja: data.unitKerja || user.unitName,
          budgetType,
          description: data.description || "",
          status: "submitted",
          lineItems: data.lineItems || [],
          createdBy: user.name,
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
          history: [
            {
              actor: user.name,
              action: "created",
              date: new Date().toISOString(),
            },
            {
              actor: user.name,
              action: "submitted",
              date: new Date().toISOString(),
            },
          ],
        }
        setBudgets((prev) => [newBudget, ...prev])
        toast.success(`Budget ${newBudget.budgetId} submitted.`)
      }
      setView("list")
      setSelectedItem(null)
    },
    [selectedItem, budgets.length, budgetType, user.name, user.unitName],
  )

  // Approval actions (from detail view)
  const handleApprove = useCallback(
    (item: BudgetItem, comment: string) => {
      const nextStatus =
        role === "supervisor" ? "supervisor_approved" : "admin_approved"
      setBudgets((prev) =>
        prev.map((b) =>
          b.id === item.id
            ? {
                ...b,
                status: nextStatus as BudgetItem["status"],
                updatedDate: new Date().toISOString(),
                history: [
                  ...b.history,
                  {
                    actor: user.name,
                    action: "approved" as const,
                    date: new Date().toISOString(),
                    comment: comment || undefined,
                  },
                ],
              }
            : b,
        ),
      )
      toast.success(`Budget ${item.budgetId} approved.`)
      setView("list")
      setSelectedItem(null)
    },
    [role, user.name],
  )

  const handleReject = useCallback(
    (item: BudgetItem, comment: string) => {
      setBudgets((prev) =>
        prev.map((b) =>
          b.id === item.id
            ? {
                ...b,
                status: "rejected" as const,
                updatedDate: new Date().toISOString(),
                history: [
                  ...b.history,
                  {
                    actor: user.name,
                    action: "rejected" as const,
                    date: new Date().toISOString(),
                    comment,
                  },
                ],
              }
            : b,
        ),
      )
      toast.warning(`Budget ${item.budgetId} rejected.`)
      setView("list")
      setSelectedItem(null)
    },
    [user.name],
  )

  const handleLock = useCallback(
    (item: BudgetItem) => {
      setBudgets((prev) =>
        prev.map((b) =>
          b.id === item.id
            ? {
                ...b,
                status: "locked" as const,
                updatedDate: new Date().toISOString(),
                history: [
                  ...b.history,
                  {
                    actor: user.name,
                    action: "locked" as const,
                    date: new Date().toISOString(),
                    comment: "Budget locked for execution.",
                  },
                ],
              }
            : b,
        ),
      )
      toast.success(`Budget ${item.budgetId} locked.`)
      setView("list")
      setSelectedItem(null)
    },
    [user.name],
  )

  // Render views
  if (view === "create") {
    return (
      <>
        <AppHeader />
        <div className="flex flex-1 flex-col p-4 md:p-6">
          <BudgetForm
            budgetType={budgetType}
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
          <BudgetForm
            budgetType={budgetType}
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
          <BudgetDetail
            item={selectedItem}
            role={role}
            onBack={handleBack}
            onApprove={handleApprove}
            onReject={handleReject}
            onLock={handleLock}
          />
        </div>
      </>
    )
  }

  // List view
  return (
    <>
      <AppHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        {/* Page heading */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">
              {budgetType === "project"
                ? "Budget Project"
                : "Budget Rutin (OPEX)"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {BUDGET_TYPE_LABELS[budgetType]} - FY {new Date().getFullYear()}
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
                Create Budget
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <BudgetListFiltersBar
          filters={filters}
          onChange={handleFiltersChange}
        />

        {/* Table */}
        <BudgetListTable
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
