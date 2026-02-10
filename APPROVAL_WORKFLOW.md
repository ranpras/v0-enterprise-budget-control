# Approval Workflow - User → Supervisor → Admin

## Overview

This document explains the complete approval workflow from user submission through supervisor approval to admin finalization.

## Data Flow

### 1. User Submits Data (Operator Role)

When an operator submits a SPK, Actual, Budget, or Revision:

**Input Form:**
- User fills in transaction data
- Clicks "Submit" button

**Backend Logic:**
```
User Action → handleSubmitFromForm() 
  → createApprovalItem() (submission-utils.ts)
  → saveApprovalToStorage() (localStorage)
```

**Data Structure Created:**
```typescript
{
  id: "appr_xxx",
  docNumber: "SPK-2026-0047",
  type: "spk",
  description: "...",
  unit: "IT Dept",
  amount: 850000000,
  submittedBy: "Rina Hartono",
  submittedDate: "2026-02-05T14:32:00",
  status: "pending",
  currentApproverRole: "supervisor",  // Initial approver role
  lineItems: [...],
  history: [
    {
      approver: "Rina Hartono",
      action: "submitted",
      date: "2026-02-05T14:32:00"
    }
  ]
}
```

**Storage:**
- Item saved to localStorage with key "submitted_approvals"
- Status = "pending"
- currentApproverRole = "supervisor"

### 2. Supervisor Reviews & Approves

**Supervisor Inbox Logic (approvals/page.tsx):**

```typescript
// Filter logic for supervisor
const filtered = approvals.filter((item) => {
  // Only show items assigned to supervisor
  if (user.role === "supervisor" && item.currentApproverRole !== "supervisor") {
    return false
  }
  // + other filters (search, type, unit, status, etc.)
  return true
})
```

**Supervisor Sees:**
- All pending items where `currentApproverRole === "supervisor"`
- Can approve or reject with comments

**On Approval:**
```
supervisor click Approve
  → handleApproveConfirm()
  → update item.status = "approved"
  → add history entry
  → updateApprovalInStorage()
  → localStorage updated
```

**Updated Item After Approval:**
```typescript
{
  ...previousItem,
  status: "approved",
  history: [
    ...previousHistory,
    {
      approver: "Budi Setiawan",
      action: "approved",
      date: "2026-02-05T16:10:00",
      comment: "Approved for processing"
    }
  ]
}
```

### 3. Admin Sees All Items

**Admin Inbox Logic:**
- No role-based filtering (admins see everything)
- Can view approved items and make final decisions
- Can transition items to admin approval if needed

## Critical Fields

### currentApproverRole
- **Type:** "supervisor" | "admin"
- **Purpose:** Determines which role should see and approve the item
- **Set At:** Item creation (submission)
- **Preserved:** Never changed during approval process
- **Default:** "supervisor" for all new submissions

### status
- **Type:** "pending" | "approved" | "rejected"
- **Purpose:** Shows workflow state
- **Pending:** Waiting for currentApproverRole to act
- **Approved/Rejected:** Final decision made

### history
- **Purpose:** Complete audit trail
- **Updated:** Every time status changes
- **Contains:** Who, what action, when, and optional comments

## Storage Strategy

**localStorage Key:** "submitted_approvals"

```json
[
  {
    "id": "appr_xxx",
    "docNumber": "SPK-2026-0047",
    // ... full ApprovalItem data
  },
  {
    "id": "appr_yyy",
    "docNumber": "ACT-2026-0112",
    // ... full ApprovalItem data
  }
]
```

**Persistence:**
- Data survives page refresh ✓
- Data survives browser close (using localStorage, not sessionStorage) ✓
- Data survives logout/login (kept in localStorage) ✓

## Success Criteria - Implementation Checklist

- [x] ApprovalItem has currentApproverRole field
- [x] createApprovalItem() sets currentApproverRole = "supervisor"
- [x] Supervisor inbox filters by currentApproverRole
- [x] Admin inbox sees all items (no filter)
- [x] Approval/rejection preserves currentApproverRole
- [x] Data persists to localStorage immediately
- [x] No manual refresh needed to see submitted items

## Testing the Workflow

### Test Case 1: Operator Submit → Supervisor See in Inbox

1. Login as Rina (operator)
2. Go to SPK/Budget page
3. Create and Submit new item
4. Logout
5. Login as Budi (supervisor)
6. Go to Approval Inbox
7. **VERIFY:** New item appears in inbox with status "pending"

### Test Case 2: Supervisor Approve → History Updated

1. Supervisor clicks on pending item
2. Click "Approve"
3. Add comment
4. Click "Confirm"
5. **VERIFY:** 
   - Status changes to "approved"
   - History shows approval entry with comment
   - Timestamp is correct
   - Approver name is correct

### Test Case 3: Data Persistence

1. Submit item as operator
2. Refresh browser
3. **VERIFY:** Item still in supervisor's inbox
4. Logout operator
5. Login supervisor
6. **VERIFY:** Item still visible

## Architecture Diagram

```
┌─────────────────────────────────────────┐
│  OPERATOR (Rina)                        │
│  - SPK/Budget/Actual Form               │
│  - Click Submit                         │
└──────────────┬──────────────────────────┘
               │
               ▼
         ┌─────────────┐
         │ Create      │
         │ Approval    │
         │ Item        │
         │ status:     │
         │ pending     │
         │ currentAppr │
         │ Role:       │
         │ supervisor  │
         └──────┬──────┘
                │
                ▼
        ┌───────────────────┐
        │ Save to           │
        │ localStorage      │
        │ submitted_        │
        │ approvals key     │
        └────────┬──────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
    ▼                         ▼
┌──────────────┐      ┌──────────────┐
│ SUPERVISOR   │      │ ADMIN        │
│ (Budi)       │      │ (Sari)       │
│ Filter:      │      │ Filter:      │
│ status=      │      │ none (sees   │
│ pending &&   │      │ all)         │
│ currentAppro │      │              │
│ verRole=    │      │              │
│ supervisor  │      │              │
│             │      │              │
│ Action:     │      │ Action:      │
│ Approve/    │      │ Final review │
│ Reject      │      │              │
└──────────────┘      └──────────────┘
```

## Notes

- currentApproverRole is immutable after creation
- All changes are immediately persisted to localStorage
- No backend API calls needed (demo mode)
- History is append-only (no edits, only new entries)
- Timestamps are ISO 8601 format for consistency
