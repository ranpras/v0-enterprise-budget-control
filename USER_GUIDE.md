# EBCS User Guide

## Login

**All demo users use the same password: `password123`**

Choose one of these accounts:

| Account | Email | Password | Role |
|---------|-------|----------|------|
| Operator | rina@company.com | password123 | Create & submit transactions |
| Supervisor | budi@company.com | password123 | Approve/reject submissions |
| Admin | sari@company.com | password123 | Full system access |
| Management | andi@company.com | password123 | View reports only |

**Important**: No quick login. You must enter email and password for each login.

---

## Operator Workflow (Rina Hartono)

### 1. Create & Submit SPK (Spending Request)

1. Navigate to **Spending → SPK**
2. Click **Create SPK**
3. Fill in:
   - Description
   - Line items (COA, cost center, amount)
4. Click **Save as Draft** to save locally
5. Click **Submit** to send to Supervisor
6. ✅ SPK appears in Supervisor's Approval Inbox

### 2. Create & Submit Budget

1. Navigate to **Budget → Project** or **Budget → Rutin**
2. Click **Create Budget**
3. Fill in:
   - Fiscal year
   - Line items with monthly amounts
4. Click **Save as Draft**
5. Click **Submit**
6. ✅ Budget appears in Supervisor's Approval Inbox

### 3. Create & Submit Actual

1. Navigate to **Actual → Realization**
2. Click **Create Actual**
3. Fill in spending details
4. Click **Submit**
5. ✅ Actual appears in Supervisor's Approval Inbox

---

## Supervisor Workflow (Budi Setiawan)

### 1. View Pending Approvals

1. Navigate to **Approvals**
2. You see items submitted by operators in your unit
3. Filter by:
   - Status (Pending, Approved, Rejected)
   - Type (SPK, Budget, Actual)
   - Unit / Amount / Date range

### 2. Approve an Item

1. Click on an item to see details
2. Click **Approve**
3. Enter optional approval comment
4. ✅ Item status changes to "Approved"
5. History shows your approval with timestamp

### 3. Reject an Item

1. Click on an item
2. Click **Reject**
3. Enter rejection reason (required)
4. ✅ Item status changes to "Rejected"
5. Item removed from pending list

---

## Admin Workflow (Sari Dewi)

- **Same as Supervisor** but:
  - Sees ALL items from all units/departments
  - Can see final approval status
  - Can view all historical approvals

---

## Monitoring Dashboard

Available to all roles. Shows:

- **KPI Summary**: Total budget, spending, pending approvals
- **Budget vs Actual**: Chart comparison
- **Spending Trend**: Monthly trend analysis
- **Top Vendors**: By spending amount
- **SPK Status Distribution**: Pie chart
- **Alerts**: Threshold warnings and issues
- **Detail Table**: Drill-down into all transactions

---

## Important Notes

### Session Management
- Your login persists after browser close
- To switch accounts, you must **Logout** first
- Then login with different credentials
- Password is required for every login

### Filtering & Search
- Filter by status (Pending, Approved, Rejected)
- Filter by unit / department
- Search by document number or description
- Filter by amount range and date range

### Data Persistence
- All data is stored locally in browser storage
- Data persists across page refresh and browser close
- Each user account has separate data

### Transactions & Approvals

**Transaction Types**:
- **SPK (Spending Request)**: Commitment to spend money
- **Budget**: Annual/periodic budget planning
- **Actual**: Actual spending realization
- **Revision**: Budget changes/adjustments

**Approval Flow**:
1. Operator submits transaction
2. Supervisor reviews and approves/rejects
3. Admin can perform final review (if applicable)
4. All changes tracked in history

---

## Troubleshooting

### "Invalid email" error on login
- Check email spelling (must match demo user)
- Check that password is "password123"
- Demo accounts: rina@, budi@, sari@, andi@ @company.com

### Submitted item not showing in approvals
- Make sure you're logged in as **Supervisor** (budi@company.com)
- Refresh the page
- Check filters aren't hiding the item
- Item should have status "pending"

### Can't switch roles
- You must **Logout** first from user menu
- Then login with different user's credentials
- Quick switching is disabled for security

### Data disappeared
- Check you didn't logout (logout clears your session)
- Try refreshing browser
- Check localStorage is enabled in browser settings

---

## System Features

### Audit Trail
Every transaction shows history with:
- Who performed the action
- What action was performed
- When (timestamp)
- Optional comment/reason

### Validation
- All required fields must be filled
- Line items must have valid amounts
- Email format is validated
- Numeric fields only accept numbers

### Export
- Click **Export** button to download data (feature ready)
- Format: CSV for spreadsheet import

---

## Rights & Permissions

| Feature | Operator | Supervisor | Admin | Management |
|---------|----------|-----------|-------|------------|
| Create Transactions | ✅ | ✗ | ✅ | ✗ |
| Submit to Approval | ✅ | ✗ | ✅ | ✗ |
| View Own Submissions | ✅ | ✅ | ✅ | ✅ |
| Approve Items | ✗ | ✅ | ✅ | ✗ |
| Reject Items | ✗ | ✅ | ✅ | ✗ |
| View All Items | ✗ | Unit only | ✅ | ✅ |
| Monitoring Dashboard | ✅ | ✅ | ✅ | ✅ |

---

## Support

For issues or questions, refer to FIXES_SUMMARY.md for technical details or system architecture.
