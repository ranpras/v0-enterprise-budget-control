// ── Actual Realization (Payment) Types & Status Lifecycle ───────

export type ActualStatus =
  | "draft"
  | "submitted"
  | "supervisor_approved"
  | "admin_approved"
  | "posted"
  | "reversed"
  | "rejected"

export const ACTUAL_STATUS_LABELS: Record<ActualStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  supervisor_approved: "Supervisor Approved",
  admin_approved: "Admin Approved",
  posted: "Posted",
  reversed: "Reversed",
  rejected: "Rejected",
}

export const ACTUAL_STATUS_STYLES: Record<ActualStatus, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  submitted: "bg-primary/10 text-primary border-primary/20",
  supervisor_approved: "bg-warning/10 text-warning border-warning/20",
  admin_approved: "bg-success/10 text-success border-success/20",
  posted: "bg-foreground/10 text-foreground border-foreground/20",
  reversed: "bg-destructive/10 text-destructive border-destructive/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
}

// ── Actual Detail Row ───────────────────────────────────────────
export interface ActualLineItem {
  id: string
  coa: string // from SPK, read-only
  costCenter: string
  remainingCommitment: number // read-only from SPK
  actualAmount: number
}

export function getRemainingAfterActual(line: ActualLineItem): number {
  return line.remainingCommitment - line.actualAmount
}

export function getCommitmentUsagePercent(line: ActualLineItem): number {
  if (line.remainingCommitment === 0) return 0
  return (line.actualAmount / line.remainingCommitment) * 100
}

// ── History Entry ───────────────────────────────────────────────
export interface ActualHistoryEntry {
  actor: string
  action:
    | "created"
    | "edited"
    | "submitted"
    | "approved"
    | "rejected"
    | "posted"
    | "reversed"
  date: string
  comment?: string
}

// ── Main Actual Item ────────────────────────────────────────────
export interface ActualItem {
  id: string
  actualNumber: string
  spkNumber: string
  fiscalYear: number
  unitKerja: string
  vendor: string
  description: string
  invoiceRef: string
  actualDate: string
  status: ActualStatus
  lineItems: ActualLineItem[]
  createdBy: string
  createdDate: string
  updatedDate: string
  submittedDate: string | null
  postingDate: string | null
  history: ActualHistoryEntry[]
}

// ── Sort ────────────────────────────────────────────────────────
export type ActualSortField =
  | "actualNumber"
  | "spkNumber"
  | "fiscalYear"
  | "unitKerja"
  | "vendor"
  | "totalAmount"
  | "status"
  | "postingDate"

export type SortDirection = "asc" | "desc"

// ── Helpers ─────────────────────────────────────────────────────
export function getActualTotal(item: ActualItem): number {
  return item.lineItems.reduce((sum, line) => sum + line.actualAmount, 0)
}

export function getTotalRemainingCommitment(item: ActualItem): number {
  return item.lineItems.reduce((sum, line) => sum + line.remainingCommitment, 0)
}

import { formatCurrency, formatDate, COA_OPTIONS, COST_CENTER_OPTIONS, UNIT_OPTIONS } from "./budget-types"
export { formatCurrency, formatDate, COA_OPTIONS, COST_CENTER_OPTIONS, UNIT_OPTIONS }

// ── SPK Lookup (active SPKs available for actual realization) ───
export const SPK_LOOKUP = [
  { value: "SPK-2026-0001", label: "SPK-2026-0001 - Server Hardware Procurement Phase 2", vendor: "PT Mega Solusi Teknologi", unit: "IT Dept" },
  { value: "SPK-2026-0003", label: "SPK-2026-0003 - Q1 Digital Advertising Campaign", vendor: "PT Kreasi Digital Nusantara", unit: "Marketing Dept" },
  { value: "SPK-2026-0006", label: "SPK-2026-0006 - GPS Tracking Device Procurement", vendor: "PT Bumi Cakra Logistics", unit: "Operations Dept" },
] as const

// ── Mock Data ───────────────────────────────────────────────────
function makeLine(
  id: string,
  coa: string,
  cc: string,
  remainingCommitment: number,
  actualAmount: number,
): ActualLineItem {
  return { id, coa, costCenter: cc, remainingCommitment, actualAmount }
}

