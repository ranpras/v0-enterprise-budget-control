"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { RoleProvider } from "@/components/role-context"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

function PageTransitionWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div
      key={pathname}
      className="flex min-h-0 flex-1 flex-col animate-in fade-in duration-300"
    >
      {children}
    </div>
  )
}

function AppFooter() {
  return (
    <footer className="flex shrink-0 items-center justify-between border-t px-6 py-3">
      <span className="text-xs text-muted-foreground">
        EBCS v0.1.0
      </span>
      <span className="text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Enterprise Budget Control System. All rights reserved.
      </span>
    </footer>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col">
          <PageTransitionWrapper>{children}</PageTransitionWrapper>
          <AppFooter />
        </SidebarInset>
      </SidebarProvider>
    </RoleProvider>
  )
}
