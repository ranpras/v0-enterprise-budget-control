"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import type { UserSession, Role } from "@/lib/rbac"
import { DEMO_USERS } from "@/lib/rbac"

interface RoleContextType {
  user: UserSession | null
  isAuthenticated: boolean
  login: (email: string, password: string) => boolean
  logout: () => void
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

/** Convenience hook that asserts user is logged in */
export function useAuthenticatedRole() {
  const context = useRole()
  if (!context.user) {
    throw new Error("User is not authenticated")
  }
  return { ...context, user: context.user }
}

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null)

  const login = useCallback((email: string, _password: string) => {
    // Demo login: match by email, any password accepted
    const found = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    )
    if (found) {
      setUser(found)
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const switchRole = useCallback((role: Role) => {
    const newUser = DEMO_USERS.find((u) => u.role === role)
    if (newUser) setUser(newUser)
  }, [])

  return (
    <RoleContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </RoleContext.Provider>
  )
}
