"use client"

import Link from "next/link"
import { Check, X, Eye, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useRole } from "@/components/role-context"

interface PendingItem {
  id: string
  title: string
  type: string
  unit: string
  amount: string
  submittedBy: string
  submittedAt: string
}

const pendingItems: PendingItem[] = [
  {
    id: "appr_001",
    title: "SPK-2026-0047",
    type: "Spending Request",
    unit: "IT Dept",
    amount: "Rp 850M",
    submittedBy: "Rina Hartono",
    submittedAt: "Feb 5, 2026",
  },
  {
    id: "appr_002",
    title: "ACT-2026-0112",
    type: "Actual Realization",
    unit: "GA Dept",
    amount: "Rp 320M",
    submittedBy: "Ahmad Fauzi",
    submittedAt: "Feb 4, 2026",
  },
  {
    id: "appr_003",
    title: "REV-2026-0009",
    type: "Budget Revision",
    unit: "Finance Dept",
    amount: "Rp 1.5B",
    submittedBy: "Dewi Lestari",
    submittedAt: "Feb 3, 2026",
  },
]

export function PendingApprovals() {
  const { user } = useRole()

  if (user.role !== "supervisor" && user.role !== "admin") {
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <CardDescription className="text-xs">
              {pendingItems.length} items awaiting your review
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-xs">
            {pendingItems.length} pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-0 pt-0">
        <div className="flex flex-col">
          {pendingItems.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-4 px-6 py-3 transition-colors hover:bg-muted/50",
                index < pendingItems.length - 1 && "border-b",
              )}
            >
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{item.title}</span>
                  <span className="text-xs text-muted-foreground">{item.type}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.submittedBy} / {item.unit} / {item.submittedAt}
                </div>
              </div>
              <span className="text-sm font-medium tabular-nums">{item.amount}</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                  <Eye className="h-3.5 w-3.5" />
                  <span className="sr-only">View details</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-success hover:text-success hover:bg-success/10">
                  <Check className="h-3.5 w-3.5" />
                  <span className="sr-only">Approve</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10">
                  <X className="h-3.5 w-3.5" />
                  <span className="sr-only">Reject</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t px-6 py-2">
          <Link
            href="/approvals"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            View all approvals
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
