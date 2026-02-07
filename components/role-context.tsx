"use client"

import React from "react"

import { createContext, useContext, useState, useCallback } from "react"
import type { UserSession, Role } from "@/lib/rbac"
import { DEMO_USERS } from "@/lib/rbac"

interface RoleContextType {
  user: UserSession
  switchRole: (role: Role) => void
}

const RoleContext = createContext<RoleContextType | null>(null)

export function useRole() {
  const context = useContext(RoleContext)
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider")
  }
  return context
}

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession>(DEMO_USERS[2]) // Default to admin

  const switchRole = useCallback((role: Role) => {
    const newUser = DEMO_USERS.find((u) => u.role === role)
    if (newUser) setUser(newUser)
  }, [])

  return (
    <RoleContext.Provider value={{ user, switchRole }}>
      {children}
    </RoleContext.Provider>
  )
}
