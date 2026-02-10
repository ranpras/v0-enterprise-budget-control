"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
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
  COA_OPTIONS, COST_CENTER_OPTIONS, SPK_LOOKUP,
  formatCurrency, getRemainingAfterActual, getCommitmentUsagePercent,
  type ActualItem, type ActualLineItem,
} from "@/lib/actual-types"
import { cn } from "@/lib/utils"

interface ActualFormProps {
  editItem?: ActualItem | null
  unitKerja: string
  onSave: (data: Partial<ActualItem>) => void
  onSubmit: (data: Partial<ActualItem>) => void
  onCancel: () => void
}

function createEmptyLine(): ActualLineItem {
  return {
    id: `new_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    coa: "",
    costCenter: "",
    remainingCommitment: 0,
    actualAmount: 0,
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

export function ActualForm({ editItem, unitKerja, onSave, onSubmit, onCancel }: ActualFormProps) {
  const isEditing = !!editItem

  // Header state
  const [fiscalYear, setFiscalYear] = useState(editItem?.fiscalYear?.toString() || "2026")
  const [spkNumber, setSpkNumber] = useState(editItem?.spkNumber || "")
  const [vendor, setVendor] = useState(editItem?.vendor || "")
  const [description, setDescription] = useState(editItem?.description || "")
  const [invoiceRef, setInvoiceRef] = useState(editItem?.invoiceRef || "")
  const [actualDate, setActualDate] = useState(editItem?.actualDate || "")

  // Line items
  const [lines, setLines] = useState<ActualLineItem[]>(
    editItem?.lineItems?.length ? editItem.lineItems : [createEmptyLine()],
  )

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)

  // Auto-save form state to localStorage to prevent data loss on refresh
  useEffect(() => {
    const formDraft = {
      fiscalYear,
      spkNumber,
      vendor,
      description,
      invoiceRef,
      actualDate,
      lines,
      timestamp: new Date().toISOString(),
    }
    try {
      localStorage.setItem("actual_form_draft", JSON.stringify(formDraft))
    } catch (e) {
      console.error("[v0] Failed to save Actual form draft:", e)
    }
  }, [fiscalYear, spkNumber, vendor, description, invoiceRef, actualDate, lines])

  // Clear draft when submit or cancel
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem("actual_form_draft")
    } catch (e) {
      console.error("[v0] Failed to clear Actual form draft:", e)
    }
  }, [])

  // Auto-fill vendor from SPK lookup
  function handleSpkChange(val: string) {
    setSpkNumber(val)
    const spk = SPK_LOOKUP.find((s) => s.value === val)
    if (spk) {
      setVendor(spk.vendor)
    }
  }

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
    (idx: number, field: keyof ActualLineItem, value: string | number) => {
      setLines((prev) =>
        prev.map((line, i) => (i === idx ? { ...line, [field]: value } : line)),
      )
    },
    [],
  )

  // Totals
  const totalActual = useMemo(
    () => lines.reduce((sum, l) => sum + l.actualAmount, 0),
    [lines],
  )

  const totalCommitment = useMemo(
    () => lines.reduce((sum, l) => sum + l.remainingCommitment, 0),
    [lines],
  )

  const totalRemainingAfter = useMemo(
    () => lines.reduce((sum, l) => sum + getRemainingAfterActual(l), 0),
    [lines],
  )

  // Validate
  function validate(): boolean {
    const newErrors: Record<string, string> = {}

    if (!spkNumber) newErrors.spkNumber = "Related SPK is required"
    if (!description.trim()) newErrors.description = "Description is required"
    if (!actualDate) newErrors.actualDate = "Actual date is required"

    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].coa) newErrors[`line_${i}_coa`] = "COA is required"
      if (!lines[i].costCenter) newErrors[`line_${i}_cc`] = "Cost Center required"
      if (lines[i].actualAmount <= 0) newErrors[`line_${i}_amt`] = "Amount must be > 0"

      // Actual Amount cannot exceed remaining commitment
      if (lines[i].actualAmount > lines[i].remainingCommitment && lines[i].remainingCommitment > 0) {
        newErrors[`line_${i}_amt`] = "Exceeds remaining commitment"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function buildPayload(): Partial<ActualItem> {
    return {
      ...(editItem || {}),
      fiscalYear: Number.parseInt(fiscalYear, 10),
      unitKerja,
      spkNumber,
      vendor,
      description,
      invoiceRef,
      actualDate,
      lineItems: lines,
    }
  }

  function handleSave() {
    if (validate()) {
      clearDraft()
      onSave(buildPayload())
    }
  }

  function handleSubmitConfirm() {
    if (validate()) setShowSubmitDialog(true)
  }

  function handleCancel() {
    clearDraft()
    onCancel()
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
            {isEditing ? `Edit Actual - ${editItem.actualNumber}` : "Create New Actual Realization"}
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
                Related SPK {errors.spkNumber && <span className="text-destructive">*</span>}
              </Label>
              <Select value={spkNumber} onValueChange={handleSpkChange}>
                <SelectTrigger className={cn("h-9 text-sm", errors.spkNumber && "border-destructive")}>
                  <SelectValue placeholder="Select SPK" />
                </SelectTrigger>
                <SelectContent>
                  {SPK_LOOKUP.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="font-mono text-xs">{opt.value}</span>
                      <span className="text-muted-foreground ml-1 text-xs">- {opt.vendor}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.spkNumber && <span className="text-[11px] text-destructive">{errors.spkNumber}</span>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Vendor (auto from SPK)</Label>
              <Input className="h-9 text-sm" value={vendor} disabled />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">
                Invoice / Reference No
              </Label>
              <Input
                className="h-9 text-sm"
                value={invoiceRef}
                onChange={(e) => setInvoiceRef(e.target.value)}
                placeholder="e.g. INV-MST-2026-0102"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">
                Actual Date {errors.actualDate && <span className="text-destructive">*</span>}
              </Label>
              <Input
                type="date"
                className={cn("h-9 text-sm", errors.actualDate && "border-destructive")}
                value={actualDate}
                onChange={(e) => setActualDate(e.target.value)}
              />
              {errors.actualDate && <span className="text-[11px] text-destructive">{errors.actualDate}</span>}
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-3">
              <Label className="text-xs">
                Description {errors.description && <span className="text-destructive">*</span>}
              </Label>
              <Textarea
                className="min-h-[36px] resize-none text-sm"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of actual realization..."
              />
              {errors.description && <span className="text-[11px] text-destructive">{errors.description}</span>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actual detail grid */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Actual Detail</CardTitle>
            <Button variant="outline" size="sm" className="gap-1.5 bg-transparent" onClick={addLine}>
              <Plus className="h-3.5 w-3.5" />
              Add Row
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <table className="w-full text-sm border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-3 py-2 text-left text-xs font-medium w-[40px]">#</th>
                  <th className="px-3 py-2 text-left text-xs font-medium w-[180px]">COA (from SPK)</th>
                  <th className="px-3 py-2 text-left text-xs font-medium w-[160px]">Cost Center</th>
                  <th className="px-3 py-2 text-right text-xs font-medium w-[150px] bg-muted/20">Remaining Commitment</th>
                  <th className="px-3 py-2 text-right text-xs font-medium w-[150px]">Actual Amount</th>
                  <th className="px-3 py-2 text-right text-xs font-medium w-[150px] bg-muted/60">Remaining After</th>
                  <th className="px-2 py-2 text-center text-xs font-medium w-[50px]">
                    <span className="sr-only">Delete</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, idx) => {
                  const remaining = getRemainingAfterActual(line)
                  const usagePct = getCommitmentUsagePercent(line)
                  const isOverCommitment = line.actualAmount > line.remainingCommitment && line.remainingCommitment > 0
                  const isHighUsage = usagePct >= 90 && !isOverCommitment
                  const isFullPayment = line.actualAmount === line.remainingCommitment && line.remainingCommitment > 0

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
                      <td className="px-1.5 py-1 bg-muted/10">
                        <Input
                          className="h-8 text-xs text-right tabular-nums"
                          value={displayNum(line.remainingCommitment)}
                          onChange={(e) => updateLineField(idx, "remainingCommitment", parseNum(e.target.value))}
                          placeholder="0"
                        />
                      </td>
                      <td className="px-1.5 py-1">
                        <div className="relative">
                          <Input
                            className={cn(
                              "h-8 text-xs text-right tabular-nums",
                              isOverCommitment && "border-destructive text-destructive",
                              isHighUsage && "border-warning text-warning",
                              errors[`line_${idx}_amt`] && "border-destructive",
                            )}
                            value={displayNum(line.actualAmount)}
                            onChange={(e) => updateLineField(idx, "actualAmount", parseNum(e.target.value))}
                            placeholder="0"
                          />
                          {isFullPayment && (
                            <TooltipProvider delayDuration={200}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="absolute right-8 top-1/2 -translate-y-1/2 text-[9px] font-bold text-success bg-success/10 px-1 rounded">FULL</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">Full payment - clears remaining commitment</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {isHighUsage && !isFullPayment && (
                            <TooltipProvider delayDuration={200}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertTriangle className="absolute right-8 top-1/2 -translate-y-1/2 h-3 w-3 text-warning" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">Uses {usagePct.toFixed(0)}% of remaining commitment</p>
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
                          remaining === 0 && "text-muted-foreground",
                          remaining > 0 && remaining < line.remainingCommitment * 0.1 && "text-warning",
                          remaining >= line.remainingCommitment * 0.1 && "text-success",
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
                  <td colSpan={3} className="px-3 py-2 text-xs font-semibold">TOTAL</td>
                  <td className="px-3 py-2 text-right text-xs font-semibold tabular-nums bg-muted/20">
                    {formatCurrency(totalCommitment)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span className="text-sm font-bold tabular-nums text-primary">
                      {formatCurrency(totalActual)}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right bg-muted/30">
                    <span className={cn(
                      "text-xs font-bold tabular-nums",
                      totalRemainingAfter < 0 && "text-destructive",
                      totalRemainingAfter >= 0 && "text-success",
                    )}>
                      {formatCurrency(totalRemainingAfter)}
                    </span>
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Payment summary card */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Actual Payment</span>
            <span className="text-lg font-bold tabular-nums text-primary">
              {formatCurrency(totalActual)}
            </span>
          </div>
          {totalCommitment > 0 && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Commitment utilization</span>
                <span className="tabular-nums">{((totalActual / totalCommitment) * 100).toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    (totalActual / totalCommitment) >= 1 && "bg-destructive",
                    (totalActual / totalCommitment) >= 0.9 && (totalActual / totalCommitment) < 1 && "bg-warning",
                    (totalActual / totalCommitment) < 0.9 && "bg-primary",
                  )}
                  style={{ width: `${Math.min((totalActual / totalCommitment) * 100, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1">
                <span>{totalActual === totalCommitment ? "Full payment" : "Partial payment"}</span>
                <span className="tabular-nums">Remaining: {formatCurrency(totalRemainingAfter)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit confirmation dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Actual for Approval?</AlertDialogTitle>
            <AlertDialogDescription>
              Once submitted, this actual realization cannot be edited. The total payment is{" "}
              <strong className="text-primary">{formatCurrency(totalActual)}</strong> against SPK{" "}
              <strong className="font-mono">{spkNumber}</strong>.
              This will be reviewed by your supervisor before posting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setShowSubmitDialog(false); clearDraft(); onSubmit(buildPayload()) }}>
              Yes, Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
