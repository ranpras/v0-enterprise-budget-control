"use client"

import { useState, useCallback, useMemo } from "react"
import { Plus, Trash2, ArrowLeft, Save, SendHorizontal, TrendingUp, TrendingDown, Minus } from "lucide-react"
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
  REVISION_TYPE_LABELS,
  COA_OPTIONS, COST_CENTER_OPTIONS, RELATED_BUDGET_OPTIONS,
  formatCurrency, getNewBudget,
  type RevisionItem, type RevisionLineItem, type RevisionType,
} from "@/lib/revision-types"
import { cn } from "@/lib/utils"

interface RevisionFormProps {
  editItem?: RevisionItem | null
  unitKerja: string
  onSave: (data: Partial<RevisionItem>) => void
  onSubmit: (data: Partial<RevisionItem>) => void
  onCancel: () => void
}

function createEmptyLine(): RevisionLineItem {
  return {
    id: `new_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    coa: "",
    costCenter: "",
    originalBudget: 0,
    revisionAmount: 0,
    description: "",
  }
}

function displayNum(v: number): string {
  if (v === 0) return ""
  return new Intl.NumberFormat("id-ID").format(v)
}

function parseNum(s: string): number {
  // Keep negative sign, remove all other non-digits
  const isNegative = s.startsWith("-")
  const cleaned = s.replace(/[^0-9]/g, "")
  const val = cleaned === "" ? 0 : Number.parseInt(cleaned, 10)
  return isNegative ? -val : val
}

function displayRevisionAmount(v: number): string {
  if (v === 0) return ""
  const sign = v > 0 ? "+" : "-"
  return sign + new Intl.NumberFormat("id-ID").format(Math.abs(v))
}

function parseRevisionAmount(s: string): number {
  const isNegative = s.includes("-")
  const cleaned = s.replace(/[^0-9]/g, "")
  const val = cleaned === "" ? 0 : Number.parseInt(cleaned, 10)
  return isNegative ? -val : val
}

export function RevisionForm({
  editItem, unitKerja, onSave, onSubmit, onCancel,
}: RevisionFormProps) {
  const isEditing = !!editItem

  // Header state
  const [fiscalYear, setFiscalYear] = useState(editItem?.fiscalYear?.toString() || "2026")
  const [relatedBudget, setRelatedBudget] = useState(editItem?.relatedBudgetId || "")
  const [revisionType, setRevisionType] = useState<RevisionType | "">(editItem?.revisionType || "")
  const [reason, setReason] = useState(editItem?.reason || "")

  // Line items
  const [lines, setLines] = useState<RevisionLineItem[]>(
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
    (idx: number, field: keyof RevisionLineItem, value: string | number) => {
      setLines((prev) =>
        prev.map((line, i) => (i === idx ? { ...line, [field]: value } : line)),
      )
    },
    [],
  )

  // Totals
  const netImpact = useMemo(
    () => lines.reduce((sum, line) => sum + line.revisionAmount, 0),
    [lines],
  )

  const totalOriginal = useMemo(
    () => lines.reduce((sum, line) => sum + line.originalBudget, 0),
    [lines],
  )

  const totalNew = useMemo(
    () => lines.reduce((sum, line) => sum + getNewBudget(line), 0),
    [lines],
  )

  // Validate
  function validate(): boolean {
    const newErrors: Record<string, string> = {}

    if (!relatedBudget) newErrors.relatedBudget = "Related budget is required"
    if (!revisionType) newErrors.revisionType = "Revision type is required"
    if (!reason.trim()) newErrors.reason = "Reason is required"

    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].coa) newErrors[`line_${i}_coa`] = "COA is required"
      if (!lines[i].costCenter) newErrors[`line_${i}_cc`] = "Cost Center required"
      if (!lines[i].description.trim()) newErrors[`line_${i}_desc`] = "Description required"
      if (lines[i].revisionAmount === 0) newErrors[`line_${i}_amt`] = "Amount required"

      // Decrease cannot exceed original
      if (lines[i].revisionAmount < 0 && Math.abs(lines[i].revisionAmount) > lines[i].originalBudget) {
        newErrors[`line_${i}_amt`] = "Cannot exceed original budget"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function buildPayload(): Partial<RevisionItem> {
    return {
      ...(editItem || {}),
      fiscalYear: Number.parseInt(fiscalYear, 10),
      unitKerja,
      relatedBudgetId: relatedBudget,
      revisionType: revisionType as RevisionType,
      reason,
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
            {isEditing ? "Edit Revision" : "Create New Revision"}
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
                Related Budget {errors.relatedBudget && <span className="text-destructive">*</span>}
              </Label>
              <Select value={relatedBudget} onValueChange={setRelatedBudget}>
                <SelectTrigger className={cn("h-9 text-sm", errors.relatedBudget && "border-destructive")}>
                  <SelectValue placeholder="Select related budget" />
                </SelectTrigger>
                <SelectContent>
                  {RELATED_BUDGET_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.relatedBudget && <span className="text-[11px] text-destructive">{errors.relatedBudget}</span>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">
                Revision Type {errors.revisionType && <span className="text-destructive">*</span>}
              </Label>
              <Select value={revisionType} onValueChange={(v) => setRevisionType(v as RevisionType)}>
                <SelectTrigger className={cn("h-9 text-sm", errors.revisionType && "border-destructive")}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(REVISION_TYPE_LABELS) as [RevisionType, string][]).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.revisionType && <span className="text-[11px] text-destructive">{errors.revisionType}</span>}
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label className="text-xs">
                Reason {errors.reason && <span className="text-destructive">*</span>}
              </Label>
              <Textarea
                className="min-h-[36px] resize-none text-sm"
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Provide a detailed reason for this revision..."
              />
              {errors.reason && <span className="text-[11px] text-destructive">{errors.reason}</span>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revision detail grid */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Revision Detail</CardTitle>
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
                  <th className="px-3 py-2 text-left text-xs font-medium w-[180px]">COA</th>
                  <th className="px-3 py-2 text-left text-xs font-medium w-[160px]">Cost Center</th>
                  <th className="px-3 py-2 text-right text-xs font-medium w-[140px]">Original Budget</th>
                  <th className="px-3 py-2 text-right text-xs font-medium w-[140px]">Revision Amount</th>
                  <th className="px-3 py-2 text-right text-xs font-medium w-[140px] bg-muted/60">New Budget</th>
                  <th className="px-3 py-2 text-left text-xs font-medium w-[180px]">Description</th>
                  <th className="px-2 py-2 text-center text-xs font-medium w-[50px]">
                    <span className="sr-only">Delete</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, idx) => {
                  const newBudget = getNewBudget(line)
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
                        {errors[`line_${idx}_coa`] && <span className="text-[10px] text-destructive">{errors[`line_${idx}_coa`]}</span>}
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
                          className="h-8 text-xs text-right tabular-nums"
                          value={displayNum(line.originalBudget)}
                          onChange={(e) => updateLineField(idx, "originalBudget", parseNum(e.target.value))}
                          placeholder="0"
                        />
                      </td>
                      <td className="px-1.5 py-1">
                        <Input
                          className={cn(
                            "h-8 text-xs text-right tabular-nums",
                            line.revisionAmount > 0 && "text-success",
                            line.revisionAmount < 0 && "text-destructive",
                            errors[`line_${idx}_amt`] && "border-destructive",
                          )}
                          value={displayRevisionAmount(line.revisionAmount)}
                          onChange={(e) => updateLineField(idx, "revisionAmount", parseRevisionAmount(e.target.value))}
                          placeholder="+/- amount"
                        />
                        {errors[`line_${idx}_amt`] && <span className="text-[10px] text-destructive">{errors[`line_${idx}_amt`]}</span>}
                      </td>
                      <td className="px-3 py-1.5 text-right bg-muted/20">
                        <span className={cn(
                          "text-xs font-semibold tabular-nums",
                          newBudget > line.originalBudget && "text-success",
                          newBudget < line.originalBudget && "text-destructive",
                        )}>
                          {formatCurrency(newBudget)}
                        </span>
                      </td>
                      <td className="px-1.5 py-1">
                        <Input
                          className={cn("h-8 text-xs", errors[`line_${idx}_desc`] && "border-destructive")}
                          value={line.description}
                          onChange={(e) => updateLineField(idx, "description", e.target.value)}
                          placeholder="Line description"
                        />
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
                  <td className="px-3 py-2 text-right text-xs font-semibold tabular-nums">{formatCurrency(totalOriginal)}</td>
                  <td className="px-3 py-2 text-right">
                    <span className={cn(
                      "text-xs font-bold tabular-nums",
                      netImpact > 0 && "text-success",
                      netImpact < 0 && "text-destructive",
                      netImpact === 0 && "text-muted-foreground",
                    )}>
                      {netImpact > 0 ? "+" : ""}{formatCurrency(netImpact)}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right bg-primary/10">
                    <span className="text-sm font-bold tabular-nums text-primary">{formatCurrency(totalNew)}</span>
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Net Impact summary card */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Net Budget Impact</span>
            <div className="flex items-center gap-2">
              {netImpact > 0 && <TrendingUp className="h-5 w-5 text-success" />}
              {netImpact < 0 && <TrendingDown className="h-5 w-5 text-destructive" />}
              {netImpact === 0 && <Minus className="h-5 w-5 text-muted-foreground" />}
              <span className={cn(
                "text-lg font-bold tabular-nums",
                netImpact > 0 && "text-success",
                netImpact < 0 && "text-destructive",
                netImpact === 0 && "text-muted-foreground",
              )}>
                {netImpact > 0 ? "+" : ""}{formatCurrency(netImpact)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit confirmation dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Revision for Approval?</AlertDialogTitle>
            <AlertDialogDescription>
              Once submitted, this revision cannot be edited until it is rejected or returned.
              The net budget impact is{" "}
              <strong className={cn(netImpact > 0 ? "text-success" : netImpact < 0 ? "text-destructive" : "")}>
                {netImpact > 0 ? "+" : ""}{formatCurrency(netImpact)}
              </strong>.
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
