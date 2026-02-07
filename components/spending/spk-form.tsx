"use client"

import { useState, useCallback, useMemo } from "react"
import { Plus, Trash2, ArrowLeft, Save, SendHorizontal, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  COA_OPTIONS, COST_CENTER_OPTIONS, VENDOR_OPTIONS,
  formatCurrency, getRemainingBudget, getBudgetUsagePercent,
  type SpkItem, type SpkLineItem,
} from "@/lib/spk-types"
import { cn } from "@/lib/utils"

interface SpkFormProps {
  editItem?: SpkItem | null
  unitKerja: string
  onSave: (data: Partial<SpkItem>) => void
  onSubmit: (data: Partial<SpkItem>) => void
  onCancel: () => void
}

function createEmptyLine(): SpkLineItem {
  return {
    id: `new_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    coa: "",
    costCenter: "",
    description: "",
    budgetAvailable: 0,
    spkAmount: 0,
  }
}

function displayNum(v: number): string {
  if (v === 0) return ""
  return new Intl.NumberFormat("id-ID").format(v)
}

function parseNum(s: string): number {
  const cleaned = s.replace(/[^0-9]/g, "")
  return cleaned === "" ? 0 : Number.parseInt(cleaned, 10)
}

export function SpkForm({ editItem, unitKerja, onSave, onSubmit, onCancel }: SpkFormProps) {
  const isEditing = !!editItem

  // Header state
  const [fiscalYear, setFiscalYear] = useState(editItem?.fiscalYear?.toString() || "2026")
  const [vendor, setVendor] = useState(editItem?.vendor || "")
  const [description, setDescription] = useState(editItem?.description || "")
  const [contractRef, setContractRef] = useState(editItem?.contractRef || "")

  // Line items
  const [lines, setLines] = useState<SpkLineItem[]>(
    editItem?.lineItems?.length ? editItem.lineItems : [createEmptyLine()],
  )

  const [errors, setErrors] = useState<Record<string, string>>({})
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
    (idx: number, field: keyof SpkLineItem, value: string | number) => {
      setLines((prev) =>
        prev.map((line, i) => (i === idx ? { ...line, [field]: value } : line)),
      )
    },
    [],
  )

  // Totals
  const totalSpk = useMemo(
    () => lines.reduce((sum, l) => sum + l.spkAmount, 0),
    [lines],
  )

  const totalBudgetAvailable = useMemo(
    () => lines.reduce((sum, l) => sum + l.budgetAvailable, 0),
    [lines],
  )

  const totalRemaining = useMemo(
    () => lines.reduce((sum, l) => sum + getRemainingBudget(l), 0),
    [lines],
  )

  // Validate
  function validate(): boolean {
    const newErrors: Record<string, string> = {}

    if (!vendor) newErrors.vendor = "Vendor is required"
    if (!description.trim()) newErrors.description = "Description is required"

    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].coa) newErrors[`line_${i}_coa`] = "COA is required"
      if (!lines[i].costCenter) newErrors[`line_${i}_cc`] = "Cost Center required"
      if (!lines[i].description.trim()) newErrors[`line_${i}_desc`] = "Description required"
      if (lines[i].spkAmount <= 0) newErrors[`line_${i}_amt`] = "Amount must be > 0"

      // SPK Amount cannot exceed available budget
      if (lines[i].spkAmount > lines[i].budgetAvailable && lines[i].budgetAvailable > 0) {
        newErrors[`line_${i}_amt`] = "Exceeds available budget"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function buildPayload(): Partial<SpkItem> {
    return {
      ...(editItem || {}),
      fiscalYear: Number.parseInt(fiscalYear, 10),
      unitKerja,
      vendor,
      description,
      contractRef,
      lineItems: lines,
    }
  }

  function handleSave() {
    if (validate()) onSave(buildPayload())
  }

  function handleSubmitConfirm() {
    if (validate()) setShowSubmitDialog(true)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={onCancel}>
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
            {isEditing ? `Edit SPK - ${editItem.spkNumber}` : "Create New SPK"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Fiscal Year</Label>
              <Select value={fiscalYear} onValueChange={setFiscalYear}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
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
              <Label className="text-xs">
                Vendor {errors.vendor && <span className="text-destructive">*</span>}
              </Label>
              <Select value={vendor} onValueChange={setVendor}>
                <SelectTrigger className={cn("h-9 text-sm", errors.vendor && "border-destructive")}>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {VENDOR_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.label}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vendor && <span className="text-[11px] text-destructive">{errors.vendor}</span>}
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label className="text-xs">
                Description {errors.description && <span className="text-destructive">*</span>}
              </Label>
              <Textarea
                className="min-h-[36px] resize-none text-sm"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of spending request..."
              />
              {errors.description && <span className="text-[11px] text-destructive">{errors.description}</span>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Contract / Reference No (optional)</Label>
              <Input
                className="h-9 text-sm"
                value={contractRef}
                onChange={(e) => setContractRef(e.target.value)}
                placeholder="e.g. CTR-IT-2026-0050"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SPK detail grid */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">SPK Detail</CardTitle>
            <Button variant="outline" size="sm" className="gap-1.5 bg-transparent" onClick={addLine}>
              <Plus className="h-3.5 w-3.5" />
              Add Row
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <table className="w-full text-sm border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-3 py-2 text-left text-xs font-medium w-[40px]">#</th>
                  <th className="px-3 py-2 text-left text-xs font-medium w-[180px]">COA</th>
                  <th className="px-3 py-2 text-left text-xs font-medium w-[160px]">Cost Center</th>
                  <th className="px-3 py-2 text-left text-xs font-medium w-[180px]">Description</th>
                  <th className="px-3 py-2 text-right text-xs font-medium w-[140px] bg-muted/20">Budget Available</th>
                  <th className="px-3 py-2 text-right text-xs font-medium w-[140px]">SPK Amount</th>
                  <th className="px-3 py-2 text-right text-xs font-medium w-[140px] bg-muted/60">Remaining</th>
                  <th className="px-2 py-2 text-center text-xs font-medium w-[50px]">
                    <span className="sr-only">Delete</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, idx) => {
                  const remaining = getRemainingBudget(line)
                  const usagePct = getBudgetUsagePercent(line)
                  const isOverBudget = line.spkAmount > line.budgetAvailable && line.budgetAvailable > 0
                  const isHighUsage = usagePct >= 90 && !isOverBudget

                  return (
                    <tr key={line.id} className={cn("border-b transition-colors", idx % 2 === 1 && "bg-muted/10")}>
                      <td className="px-3 py-1.5 text-xs text-muted-foreground tabular-nums">{idx + 1}</td>
                      <td className="px-1.5 py-1">
                        <Select value={line.coa} onValueChange={(v) => updateLineField(idx, "coa", v)}>
                          <SelectTrigger className={cn("h-8 text-xs", errors[`line_${idx}_coa`] && "border-destructive")}>
                            <SelectValue placeholder="Select COA" />
                          </SelectTrigger>
                          <SelectContent>
                            {COA_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-1.5 py-1">
                        <Select value={line.costCenter} onValueChange={(v) => updateLineField(idx, "costCenter", v)}>
                          <SelectTrigger className={cn("h-8 text-xs", errors[`line_${idx}_cc`] && "border-destructive")}>
                            <SelectValue placeholder="Select CC" />
                          </SelectTrigger>
                          <SelectContent>
                            {COST_CENTER_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-1.5 py-1">
                        <Input
                          className={cn("h-8 text-xs", errors[`line_${idx}_desc`] && "border-destructive")}
                          value={line.description}
                          onChange={(e) => updateLineField(idx, "description", e.target.value)}
                          placeholder="Line description"
                        />
                      </td>
                      <td className="px-1.5 py-1 bg-muted/10">
                        <Input
                          className="h-8 text-xs text-right tabular-nums"
                          value={displayNum(line.budgetAvailable)}
                          onChange={(e) => updateLineField(idx, "budgetAvailable", parseNum(e.target.value))}
                          placeholder="0"
                        />
                      </td>
                      <td className="px-1.5 py-1">
                        <div className="relative">
                          <Input
                            className={cn(
                              "h-8 text-xs text-right tabular-nums",
                              isOverBudget && "border-destructive text-destructive",
                              isHighUsage && "border-warning text-warning",
                              errors[`line_${idx}_amt`] && "border-destructive",
                            )}
                            value={displayNum(line.spkAmount)}
                            onChange={(e) => updateLineField(idx, "spkAmount", parseNum(e.target.value))}
                            placeholder="0"
                          />
                          {isHighUsage && !isOverBudget && (
                            <TooltipProvider delayDuration={200}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertTriangle className="absolute right-8 top-1/2 -translate-y-1/2 h-3 w-3 text-warning" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">Uses {usagePct.toFixed(0)}% of available budget</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                        {errors[`line_${idx}_amt`] && <span className="text-[10px] text-destructive">{errors[`line_${idx}_amt`]}</span>}
                      </td>
                      <td className="px-3 py-1.5 text-right bg-muted/20">
                        <span className={cn(
                          "text-xs font-semibold tabular-nums",
                          remaining < 0 && "text-destructive",
                          remaining >= 0 && remaining < line.budgetAvailable * 0.1 && "text-warning",
                          remaining >= line.budgetAvailable * 0.1 && "text-success",
                        )}>
                          {formatCurrency(remaining)}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <Button
                          variant="ghost" size="icon"
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
              <tfoot>
                <tr className="border-t-2 bg-muted/40">
                  <td colSpan={4} className="px-3 py-2 text-xs font-semibold">TOTAL</td>
                  <td className="px-3 py-2 text-right text-xs font-semibold tabular-nums bg-muted/20">
                    {formatCurrency(totalBudgetAvailable)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span className="text-sm font-bold tabular-nums text-primary">
                      {formatCurrency(totalSpk)}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right bg-muted/30">
                    <span className={cn(
                      "text-xs font-bold tabular-nums",
                      totalRemaining < 0 && "text-destructive",
                      totalRemaining >= 0 && "text-success",
                    )}>
                      {formatCurrency(totalRemaining)}
                    </span>
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Commitment summary card */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Commitment</span>
            <span className="text-lg font-bold tabular-nums text-primary">
              {formatCurrency(totalSpk)}
            </span>
          </div>
          {totalBudgetAvailable > 0 && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Budget utilization</span>
                <span className="tabular-nums">{((totalSpk / totalBudgetAvailable) * 100).toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    (totalSpk / totalBudgetAvailable) >= 1 && "bg-destructive",
                    (totalSpk / totalBudgetAvailable) >= 0.9 && (totalSpk / totalBudgetAvailable) < 1 && "bg-warning",
                    (totalSpk / totalBudgetAvailable) < 0.9 && "bg-primary",
                  )}
                  style={{ width: `${Math.min((totalSpk / totalBudgetAvailable) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit confirmation dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit SPK for Approval?</AlertDialogTitle>
            <AlertDialogDescription>
              Once submitted, this SPK cannot be edited. The total commitment is{" "}
              <strong className="text-primary">{formatCurrency(totalSpk)}</strong>.
              This will be reviewed by your supervisor before final approval.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setShowSubmitDialog(false); onSubmit(buildPayload()) }}>
              Yes, Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
