"use client"

import React from "react"
import { RoleProvider, useRole } from "@/components/role-context"
import { LoginPage } from "@/components/login-page"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

function PageTransitionWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      {children}
    </div>
  )
}

function AppFooter() {
  return (
    <footer className="flex shrink-0 items-center justify-between border-t border-border bg-muted/50 px-6 py-3">
      <span className="text-xs text-muted-foreground">EBCS v0.1.0</span>
      <span className="text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Enterprise Budget Control System
      </span>
    </footer>
  )
}

function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useRole()

  // During hydration/loading, show a loading state to prevent layout shifts
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col">
        <AppHeader />
        <PageTransitionWrapper>{children}</PageTransitionWrapper>
        <AppFooter />
      </SidebarInset>
    </SidebarProvider>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <AuthenticatedShell>{children}</AuthenticatedShell>
    </RoleProvider>
  )
}