export const MOCK_ACTUALS: ActualItem[] = [
  {
    id: "act_001",
    actualNumber: "ACT-2026-0001",
    spkNumber: "SPK-2026-0001",
    fiscalYear: 2026,
    unitKerja: "IT Dept",
    vendor: "PT Mega Solusi Teknologi",
    description: "Server Hardware - Partial Payment 1 (60%)",
    invoiceRef: "INV-MST-2026-0102",
    actualDate: "2026-02-10",
    status: "posted",
    lineItems: [
      makeLine("al_001", "5201.001", "CC-IT-01", 450_000_000, 270_000_000),
      makeLine("al_002", "5201.002", "CC-IT-01", 180_000_000, 108_000_000),
    ],
    createdBy: "Rina Hartono",
    createdDate: "2026-02-10T09:00:00",
    updatedDate: "2026-02-15T16:00:00",
    submittedDate: "2026-02-11T09:00:00",
    postingDate: "2026-02-15T16:00:00",
    history: [
      { actor: "Rina Hartono", action: "created", date: "2026-02-10T09:00:00" },
      { actor: "Rina Hartono", action: "submitted", date: "2026-02-11T09:00:00" },
      { actor: "Budi Setiawan", action: "approved", date: "2026-02-12T14:00:00", comment: "Invoice verified against delivery receipt." },
      { actor: "Sari Dewi", action: "approved", date: "2026-02-14T10:00:00", comment: "Final approved." },
      { actor: "Sari Dewi", action: "posted", date: "2026-02-15T16:00:00", comment: "Posted. Commitment reduced." },
    ],
  },
  {
    id: "act_002",
    actualNumber: "ACT-2026-0002",
    spkNumber: "SPK-2026-0001",
    fiscalYear: 2026,
    unitKerja: "IT Dept",
    vendor: "PT Mega Solusi Teknologi",
    description: "Server Hardware - Partial Payment 2 (remaining 40%)",
    invoiceRef: "INV-MST-2026-0189",
    actualDate: "2026-03-05",
    status: "submitted",
    lineItems: [
      makeLine("al_003", "5201.001", "CC-IT-01", 180_000_000, 180_000_000),
      makeLine("al_004", "5201.002", "CC-IT-01", 72_000_000, 72_000_000),
    ],
    createdBy: "Rina Hartono",
    createdDate: "2026-03-05T10:00:00",
    updatedDate: "2026-03-06T09:00:00",
    submittedDate: "2026-03-06T09:00:00",
    postingDate: null,
    history: [
      { actor: "Rina Hartono", action: "created", date: "2026-03-05T10:00:00" },
      { actor: "Rina Hartono", action: "submitted", date: "2026-03-06T09:00:00" },
    ],
  },
  {
    id: "act_003",
    actualNumber: "ACT-2026-0003",
    spkNumber: "SPK-2026-0003",
    fiscalYear: 2026,
    unitKerja: "Marketing Dept",
    vendor: "PT Kreasi Digital Nusantara",
    description: "Digital Campaign - January Invoice",
    invoiceRef: "INV-KDN-2026-0045",
    actualDate: "2026-02-01",
    status: "supervisor_approved",
    lineItems: [
      makeLine("al_005", "5401.001", "CC-MKT-01", 350_000_000, 115_000_000),
      makeLine("al_006", "5401.002", "CC-MKT-01", 120_000_000, 40_000_000),
    ],
    createdBy: "Dewi Lestari",
    createdDate: "2026-02-01T11:00:00",
    updatedDate: "2026-02-07T14:00:00",
    submittedDate: "2026-02-03T09:00:00",
    postingDate: null,
    history: [
      { actor: "Dewi Lestari", action: "created", date: "2026-02-01T11:00:00" },
      { actor: "Dewi Lestari", action: "submitted", date: "2026-02-03T09:00:00" },
      { actor: "Budi Setiawan", action: "approved", date: "2026-02-07T14:00:00", comment: "Campaign metrics verified. Approved." },
    ],
  },
  {
    id: "act_004",
    actualNumber: "ACT-2026-0004",
    spkNumber: "SPK-2026-0006",
    fiscalYear: 2026,
    unitKerja: "Operations Dept",
    vendor: "PT Bumi Cakra Logistics",
    description: "GPS Tracker - Full Payment",
    invoiceRef: "INV-BCL-2026-0078",
    actualDate: "2026-02-20",
    status: "admin_approved",
    lineItems: [
      makeLine("al_007", "5101.001", "CC-OPS-01", 140_000_000, 140_000_000),
    ],
    createdBy: "Hadi Sutanto",
    createdDate: "2026-02-20T09:00:00",
    updatedDate: "2026-03-01T15:00:00",
    submittedDate: "2026-02-22T10:00:00",
    postingDate: null,
    history: [
      { actor: "Hadi Sutanto", action: "created", date: "2026-02-20T09:00:00" },
      { actor: "Hadi Sutanto", action: "submitted", date: "2026-02-22T10:00:00" },
      { actor: "Budi Setiawan", action: "approved", date: "2026-02-28T09:00:00", comment: "Delivery confirmed. Full payment approved." },
      { actor: "Sari Dewi", action: "approved", date: "2026-03-01T15:00:00", comment: "Final approved. Ready for posting." },
    ],
  },
  {
    id: "act_005",
    actualNumber: "ACT-2026-0005",
    spkNumber: "SPK-2026-0003",
    fiscalYear: 2026,
    unitKerja: "Marketing Dept",
    vendor: "PT Kreasi Digital Nusantara",
    description: "Digital Campaign - February Invoice",
    invoiceRef: "INV-KDN-2026-0089",
    actualDate: "2026-03-01",
    status: "draft",
    lineItems: [
      makeLine("al_008", "5401.001", "CC-MKT-01", 235_000_000, 120_000_000),
      makeLine("al_009", "5401.002", "CC-MKT-01", 80_000_000, 35_000_000),
    ],
    createdBy: "Dewi Lestari",
    createdDate: "2026-03-01T14:00:00",
    updatedDate: "2026-03-02T10:00:00",
    submittedDate: null,
    postingDate: null,
    history: [
      { actor: "Dewi Lestari", action: "created", date: "2026-03-01T14:00:00" },
      { actor: "Dewi Lestari", action: "edited", date: "2026-03-02T10:00:00", comment: "Updated influencer amount." },
    ],
  },
  {
    id: "act_006",
    actualNumber: "ACT-2026-0006",
    spkNumber: "SPK-2026-0001",
    fiscalYear: 2026,
    unitKerja: "IT Dept",
    vendor: "PT Mega Solusi Teknologi",
    description: "Server Hardware - Duplicate Payment (Reversed)",
    invoiceRef: "INV-MST-2026-0102-DUP",
    actualDate: "2026-02-12",
    status: "reversed",
    lineItems: [
      makeLine("al_010", "5201.001", "CC-IT-01", 450_000_000, 270_000_000),
    ],
    createdBy: "Rina Hartono",
    createdDate: "2026-02-12T09:00:00",
    updatedDate: "2026-02-18T11:00:00",
    submittedDate: "2026-02-12T10:00:00",
    postingDate: "2026-02-16T14:00:00",
    history: [
      { actor: "Rina Hartono", action: "created", date: "2026-02-12T09:00:00" },
      { actor: "Rina Hartono", action: "submitted", date: "2026-02-12T10:00:00" },
      { actor: "Budi Setiawan", action: "approved", date: "2026-02-14T09:00:00" },
      { actor: "Sari Dewi", action: "approved", date: "2026-02-15T10:00:00" },
      { actor: "Sari Dewi", action: "posted", date: "2026-02-16T14:00:00" },
      { actor: "Sari Dewi", action: "reversed", date: "2026-02-18T11:00:00", comment: "Duplicate of ACT-2026-0001. Commitment restored. Original record preserved for audit." },
    ],
  },
  {
    id: "act_007",
    actualNumber: "ACT-2026-0007",
    spkNumber: "SPK-2026-0003",
    fiscalYear: 2026,
    unitKerja: "Marketing Dept",
    vendor: "PT Kreasi Digital Nusantara",
    description: "Digital Campaign - Rejected Advance Request",
    invoiceRef: "",
    actualDate: "2026-01-25",
    status: "rejected",
    lineItems: [
      makeLine("al_011", "5401.001", "CC-MKT-01", 350_000_000, 200_000_000),
    ],
    createdBy: "Dewi Lestari",
    createdDate: "2026-01-25T10:00:00",
    updatedDate: "2026-02-01T09:30:00",
    submittedDate: "2026-01-27T09:00:00",
    postingDate: null,
    history: [
      { actor: "Dewi Lestari", action: "created", date: "2026-01-25T10:00:00" },
      { actor: "Dewi Lestari", action: "submitted", date: "2026-01-27T09:00:00" },
      { actor: "Budi Setiawan", action: "rejected", date: "2026-02-01T09:30:00", comment: "Advance payments require VP approval. Please submit with supporting invoice." },
    ],
  },
]
