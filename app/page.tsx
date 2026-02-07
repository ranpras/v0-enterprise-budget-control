"use client"

import { AppHeader } from "@/components/app-header"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { BudgetChart } from "@/components/dashboard/budget-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { PendingApprovals } from "@/components/dashboard/pending-approvals"

export default function Page() {
  return (
    <>
      <AppHeader />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <SummaryCards />
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <BudgetChart />
          </div>
          <div className="lg:col-span-2">
            <PendingApprovals />
          </div>
        </div>
        <RecentActivity />
      </div>
    </>
  )
}
