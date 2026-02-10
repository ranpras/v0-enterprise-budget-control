"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { UserSession, Role } from "@/lib/rbac"
import { DEMO_USERS } from "@/lib/rbac"

interface RoleContextType {
  user: UserSession | null
  isAuthenticated: boolean
  login: (email: string, password: string) => boolean
  logout: () => void
  switchRole: (role: Role) => void
  isLoading: boolean
}

const RoleContext = createContext<RoleContextType | null>(null)

export function useRole() {
  const context = useContext(RoleContext)
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider")
  }
  return context
}

/** Safe hook for authenticated contexts - never throws */
export function useAuthenticatedRole() {
  const context = useRole()
  return context
}

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Hydrate from localStorage on mount - persists across browser close
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ebcs_auth_user")
      if (stored) {
        const parsed = JSON.parse(stored)
        setUser(parsed)
      }
    } catch (e) {
      console.error("[v0] Failed to restore session:", e)
      localStorage.removeItem("ebcs_auth_user")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback((email: string, password: string) => {
    // Demo login: match by email AND password - both required
    const found = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
    )
    if (found) {
      // Extract user session without password
      const { password: _, ...userSession } = found
      setUser(userSession as UserSession)
      // Persist to localStorage for persistence across browser close (NO password stored)
      localStorage.setItem("ebcs_auth_user", JSON.stringify(userSession))
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem("ebcs_auth_user")
  }, [])

  const switchRole = useCallback((role: Role) => {
    const newUser = DEMO_USERS.find((u) => u.role === role)
    if (newUser) {
      // Extract user session without password
      const { password: _, ...userSession } = newUser
      setUser(userSession as UserSession)
      localStorage.setItem("ebcs_auth_user", JSON.stringify(userSession))
    }
  }, [])

  const contextValue = {
    user,
    isAuthenticated: user !== null,
    login,
    logout,
    switchRole,
    isLoading,
  }

  return (
    <RoleContext.Provider value={contextValue}>
      {children}
    </RoleContext.Provider>
  )
}

