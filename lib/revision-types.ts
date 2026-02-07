// ── Revision Types & Status Lifecycle ────────────────────────────

export type RevisionType = "increase" | "decrease" | "reallocate" | "unbudget"

export const REVISION_TYPE_LABELS: Record<RevisionType, string> = {
  increase: "Increase",
  decrease: "Decrease",
  reallocate: "Reallocate",
  unbudget: "Unbudget",
}

export const REVISION_TYPE_STYLES: Record<RevisionType, string> = {
  increase: "bg-success/10 text-success border-success/20",
  decrease: "bg-destructive/10 text-destructive border-destructive/20",
  reallocate: "bg-primary/10 text-primary border-primary/20",
  unbudget: "bg-warning/10 text-warning border-warning/20",
}

export type RevisionStatus =
  | "draft"
  | "submitted"
  | "supervisor_approved"
  | "admin_approved"
  | "applied"
  | "rejected"

export const REVISION_STATUS_LABELS: Record<RevisionStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  supervisor_approved: "Supervisor Approved",
  admin_approved: "Admin Approved",
  applied: "Applied",
  rejected: "Rejected",
}

export const REVISION_STATUS_STYLES: Record<RevisionStatus, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  submitted: "bg-primary/10 text-primary border-primary/20",
  supervisor_approved: "bg-warning/10 text-warning border-warning/20",
  admin_approved: "bg-success/10 text-success border-success/20",
  applied: "bg-foreground/10 text-foreground border-foreground/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
}

// ── Revision Detail Row ─────────────────────────────────────────
export interface RevisionLineItem {
  id: string
  coa: string
  costCenter: string
  originalBudget: number
  revisionAmount: number // positive = increase, negative = decrease
  description: string
}

export function getNewBudget(line: RevisionLineItem): number {
  return line.originalBudget + line.revisionAmount
}

// ── Revision History Entry ──────────────────────────────────────
export interface RevisionHistoryEntry {
  actor: string
  action: "created" | "submitted" | "approved" | "rejected" | "applied" | "edited"
  date: string
  comment?: string
}

// ── Main Revision Item ──────────────────────────────────────────
export interface RevisionItem {
  id: string
  revisionId: string
  fiscalYear: number
  unitKerja: string
  relatedBudgetId: string
  revisionType: RevisionType
  reason: string
  status: RevisionStatus
  lineItems: RevisionLineItem[]
  createdBy: string
  createdDate: string
  updatedDate: string
  submittedDate: string | null
  history: RevisionHistoryEntry[]
}

// ── Helpers ─────────────────────────────────────────────────────
export function getNetImpact(item: RevisionItem): number {
  return item.lineItems.reduce((sum, line) => sum + line.revisionAmount, 0)
}

export type RevisionSortField =
  | "revisionId"
  | "fiscalYear"
  | "unitKerja"
  | "revisionType"
  | "netImpact"
  | "status"
  | "submittedDate"

export type SortDirection = "asc" | "desc"

// Reuse formatCurrency / formatDate from budget-types
import { formatCurrency, formatDate, COA_OPTIONS, COST_CENTER_OPTIONS, UNIT_OPTIONS } from "./budget-types"
export { formatCurrency, formatDate, COA_OPTIONS, COST_CENTER_OPTIONS, UNIT_OPTIONS }

// ── Related budget options (approved / locked budgets) ───────────
export const RELATED_BUDGET_OPTIONS = [
  { value: "BDG-PRJ-2026-0003", label: "BDG-PRJ-2026-0003 - Fleet Management System" },
  { value: "BDG-PRJ-2026-0004", label: "BDG-PRJ-2026-0004 - Brand Refresh & Digital Campaign" },
  { value: "BDG-PRJ-2026-0005", label: "BDG-PRJ-2026-0005 - HRIS System Upgrade" },
  { value: "BDG-OPX-2026-0001", label: "BDG-OPX-2026-0001 - IT Monthly Cloud & SaaS" },
  { value: "BDG-OPX-2026-0004", label: "BDG-OPX-2026-0004 - Office Supplies & Consumables" },
] as const

