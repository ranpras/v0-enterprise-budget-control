"use client"

import { useState } from "react"
import { Check, X, Eye, Filter, Search } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface ApprovalItem {
  id: string
  docNumber: string
  type: "budget" | "spk" | "actual" | "revision" | "unbudget"
  title: string
  unit: string
  amount: string
  submittedBy: string
  submittedAt: string
  status: string
  priority: "high" | "medium" | "low"
}

const TYPE_LABELS: Record<string, string> = {
  budget: "Budget",
  spk: "Spending Request",
  actual: "Actual Realization",
  revision: "Budget Revision",
  unbudget: "Unbudget Request",
}

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-warning/10 text-warning",
  low: "bg-muted text-muted-foreground",
}

const approvalItems: ApprovalItem[] = [
  {
    id: "appr_001",
    docNumber: "SPK-2026-0047",
    type: "spk",
    title: "Server Procurement for Data Center Expansion",
    unit: "IT Dept",
    amount: "Rp 850,000,000",
    submittedBy: "Rina Hartono",
    submittedAt: "Feb 5, 2026 14:32",
    status: "submitted",
    priority: "high",
  },
  {
    id: "appr_002",
    docNumber: "ACT-2026-0112",
    type: "actual",
    title: "Office Renovation Phase 2 - Floor 3",
    unit: "GA Dept",
    amount: "Rp 320,000,000",
    submittedBy: "Ahmad Fauzi",
    submittedAt: "Feb 4, 2026 09:15",
    status: "submitted",
    priority: "medium",
  },
  {
    id: "appr_003",
    docNumber: "REV-2026-0009",
    type: "revision",
    title: "Marketing Campaign Budget Increase Q2",
    unit: "Marketing Dept",
    amount: "Rp 1,500,000,000",
    submittedBy: "Dewi Lestari",
    submittedAt: "Feb 3, 2026 16:45",
    status: "submitted",
    priority: "high",
  },
  {
    id: "appr_004",
    docNumber: "SPK-2026-0048",
    type: "spk",
    title: "Annual Employee Training Program",
    unit: "HR Dept",
    amount: "Rp 150,000,000",
    submittedBy: "Maya Indah",
    submittedAt: "Feb 3, 2026 11:20",
    status: "submitted",
    priority: "low",
  },
  {
    id: "appr_005",
    docNumber: "BDG-2026-0015",
    type: "budget",
    title: "Q3 Operations Budget - Logistics",
    unit: "Operations Dept",
    amount: "Rp 2,800,000,000",
    submittedBy: "Hadi Sutanto",
    submittedAt: "Feb 2, 2026 08:00",
    status: "submitted",
    priority: "high",
  },
]

export default function ApprovalsPage() {
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null)
  const [filter, setFilter] = useState("all")

  const filtered =
    filter === "all"
      ? approvalItems
      : approvalItems.filter((i) => i.type === filter)

  return (
    <>
      <AppHeader title="Approval Inbox" />
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                className="h-9 w-64 pl-8 text-sm"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="h-9 w-44 text-sm">
                <Filter className="mr-2 h-3.5 w-3.5" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="budget">Budget</SelectItem>
                <SelectItem value="spk">Spending Request</SelectItem>
                <SelectItem value="actual">Actual Realization</SelectItem>
                <SelectItem value="revision">Budget Revision</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">
            {filtered.length} pending approval{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Document</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Unit</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Submitted By</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Amount</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Priority</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, index) => (
                    <tr
                      key={item.id}
                      className={cn(
                        "transition-colors hover:bg-muted/30",
                        index < filtered.length - 1 && "border-b",
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium">{item.docNumber}</span>
                          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {item.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="text-[11px] font-normal">
                          {TYPE_LABELS[item.type]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{item.unit}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span>{item.submittedBy}</span>
                          <span className="text-xs text-muted-foreground">{item.submittedAt}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums">{item.amount}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={cn("text-[11px] font-medium border-none capitalize", PRIORITY_STYLES[item.priority])}>
                          {item.priority}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => setSelectedItem(item)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span className="sr-only">View details</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-success hover:text-success hover:bg-success/10"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span className="sr-only">Approve</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span className="sr-only">Reject</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Drawer Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-lg">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base">{selectedItem.docNumber}</DialogTitle>
                <DialogDescription>{selectedItem.title}</DialogDescription>
              </DialogHeader>
              <Separator />
              <div className="grid grid-cols-2 gap-4 py-2 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground">Type</span>
                  <p className="font-medium">{TYPE_LABELS[selectedItem.type]}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Unit</span>
                  <p className="font-medium">{selectedItem.unit}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Amount</span>
                  <p className="font-medium">{selectedItem.amount}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Priority</span>
                  <p>
                    <Badge className={cn("text-[11px] font-medium border-none capitalize", PRIORITY_STYLES[selectedItem.priority])}>
                      {selectedItem.priority}
                    </Badge>
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Submitted By</span>
                  <p className="font-medium">{selectedItem.submittedBy}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Submitted At</span>
                  <p className="font-medium">{selectedItem.submittedAt}</p>
                </div>
              </div>
              <Separator />
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  className="text-destructive border-destructive/30 hover:bg-destructive/10 bg-transparent"
                  size="sm"
                >
                  <X className="mr-1.5 h-3.5 w-3.5" />
                  Reject
                </Button>
                <Button size="sm" className="bg-success text-success-foreground hover:bg-success/90">
                  <Check className="mr-1.5 h-3.5 w-3.5" />
                  Approve
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
