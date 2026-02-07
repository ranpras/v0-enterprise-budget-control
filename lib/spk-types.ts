// ── SPK (Spending Request / Commitment) Types & Status Lifecycle ─

export type SpkStatus =
  | "draft"
  | "submitted"
  | "supervisor_approved"
  | "admin_approved"
  | "active"
  | "rejected"
  | "cancelled"

export const SPK_STATUS_LABELS: Record<SpkStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  supervisor_approved: "Supervisor Approved",
  admin_approved: "Admin Approved",
  active: "Active",
  rejected: "Rejected",
  cancelled: "Cancelled",
}

export const SPK_STATUS_STYLES: Record<SpkStatus, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  submitted: "bg-primary/10 text-primary border-primary/20",
  supervisor_approved: "bg-warning/10 text-warning border-warning/20",
  admin_approved: "bg-success/10 text-success border-success/20",
  active: "bg-primary/15 text-primary border-primary/30",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  cancelled: "bg-muted text-muted-foreground border-border line-through",
}

// ── SPK Detail Row ──────────────────────────────────────────────
export interface SpkLineItem {
  id: string
  coa: string
  costCenter: string
  description: string
  budgetAvailable: number // read-only from budget
  spkAmount: number
}

export function getRemainingBudget(line: SpkLineItem): number {
  return line.budgetAvailable - line.spkAmount
}

// ── SPK History Entry ───────────────────────────────────────────
export interface SpkHistoryEntry {
  actor: string
  action:
    | "created"
    | "edited"
    | "submitted"
    | "approved"
    | "rejected"
    | "activated"
    | "cancelled"
  date: string
  comment?: string
}

// ── Main SPK Item ───────────────────────────────────────────────
export interface SpkItem {
  id: string
  spkNumber: string
  fiscalYear: number
  unitKerja: string
  vendor: string
  description: string
  contractRef: string // optional contract / reference no
  status: SpkStatus
  lineItems: SpkLineItem[]
  createdBy: string
  createdDate: string
  updatedDate: string
  submittedDate: string | null
  history: SpkHistoryEntry[]
}

// ── Sort ────────────────────────────────────────────────────────
export type SpkSortField =
  | "spkNumber"
  | "fiscalYear"
  | "unitKerja"
  | "vendor"
  | "description"
  | "totalAmount"
  | "status"
  | "submittedDate"

export type SortDirection = "asc" | "desc"

// ── Helpers ─────────────────────────────────────────────────────
export function getSpkTotal(item: SpkItem): number {
  return item.lineItems.reduce((sum, line) => sum + line.spkAmount, 0)
}

export function getBudgetUsagePercent(line: SpkLineItem): number {
  if (line.budgetAvailable === 0) return 0
  return (line.spkAmount / line.budgetAvailable) * 100
}

import { formatCurrency, formatDate, COA_OPTIONS, COST_CENTER_OPTIONS, UNIT_OPTIONS } from "./budget-types"
export { formatCurrency, formatDate, COA_OPTIONS, COST_CENTER_OPTIONS, UNIT_OPTIONS }

// ── Vendor options ──────────────────────────────────────────────
export const VENDOR_OPTIONS = [
  { value: "VND-001", label: "PT Telkom Indonesia" },
  { value: "VND-002", label: "PT Pertamina (Persero)" },
  { value: "VND-003", label: "CV Mitra Jaya Konstruksi" },
  { value: "VND-004", label: "PT Mega Solusi Teknologi" },
  { value: "VND-005", label: "PT Mandiri Office Supplies" },
  { value: "VND-006", label: "PT Kreasi Digital Nusantara" },
  { value: "VND-007", label: "PT Bumi Cakra Logistics" },
  { value: "VND-008", label: "PT Sinar Abadi Printing" },
] as const

// ── Mock Data ───────────────────────────────────────────────────
function makeLine(
  id: string,
  coa: string,
  cc: string,
  desc: string,
  budgetAvailable: number,
  spkAmount: number,
): SpkLineItem {
  return { id, coa, costCenter: cc, description: desc, budgetAvailable, spkAmount }
}

