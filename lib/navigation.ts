import {
  LayoutDashboard,
  FileText,
  FilePlus,
  FileMinus,
  ClipboardList,
  Receipt,
  BarChart3,
  Inbox,
  Database,
  Lock,
  Settings,
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
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
        roles: ["operator", "supervisor", "admin", "management"],
      },
      {
        title: "Approval Inbox",
        href: "/approvals",
        icon: Inbox,
        roles: ["supervisor", "admin"],
        badge: "3",
      },
    ],
  },
  {
    label: "Budget Planning",
    items: [
      {
        title: "Project Budget",
        href: "/budget/project",
        icon: FileText,
        roles: ["operator", "supervisor", "admin"],
      },
      {
        title: "Routine / OPEX",
        href: "/budget/routine",
        icon: FileText,
        roles: ["operator", "supervisor", "admin"],
      },
      {
        title: "Budget Revision",
        href: "/budget/revision",
        icon: FilePlus,
        roles: ["operator", "supervisor", "admin"],
      },
      {
        title: "Unbudget Request",
        href: "/budget/unbudget",
        icon: FileMinus,
        roles: ["operator", "supervisor", "admin"],
      },
    ],
  },
  {
    label: "Spending",
    items: [
      {
        title: "Spending Request (SPK)",
        href: "/spending/spk",
        icon: ClipboardList,
        roles: ["operator", "supervisor", "admin"],
      },
      {
        title: "Actual Realization",
        href: "/spending/actual",
        icon: Receipt,
        roles: ["operator", "supervisor", "admin"],
      },
    ],
  },
  {
    label: "Monitoring",
    items: [
      {
        title: "Budget Monitoring",
        href: "/monitoring",
        icon: BarChart3,
        roles: ["operator", "supervisor", "admin", "management"],
      },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        title: "Master Data",
        href: "/admin/master-data",
        icon: Database,
        roles: ["admin"],
      },
      {
        title: "Fiscal Year",
        href: "/admin/fiscal-year",
        icon: Lock,
        roles: ["admin"],
      },
      {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings,
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
