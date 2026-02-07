"use client"

import { useState, useCallback, useMemo } from "react"
import { Plus, Trash2, ArrowLeft, Save, SendHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  MONTHS,
  COA_OPTIONS,
  COST_CENTER_OPTIONS,
  BUDGET_TYPE_LABELS,
  formatCurrency,
  getLineTotal,
  type BudgetItem,
  type BudgetLineItem,
  type BudgetType,
} from "@/lib/budget-types"
import { cn } from "@/lib/utils"

interface BudgetFormProps {
  budgetType: BudgetType
  editItem?: BudgetItem | null
  unitKerja: string
  onSave: (data: Partial<BudgetItem>) => void
  onSubmit: (data: Partial<BudgetItem>) => void
  onCancel: () => void
}

function createEmptyLine(): BudgetLineItem {
  return {
    id: `new_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    coa: "",
    costCenter: "",
    description: "",
    monthly: Array(12).fill(0),
  }
}

// Format a large number with thousand separators for display
function displayNum(v: number): string {
  if (v === 0) return ""
  return new Intl.NumberFormat("id-ID").format(v)
}

// Parse display string back to number
function parseNum(s: string): number {
  const cleaned = s.replace(/[^0-9]/g, "")
  return cleaned === "" ? 0 : Number.parseInt(cleaned, 10)
}

export function BudgetForm({
  budgetType,
  editItem,
  unitKerja,
  onSave,
  onSubmit,
  onCancel,
}: BudgetFormProps) {
  const isEditing = !!editItem

  // Header state
  const [fiscalYear, setFiscalYear] = useState(
    editItem?.fiscalYear?.toString() || "2026",
  )
  const [description, setDescription] = useState(editItem?.description || "")

  // Line items state
  const [lines, setLines] = useState<BudgetLineItem[]>(
    editItem?.lineItems?.length ? editItem.lineItems : [createEmptyLine()],
  )

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Submit dialog
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)

  const addLine = useCallback(() => {
    setLines((prev) => [...prev, createEmptyLine()])
  }, [])

  const removeLine = useCallback(
    (idx: number) => {
      if (lines.length <= 1) return
      setLines((prev) => prev.filter((_, i) => i !== idx))
    },
    [lines.length],
  )

  const updateLineField = useCallback(
    (idx: number, field: keyof BudgetLineItem, value: string) => {
      setLines((prev) =>
        prev.map((line, i) =>
          i === idx ? { ...line, [field]: value } : line,
        ),
      )
    },
    [],
  )

  const updateMonthly = useCallback(
    (lineIdx: number, monthIdx: number, value: string) => {
      setLines((prev) =>
        prev.map((line, i) => {
          if (i !== lineIdx) return line
          const newMonthly = [...line.monthly]
          newMonthly[monthIdx] = parseNum(value)
          return { ...line, monthly: newMonthly }
        }),
      )
    },
    [],
  )

  // Column totals
  const monthlyTotals = useMemo(() => {
    const totals = Array(12).fill(0) as number[]
    for (const line of lines) {
      for (let m = 0; m < 12; m++) {
        totals[m] += line.monthly[m]
      }
    }
    return totals
  }, [lines])

  const grandTotal = useMemo(
    () => lines.reduce((sum, row) => sum + getLineTotal(row), 0),
    [lines],
  )

  // Validate
  function validate(): boolean {
    const newErrors: Record<string, string> = {}

    if (!description.trim()) {
      newErrors.description = "Description is required"
    }

    const usedCoas = new Set<string>()
    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].coa) {
        newErrors[`line_${i}_coa`] = "COA is required"
      } else if (usedCoas.has(lines[i].coa)) {
        newErrors[`line_${i}_coa`] = "Duplicate COA"
      }
      usedCoas.add(lines[i].coa)

      if (!lines[i].costCenter) {
        newErrors[`line_${i}_cc`] = "Cost Center is required"
      }
      if (!lines[i].description.trim()) {
        newErrors[`line_${i}_desc`] = "Description is required"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function buildPayload(): Partial<BudgetItem> {
    return {
      ...(editItem || {}),
      fiscalYear: Number.parseInt(fiscalYear, 10),
      unitKerja,
      budgetType,
      description,
      lineItems: lines,
    }
  }

  function handleSave() {
    if (validate()) {
      onSave(buildPayload())
    }
  }

  function handleSubmitConfirm() {
    if (validate()) {
      setShowSubmitDialog(true)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground"
          onClick={onCancel}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to List
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 bg-transparent" onClick={handleSave}>
            <Save className="h-3.5 w-3.5" />
            Save Draft
          </Button>
          <Button size="sm" className="gap-1.5" onClick={handleSubmitConfirm}>
            <SendHorizontal className="h-3.5 w-3.5" />
            Submit
          </Button>
        </div>
      </div>

      {/* Header section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">
            {isEditing ? "Edit Budget" : "Create New Budget"} -{" "}
            {BUDGET_TYPE_LABELS[budgetType]}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Fiscal Year</Label>
              <Select value={fiscalYear} onValueChange={setFiscalYear}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Unit Kerja</Label>
              <Input className="h-9" value={unitKerja} disabled />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Budget Type</Label>
              <Input
                className="h-9"
                value={BUDGET_TYPE_LABELS[budgetType]}
                disabled
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
              <Label className="text-xs">
                Description{" "}
                {errors.description && (
                  <span className="text-destructive">*</span>
                )}
              </Label>
              <Textarea
                className="min-h-[36px] resize-none text-sm"
                rows={1}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter budget description..."
              />
              {errors.description && (
                <span className="text-[11px] text-destructive">
                  {errors.description}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget detail grid */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Budget Detail</CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 bg-transparent"
              onClick={addLine}
            >
              <Plus className="h-3.5 w-3.5" />
              Add Row
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <table className="w-full text-sm border-collapse min-w-[1200px]">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="sticky left-0 z-20 bg-muted/40 px-3 py-2 text-left text-xs font-medium w-[40px]">
                    #
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium w-[180px]">
                    COA
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium w-[160px]">
                    Cost Center
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium w-[180px]">
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
                  <th className="px-2 py-2 text-center text-xs font-medium w-[50px]">
                    <span className="sr-only">Delete</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, idx) => {
                  const lineTotal = getLineTotal(line)
                  return (
                    <tr
                      key={line.id}
                      className={cn(
                        "border-b transition-colors",
                        idx % 2 === 1 && "bg-muted/10",
                      )}
                    >
                      <td className="sticky left-0 z-20 bg-card px-3 py-1.5 text-xs text-muted-foreground tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="px-1.5 py-1">
                        <Select
                          value={line.coa}
                          onValueChange={(v) =>
                            updateLineField(idx, "coa", v)
                          }
                        >
                          <SelectTrigger
                            className={cn(
                              "h-8 text-xs",
                              errors[`line_${idx}_coa`] &&
                                "border-destructive",
                            )}
                          >
                            <SelectValue placeholder="Select COA" />
                          </SelectTrigger>
                          <SelectContent>
                            {COA_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors[`line_${idx}_coa`] && (
                          <span className="text-[10px] text-destructive">
                            {errors[`line_${idx}_coa`]}
                          </span>
                        )}
                      </td>
                      <td className="px-1.5 py-1">
                        <Select
                          value={line.costCenter}
                          onValueChange={(v) =>
                            updateLineField(idx, "costCenter", v)
                          }
                        >
                          <SelectTrigger
                            className={cn(
                              "h-8 text-xs",
                              errors[`line_${idx}_cc`] &&
                                "border-destructive",
                            )}
                          >
                            <SelectValue placeholder="Select CC" />
                          </SelectTrigger>
                          <SelectContent>
                            {COST_CENTER_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-1.5 py-1">
                        <Input
                          className={cn(
                            "h-8 text-xs",
                            errors[`line_${idx}_desc`] &&
                              "border-destructive",
                          )}
                          value={line.description}
                          onChange={(e) =>
                            updateLineField(idx, "description", e.target.value)
                          }
                          placeholder="Line description"
                        />
                      </td>
                      {MONTHS.map((m, monthIdx) => (
                        <td key={m} className="px-1 py-1">
                          <Input
                            className="h-8 text-xs text-right tabular-nums"
                            value={displayNum(line.monthly[monthIdx])}
                            onChange={(e) =>
                              updateMonthly(idx, monthIdx, e.target.value)
                            }
                            placeholder="0"
                          />
                        </td>
                      ))}
                      <td className="px-3 py-1.5 text-right bg-muted/20">
                        <span className="text-xs font-semibold tabular-nums">
                          {formatCurrency(lineTotal)}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          disabled={lines.length <= 1}
                          onClick={() => removeLine(idx)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Remove row</span>
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              {/* Totals row */}
              <tfoot>
                <tr className="border-t-2 bg-muted/40">
                  <td
                    colSpan={4}
                    className="sticky left-0 z-20 bg-muted/40 px-3 py-2 text-xs font-semibold"
                  >
                    TOTAL
                  </td>
                  {MONTHS.map((m, monthIdx) => (
                    <td
                      key={m}
                      className="px-2 py-2 text-right text-xs font-semibold tabular-nums"
                    >
                      {formatCurrency(monthlyTotals[monthIdx])}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-right bg-primary/10">
                    <span className="text-sm font-bold tabular-nums text-primary">
                      {formatCurrency(grandTotal)}
                    </span>
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Submit confirmation dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Budget for Approval?</AlertDialogTitle>
            <AlertDialogDescription>
              Once submitted, this budget cannot be edited until it is rejected
              or returned. The total budget amount is{" "}
              <strong>{formatCurrency(grandTotal)}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowSubmitDialog(false)
                onSubmit(buildPayload())
              }}
            >
              Yes, Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
