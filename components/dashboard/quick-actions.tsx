"use client"

import React from "react"

import Link from "next/link"
import {
  FilePlus,
  ClipboardPen,
  ReceiptText,
  FileUp,
  BarChart3,
  Inbox,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRole } from "@/components/role-context"
import { cn } from "@/lib/utils"

interface QuickAction {
  title: string
  description: string
  href: string
  icon: React.ElementType
  roles: string[]
  accent: string
}

const actions: QuickAction[] = [
  {
    title: "New Budget",
    description: "Create a budget plan",
    href: "/budget/project",
    icon: FilePlus,
    roles: ["operator"],
    accent: "bg-primary/10 text-primary",
  },
  {
    title: "New SPK",
    description: "Create spending request",
    href: "/spending",
    icon: ClipboardPen,
    roles: ["operator"],
    accent: "bg-warning/10 text-warning",
  },
  {
    title: "Input Actual",
    description: "Record realization",
    href: "/actual",
    icon: ReceiptText,
    roles: ["operator"],
    accent: "bg-success/10 text-success",
  },
  {
    title: "Submit Revision",
    description: "Revise approved budget",
    href: "/revision",
    icon: FileUp,
    roles: ["operator"],
    accent: "bg-chart-4/10 text-chart-4",
  },
  {
    title: "Approval Inbox",
    description: "Review pending items",
    href: "/approvals",
    icon: Inbox,
    roles: ["supervisor", "admin"],
    accent: "bg-primary/10 text-primary",
  },
  {
    title: "Monitoring",
    description: "View analytics dashboard",
    href: "/monitoring",
    icon: BarChart3,
    roles: ["supervisor", "admin", "management"],
    accent: "bg-success/10 text-success",
  },
]

export function QuickActions() {
  const { user } = useRole()
  const visibleActions = actions.filter((a) => a.roles.includes(user.role))

  if (visibleActions.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {visibleActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-all hover:border-primary/30 hover:bg-accent/50 hover:shadow-sm"
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-110",
                  action.accent,
                )}
              >
                <action.icon className="h-5 w-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium">{action.title}</span>
                <span className="hidden text-[10px] text-muted-foreground md:block">
                  {action.description}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
