"use client"

import { BudgetPageShell } from "@/components/budget/budget-page-shell"
import { MOCK_BUDGETS_ROUTINE } from "@/lib/budget-types"

export default function BudgetRoutinePage() {
  return (
    <BudgetPageShell budgetType="routine" initialData={MOCK_BUDGETS_ROUTINE} />
  )
}
