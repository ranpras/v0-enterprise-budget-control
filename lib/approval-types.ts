// ── Transaction types ───────────────────────────────────────────
export type TransactionType = "budget" | "revision" | "spk" | "actual"

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  budget: "Budget Planning",
  revision: "Budget Revision",
  spk: "Spending Request",
  actual: "Actual Realization",
}

export const TRANSACTION_TYPE_COLORS: Record<TransactionType, string> = {
  budget: "bg-primary/10 text-primary border-primary/20",
  revision: "bg-warning/10 text-warning border-warning/20",
  spk: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  actual: "bg-chart-5/10 text-chart-5 border-chart-5/20",
}

// ── Status ──────────────────────────────────────────────────────
export type ApprovalStatus = "pending" | "approved" | "rejected"

export const STATUS_LABELS: Record<ApprovalStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
}

export const STATUS_STYLES: Record<ApprovalStatus, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
}

// ── Line item ───────────────────────────────────────────────────
export interface LineItem {
  id: string
  coa: string
  description: string
  amount: number
}

// ── Approval history entry ──────────────────────────────────────
export interface ApprovalHistoryEntry {
  approver: string
  action: "submitted" | "approved" | "rejected" | "reviewed"
  date: string
  comment?: string
}

// ── Main approval item ──────────────────────────────────────────
export interface ApprovalItem {
  id: string
  docNumber: string
  type: TransactionType
  description: string
  unit: string
  amount: number
  submittedBy: string
  submittedDate: string
  status: ApprovalStatus
  lineItems: LineItem[]
  history: ApprovalHistoryEntry[]
  budgetImpact?: {
    baseline: number
    currentCommitment: number
    afterApproval: number
    remaining: number
  }
}

// ── Unit list ───────────────────────────────────────────────────
export const UNIT_OPTIONS = [
  "All Units",
  "IT Dept",
  "Finance Dept",
  "GA Dept",
  "HR Dept",
  "Marketing Dept",
  "Operations Dept",
  "Procurement Dept",
  "Legal Dept",
] as const

// ── Sorting ─────────────────────────────────────────────────────
export type SortField =
  | "docNumber"
  | "type"
  | "unit"
  | "amount"
  | "submittedBy"
  | "submittedDate"

export type SortDirection = "asc" | "desc"