export const MOCK_SPKS: SpkItem[] = [
  {
    id: "spk_001",
    spkNumber: "SPK-2026-0001",
    fiscalYear: 2026,
    unitKerja: "IT Dept",
    vendor: "PT Mega Solusi Teknologi",
    description: "Server Hardware Procurement - Phase 2",
    contractRef: "CTR-IT-2026-0045",
    status: "active",
    lineItems: [
      makeLine("sl_001", "5201.001", "CC-IT-01", "Dell PowerEdge R760 x 10 units", 700_000_000, 450_000_000),
      makeLine("sl_002", "5201.002", "CC-IT-01", "Network switches and cabling", 250_000_000, 180_000_000),
    ],
    createdBy: "Rina Hartono",
    createdDate: "2026-01-20T09:00:00",
    updatedDate: "2026-02-04T16:00:00",
    submittedDate: "2026-01-22T10:00:00",
    history: [
      { actor: "Rina Hartono", action: "created", date: "2026-01-20T09:00:00" },
      { actor: "Rina Hartono", action: "submitted", date: "2026-01-22T10:00:00" },
      { actor: "Budi Setiawan", action: "approved", date: "2026-01-28T14:00:00", comment: "Specs verified. Approved." },
      { actor: "Sari Dewi", action: "approved", date: "2026-02-02T10:00:00", comment: "Final approval granted." },
      { actor: "Sari Dewi", action: "activated", date: "2026-02-04T16:00:00", comment: "Budget committed. SPK active." },
    ],
  },
  {
    id: "spk_002",
    spkNumber: "SPK-2026-0002",
    fiscalYear: 2026,
    unitKerja: "GA Dept",
    vendor: "CV Mitra Jaya Konstruksi",
    description: "Office Interior Renovation - 3rd Floor",
    contractRef: "CTR-GA-2026-0012",
    status: "submitted",
    lineItems: [
      makeLine("sl_003", "5301.010", "CC-GA-01", "Civil works and partitioning", 800_000_000, 320_000_000),
      makeLine("sl_004", "5301.011", "CC-GA-01", "Electrical rewiring", 220_000_000, 95_000_000),
      makeLine("sl_005", "5301.012", "CC-GA-01", "New furniture and fixtures", 230_000_000, 150_000_000),
    ],
    createdBy: "Ahmad Fauzi",
    createdDate: "2026-02-01T08:30:00",
    updatedDate: "2026-02-05T09:00:00",
    submittedDate: "2026-02-05T09:00:00",
    history: [
      { actor: "Ahmad Fauzi", action: "created", date: "2026-02-01T08:30:00" },
      { actor: "Ahmad Fauzi", action: "submitted", date: "2026-02-05T09:00:00" },
    ],
  },
  {
    id: "spk_003",
    spkNumber: "SPK-2026-0003",
    fiscalYear: 2026,
    unitKerja: "Marketing Dept",
    vendor: "PT Kreasi Digital Nusantara",
    description: "Q1 Digital Advertising Campaign",
    contractRef: "",
    status: "supervisor_approved",
    lineItems: [
      makeLine("sl_006", "5401.001", "CC-MKT-01", "Google Ads & Meta Ads Q1", 1_500_000_000, 350_000_000),
      makeLine("sl_007", "5401.002", "CC-MKT-01", "Influencer partnerships", 380_000_000, 120_000_000),
    ],
    createdBy: "Dewi Lestari",
    createdDate: "2026-01-15T10:00:00",
    updatedDate: "2026-02-03T11:00:00",
    submittedDate: "2026-01-18T09:00:00",
    history: [
      { actor: "Dewi Lestari", action: "created", date: "2026-01-15T10:00:00" },
      { actor: "Dewi Lestari", action: "submitted", date: "2026-01-18T09:00:00" },
      { actor: "Budi Setiawan", action: "approved", date: "2026-02-03T11:00:00", comment: "Campaign plan reviewed. Approved." },
    ],
  },
  {
    id: "spk_004",
    spkNumber: "SPK-2026-0004",
    fiscalYear: 2026,
    unitKerja: "IT Dept",
    vendor: "PT Telkom Indonesia",
    description: "Cloud Infrastructure - Monthly Subscription Q1",
    contractRef: "CTR-IT-2026-0050",
    status: "draft",
    lineItems: [
      makeLine("sl_008", "5201.010", "CC-IT-01", "AWS Reserved Instances (Jan-Mar)", 1_140_000_000, 285_000_000),
      makeLine("sl_009", "5201.011", "CC-IT-01", "S3 + RDS provisioning", 600_000_000, 150_000_000),
    ],
    createdBy: "Rina Hartono",
    createdDate: "2026-02-06T14:00:00",
    updatedDate: "2026-02-06T16:30:00",
    submittedDate: null,
    history: [
      { actor: "Rina Hartono", action: "created", date: "2026-02-06T14:00:00" },
      { actor: "Rina Hartono", action: "edited", date: "2026-02-06T16:30:00", comment: "Updated RDS sizing." },
    ],
  },
  {
    id: "spk_005",
    spkNumber: "SPK-2026-0005",
    fiscalYear: 2026,
    unitKerja: "HR Dept",
    vendor: "PT Mandiri Office Supplies",
    description: "Employee Wellness Program Q1",
    contractRef: "",
    status: "rejected",
    lineItems: [
      makeLine("sl_010", "5501.001", "CC-HR-01", "Health screening packages", 1_440_000_000, 200_000_000),
      makeLine("sl_011", "5501.002", "CC-HR-01", "Catering for wellness event", 480_000_000, 80_000_000),
    ],
    createdBy: "Maya Indah",
    createdDate: "2026-01-25T11:00:00",
    updatedDate: "2026-02-04T09:30:00",
    submittedDate: "2026-01-28T10:00:00",
    history: [
      { actor: "Maya Indah", action: "created", date: "2026-01-25T11:00:00" },
      { actor: "Maya Indah", action: "submitted", date: "2026-01-28T10:00:00" },
      { actor: "Budi Setiawan", action: "rejected", date: "2026-02-04T09:30:00", comment: "Please obtain 3 vendor quotes and resubmit with comparative pricing." },
    ],
  },
  {
    id: "spk_006",
    spkNumber: "SPK-2026-0006",
    fiscalYear: 2026,
    unitKerja: "Operations Dept",
    vendor: "PT Bumi Cakra Logistics",
    description: "GPS Tracking Device Procurement",
    contractRef: "CTR-OPS-2026-0008",
    status: "admin_approved",
    lineItems: [
      makeLine("sl_012", "5101.001", "CC-OPS-01", "GPS trackers x 200 units", 200_000_000, 140_000_000),
    ],
    createdBy: "Hadi Sutanto",
    createdDate: "2026-01-18T09:00:00",
    updatedDate: "2026-02-05T15:00:00",
    submittedDate: "2026-01-20T09:00:00",
    history: [
      { actor: "Hadi Sutanto", action: "created", date: "2026-01-18T09:00:00" },
      { actor: "Hadi Sutanto", action: "submitted", date: "2026-01-20T09:00:00" },
      { actor: "Budi Setiawan", action: "approved", date: "2026-01-30T10:00:00", comment: "Quantity verified against fleet plan." },
      { actor: "Sari Dewi", action: "approved", date: "2026-02-05T15:00:00", comment: "Final approved. Ready for activation." },
    ],
  },
  {
    id: "spk_007",
    spkNumber: "SPK-2026-0007",
    fiscalYear: 2026,
    unitKerja: "Procurement Dept",
    vendor: "PT Sinar Abadi Printing",
    description: "Office Stationery Supply Q1",
    contractRef: "",
    status: "cancelled",
    lineItems: [
      makeLine("sl_013", "5701.001", "CC-PRO-01", "Stationery bulk order", 180_000_000, 45_000_000),
      makeLine("sl_014", "5701.002", "CC-PRO-01", "Toner cartridges", 120_000_000, 30_000_000),
    ],
    createdBy: "Siti Nurhaliza",
    createdDate: "2026-01-10T14:00:00",
    updatedDate: "2026-02-03T10:00:00",
    submittedDate: "2026-01-12T09:00:00",
    history: [
      { actor: "Siti Nurhaliza", action: "created", date: "2026-01-10T14:00:00" },
      { actor: "Siti Nurhaliza", action: "submitted", date: "2026-01-12T09:00:00" },
      { actor: "Budi Setiawan", action: "approved", date: "2026-01-20T10:00:00" },
      { actor: "Sari Dewi", action: "approved", date: "2026-01-25T14:00:00" },
      { actor: "Sari Dewi", action: "activated", date: "2026-01-28T10:00:00", comment: "SPK activated." },
      { actor: "Sari Dewi", action: "cancelled", date: "2026-02-03T10:00:00", comment: "Vendor unable to fulfil. Replaced by SPK-2026-0009. Commitment released." },
    ],
  },
]
