export type Role = "operator" | "supervisor" | "admin" | "management"

export interface UserSession {
  id: string
  name: string
  email: string
  role: Role
  unitId: string
  unitName: string
}

export const ROLE_LABELS: Record<Role, string> = {
  operator: "Operator",
  supervisor: "Supervisor",
  admin: "Admin Budget",
  management: "Management",
}

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  operator: "Input & submit transactions for your unit",
  supervisor: "Approve or reject transactions for your unit",
  admin: "Full governance, master data, and final approvals",
  management: "Read-only dashboards and reports",
}

// Demo users for authentication (password required for all accounts)
export const DEMO_USERS: (UserSession & { password: string })[] = [
  {
    id: "usr_op_01",
    name: "Rina Hartono",
    email: "rina@company.com",
    password: "password123",
    role: "operator",
    unitId: "unit_fin",
    unitName: "Finance Dept",
  },
  {
    id: "usr_sv_01",
    name: "Budi Setiawan",
    email: "budi@company.com",
    password: "password123",
    role: "supervisor",
    unitId: "unit_fin",
    unitName: "Finance Dept",
  },
  {
    id: "usr_adm_01",
    name: "Sari Dewi",
    email: "sari@company.com",
    password: "password123",
    role: "admin",
    unitId: "unit_hq",
    unitName: "Headquarters",
  },
  {
    id: "usr_mgmt_01",
    name: "Andi Prasetyo",
    email: "andi@company.com",
    password: "password123",
    role: "management",
    unitId: "unit_hq",
    unitName: "Headquarters",
  },
]