// ── Currency formatter ──────────────────────────────────────────
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// ── Mock data ───────────────────────────────────────────────────
export const MOCK_APPROVALS: ApprovalItem[] = [
  {
    id: "appr_001",
    docNumber: "SPK-2026-0047",
    type: "spk",
    description: "Server Procurement for Data Center Expansion",
    unit: "IT Dept",
    amount: 850000000,
    submittedBy: "Rina Hartono",
    submittedDate: "2026-02-05T14:32:00",
    status: "pending",
    lineItems: [
      { id: "li_001", coa: "5201.001", description: "Dell PowerEdge R760 Server x4", amount: 640000000 },
      { id: "li_002", coa: "5201.002", description: "Network Switch Cisco Catalyst 9300", amount: 120000000 },
      { id: "li_003", coa: "5201.003", description: "Installation & Configuration Service", amount: 90000000 },
    ],
    history: [
      { approver: "Rina Hartono", action: "submitted", date: "2026-02-05T14:32:00" },
      { approver: "Budi Setiawan", action: "reviewed", date: "2026-02-05T16:10:00", comment: "Specs verified, forwarded to budget admin." },
    ],
    budgetImpact: { baseline: 5000000000, currentCommitment: 2100000000, afterApproval: 2950000000, remaining: 2050000000 },
  },
  {
    id: "appr_002",
    docNumber: "ACT-2026-0112",
    type: "actual",
    description: "Office Renovation Phase 2 - Floor 3",
    unit: "GA Dept",
    amount: 320000000,
    submittedBy: "Ahmad Fauzi",
    submittedDate: "2026-02-04T09:15:00",
    status: "pending",
    lineItems: [
      { id: "li_004", coa: "5301.010", description: "Civil & Interior Works", amount: 210000000 },
      { id: "li_005", coa: "5301.011", description: "Electrical & Lighting Upgrade", amount: 65000000 },
      { id: "li_006", coa: "5301.012", description: "Furniture & Fixtures", amount: 45000000 },
    ],
    history: [
      { approver: "Ahmad Fauzi", action: "submitted", date: "2026-02-04T09:15:00" },
    ],
    budgetImpact: { baseline: 2000000000, currentCommitment: 1200000000, afterApproval: 1520000000, remaining: 480000000 },
  },
  {
    id: "appr_003",
    docNumber: "REV-2026-0009",
    type: "revision",
    description: "Marketing Campaign Budget Increase Q2",
    unit: "Marketing Dept",
    amount: 1500000000,
    submittedBy: "Dewi Lestari",
    submittedDate: "2026-02-03T16:45:00",
    status: "pending",
    lineItems: [
      { id: "li_007", coa: "5401.001", description: "Digital Advertising - Google & Meta", amount: 800000000 },
      { id: "li_008", coa: "5401.002", description: "Brand Activation Events", amount: 450000000 },
      { id: "li_009", coa: "5401.003", description: "Content Production & Creative", amount: 250000000 },
    ],
    history: [
      { approver: "Dewi Lestari", action: "submitted", date: "2026-02-03T16:45:00" },
      { approver: "Budi Setiawan", action: "approved", date: "2026-02-04T10:30:00", comment: "Aligned with Q2 strategy." },
    ],
    budgetImpact: { baseline: 3000000000, currentCommitment: 1500000000, afterApproval: 3000000000, remaining: 0 },
  },
  {
    id: "appr_004",
    docNumber: "SPK-2026-0048",
    type: "spk",
    description: "Annual Employee Training Program",
    unit: "HR Dept",
    amount: 150000000,
    submittedBy: "Maya Indah",
    submittedDate: "2026-02-03T11:20:00",
    status: "pending",
    lineItems: [
      { id: "li_010", coa: "5501.001", description: "External Trainer Fee (Leadership)", amount: 60000000 },
      { id: "li_011", coa: "5501.002", description: "Venue & Logistics", amount: 40000000 },
      { id: "li_012", coa: "5501.003", description: "Online Learning Platform License", amount: 50000000 },
    ],
    history: [
      { approver: "Maya Indah", action: "submitted", date: "2026-02-03T11:20:00" },
    ],
    budgetImpact: { baseline: 800000000, currentCommitment: 350000000, afterApproval: 500000000, remaining: 300000000 },
  },
  {
    id: "appr_005",
    docNumber: "BDG-2026-0015",
    type: "budget",
    description: "Q3 Operations Budget - Logistics Division",
    unit: "Operations Dept",
    amount: 2800000000,
    submittedBy: "Hadi Sutanto",
    submittedDate: "2026-02-02T08:00:00",
    status: "pending",
    lineItems: [
      { id: "li_013", coa: "5101.001", description: "Fleet Maintenance & Fuel", amount: 1200000000 },
      { id: "li_014", coa: "5101.002", description: "Warehouse Operations", amount: 900000000 },
      { id: "li_015", coa: "5101.003", description: "Third-party Logistics Partners", amount: 700000000 },
    ],
    history: [
      { approver: "Hadi Sutanto", action: "submitted", date: "2026-02-02T08:00:00" },
      { approver: "Budi Setiawan", action: "reviewed", date: "2026-02-02T14:00:00", comment: "All allocations within guideline. Recommending approval." },
    ],
    budgetImpact: { baseline: 10000000000, currentCommitment: 4200000000, afterApproval: 7000000000, remaining: 3000000000 },
  },
  {
    id: "appr_006",
    docNumber: "ACT-2026-0098",
    type: "actual",
    description: "Cloud Infrastructure Monthly - January 2026",
    unit: "IT Dept",
    amount: 175000000,
    submittedBy: "Rina Hartono",
    submittedDate: "2026-02-01T10:00:00",
    status: "pending",
    lineItems: [
      { id: "li_016", coa: "5201.010", description: "AWS Compute (EC2 + ECS)", amount: 95000000 },
      { id: "li_017", coa: "5201.011", description: "AWS Storage (S3 + RDS)", amount: 50000000 },
      { id: "li_018", coa: "5201.012", description: "CDN & Bandwidth", amount: 30000000 },
    ],
    history: [
      { approver: "Rina Hartono", action: "submitted", date: "2026-02-01T10:00:00" },
    ],
    budgetImpact: { baseline: 2400000000, currentCommitment: 350000000, afterApproval: 525000000, remaining: 1875000000 },
  },
  {
    id: "appr_007",
    docNumber: "REV-2026-0010",
    type: "revision",
    description: "Legal Compliance Audit - Additional Scope",
    unit: "Legal Dept",
    amount: 250000000,
    submittedBy: "Fajar Wibowo",
    submittedDate: "2026-01-31T15:30:00",
    status: "pending",
    lineItems: [
      { id: "li_019", coa: "5601.001", description: "External Legal Counsel", amount: 180000000 },
      { id: "li_020", coa: "5601.002", description: "Regulatory Filing Fees", amount: 70000000 },
    ],
    history: [
      { approver: "Fajar Wibowo", action: "submitted", date: "2026-01-31T15:30:00" },
    ],
    budgetImpact: { baseline: 1000000000, currentCommitment: 500000000, afterApproval: 750000000, remaining: 250000000 },
  },
  {
    id: "appr_008",
    docNumber: "SPK-2026-0050",
    type: "spk",
    description: "Office Supplies Q1 Bulk Purchase",
    unit: "Procurement Dept",
    amount: 45000000,
    submittedBy: "Siti Nurhaliza",
    submittedDate: "2026-01-30T09:45:00",
    status: "pending",
    lineItems: [
      { id: "li_021", coa: "5701.001", description: "Stationery & Paper Supplies", amount: 15000000 },
      { id: "li_022", coa: "5701.002", description: "Toner & Printer Consumables", amount: 20000000 },
      { id: "li_023", coa: "5701.003", description: "Cleaning Materials", amount: 10000000 },
    ],
    history: [
      { approver: "Siti Nurhaliza", action: "submitted", date: "2026-01-30T09:45:00" },
    ],
    budgetImpact: { baseline: 200000000, currentCommitment: 80000000, afterApproval: 125000000, remaining: 75000000 },
  },
]
