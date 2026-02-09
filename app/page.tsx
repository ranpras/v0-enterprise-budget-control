"use client"

import { SummaryCards } from "@/components/dashboard/summary-cards"
import { BudgetChart } from "@/components/dashboard/budget-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { PendingApprovals } from "@/components/dashboard/pending-approvals"
import { QuickActions } from "@/components/dashboard/quick-actions"

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      {/* Quick Actions */}
      <QuickActions />

      {/* KPI Summary Cards */}
      <SummaryCards />

      {/* Charts + Pending Approvals */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <BudgetChart />
        </div>
        <div className="lg:col-span-2">
          <PendingApprovals />
        </div>
      </div>

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  )
}
