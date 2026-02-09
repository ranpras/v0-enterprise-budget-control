'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { toast } from 'sonner'
import type { ApprovalItem, TransactionType, LineItem } from '@/lib/approval-types'
import type { BudgetItem } from '@/lib/budget-types'
import type { SpkItem } from '@/lib/spk-types'
import type { ActualItem } from '@/lib/actual-types'
import type { RevisionItem } from '@/lib/revision-types'

interface SubmissionContextType {
  approvals: ApprovalItem[]
  addApproval: (approval: ApprovalItem) => void
  updateApprovalStatus: (
    id: string,
    status: 'pending' | 'approved' | 'rejected',
    comment?: string,
  ) => void
  getSubmittedItems: (type: TransactionType) => ApprovalItem[]
}

const SubmissionContext = createContext<SubmissionContextType | null>(null)

export function useSubmissions() {
  const context = useContext(SubmissionContext)
  if (!context) {
    throw new Error('useSubmissions must be used within SubmissionProvider')
  }
  return context
}

export function SubmissionProvider({ children }: { children: React.ReactNode }) {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([])

  const addApproval = useCallback((approval: ApprovalItem) => {
    setApprovals((prev) => [approval, ...prev])
    toast.success(`Submitted for approval: ${approval.docNumber}`)
  }, [])

  const updateApprovalStatus = useCallback(
    (
      id: string,
      status: 'pending' | 'approved' | 'rejected',
      comment?: string,
    ) => {
      setApprovals((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                status,
                history: [
                  ...a.history,
                  {
                    approver: 'Current User',
                    action: status === 'approved' ? 'approved' : 'rejected',
                    date: new Date().toISOString(),
                    comment,
                  },
                ],
              }
            : a,
        ),
      )
    },
    [],
  )

  const getSubmittedItems = useCallback(
    (type: TransactionType) =>
      approvals.filter((a) => a.type === type && a.status === 'pending'),
    [approvals],
  )

  return (
    <SubmissionContext.Provider
      value={{
        approvals,
        addApproval,
        updateApprovalStatus,
        getSubmittedItems,
      }}
    >
      {children}
    </SubmissionContext.Provider>
  )
}
