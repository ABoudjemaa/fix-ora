"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

function DashboardBreadcrumb() {
  const pathname = usePathname()
  
  // Créer les segments du breadcrumb à partir du pathname
  const segments = pathname.split("/").filter(Boolean)
  
  // Mapper les segments aux labels
  const breadcrumbMap: Record<string, string> = {
    dashboard: "Dashboard",
    machines: "Machines",
    add: "Ajouter une machine",
  }
  
  // Filtrer les segments pour ne pas afficher les IDs UUID
  const displaySegments = segments.map((segment, index) => {
    const isUUID = segment.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    if (isUUID) {
      return { segment: "Détails", isUUID: true, originalIndex: index }
    }
    return { segment, isUUID: false, originalIndex: index }
  })
  
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {displaySegments.map((item, index) => {
          const isLast = index === displaySegments.length - 1
          const originalIndex = item.originalIndex
          const href = "/" + segments.slice(0, originalIndex + 1).join("/")
          const label = breadcrumbMap[item.segment] || item.segment
          
          return (
            <React.Fragment key={index}>
              {isLast ? (
                <BreadcrumbItem>
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                </BreadcrumbItem>
              ) : (
                <>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                </>
              )}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <DashboardBreadcrumb />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}

