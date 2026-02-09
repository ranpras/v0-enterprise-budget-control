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
    ],
  },

  // ── 3. BUDGET REVISION / UNBUDGET ────────────────────────────
  {
    label: "Budget Revision / Unbudget",
    icon: FileMinus,
    items: [
      {
        title: "All Revisions",
        href: "/revision",
        icon: FileMinus,
        roles: ["operator", "supervisor", "admin", "management"],
      },
    ],
  },

  // ── 4. SPENDING REQUEST (COMMITMENT / SPK) ───────────────────
  {
    label: "Spending Request (SPK)",
    icon: ClipboardList,
    items: [
      {
        title: "All SPK",
        href: "/spending",
        icon: ClipboardList,
        roles: ["operator", "supervisor", "admin", "management"],
      },
    ],
  },

  // ── 5. ACTUAL REALIZATION (PAYMENT) ──────────────────────────
  {
    label: "Actual Realization (Payment)",
    icon: Receipt,
    items: [
      {
        title: "All Actual",
        href: "/actual",
        icon: Receipt,
        roles: ["operator", "supervisor", "admin", "management"],
      },
    ],
  },

  // ── 6. MONITORING & CONTROL ──────────────────────────────────
  {
    label: "Monitoring & Control",
    icon: BarChart3,
    items: [
      {
        title: "Dashboard Overview",
        href: "/monitoring",
        icon: BarChart3,
        roles: ["operator", "supervisor", "admin", "management"],
      },
    ],
  },

  // ── 7. APPROVAL INBOX ────────────────────────────────────────
  {
    label: "Approval Inbox",
    icon: Inbox,
    items: [
      {
        title: "All Approvals",
        href: "/approvals",
        icon: Inbox,
        roles: ["supervisor", "admin"],
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
