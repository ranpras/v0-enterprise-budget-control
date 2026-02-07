"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  ChevronRight,
  Shield,
  LogOut,
  User,
  KeyRound,
} from "lucide-react"
import { useRole } from "@/components/role-context"
import { getNavigationForRole } from "@/lib/navigation"
import type { NavGroup } from "@/lib/navigation"
import { ROLE_LABELS, DEMO_USERS } from "@/lib/rbac"
import type { Role } from "@/lib/rbac"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

function CollapsibleNavGroup({
  group,
  pathname,
}: {
  group: NavGroup
  pathname: string
}) {
  const hasActiveChild = group.items.some((item) => pathname === item.href)

  // Single-item groups (Dashboard, Approval Inbox) render as a direct link
  if (group.items.length === 1) {
    const item = group.items[0]
    const isActive = pathname === item.href

    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
          <Link href={item.href}>
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
        {item.badge && (
          <SidebarMenuBadge className="bg-sidebar-primary text-sidebar-primary-foreground text-[10px] font-semibold">
            {item.badge}
          </SidebarMenuBadge>
        )}
      </SidebarMenuItem>
    )
  }

  return (
    <Collapsible asChild defaultOpen={hasActiveChild} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={group.label}>
            <group.icon className="h-4 w-4" />
            <span>{group.label}</span>
            <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {group.items.map((item) => {
              const isActive = pathname === item.href
              return (
                <SidebarMenuSubItem key={item.href}>
                  <SidebarMenuSubButton asChild isActive={isActive}>
                    <Link href={item.href}>
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const { user, switchRole, logout } = useRole()

  if (!user) return null

  const navigation = getNavigationForRole(user.role)

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      {/* ── Brand Header ──────────────────────────────────────── */}
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Shield className="h-4 w-4" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold text-sidebar-accent-foreground">
              EBCS
            </span>
            <span className="text-[11px] leading-none text-sidebar-foreground">
              Budget Control
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      {/* ── Navigation ────────────────────────────────────────── */}
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((group) => (
                <CollapsibleNavGroup
                  key={group.label}
                  group={group}
                  pathname={pathname}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      {/* ── User Footer ───────────────────────────────────────── */}
      <SidebarFooter className="px-3 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg p-1.5 text-left transition-colors hover:bg-sidebar-accent group-data-[collapsible=icon]:justify-center"
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-medium text-sidebar-accent-foreground">
                  {user.name}
                </span>
                <span className="text-[11px] text-sidebar-foreground">
                  {ROLE_LABELS[user.role]}
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-60">
            {/* Profile Actions */}
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
              Account
            </DropdownMenuLabel>
            <DropdownMenuItem className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <KeyRound className="h-4 w-4" />
              Change Password
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 text-destructive focus:text-destructive"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Role Switcher (Demo) */}
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
              Switch Role (Demo)
            </DropdownMenuLabel>
            {DEMO_USERS.map((demoUser) => (
              <DropdownMenuItem
                key={demoUser.id}
                onClick={() => switchRole(demoUser.role as Role)}
                className="flex items-center gap-2"
              >
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-[10px]">
                    {demoUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm">{demoUser.name}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {ROLE_LABELS[demoUser.role]} - {demoUser.unitName}
                  </span>
                </div>
                {user.role === demoUser.role && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
