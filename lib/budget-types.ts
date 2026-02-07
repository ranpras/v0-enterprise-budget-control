// ── Budget Types & Status Lifecycle ──────────────────────────────

export type BudgetType = "project" | "routine"

export const BUDGET_TYPE_LABELS: Record<BudgetType, string> = {
  project: "Budget Project (CAPEX)",
  routine: "Budget Rutin (OPEX)",
}

export type BudgetStatus =
  | "draft"
  | "submitted"
  | "supervisor_approved"
  | "admin_approved"
  | "locked"
  | "rejected"

export const BUDGET_STATUS_LABELS: Record<BudgetStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  supervisor_approved: "Supervisor Approved",
  admin_approved: "Admin Approved",
  locked: "Locked",
  rejected: "Rejected",
}

export const BUDGET_STATUS_STYLES: Record<BudgetStatus, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  submitted: "bg-primary/10 text-primary border-primary/20",
  supervisor_approved: "bg-warning/10 text-warning border-warning/20",
  admin_approved: "bg-success/10 text-success border-success/20",
  locked: "bg-foreground/10 text-foreground border-foreground/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
}

// ── Months ──────────────────────────────────────────────────────
export const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const

// ── Budget Detail Row ───────────────────────────────────────────
export interface BudgetLineItem {
  id: string
  coa: string
  costCenter: string
  description: string
  monthly: number[] // 12 elements, Jan–Dec
}

// ── Budget History Entry ────────────────────────────────────────
export interface BudgetHistoryEntry {
  actor: string
  action: "created" | "submitted" | "approved" | "rejected" | "locked" | "edited"
  date: string
  comment?: string
}

// ── Main Budget Item ────────────────────────────────────────────
export interface BudgetItem {
  id: string
  budgetId: string
  fiscalYear: number
  unitKerja: string
  budgetType: BudgetType
  description: string
  status: BudgetStatus
  lineItems: BudgetLineItem[]
  createdBy: string
  createdDate: string
  updatedDate: string
  history: BudgetHistoryEntry[]
}

// ── Sort ────────────────────────────────────────────────────────
export type BudgetSortField =
  | "budgetId"
  | "fiscalYear"
  | "unitKerja"
  | "description"
  | "totalBudget"
  | "status"
  | "updatedDate"

export type SortDirection = "asc" | "desc"

// ── Helpers ─────────────────────────────────────────────────────
export function getLineTotal(row: BudgetLineItem): number {
  return row.monthly.reduce((sum, v) => sum + v, 0)
}

