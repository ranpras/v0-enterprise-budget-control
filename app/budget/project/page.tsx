"use client"

import { BudgetPageShell } from "@/components/budget/budget-page-shell"
import { MOCK_BUDGETS_PROJECT } from "@/lib/budget-types"

export default function BudgetProjectPage() {
  return (
    <BudgetPageShell budgetType="project" initialData={MOCK_BUDGETS_PROJECT} />
  )
}
