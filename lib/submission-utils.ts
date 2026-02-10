import { ApprovalItem, LineItem } from "./approval-types"

export interface SubmissionPayload {
  docNumber: string
  type: "spk" | "actual"
  description: string
  unit: string
  amount: number
  submittedBy: string
  lineItems: Array<{
    id: string
    coa: string
    description: string
    spkAmount?: number
    actualAmount?: number
  }>
}

/**
 * Creates an approval item from a submission payload
 * Initial approver role is supervisor for all submissions
 */
export function createApprovalItem(payload: SubmissionPayload): ApprovalItem {
  const now = new Date().toISOString()
  const id = `appr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const lineItems: LineItem[] = payload.lineItems.map((line) => ({
    id: line.id,
    coa: line.coa,
    description: line.description,
    amount: line.spkAmount || line.actualAmount || 0,
  }))

  return {
    id,
    docNumber: payload.docNumber,
    type: payload.type,
    description: payload.description,
    unit: payload.unit,
    amount: payload.amount,
    submittedBy: payload.submittedBy,
    submittedDate: now,
    status: "pending",
    currentApproverRole: "supervisor",
    lineItems,
    history: [
      {
        approver: payload.submittedBy,
        action: "submitted",
        date: now,
      },
    ],
  }
}

/**
 * Saves an approval item to localStorage
 */
export function saveApprovalToStorage(item: ApprovalItem): void {
  try {
    const existing = localStorage.getItem("submitted_approvals")
    const existingApprovals: ApprovalItem[] = existing ? JSON.parse(existing) : []

    // Check for duplicates before adding
    const isDuplicate = existingApprovals.some((a) => a.id === item.id)
    if (!isDuplicate) {
      const updated = [item, ...existingApprovals]
      localStorage.setItem("submitted_approvals", JSON.stringify(updated))
    }
  } catch (error) {
    console.error("[v0] Error saving approval to localStorage:", error)
  }
}

/**
 * Updates an approval item in localStorage
 */
export function updateApprovalInStorage(item: ApprovalItem): void {
  try {
    const existing = localStorage.getItem("submitted_approvals")
    const existingApprovals: ApprovalItem[] = existing ? JSON.parse(existing) : []

    const updated = existingApprovals.map((a) => (a.id === item.id ? item : a))
    localStorage.setItem("submitted_approvals", JSON.stringify(updated))
  } catch (error) {
    console.error("[v0] Error updating approval in localStorage:", error)
  }
}

/**
 * Retrieves all approvals from localStorage
 */
export function getApprovalsFromStorage(): ApprovalItem[] {
  try {
    const existing = localStorage.getItem("submitted_approvals")
    return existing ? JSON.parse(existing) : []
  } catch (error) {
    console.error("[v0] Error retrieving approvals from localStorage:", error)
    return []
  }
}
