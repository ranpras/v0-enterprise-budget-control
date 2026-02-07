"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ActivityItem {
  id: string
  type: "budget" | "spk" | "actual" | "revision"
  title: string
  status: string
  unit: string
  amount: string
  timestamp: string
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-primary/10 text-primary",
  supervisor_approved: "bg-warning/10 text-warning",
  admin_approved: "bg-success/10 text-success",
  locked: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
  reversed: "bg-muted text-muted-foreground",
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  supervisor_approved: "Approved (Spv)",
  admin_approved: "Approved (Adm)",
  locked: "Locked",
  rejected: "Rejected",
  reversed: "Reversed",
}

const TYPE_LABELS: Record<string, string> = {
  budget: "Budget",
  spk: "SPK",
  actual: "Actual",
  revision: "Revision",
}

const activities: ActivityItem[] = [
  {
    id: "act_001",
    type: "spk",
    title: "SPK-2026-0047 Server Procurement",
    status: "submitted",
    unit: "IT Dept",
    amount: "Rp 850M",
    timestamp: "2 hours ago",
  },
  {
    id: "act_002",
    type: "actual",
    title: "ACT-2026-0112 Office Renovation Phase 2",
    status: "supervisor_approved",
    unit: "GA Dept",
    amount: "Rp 320M",
    timestamp: "4 hours ago",
  },
  {
    id: "act_003",
    type: "budget",
    title: "BDG-2026-FIN Q3 Budget Routine",
    status: "admin_approved",
    unit: "Finance Dept",
    amount: "Rp 1.2B",
    timestamp: "6 hours ago",
  },
  {
    id: "act_004",
    type: "revision",
    title: "REV-2026-0008 Marketing Campaign",
    status: "rejected",
    unit: "Marketing Dept",
    amount: "Rp 500M",
    timestamp: "1 day ago",
  },
  {
    id: "act_005",
    type: "spk",
    title: "SPK-2026-0048 Training Program",
    status: "draft",
    unit: "HR Dept",
    amount: "Rp 150M",
    timestamp: "1 day ago",
  },
]

export function RecentActivity() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pt-0">
        <div className="flex flex-col">
          {activities.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-4 px-6 py-3 transition-colors hover:bg-muted/50",
                index < activities.length - 1 && "border-b",
              )}
            >
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium">
                    {item.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{item.unit}</span>
                  <span>{"/"}</span>
                  <span>{TYPE_LABELS[item.type]}</span>
                  <span>{"/"}</span>
                  <span>{item.timestamp}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium tabular-nums">{item.amount}</span>
                <Badge
                  className={cn(
                    "text-[11px] font-medium border-none whitespace-nowrap",
                    STATUS_STYLES[item.status],
                  )}
                >
                  {STATUS_LABELS[item.status]}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
