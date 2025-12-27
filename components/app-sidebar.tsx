"use client"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
// import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { sidebarData } from "@/data/sidebar-date"
import { useSession } from "next-auth/react"
// This is sample data.

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const {data} = useSession()


  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* <TeamSwitcher teams={sidebarData.teams} /> */}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarData.navMain} />
        <NavProjects projects={sidebarData.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ name: data?.user.name || "", email: data?.user.email || "", avatar: data?.user.id || "" }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
