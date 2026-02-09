"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { CalendarDays, Bell, User, KeyRound, LogOut } from "lucide-react"
import { useRole } from "@/components/role-context"
import { ROLE_LABELS } from "@/lib/rbac"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// ── Breadcrumb path map ─────────────────────────────────────────
const PATH_LABELS: Record<string, string> = {
  budget: "Budget Planning",
  project: "Budget Project",
  routine: "Budget Rutin (OPEX)",
  draft: "Draft Budget",
  review: "Review Budget",
  approval: "Approval Budget",
  revision: "Budget Revision / Unbudget",
  submit: "Submit Revision",
  spending: "Spending Request (SPK)",
  create: "Create SPK",
  active: "Active Commitments",
  actual: "Actual Realization",
  input: "Input Actual",
  reversal: "Reversal",
  monitoring: "Monitoring & Control",
  commitment: "Budget vs Commitment",
  exception: "Exception / Overbudget",
  reports: "Reporting",
  export: "Export Center",
  approvals: "Approval Inbox",
  master: "Master Data",
  "fiscal-year": "Fiscal Year",
  "unit-kerja": "Unit Kerja",
  coa: "COA",
  "cost-center": "Cost Center (RCC)",
  vendor: "Vendor",
  "approval-matrix": "Approval Matrix",
  users: "User & Role",
}

function BreadcrumbNav() {
  const pathname = usePathname()

  if (pathname === "/") {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  const segments = pathname.split("/").filter(Boolean)
  const crumbs = segments.map((seg, idx) => ({
    label: PATH_LABELS[seg] || seg.charAt(0).toUpperCase() + seg.slice(1),
    href: "/" + segments.slice(0, idx + 1).join("/"),
    isLast: idx === segments.length - 1,
  }))

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">Dashboard</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {crumbs.map((crumb) => (
          <span key={crumb.href} className="contents">
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {crumb.isLast ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={crumb.href}>{crumb.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </span>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

// ── Role badge variant colors ───────────────────────────────────
const ROLE_BADGE_STYLES: Record<string, string> = {
  operator: "bg-primary/10 text-primary border-primary/20",
  supervisor: "bg-warning/10 text-warning border-warning/20",
  admin: "bg-success/10 text-success border-success/20",
  management: "bg-muted text-muted-foreground border-border",
}

export function AppHeader() {
  const { user, logout } = useRole()

  if (!user) return null

  return (
    <header className="flex flex-col border-b">
      {/* ── Top bar ────────────────────────────────────────────── */}
      <div className="flex h-14 shrink-0 items-center gap-3 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-5" />

        {/* App name */}
        <span className="hidden text-sm font-semibold md:inline">
          Enterprise Budget Control System
        </span>
        <span className="text-sm font-semibold md:hidden">EBCS</span>

        <div className="flex-1" />

        {/* Fiscal year */}
        <div className="hidden items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs text-muted-foreground md:flex">
          <CalendarDays className="h-3.5 w-3.5" />
          <span className="font-medium">FY 2026</span>
        </div>

        <Separator orientation="vertical" className="hidden h-5 md:block" />

        {/* Notification bell */}
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
            5
          </span>
          <span className="sr-only">Notifications</span>
        </Button>

        <Separator orientation="vertical" className="h-5" />

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2.5 rounded-lg p-1 transition-colors hover:bg-accent"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start md:flex">
                <span className="text-sm font-medium leading-none">
                  {user.name}
                </span>
                <span className="text-[11px] text-muted-foreground leading-none mt-0.5">
                  {user.unitName}
                </span>
              </div>
              <Badge
                variant="outline"
                className={`hidden text-[10px] font-medium md:inline-flex ${ROLE_BADGE_STYLES[user.role]}`}
              >
                {ROLE_LABELS[user.role]}
              </Badge>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <KeyRound className="h-4 w-4" />
              Change Password
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 text-destructive focus:text-destructive"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                logout()
              }}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Breadcrumb bar ─────────────────────────────────────── */}
      <div className="flex h-10 items-center px-4 text-sm">
        <BreadcrumbNav />
      </div>
    </header>
  )
}
