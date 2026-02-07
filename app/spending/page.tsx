"use client"

import { SpkPageShell } from "@/components/spending/spk-page-shell"
import { MOCK_SPKS } from "@/lib/spk-types"

export default function SpendingPage() {
  return <SpkPageShell initialData={MOCK_SPKS} />
}
