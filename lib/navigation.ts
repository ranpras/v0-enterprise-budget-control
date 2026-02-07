import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  FilePen,
  FileSearch,
  FileCheck,
  FilePlus,
  FileMinus,
  FileUp,
  ClipboardList,
  ClipboardCheck,
  ClipboardPen,
  Activity,
  Receipt,
  ReceiptText,
  CheckCircle,
  Undo2,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  FileBarChart,
  Download,
  Inbox,
  Database,
  Calendar,
  Building2,
  BookOpen,
  MapPin,
  Truck,
  FolderOpen,
  GitBranch,
  Users,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { Role } from "./rbac"

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  roles: Role[]
  badge?: string
}

export interface NavGroup {
  label: string
  icon: LucideIcon
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  // ── 1. DASHBOARD ─────────────────────────────────────────────
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    items: [
      {
        title: "Dashboard Overview",
        href: "/",
        icon: LayoutDashboard,
        roles: ["operator", "supervisor", "admin", "management"],
      },
    ],
  },

  // ── 2. BUDGET PLANNING ───────────────────────────────────────
  {
    label: "Budget Planning",
    icon: FileText,
    items: [
      {
        title: "Budget Project",
        href: "/budget/project",
        icon: FolderKanban,
        roles: ["operator", "supervisor", "admin"],
      },
      {
        title: "Budget Rutin (OPEX)",
        href: "/budget/routine",
        icon: FileText,
        roles: ["operator", "supervisor", "admin"],
      },
      {
        title: "Draft Budget",
        href: "/budget/draft",
        icon: FilePen,
        roles: ["operator"],
      },
      {
        title: "Review Budget",
        href: "/budget/review",
        icon: FileSearch,
        roles: ["supervisor", "admin"],
      },
      {
        title: "Approval Budget",
        href: "/budget/approval",
        icon: FileCheck,
        roles: ["supervisor", "admin"],
      },
    ],
  },

  // ── 3. BUDGET REVISION / UNBUDGET ────────────────────────────
  {
    label: "Budget Revision / Unbudget",
    icon: FilePlus,
    items: [
      {
        title: "All Revisions",
        href: "/revision",
        icon: FilePlus,
        roles: ["operator", "supervisor", "admin", "management"],
      },
      {
        title: "Submit Revision",
        href: "/revision/submit",
        icon: FileUp,
        roles: ["operator"],
      },
      {
        title: "Review Revision",
        href: "/revision/review",
        icon: FileSearch,
        roles: ["supervisor", "admin"],
      },
      {
        title: "Approval Revision",
        href: "/revision/approval",
        icon: FileCheck,
        roles: ["admin"],
      },
    ],
  },

  // ── 4. SPENDING REQUEST (COMMITMENT / SPK) ───────────────────
  {
    label: "Spending Request (SPK)",
    icon: ClipboardList,
    items: [
      {
        title: "Create SPK",
        href: "/spending/create",
        icon: ClipboardPen,
        roles: ["operator"],
      },
      {
        title: "Review SPK",
        href: "/spending/review",
        icon: ClipboardCheck,
        roles: ["supervisor"],
      },
      {
        title: "Approval SPK",
        href: "/spending/approval",
        icon: FileCheck,
        roles: ["admin"],
      },
      {
        title: "Active Commitments",
        href: "/spending/active",
        icon: Activity,
        roles: ["operator", "supervisor", "admin"],
      },
    ],
  },

  // ── 5. ACTUAL REALIZATION ────────────────────────────────────
  {
    label: "Actual Realization",
    icon: Receipt,
    items: [
      {
        title: "Input Actual",
        href: "/actual/input",
        icon: ReceiptText,
        roles: ["operator"],
      },
      {
        title: "Review Actual",
        href: "/actual/review",
        icon: FileSearch,
        roles: ["supervisor"],
      },
      {
        title: "Approval & Posting",
        href: "/actual/approval",
        icon: CheckCircle,
        roles: ["admin"],
      },
      {
        title: "Reversal",
        href: "/actual/reversal",
        icon: Undo2,
        roles: ["admin"],
      },
    ],
  },

  // ── 6. MONITORING & CONTROL ──────────────────────────────────
  {
    label: "Monitoring & Control",
    icon: BarChart3,
    items: [
      {
        title: "Budget vs Actual (Project)",
        href: "/monitoring/project",
        icon: BarChart3,
        roles: ["operator", "supervisor", "admin", "management"],
      },
      {
        title: "Budget vs Actual (Rutin)",
        href: "/monitoring/routine",
        icon: TrendingUp,
        roles: ["operator", "supervisor", "admin", "management"],
      },
      {
        title: "Budget vs Commitment",
        href: "/monitoring/commitment",
        icon: FileBarChart,
        roles: ["operator", "supervisor", "admin", "management"],
      },
      {
        title: "Exception / Overbudget",
        href: "/monitoring/exception",
        icon: AlertTriangle,
        roles: ["operator", "supervisor", "admin", "management"],
      },
    ],
  },

  // ── 7. REPORTING ─────────────────────────────────────────────
  {
    label: "Reporting",
    icon: FileBarChart,
    items: [
      {
        title: "Budget Report",
        href: "/reports/budget",
        icon: FileText,
        roles: ["operator", "supervisor", "admin", "management"],
      },
      {
        title: "Commitment Report",
        href: "/reports/commitment",
        icon: ClipboardList,
        roles: ["operator", "supervisor", "admin", "management"],
      },
      {
        title: "Actual Report",
        href: "/reports/actual",
        icon: Receipt,
        roles: ["operator", "supervisor", "admin", "management"],
      },
      {
        title: "Export Center",
        href: "/reports/export",
        icon: Download,
        roles: ["operator", "supervisor", "admin", "management"],
      },
    ],
  },

  // ── 8. APPROVAL INBOX ────────────────────────────────────────
  {
    label: "Approval Inbox",
    icon: Inbox,
    items: [
      {
        title: "Approval Inbox",
        href: "/approvals",
        icon: Inbox,
        roles: ["supervisor", "admin"],
        badge: "5",
      },
    ],
  },

  // ── 9. MASTER DATA ──────────────────────────────────────────
  {
    label: "Master Data",
    icon: Database,
    items: [
      {
        title: "Fiscal Year",
        href: "/master/fiscal-year",
        icon: Calendar,
        roles: ["admin"],
      },
      {
        title: "Unit Kerja",
        href: "/master/unit-kerja",
        icon: Building2,
        roles: ["admin"],
      },
      {
        title: "COA",
        href: "/master/coa",
        icon: BookOpen,
        roles: ["admin"],
      },
      {
        title: "Cost Center (RCC)",
        href: "/master/cost-center",
        icon: MapPin,
        roles: ["admin"],
      },
      {
        title: "Vendor",
        href: "/master/vendor",
        icon: Truck,
        roles: ["admin"],
      },
      {
        title: "Project",
        href: "/master/project",
        icon: FolderOpen,
        roles: ["admin"],
      },
      {
        title: "Approval Matrix",
        href: "/master/approval-matrix",
        icon: GitBranch,
        roles: ["admin"],
      },
      {
        title: "User & Role",
        href: "/master/users",
        icon: Users,
        roles: ["admin"],
      },
    ],
  },
]

export function getNavigationForRole(role: Role): NavGroup[] {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles.includes(role)),
  })).filter((group) => group.items.length > 0)
}
