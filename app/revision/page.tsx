"use client"

import { RevisionPageShell } from "@/components/revision/revision-page-shell"
import { MOCK_REVISIONS } from "@/lib/revision-types"

export default function RevisionPage() {
  return <RevisionPageShell initialData={MOCK_REVISIONS} />
}
