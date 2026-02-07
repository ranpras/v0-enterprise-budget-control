"use client"

import { ActualPageShell } from "@/components/actual/actual-page-shell"
import { MOCK_ACTUALS } from "@/lib/actual-types"

export default function ActualPage() {
  return <ActualPageShell initialData={MOCK_ACTUALS} />
}