export function getBudgetTotal(item: BudgetItem): number {
  return item.lineItems.reduce((sum, row) => sum + getLineTotal(row), 0)
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

// ── COA options (leaf only) ─────────────────────────────────────
export const COA_OPTIONS = [
  { value: "5101.001", label: "5101.001 - Fleet Maintenance & Fuel" },
  { value: "5101.002", label: "5101.002 - Warehouse Operations" },
  { value: "5101.003", label: "5101.003 - Third-party Logistics" },
  { value: "5201.001", label: "5201.001 - Server Hardware" },
  { value: "5201.002", label: "5201.002 - Network Equipment" },
  { value: "5201.003", label: "5201.003 - Installation Services" },
  { value: "5201.010", label: "5201.010 - Cloud Compute" },
  { value: "5201.011", label: "5201.011 - Cloud Storage" },
  { value: "5301.010", label: "5301.010 - Civil & Interior Works" },
  { value: "5301.011", label: "5301.011 - Electrical & Lighting" },
  { value: "5301.012", label: "5301.012 - Furniture & Fixtures" },
  { value: "5401.001", label: "5401.001 - Digital Advertising" },
  { value: "5401.002", label: "5401.002 - Brand Activation" },
  { value: "5501.001", label: "5501.001 - External Training" },
  { value: "5501.002", label: "5501.002 - Venue & Logistics" },
  { value: "5601.001", label: "5601.001 - External Legal Counsel" },
  { value: "5701.001", label: "5701.001 - Stationery Supplies" },
  { value: "5701.002", label: "5701.002 - Toner & Consumables" },
] as const

export const COST_CENTER_OPTIONS = [
  { value: "CC-FIN-01", label: "CC-FIN-01 - Finance Division" },
  { value: "CC-IT-01", label: "CC-IT-01 - IT Division" },
  { value: "CC-OPS-01", label: "CC-OPS-01 - Operations Division" },
  { value: "CC-HR-01", label: "CC-HR-01 - HR Division" },
  { value: "CC-MKT-01", label: "CC-MKT-01 - Marketing Division" },
  { value: "CC-GA-01", label: "CC-GA-01 - General Affairs" },
  { value: "CC-LGL-01", label: "CC-LGL-01 - Legal Division" },
  { value: "CC-PRO-01", label: "CC-PRO-01 - Procurement Division" },
] as const

// ── Unit options ────────────────────────────────────────────────
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

// ── Mock Data ───────────────────────────────────────────────────
function makeLine(
  id: string,
  coa: string,
  cc: string,
  desc: string,
  monthly: number[],
): BudgetLineItem {
  return { id, coa, costCenter: cc, description: desc, monthly }
}

export const MOCK_BUDGETS_PROJECT: BudgetItem[] = [
  {
    id: "bp_001",
    budgetId: "BDG-PRJ-2026-0001",
    fiscalYear: 2026,
    unitKerja: "IT Dept",
    budgetType: "project",
    description: "Data Center Expansion Phase 2",
    status: "draft",
    lineItems: [
      makeLine("bl_001", "5201.001", "CC-IT-01", "Server Hardware Procurement", [200e6, 200e6, 150e6, 100e6, 50e6, 0, 0, 0, 0, 0, 0, 0]),
      makeLine("bl_002", "5201.002", "CC-IT-01", "Network Switch & Cabling", [50e6, 80e6, 80e6, 40e6, 0, 0, 0, 0, 0, 0, 0, 0]),
      makeLine("bl_003", "5201.003", "CC-IT-01", "Installation & Configuration", [0, 0, 30e6, 60e6, 60e6, 30e6, 0, 0, 0, 0, 0, 0]),
    ],
    createdBy: "Rina Hartono",
    createdDate: "2026-01-15T10:00:00",
    updatedDate: "2026-02-01T14:30:00",
    history: [
      { actor: "Rina Hartono", action: "created", date: "2026-01-15T10:00:00" },
      { actor: "Rina Hartono", action: "edited", date: "2026-02-01T14:30:00", comment: "Updated server specs to R760." },
    ],
  },
  {
    id: "bp_002",
    budgetId: "BDG-PRJ-2026-0002",
    fiscalYear: 2026,
    unitKerja: "GA Dept",
    budgetType: "project",
    description: "Office Renovation - HQ Building",
    status: "submitted",
    lineItems: [
      makeLine("bl_004", "5301.010", "CC-GA-01", "Civil & Interior Works", [0, 100e6, 150e6, 200e6, 200e6, 150e6, 0, 0, 0, 0, 0, 0]),
      makeLine("bl_005", "5301.011", "CC-GA-01", "Electrical & Lighting Upgrade", [0, 0, 40e6, 60e6, 80e6, 40e6, 0, 0, 0, 0, 0, 0]),
      makeLine("bl_006", "5301.012", "CC-GA-01", "Furniture & Fixtures", [0, 0, 0, 0, 50e6, 100e6, 80e6, 0, 0, 0, 0, 0]),
    ],
    createdBy: "Ahmad Fauzi",
    createdDate: "2026-01-10T08:30:00",
    updatedDate: "2026-01-28T11:00:00",
    history: [
      { actor: "Ahmad Fauzi", action: "created", date: "2026-01-10T08:30:00" },
      { actor: "Ahmad Fauzi", action: "submitted", date: "2026-01-28T11:00:00" },
    ],
  },
  {
    id: "bp_003",
    budgetId: "BDG-PRJ-2026-0003",
    fiscalYear: 2026,
    unitKerja: "Operations Dept",
    budgetType: "project",
    description: "Fleet Management System Implementation",
    status: "supervisor_approved",
    lineItems: [
      makeLine("bl_007", "5101.001", "CC-OPS-01", "GPS Tracking Hardware", [80e6, 80e6, 40e6, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
      makeLine("bl_008", "5201.010", "CC-OPS-01", "Software License & Development", [0, 50e6, 100e6, 100e6, 50e6, 0, 0, 0, 0, 0, 0, 0]),
    ],
    createdBy: "Hadi Sutanto",
    createdDate: "2026-01-05T09:00:00",
    updatedDate: "2026-02-03T15:45:00",
    history: [
      { actor: "Hadi Sutanto", action: "created", date: "2026-01-05T09:00:00" },
      { actor: "Hadi Sutanto", action: "submitted", date: "2026-01-20T09:30:00" },
      { actor: "Budi Setiawan", action: "approved", date: "2026-02-03T15:45:00", comment: "Budget within allocation limits." },
    ],
  },
  {
    id: "bp_004",
    budgetId: "BDG-PRJ-2026-0004",
    fiscalYear: 2026,
    unitKerja: "Marketing Dept",
    budgetType: "project",
    description: "Brand Refresh & Digital Campaign",
    status: "admin_approved",
    lineItems: [
      makeLine("bl_009", "5401.001", "CC-MKT-01", "Digital Advertising Campaign", [100e6, 120e6, 150e6, 150e6, 120e6, 100e6, 80e6, 80e6, 100e6, 120e6, 150e6, 130e6]),
      makeLine("bl_010", "5401.002", "CC-MKT-01", "Brand Activation Events", [0, 0, 80e6, 0, 0, 100e6, 0, 0, 80e6, 0, 0, 120e6]),
    ],
    createdBy: "Dewi Lestari",
    createdDate: "2025-12-10T14:00:00",
    updatedDate: "2026-01-25T10:00:00",
    history: [
      { actor: "Dewi Lestari", action: "created", date: "2025-12-10T14:00:00" },
      { actor: "Dewi Lestari", action: "submitted", date: "2025-12-20T09:00:00" },
      { actor: "Budi Setiawan", action: "approved", date: "2026-01-10T14:00:00", comment: "Approved. Aligned with annual plan." },
      { actor: "Sari Dewi", action: "approved", date: "2026-01-25T10:00:00", comment: "Final approval granted." },
    ],
  },
  {
    id: "bp_005",
    budgetId: "BDG-PRJ-2026-0005",
    fiscalYear: 2026,
    unitKerja: "HR Dept",
    budgetType: "project",
    description: "HRIS System Upgrade",
    status: "locked",
    lineItems: [
      makeLine("bl_011", "5201.010", "CC-HR-01", "HRIS Software License", [0, 50e6, 0, 0, 0, 50e6, 0, 0, 0, 0, 0, 50e6]),
      makeLine("bl_012", "5501.001", "CC-HR-01", "Implementation & Training", [0, 0, 30e6, 40e6, 20e6, 0, 0, 0, 0, 0, 0, 0]),
    ],
    createdBy: "Maya Indah",
    createdDate: "2025-11-20T10:00:00",
    updatedDate: "2026-01-15T16:00:00",
    history: [
      { actor: "Maya Indah", action: "created", date: "2025-11-20T10:00:00" },
      { actor: "Maya Indah", action: "submitted", date: "2025-12-01T10:00:00" },
      { actor: "Budi Setiawan", action: "approved", date: "2025-12-15T09:00:00" },
      { actor: "Sari Dewi", action: "approved", date: "2026-01-10T11:00:00" },
      { actor: "Sari Dewi", action: "locked", date: "2026-01-15T16:00:00", comment: "Budget locked for execution." },
    ],
  },
  {
    id: "bp_006",
    budgetId: "BDG-PRJ-2026-0006",
    fiscalYear: 2026,
    unitKerja: "Finance Dept",
    budgetType: "project",
    description: "ERP Finance Module Enhancement",
    status: "rejected",
    lineItems: [
      makeLine("bl_013", "5201.010", "CC-FIN-01", "SAP Module Customization", [0, 0, 200e6, 250e6, 250e6, 200e6, 0, 0, 0, 0, 0, 0]),
    ],
    createdBy: "Rina Hartono",
    createdDate: "2026-01-08T11:00:00",
    updatedDate: "2026-01-30T09:00:00",
    history: [
      { actor: "Rina Hartono", action: "created", date: "2026-01-08T11:00:00" },
      { actor: "Rina Hartono", action: "submitted", date: "2026-01-20T14:00:00" },
      { actor: "Budi Setiawan", action: "rejected", date: "2026-01-30T09:00:00", comment: "Budget exceeds unit allocation. Please revise scope and resubmit." },
    ],
  },
]

export const MOCK_BUDGETS_ROUTINE: BudgetItem[] = [
  {
    id: "br_001",
    budgetId: "BDG-OPX-2026-0001",
    fiscalYear: 2026,
    unitKerja: "IT Dept",
    budgetType: "routine",
    description: "IT Monthly Cloud & SaaS Subscriptions",
    status: "locked",
    lineItems: [
      makeLine("rl_001", "5201.010", "CC-IT-01", "AWS Compute (EC2 + ECS)", [95e6, 95e6, 95e6, 95e6, 95e6, 95e6, 95e6, 95e6, 95e6, 95e6, 95e6, 95e6]),
      makeLine("rl_002", "5201.011", "CC-IT-01", "AWS Storage (S3 + RDS)", [50e6, 50e6, 50e6, 50e6, 50e6, 50e6, 50e6, 50e6, 50e6, 50e6, 50e6, 50e6]),
      makeLine("rl_003", "5701.002", "CC-IT-01", "Software Licenses (Office 365, etc.)", [25e6, 25e6, 25e6, 25e6, 25e6, 25e6, 25e6, 25e6, 25e6, 25e6, 25e6, 25e6]),
    ],
    createdBy: "Rina Hartono",
    createdDate: "2025-11-01T08:00:00",
    updatedDate: "2026-01-05T10:00:00",
    history: [
      { actor: "Rina Hartono", action: "created", date: "2025-11-01T08:00:00" },
      { actor: "Rina Hartono", action: "submitted", date: "2025-11-15T09:00:00" },
      { actor: "Budi Setiawan", action: "approved", date: "2025-12-01T10:00:00" },
      { actor: "Sari Dewi", action: "approved", date: "2025-12-15T14:00:00" },
      { actor: "Sari Dewi", action: "locked", date: "2026-01-05T10:00:00" },
    ],
  },
  {
    id: "br_002",
    budgetId: "BDG-OPX-2026-0002",
    fiscalYear: 2026,
    unitKerja: "GA Dept",
    budgetType: "routine",
    description: "Office Facility Maintenance & Utilities",
    status: "submitted",
    lineItems: [
      makeLine("rl_004", "5301.010", "CC-GA-01", "Facility Maintenance", [35e6, 35e6, 35e6, 35e6, 35e6, 35e6, 35e6, 35e6, 35e6, 35e6, 35e6, 35e6]),
      makeLine("rl_005", "5301.011", "CC-GA-01", "Electricity & Water", [20e6, 20e6, 22e6, 25e6, 28e6, 30e6, 30e6, 28e6, 25e6, 22e6, 20e6, 20e6]),
    ],
    createdBy: "Ahmad Fauzi",
    createdDate: "2026-01-20T09:00:00",
    updatedDate: "2026-02-01T10:00:00",
    history: [
      { actor: "Ahmad Fauzi", action: "created", date: "2026-01-20T09:00:00" },
      { actor: "Ahmad Fauzi", action: "submitted", date: "2026-02-01T10:00:00" },
    ],
  },
  {
    id: "br_003",
    budgetId: "BDG-OPX-2026-0003",
    fiscalYear: 2026,
    unitKerja: "HR Dept",
    budgetType: "routine",
    description: "Employee Benefits & Welfare",
    status: "draft",
    lineItems: [
      makeLine("rl_006", "5501.001", "CC-HR-01", "Health Insurance Premium", [120e6, 120e6, 120e6, 120e6, 120e6, 120e6, 120e6, 120e6, 120e6, 120e6, 120e6, 120e6]),
      makeLine("rl_007", "5501.002", "CC-HR-01", "Employee Meal Allowance", [40e6, 40e6, 40e6, 40e6, 40e6, 40e6, 40e6, 40e6, 40e6, 40e6, 40e6, 40e6]),
    ],
    createdBy: "Maya Indah",
    createdDate: "2026-02-03T11:00:00",
    updatedDate: "2026-02-05T16:00:00",
    history: [
      { actor: "Maya Indah", action: "created", date: "2026-02-03T11:00:00" },
      { actor: "Maya Indah", action: "edited", date: "2026-02-05T16:00:00", comment: "Added meal allowance line." },
    ],
  },
  {
    id: "br_004",
    budgetId: "BDG-OPX-2026-0004",
    fiscalYear: 2026,
    unitKerja: "Procurement Dept",
    budgetType: "routine",
    description: "Office Supplies & Consumables",
    status: "supervisor_approved",
    lineItems: [
      makeLine("rl_008", "5701.001", "CC-PRO-01", "Stationery & Paper", [15e6, 15e6, 15e6, 15e6, 15e6, 15e6, 15e6, 15e6, 15e6, 15e6, 15e6, 15e6]),
      makeLine("rl_009", "5701.002", "CC-PRO-01", "Toner & Printer Consumables", [10e6, 10e6, 10e6, 10e6, 10e6, 10e6, 10e6, 10e6, 10e6, 10e6, 10e6, 10e6]),
    ],
    createdBy: "Siti Nurhaliza",
    createdDate: "2026-01-12T14:00:00",
    updatedDate: "2026-02-04T09:00:00",
    history: [
      { actor: "Siti Nurhaliza", action: "created", date: "2026-01-12T14:00:00" },
      { actor: "Siti Nurhaliza", action: "submitted", date: "2026-01-25T10:00:00" },
      { actor: "Budi Setiawan", action: "approved", date: "2026-02-04T09:00:00", comment: "Routine allocation confirmed." },
    ],
  },
]