// ── Mock Data ───────────────────────────────────────────────────
function makeLine(
  id: string,
  coa: string,
  cc: string,
  originalBudget: number,
  revisionAmount: number,
  desc: string,
): RevisionLineItem {
  return { id, coa, costCenter: cc, originalBudget, revisionAmount, description: desc }
}

export const MOCK_REVISIONS: RevisionItem[] = [
  {
    id: "rev_001",
    revisionId: "REV-2026-0001",
    fiscalYear: 2026,
    unitKerja: "IT Dept",
    relatedBudgetId: "BDG-OPX-2026-0001",
    revisionType: "increase",
    reason: "Additional cloud compute capacity needed due to new microservices deployment in Q2.",
    status: "submitted",
    lineItems: [
      makeLine("rvl_001", "5201.010", "CC-IT-01", 1_140_000_000, 180_000_000, "Additional AWS EC2 instances for Q2-Q4"),
      makeLine("rvl_002", "5201.011", "CC-IT-01", 600_000_000, 60_000_000, "Increased S3 storage for logging"),
    ],
    createdBy: "Rina Hartono",
    createdDate: "2026-02-01T09:00:00",
    updatedDate: "2026-02-03T14:00:00",
    submittedDate: "2026-02-03T14:00:00",
    history: [
      { actor: "Rina Hartono", action: "created", date: "2026-02-01T09:00:00" },
      { actor: "Rina Hartono", action: "submitted", date: "2026-02-03T14:00:00" },
    ],
  },
  {
    id: "rev_002",
    revisionId: "REV-2026-0002",
    fiscalYear: 2026,
    unitKerja: "Marketing Dept",
    relatedBudgetId: "BDG-PRJ-2026-0004",
    revisionType: "reallocate",
    reason: "Reallocate from digital ads to brand activation events based on H1 performance review.",
    status: "supervisor_approved",
    lineItems: [
      makeLine("rvl_003", "5401.001", "CC-MKT-01", 1_500_000_000, -200_000_000, "Reduce digital ad spend H2"),
      makeLine("rvl_004", "5401.002", "CC-MKT-01", 380_000_000, 200_000_000, "Increase brand activation for Q3-Q4"),
    ],
    createdBy: "Dewi Lestari",
    createdDate: "2026-01-25T10:00:00",
    updatedDate: "2026-02-05T11:00:00",
    submittedDate: "2026-01-28T09:00:00",
    history: [
      { actor: "Dewi Lestari", action: "created", date: "2026-01-25T10:00:00" },
      { actor: "Dewi Lestari", action: "submitted", date: "2026-01-28T09:00:00" },
      { actor: "Budi Setiawan", action: "approved", date: "2026-02-05T11:00:00", comment: "Net zero reallocation. Approved." },
    ],
  },
  {
    id: "rev_003",
    revisionId: "REV-2026-0003",
    fiscalYear: 2026,
    unitKerja: "Operations Dept",
    relatedBudgetId: "BDG-PRJ-2026-0003",
    revisionType: "decrease",
    reason: "GPS hardware vendor offered 15% discount. Reducing allocated hardware budget.",
    status: "admin_approved",
    lineItems: [
      makeLine("rvl_005", "5101.001", "CC-OPS-01", 200_000_000, -30_000_000, "GPS tracker hardware discount applied"),
    ],
    createdBy: "Hadi Sutanto",
    createdDate: "2026-01-20T08:00:00",
    updatedDate: "2026-02-06T15:00:00",
    submittedDate: "2026-01-22T10:00:00",
    history: [
      { actor: "Hadi Sutanto", action: "created", date: "2026-01-20T08:00:00" },
      { actor: "Hadi Sutanto", action: "submitted", date: "2026-01-22T10:00:00" },
      { actor: "Budi Setiawan", action: "approved", date: "2026-01-30T09:00:00", comment: "Verified vendor quotation." },
      { actor: "Sari Dewi", action: "approved", date: "2026-02-06T15:00:00", comment: "Final approved. Ready to apply." },
    ],
  },
  {
    id: "rev_004",
    revisionId: "REV-2026-0004",
    fiscalYear: 2026,
    unitKerja: "HR Dept",
    relatedBudgetId: "BDG-PRJ-2026-0005",
    revisionType: "unbudget",
    reason: "New compliance training module required by regulation change effective March 2026.",
    status: "draft",
    lineItems: [
      makeLine("rvl_006", "5501.001", "CC-HR-01", 0, 75_000_000, "Compliance training platform license"),
      makeLine("rvl_007", "5501.002", "CC-HR-01", 0, 25_000_000, "Training facilitation and venue"),
    ],
    createdBy: "Maya Indah",
    createdDate: "2026-02-05T14:00:00",
    updatedDate: "2026-02-06T09:00:00",
    submittedDate: null,
    history: [
      { actor: "Maya Indah", action: "created", date: "2026-02-05T14:00:00" },
      { actor: "Maya Indah", action: "edited", date: "2026-02-06T09:00:00", comment: "Added venue cost line." },
    ],
  },
  {
    id: "rev_005",
    revisionId: "REV-2026-0005",
    fiscalYear: 2026,
    unitKerja: "Procurement Dept",
    relatedBudgetId: "BDG-OPX-2026-0004",
    revisionType: "increase",
    reason: "Paper price increase from supplier effective February. Need additional allocation.",
    status: "rejected",
    lineItems: [
      makeLine("rvl_008", "5701.001", "CC-PRO-01", 180_000_000, 36_000_000, "Stationery price adjustment"),
    ],
    createdBy: "Siti Nurhaliza",
    createdDate: "2026-01-28T11:00:00",
    updatedDate: "2026-02-04T10:00:00",
    submittedDate: "2026-01-30T09:00:00",
    history: [
      { actor: "Siti Nurhaliza", action: "created", date: "2026-01-28T11:00:00" },
      { actor: "Siti Nurhaliza", action: "submitted", date: "2026-01-30T09:00:00" },
      { actor: "Budi Setiawan", action: "rejected", date: "2026-02-04T10:00:00", comment: "Please obtain alternate supplier quotes before requesting increase. Current justification insufficient." },
    ],
  },
  {
    id: "rev_006",
    revisionId: "REV-2026-0006",
    fiscalYear: 2026,
    unitKerja: "IT Dept",
    relatedBudgetId: "BDG-OPX-2026-0001",
    revisionType: "decrease",
    reason: "Negotiated multi-year discount on Office 365 licenses. Reducing monthly allocation.",
    status: "applied",
    lineItems: [
      makeLine("rvl_009", "5701.002", "CC-IT-01", 300_000_000, -48_000_000, "Office 365 license discount (3-year term)"),
    ],
    createdBy: "Rina Hartono",
    createdDate: "2026-01-10T09:00:00",
    updatedDate: "2026-02-01T16:00:00",
    submittedDate: "2026-01-12T10:00:00",
    history: [
      { actor: "Rina Hartono", action: "created", date: "2026-01-10T09:00:00" },
      { actor: "Rina Hartono", action: "submitted", date: "2026-01-12T10:00:00" },
      { actor: "Budi Setiawan", action: "approved", date: "2026-01-20T14:00:00", comment: "Verified contract terms." },
      { actor: "Sari Dewi", action: "approved", date: "2026-01-28T10:00:00", comment: "Final approved." },
      { actor: "Sari Dewi", action: "applied", date: "2026-02-01T16:00:00", comment: "Applied to budget baseline. Audit trail created." },
    ],
  },
]
