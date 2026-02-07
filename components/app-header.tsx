"use client"

import { CalendarDays, Bell } from "lucide-react"
import { useRole } from "@/components/role-context"
import { ROLE_LABELS } from "@/lib/rbac"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function AppHeader({ title }: { title: string }) {
  const { user } = useRole()

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-5" />
      <div className="flex flex-1 items-center gap-3">
        <h1 className="text-sm font-semibold">{title}</h1>
        <Badge
          variant="secondary"
          className="hidden text-[11px] font-normal md:inline-flex"
        >
          {ROLE_LABELS[user.role]}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-1.5 text-xs text-muted-foreground md:flex">
          <CalendarDays className="h-3.5 w-3.5" />
          <span>FY 2026</span>
        </div>
        <Separator orientation="vertical" className="hidden h-5 md:block" />
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
            3
          </span>
          <span className="sr-only">Notifications</span>
        </Button>
      </div>
    </header>
  )
}
